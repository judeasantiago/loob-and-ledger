import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { FILE_POSTS } from '~/lib/posts'
import { HERO_IDS } from '~/components/Hero'
import { GLOSSARY, SOURCES } from '~/lib/site'
import { getStore } from './store'
import { requireAdmin } from './auth'
import { bust, loadPosts } from './posts.server'

export const getPosts = createServerFn({ method: 'GET' }).handler(async () => loadPosts())

/* ---------- admin ---------- */

export const adminListPosts = createServerFn({ method: 'GET' }).handler(async () => {
  if (!(await requireAdmin())) return { ok: false as const, posts: [] }
  const saved = await getStore().posts()
  const bySlug = new Map(saved.map((r) => [r.slug, r]))
  const fileSlugs = new Set(FILE_POSTS.map((p) => p.slug))
  const rows = [
    ...FILE_POSTS.map((p) => {
      const r = bySlug.get(p.slug)
      const live = r && !r.deleted ? r : p
      return { slug: p.slug, n: live.n, title: live.title, part: live.part, published: live.published, state: r ? (r.deleted ? 'deleted' : 'edited') : 'original' } as const
    }),
    ...saved.filter((r) => !fileSlugs.has(r.slug)).map((r) => ({ slug: r.slug, n: r.n, title: r.title, part: r.part, published: r.published, state: 'new' as const })),
  ].sort((a, b) => a.n - b.n)
  return { ok: true as const, posts: rows }
})

export const adminGetPost = createServerFn({ method: 'GET' })
  .validator((d: { slug: string }) => z.object({ slug: z.string().max(80) }).parse(d))
  .handler(async ({ data }) => {
    if (!(await requireAdmin())) return { ok: false as const }
    const saved = (await getStore().posts()).find((r) => r.slug === data.slug)
    const file = FILE_POSTS.find((p) => p.slug === data.slug)
    const src = saved && !saved.deleted ? saved : file
    const nextN = Math.max(0, ...FILE_POSTS.map((p) => p.n), ...(await getStore().posts()).map((r) => r.n)) + 1
    return { ok: true as const, post: src ? { ...src, minutes: undefined } : null, nextN, deleted: Boolean(saved?.deleted) }
  })

const PostSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes only.').max(80),
  n: z.coerce.number().int().min(1).max(999),
  title: z.string().trim().min(1, 'Add a title.').max(160),
  deck: z.string().trim().min(1, 'Add a short summary.').max(400),
  part: z.coerce.number().int().min(1).max(4),
  hero: z.enum(HERO_IDS as unknown as [string, ...string[]]),
  published: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the date format YYYY-MM-DD.'),
  terms: z.array(z.string()).transform((a) => a.filter((t) => GLOSSARY.some((g) => g.slug === t))),
  sources: z.array(z.string()).transform((a) => a.filter((k) => SOURCES.some((s) => s.key === k))),
  prompt: z.string().trim().max(300).default(''),
  body: z.string().trim().min(1, 'The post body is empty.').max(60000),
})

export const adminSavePost = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d)
  .handler(async ({ data }): Promise<{ ok: true; slug: string } | { ok: false; error: string }> => {
    if (!(await requireAdmin())) return { ok: false, error: 'Please sign in again.' }
    const parsed = PostSchema.safeParse(data)
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form.' }
    await getStore().savePost({ ...parsed.data, deleted: false })
    bust()
    return { ok: true, slug: parsed.data.slug }
  })

export const adminDeletePost = createServerFn({ method: 'POST' })
  .validator((d: { slug: string; restore?: boolean }) => z.object({ slug: z.string().max(80), restore: z.boolean().optional() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await requireAdmin())) return { ok: false }
    const store = getStore()
    const file = FILE_POSTS.find((p) => p.slug === data.slug)
    if (data.restore) await store.deletePostRow(data.slug)
    else if (file) {
      // Posts that ship with the code are hidden rather than erased, so they can be restored.
      const saved = (await store.posts()).find((r) => r.slug === data.slug)
      const base = saved ?? { ...file }
      await store.savePost({ slug: base.slug, n: base.n, title: base.title, deck: base.deck, part: base.part, hero: base.hero, published: base.published, terms: base.terms, sources: base.sources, prompt: base.prompt, body: base.body, deleted: true })
    } else await store.deletePostRow(data.slug)
    bust()
    return { ok: true }
  })
