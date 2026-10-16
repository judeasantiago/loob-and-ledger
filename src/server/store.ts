import { neon } from '@neondatabase/serverless'

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
}

export interface Store {
  mode: 'database' | 'demo'
  insert(c: Omit<CommentRow, 'id' | 'createdAt' | 'reports' | 'pinned'>): Promise<CommentRow>
  approved(slug: string): Promise<CommentRow[]>
  all(status?: Status): Promise<CommentRow[]>
  setStatus(id: string, status: Status): Promise<void>
  setPinned(id: string, pinned: boolean): Promise<void>
  report(id: string): Promise<void>
  remove(id: string): Promise<void>
}

const url = process.env.DATABASE_URL

function dbStore(connection: string): Store {
  const sql = neon(connection)
  let ready: Promise<unknown> | null = null
  const init = () =>
    (ready ??= sql`CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY, slug TEXT NOT NULL, parent_id TEXT, name TEXT NOT NULL, body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', pinned BOOLEAN NOT NULL DEFAULT FALSE, reports INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(), ip_hash TEXT NOT NULL DEFAULT ''
    )`)
  const map = (r: Record<string, unknown>): CommentRow => ({
    id: r.id as string, slug: r.slug as string, parentId: (r.parent_id as string) ?? null, name: r.name as string, body: r.body as string,
    status: r.status as Status, pinned: r.pinned as boolean, reports: Number(r.reports), createdAt: new Date(r.created_at as string).toISOString(), ipHash: r.ip_hash as string,
  })
  return {
    mode: 'database',
    async insert(c) {
      await init()
      const id = crypto.randomUUID()
      const rows = await sql`INSERT INTO comments (id, slug, parent_id, name, body, status, ip_hash)
        VALUES (${id}, ${c.slug}, ${c.parentId}, ${c.name}, ${c.body}, ${c.status}, ${c.ipHash}) RETURNING *`
      return map(rows[0])
    },
    async approved(slug) {
      await init()
      const rows = await sql`SELECT * FROM comments WHERE slug = ${slug} AND status = 'approved' ORDER BY pinned DESC, created_at DESC`
      return rows.map(map)
    },
    async all(status) {
      await init()
      const rows = status
        ? await sql`SELECT * FROM comments WHERE status = ${status} ORDER BY created_at DESC LIMIT 300`
        : await sql`SELECT * FROM comments ORDER BY (reports > 0) DESC, created_at DESC LIMIT 300`
      return rows.map(map)
    },
    async setStatus(id, status) { await init(); await sql`UPDATE comments SET status = ${status} WHERE id = ${id}` },
    async setPinned(id, pinned) { await init(); await sql`UPDATE comments SET pinned = ${pinned} WHERE id = ${id}` },
    async report(id) {
      await init()
      // three reports hide a comment pending review
      await sql`UPDATE comments SET reports = reports + 1, status = CASE WHEN reports + 1 >= 3 THEN 'pending' ELSE status END WHERE id = ${id}`
    },
    async remove(id) { await init(); await sql`DELETE FROM comments WHERE id = ${id} OR parent_id = ${id}` },
  }
}

function demoStore(): Store {
  const g = globalThis as unknown as { __ll_comments?: CommentRow[] }
  const rows = (g.__ll_comments ??= [])
  return {
    mode: 'demo',
    async insert(c) {
      const row: CommentRow = { ...c, id: crypto.randomUUID(), createdAt: new Date().toISOString(), reports: 0, pinned: false }
      rows.unshift(row)
      return row
    },
    async approved(slug) { return rows.filter((r) => r.slug === slug && r.status === 'approved').sort((a, b) => Number(b.pinned) - Number(a.pinned)) },
    async all(status) { return rows.filter((r) => !status || r.status === status) },
    async setStatus(id, status) { const r = rows.find((x) => x.id === id); if (r) r.status = status },
    async setPinned(id, pinned) { const r = rows.find((x) => x.id === id); if (r) r.pinned = pinned },
    async report(id) { const r = rows.find((x) => x.id === id); if (r && ++r.reports >= 3) r.status = 'pending' },
    async remove(id) { for (let i = rows.length - 1; i >= 0; i--) if (rows[i].id === id || rows[i].parentId === id) rows.splice(i, 1) },
  }
}

let store: Store | undefined
export const getStore = () => (store ??= url ? dbStore(url) : demoStore())
