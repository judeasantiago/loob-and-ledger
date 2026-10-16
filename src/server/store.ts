import postgres from 'postgres'

export type Status = 'pending' | 'approved' | 'rejected'
export type CommentRow = {
  id: string
  slug: string
  parentId: string | null
  name: string
  body: string
  status: Status
  pinned: boolean
  reports: number
  createdAt: string
  ipHash: string
  isAdmin: boolean
  editedAt: string | null
}

/** A post saved from the admin. It overrides (or adds to) the markdown files in src/content/posts. */
export type PostRow = {
  slug: string
  n: number
  title: string
  deck: string
  part: number
  hero: string
  published: string
  terms: string[]
  sources: string[]
  prompt: string
  body: string
  deleted: boolean
  updatedAt: string
}

export interface Store {
  mode: 'database' | 'demo'
  insert(c: Pick<CommentRow, 'slug' | 'parentId' | 'name' | 'body' | 'status' | 'ipHash'> & { isAdmin?: boolean }): Promise<CommentRow>
  approved(slug: string): Promise<CommentRow[]>
  all(): Promise<CommentRow[]>
  one(id: string): Promise<CommentRow | undefined>
  setStatus(id: string, status: Status): Promise<void>
  setPinned(id: string, pinned: boolean): Promise<void>
  edit(id: string, name: string, body: string): Promise<void>
  report(id: string): Promise<void>
  remove(id: string): Promise<void>
  posts(): Promise<PostRow[]>
  savePost(p: Omit<PostRow, 'updatedAt'>): Promise<void>
  deletePostRow(slug: string): Promise<void>
}

// Tolerate quotes or stray spaces pasted along with the value.
const url = process.env.DATABASE_URL?.trim().replace(/^["']|["']$/g, '')

function dbStore(connection: string): Store {
  // Works with Supabase's "Transaction pooler" string (port 6543), which does not support prepared statements.
  const sql = postgres(connection, { prepare: false, max: 1, onnotice: () => {}, idle_timeout: 20, connect_timeout: 15, ssl: /localhost|127\.0\.0\.1/.test(connection) ? false : 'require' })
  let ready: Promise<unknown> | null = null
  const init = () =>
    (ready ??= (async () => {
      await sql`CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY, slug TEXT NOT NULL, parent_id TEXT, name TEXT NOT NULL, body TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'approved', pinned BOOLEAN NOT NULL DEFAULT FALSE, reports INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(), ip_hash TEXT NOT NULL DEFAULT '',
        is_admin BOOLEAN NOT NULL DEFAULT FALSE, edited_at TIMESTAMPTZ
      )`
      await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE`
      await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ`
      await sql`CREATE TABLE IF NOT EXISTS posts (
        slug TEXT PRIMARY KEY, n INT NOT NULL, title TEXT NOT NULL, deck TEXT NOT NULL, part INT NOT NULL, hero TEXT NOT NULL,
        published TEXT NOT NULL, terms TEXT NOT NULL DEFAULT '', sources TEXT NOT NULL DEFAULT '', prompt TEXT NOT NULL DEFAULT '',
        body TEXT NOT NULL DEFAULT '', deleted BOOLEAN NOT NULL DEFAULT FALSE, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`
      // Supabase exposes the public schema through its API. Turning on row level security with no policies
      // keeps these tables private; this server connects as the database owner, which bypasses it.
      await sql`ALTER TABLE comments ENABLE ROW LEVEL SECURITY`
      await sql`ALTER TABLE posts ENABLE ROW LEVEL SECURITY`
    })().catch((e) => { ready = null; throw e }))
  const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null)
  const mapC = (r: Record<string, unknown>): CommentRow => ({
    id: r.id as string, slug: r.slug as string, parentId: (r.parent_id as string) ?? null, name: r.name as string, body: r.body as string,
    status: r.status as Status, pinned: r.pinned as boolean, reports: Number(r.reports), createdAt: iso(r.created_at)!, ipHash: r.ip_hash as string,
    isAdmin: Boolean(r.is_admin), editedAt: iso(r.edited_at),
  })
  const list = (s: string) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : [])
  const mapP = (r: Record<string, unknown>): PostRow => ({
    slug: r.slug as string, n: Number(r.n), title: r.title as string, deck: r.deck as string, part: Number(r.part), hero: r.hero as string,
    published: r.published as string, terms: list(r.terms as string), sources: list(r.sources as string), prompt: r.prompt as string,
    body: r.body as string, deleted: Boolean(r.deleted), updatedAt: iso(r.updated_at)!,
  })
  return {
    mode: 'database',
    async insert(c) {
      await init()
      const id = crypto.randomUUID()
      const rows = await sql`INSERT INTO comments (id, slug, parent_id, name, body, status, ip_hash, is_admin)
        VALUES (${id}, ${c.slug}, ${c.parentId}, ${c.name}, ${c.body}, ${c.status}, ${c.ipHash}, ${Boolean(c.isAdmin)}) RETURNING *`
      return mapC(rows[0])
    },
    async approved(slug) {
      await init()
      return (await sql`SELECT * FROM comments WHERE slug = ${slug} AND status = 'approved' ORDER BY pinned DESC, created_at DESC`).map(mapC)
    },
    async all() {
      await init()
      return (await sql`SELECT * FROM comments ORDER BY (reports > 0) DESC, created_at DESC LIMIT 500`).map(mapC)
    },
    async one(id) {
      await init()
      const rows = await sql`SELECT * FROM comments WHERE id = ${id}`
      return rows[0] ? mapC(rows[0]) : undefined
    },
    async setStatus(id, status) { await init(); await sql`UPDATE comments SET status = ${status} WHERE id = ${id}` },
    async setPinned(id, pinned) { await init(); await sql`UPDATE comments SET pinned = ${pinned} WHERE id = ${id}` },
    async edit(id, name, body) { await init(); await sql`UPDATE comments SET name = ${name}, body = ${body}, edited_at = now() WHERE id = ${id}` },
    async report(id) {
      await init()
      // three reports hide a comment until the author of the site reviews it
      await sql`UPDATE comments SET reports = reports + 1, status = CASE WHEN reports + 1 >= 3 THEN 'pending' ELSE status END WHERE id = ${id}`
    },
    async remove(id) { await init(); await sql`DELETE FROM comments WHERE id = ${id} OR parent_id = ${id}` },
    async posts() { await init(); return (await sql`SELECT * FROM posts`).map(mapP) },
    async savePost(p) {
      await init()
      await sql`INSERT INTO posts (slug, n, title, deck, part, hero, published, terms, sources, prompt, body, deleted, updated_at)
        VALUES (${p.slug}, ${p.n}, ${p.title}, ${p.deck}, ${p.part}, ${p.hero}, ${p.published}, ${p.terms.join(',')}, ${p.sources.join(',')}, ${p.prompt}, ${p.body}, ${p.deleted}, now())
        ON CONFLICT (slug) DO UPDATE SET n = EXCLUDED.n, title = EXCLUDED.title, deck = EXCLUDED.deck, part = EXCLUDED.part, hero = EXCLUDED.hero,
          published = EXCLUDED.published, terms = EXCLUDED.terms, sources = EXCLUDED.sources, prompt = EXCLUDED.prompt, body = EXCLUDED.body,
          deleted = EXCLUDED.deleted, updated_at = now()`
    },
    async deletePostRow(slug) { await init(); await sql`DELETE FROM posts WHERE slug = ${slug}` },
  }
}

function demoStore(): Store {
  const g = globalThis as unknown as { __ll_comments?: CommentRow[]; __ll_posts?: PostRow[] }
  const rows = (g.__ll_comments ??= [])
  const posts = (g.__ll_posts ??= [])
  return {
    mode: 'demo',
    async insert(c) {
      const row: CommentRow = { ...c, isAdmin: Boolean(c.isAdmin), id: crypto.randomUUID(), createdAt: new Date().toISOString(), reports: 0, pinned: false, editedAt: null }
      rows.unshift(row)
      return row
    },
    async approved(slug) { return rows.filter((r) => r.slug === slug && r.status === 'approved').sort((a, b) => Number(b.pinned) - Number(a.pinned)) },
    async all() { return [...rows].sort((a, b) => Number(b.reports > 0) - Number(a.reports > 0)) },
    async one(id) { return rows.find((r) => r.id === id) },
    async setStatus(id, status) { const r = rows.find((x) => x.id === id); if (r) r.status = status },
    async setPinned(id, pinned) { const r = rows.find((x) => x.id === id); if (r) r.pinned = pinned },
    async edit(id, name, body) { const r = rows.find((x) => x.id === id); if (r) { r.name = name; r.body = body; r.editedAt = new Date().toISOString() } },
    async report(id) { const r = rows.find((x) => x.id === id); if (r && ++r.reports >= 3) r.status = 'pending' },
    async remove(id) { for (let i = rows.length - 1; i >= 0; i--) if (rows[i].id === id || rows[i].parentId === id) rows.splice(i, 1) },
    async posts() { return posts },
    async savePost(p) {
      const row = { ...p, updatedAt: new Date().toISOString() }
      const i = posts.findIndex((x) => x.slug === p.slug)
      if (i >= 0) posts[i] = row; else posts.push(row)
    },
    async deletePostRow(slug) { const i = posts.findIndex((x) => x.slug === slug); if (i >= 0) posts.splice(i, 1) },
  }
}

let store: Store | undefined
export const getStore = () => (store ??= url ? dbStore(url) : demoStore())
