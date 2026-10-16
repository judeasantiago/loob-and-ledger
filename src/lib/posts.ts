import { z } from 'zod'

const raw = import.meta.glob('/src/content/posts/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const Front = z.object({
  n: z.coerce.number(),
  slug: z.string(),
  title: z.string(),
  deck: z.string(),
  part: z.coerce.number(),
  hero: z.string(),
  published: z.string(),
  terms: z.string().default(''),
  sources: z.string().default(''),
  prompt: z.string(),
})

export type Post = Omit<z.infer<typeof Front>, 'terms' | 'sources'> & {
  terms: string[]
  sources: string[]
  body: string
  minutes: number
}

export type PostInput = Omit<Post, 'minutes'>
export const readingMinutes = (body: string) => Math.max(3, Math.round(body.split(/\s+/).length / 200))

function parse(file: string): Post {
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(file.replace(/\r\n/g, '\n'))
  if (!m) throw new Error('Post is missing frontmatter')
  const data: Record<string, string> = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, '$1')
  }
  const f = Front.parse(data)
  const body = m[2].trim()
  return {
    ...f,
    terms: f.terms ? f.terms.split(',').map((s) => s.trim()) : [],
    sources: f.sources ? f.sources.split(',').map((s) => s.trim()) : [],
    body,
    minutes: readingMinutes(body),
  }
}

/** The posts that ship with the code, from src/content/posts/*.md */
export const FILE_POSTS: Post[] = Object.values(raw).map(parse).sort((a, b) => a.n - b.n)

export type PostRecord = PostInput & { deleted?: boolean }

/** Posts saved in the admin override the files with the same slug, or add new ones. */
export function mergePosts(files: Post[], saved: PostRecord[]): Post[] {
  const map = new Map(files.map((p) => [p.slug, p]))
  for (const r of saved) {
    if (r.deleted) map.delete(r.slug)
    else map.set(r.slug, { ...r, minutes: readingMinutes(r.body) })
  }
  return [...map.values()].sort((a, b) => a.n - b.n || a.slug.localeCompare(b.slug))
}

export const findPost = (list: Post[], slug: string) => list.find((p) => p.slug === slug)
export const neighbors = (list: Post[], p: Post) => {
  const i = list.findIndex((x) => x.slug === p.slug)
  return { prev: i > 0 ? list[i - 1] : undefined, next: i >= 0 ? list[i + 1] : undefined }
}
