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
  const words = body.split(/\s+/).length
  return {
    ...f,
    terms: f.terms ? f.terms.split(',').map((s) => s.trim()) : [],
    sources: f.sources ? f.sources.split(',').map((s) => s.trim()) : [],
    body,
    minutes: Math.max(3, Math.round(words / 200)),
  }
}

export const POSTS: Post[] = Object.values(raw).map(parse).sort((a, b) => a.n - b.n)
export const postBySlug = (slug: string) => POSTS.find((p) => p.slug === slug)
export const neighbors = (p: Post) => ({ prev: POSTS.find((x) => x.n === p.n - 1), next: POSTS.find((x) => x.n === p.n + 1) })
