import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie, deleteCookie } from '@tanstack/react-start/server'
import { z } from 'zod'
import { getStore } from './store'
import type { CommentRow, Status } from './store'
import { checkContent, hashedIp, rateLimit, sign, verifySigned, verifyTurnstile } from './guard'
import { postBySlug } from '~/lib/posts'

export type PublicComment = Pick<CommentRow, 'id' | 'parentId' | 'name' | 'body' | 'pinned' | 'createdAt'>
const pub = (c: CommentRow): PublicComment => ({ id: c.id, parentId: c.parentId, name: c.name, body: c.body, pinned: c.pinned, createdAt: c.createdAt })

export const listComments = createServerFn({ method: 'GET' })
  .validator((d: { slug: string }) => z.object({ slug: z.string().max(80) }).parse(d))
  .handler(async ({ data }) => {
    const store = getStore()
    const rows = await store.approved(data.slug)
    return { mode: store.mode, comments: rows.map(pub) }
  })

const PostInput = z.object({
  slug: z.string().max(80),
  parentId: z.string().max(64).nullable(),
  name: z.string().trim().min(1, 'Please add a name or nickname.').max(40),
  body: z.string().trim().min(3, 'Your comment is a bit short.').max(1200, 'Comments can be up to 1,200 characters.'),
  website: z.string().max(0).optional(), // honeypot
  openedAt: z.number(),
  token: z.string().max(4096).optional(),
})

export const postComment = createServerFn({ method: 'POST' })
  .validator((d: unknown) => PostInput.parse(d))
  .handler(async ({ data }): Promise<{ ok: true; message: string } | { ok: false; error: string }> => {
    if (!postBySlug(data.slug)) return { ok: false, error: 'That post does not exist.' }
    if (data.website) return { ok: true, message: 'Thanks! Your comment is waiting for review.' } // silently drop bots
    if (Date.now() - data.openedAt < 4000) return { ok: false, error: 'That was quick. Take a moment and try again.' }
    const ip = await hashedIp()
    if (!(await rateLimit(`c:${ip}`, 5, 3600))) return { ok: false, error: 'You have posted a few comments recently. Please try again later.' }
    if (!(await verifyTurnstile(data.token))) return { ok: false, error: 'We could not verify you are human. Please try again.' }
    const why = checkContent(data.name, data.body)
    if (why) return { ok: false, error: why }
    await getStore().insert({ slug: data.slug, parentId: data.parentId, name: data.name, body: data.body, status: 'pending', ipHash: ip })
    return { ok: true, message: 'Thank you! Your comment will appear after a quick review.' }
  })

export const reportComment = createServerFn({ method: 'POST' })
  .validator((d: { id: string }) => z.object({ id: z.string().max(64) }).parse(d))
  .handler(async ({ data }) => {
    const ip = await hashedIp()
    if (!(await rateLimit(`r:${ip}`, 10, 3600))) return { ok: false }
    await getStore().report(data.id)
    return { ok: true }
  })

/* ---------- moderation ---------- */
const COOKIE = 'll_admin'
const isAdmin = async () => verifySigned(getCookie(COOKIE))

export const adminStatus = createServerFn({ method: 'GET' }).handler(async () => ({
  signedIn: await isAdmin(),
  configured: Boolean(process.env.ADMIN_PASSWORD),
  mode: getStore().mode,
}))

export const adminLogin = createServerFn({ method: 'POST' })
  .validator((d: { password: string }) => z.object({ password: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const ip = await hashedIp()
    if (!(await rateLimit(`a:${ip}`, 8, 900))) return { ok: false, error: 'Too many attempts. Try again in a few minutes.' }
    const expected = process.env.ADMIN_PASSWORD
    if (!expected || data.password !== expected) return { ok: false, error: 'Wrong password.' }
    setCookie(COOKIE, await sign(`admin:${Date.now() + 12 * 3600 * 1000}`), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 12 * 3600 })
    return { ok: true }
  })

export const adminLogout = createServerFn({ method: 'POST' }).handler(async () => { deleteCookie(COOKIE, { path: '/' }); return { ok: true } })

export const adminList = createServerFn({ method: 'GET' }).handler(async () => {
  if (!(await isAdmin())) return { ok: false as const, comments: [] as CommentRow[] }
  const rows = await getStore().all()
  return { ok: true as const, comments: rows.map((r) => ({ ...r, ipHash: r.ipHash.slice(0, 6) })) }
})

export const adminAct = createServerFn({ method: 'POST' })
  .validator((d: { id: string; action: 'approve' | 'reject' | 'delete' | 'pin' | 'unpin' }) =>
    z.object({ id: z.string().max(64), action: z.enum(['approve', 'reject', 'delete', 'pin', 'unpin']) }).parse(d))
  .handler(async ({ data }) => {
    if (!(await isAdmin())) return { ok: false }
    const s = getStore()
    if (data.action === 'delete') await s.remove(data.id)
    else if (data.action === 'pin' || data.action === 'unpin') await s.setPinned(data.id, data.action === 'pin')
    else await s.setStatus(data.id, (data.action === 'approve' ? 'approved' : 'rejected') as Status)
    return { ok: true }
  })
