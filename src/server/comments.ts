import { createServerFn } from '@tanstack/react-start'
import { setCookie, deleteCookie } from '@tanstack/react-start/server'
import { z } from 'zod'
import { getStore } from './store'
import type { CommentRow, Status } from './store'
import { checkContent, hashedIp, rateLimit, sign, verifyTurnstile } from './guard'
import { ADMIN_COOKIE, requireAdmin } from './auth'
import { loadPosts } from './posts.server'

export type PublicComment = Pick<CommentRow, 'id' | 'parentId' | 'name' | 'body' | 'pinned' | 'createdAt' | 'isAdmin' | 'editedAt'>
const pub = (c: CommentRow): PublicComment => ({ id: c.id, parentId: c.parentId, name: c.name, body: c.body, pinned: c.pinned, createdAt: c.createdAt, isAdmin: c.isAdmin, editedAt: c.editedAt })

export const listComments = createServerFn({ method: 'GET' })
  .validator((d: { slug: string }) => z.object({ slug: z.string().max(80) }).parse(d))
  .handler(async ({ data }) => {
    const store = getStore()
    let rows: CommentRow[] = []
    try { rows = await store.approved(data.slug) } catch (e) { console.error('comments: could not load', e) }
    return { mode: store.mode, viewerIsAdmin: await requireAdmin(), comments: rows.map(pub) }
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
    if (!(await loadPosts()).some((p) => p.slug === data.slug)) return { ok: false, error: 'That post does not exist.' }
    if (data.website) return { ok: true, message: 'Posted.' } // silently drop bots
    const store = getStore()
    if (await requireAdmin()) {
      // The site owner skips the spam checks.
      await store.insert({ slug: data.slug, parentId: data.parentId, name: data.name, body: data.body, status: 'approved', ipHash: 'admin', isAdmin: true })
      return { ok: true, message: 'Posted.' }
    }
    if (Date.now() - data.openedAt < 4000) return { ok: false, error: 'That was quick. Take a moment and try again.' }
    const ip = await hashedIp()
    if (!(await rateLimit(`c:${ip}`, 6, 3600))) return { ok: false, error: 'You have posted a few comments recently. Please try again later.' }
    if (!(await verifyTurnstile(data.token))) return { ok: false, error: 'We could not verify you are human. Please try again.' }
    const why = checkContent(data.name, data.body)
    if (why) return { ok: false, error: why }
    await store.insert({ slug: data.slug, parentId: data.parentId, name: data.name, body: data.body, status: 'approved', ipHash: ip })
    return { ok: true, message: 'Posted. Thank you for sharing.' }
  })

export const reportComment = createServerFn({ method: 'POST' })
  .validator((d: { id: string }) => z.object({ id: z.string().max(64) }).parse(d))
  .handler(async ({ data }) => {
    const ip = await hashedIp()
    if (!(await rateLimit(`r:${ip}`, 10, 3600))) return { ok: false }
    await getStore().report(data.id)
    return { ok: true }
  })

/* ---------- admin ---------- */

export const adminStatus = createServerFn({ method: 'GET' }).handler(async () => {
  const signedIn = await requireAdmin()
  const store = getStore()
  let dbError: string | null = null
  if (signedIn && store.mode === 'database') {
    // Surface connection problems on screen so they are easy to diagnose.
    try { await store.posts() } catch (e) { dbError = e instanceof Error ? `${e.name}: ${e.message}` : String(e) }
  }
  return {
    signedIn,
    configured: Boolean(process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET),
    mode: store.mode,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    dbError,
  }
})

export const adminLogin = createServerFn({ method: 'POST' })
  .validator((d: { password: string }) => z.object({ password: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const ip = await hashedIp()
    if (!(await rateLimit(`a:${ip}`, 8, 900))) return { ok: false, error: 'Too many attempts. Try again in a few minutes.' }
    const expected = process.env.ADMIN_PASSWORD
    if (!expected || data.password !== expected) return { ok: false, error: 'Wrong password.' }
    setCookie(ADMIN_COOKIE, await sign(`admin:${Date.now() + 14 * 24 * 3600 * 1000}`), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 14 * 24 * 3600 })
    return { ok: true }
  })

export const adminLogout = createServerFn({ method: 'POST' }).handler(async () => { deleteCookie(ADMIN_COOKIE, { path: '/' }); return { ok: true } })

export const adminList = createServerFn({ method: 'GET' }).handler(async () => {
  if (!(await requireAdmin())) return { ok: false as const, comments: [] as CommentRow[] }
  const rows = await getStore().all()
  return { ok: true as const, comments: rows.map((r) => ({ ...r, ipHash: r.ipHash.slice(0, 6) })) }
})

export const adminAct = createServerFn({ method: 'POST' })
  .validator((d: { id: string; action: 'approve' | 'reject' | 'delete' | 'pin' | 'unpin' }) =>
    z.object({ id: z.string().max(64), action: z.enum(['approve', 'reject', 'delete', 'pin', 'unpin']) }).parse(d))
  .handler(async ({ data }) => {
    if (!(await requireAdmin())) return { ok: false }
    const s = getStore()
    if (data.action === 'delete') await s.remove(data.id)
    else if (data.action === 'pin' || data.action === 'unpin') await s.setPinned(data.id, data.action === 'pin')
    else await s.setStatus(data.id, (data.action === 'approve' ? 'approved' : 'rejected') as Status)
    return { ok: true }
  })

/** The owner can edit comments they wrote themselves. */
export const adminEditComment = createServerFn({ method: 'POST' })
  .validator((d: { id: string; name: string; body: string }) =>
    z.object({ id: z.string().max(64), name: z.string().trim().min(1).max(40), body: z.string().trim().min(1).max(1200) }).parse(d))
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    if (!(await requireAdmin())) return { ok: false, error: 'Please sign in again.' }
    const s = getStore()
    const row = await s.one(data.id)
    if (!row) return { ok: false, error: 'Comment not found.' }
    if (!row.isAdmin) return { ok: false, error: 'You can only edit your own comments.' }
    await s.edit(data.id, data.name, data.body)
    return { ok: true }
  })
