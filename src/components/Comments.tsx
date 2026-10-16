import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { adminAct, adminEditComment, listComments, postComment, reportComment } from '~/server/comments'
import type { PublicComment } from '~/server/comments'
import { toast } from './Share'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

declare global {
  interface Window { turnstile?: { render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id?: string) => void } }
}

function ago(iso: string) {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`
  if (s < 86400) return `${Math.round(s / 3600)} h ago`
  if (s < 86400 * 30) return `${Math.round(s / 86400)} d ago`
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}
const hue = (name: string) => [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 3
const AVATARS = ['bg-teal text-teal-ink', 'bg-accent text-on-accent', 'bg-gold text-[#1F1A17]']

export function useCommentCount(slug: string) {
  const list = useServerFn(listComments)
  const q = useQuery({ queryKey: ['comments', slug], queryFn: () => list({ data: { slug } }) })
  return { count: q.data?.comments.length ?? 0, query: q }
}

export function Comments({ slug, prompt }: { slug: string; prompt: string }) {
  const { query } = useCommentCount(slug)
  const qc = useQueryClient()
  const post = useServerFn(postComment)
  const report = useServerFn(reportComment)
  const act = useServerFn(adminAct)
  const editFn = useServerFn(adminEditComment)
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editBody, setEditBody] = useState('')
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [website, setWebsite] = useState('')
  const [parent, setParent] = useState<PublicComment | null>(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const [token, setToken] = useState<string>()
  const [openedAt] = useState(() => Date.now())
  const tsRef = useRef<HTMLDivElement>(null)
  const widget = useRef<string | undefined>(undefined)

  useEffect(() => {
    try { setName(localStorage.getItem('ll_name') ?? '') } catch { /* private mode */ }
  }, [])
  useEffect(() => {
    if (!SITE_KEY || !tsRef.current) return
    const mount = () => {
      if (!window.turnstile || !tsRef.current || widget.current) return
      widget.current = window.turnstile.render(tsRef.current, { sitekey: SITE_KEY, callback: (t: string) => setToken(t), 'expired-callback': () => setToken(undefined), theme: 'auto' })
    }
    if (window.turnstile) return mount()
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true; s.onload = mount
    document.head.appendChild(s)
  }, [])

  const submit = useMutation({
    mutationFn: () => post({ data: { slug, parentId: parent?.id ?? null, name, body, website, openedAt, token } }),
    onSuccess: (r) => {
      if (r.ok) {
        setDone(r.message); setBody(''); setError(''); setParent(null)
        try { localStorage.setItem('ll_name', name) } catch { /* ignore */ }
        void qc.invalidateQueries({ queryKey: ['comments', slug] })
        window.turnstile?.reset(widget.current); setToken(undefined)
      } else setError(r.error)
    },
    onError: () => setError('Something went wrong. Please try again.'),
  })

  const { tops, replies } = useMemo(() => {
    const all = query.data?.comments ?? []
    return { tops: all.filter((c) => !c.parentId), replies: (id: string) => all.filter((c) => c.parentId === id).reverse() }
  }, [query.data])
  const count = query.data?.comments.length ?? 0

  const viewerIsAdmin = Boolean(query.data?.viewerIsAdmin)
  const refresh = () => qc.invalidateQueries({ queryKey: ['comments', slug] })
  const item = (c: PublicComment, nested = false) => (
    <div key={c.id} className={`grid grid-cols-[36px_1fr] gap-3 border-t border-line py-4 ${nested ? 'ml-11' : ''}`}>
      <div className={`grid h-9 w-9 place-items-center rounded-full font-display font-bold ${c.isAdmin ? 'bg-ink text-paper' : AVATARS[hue(c.name)]}`} aria-hidden="true">{c.name.slice(0, 1).toUpperCase()}</div>
      <div className="min-w-0">
        <div className="font-ui text-sm"><b>{c.name}</b>{c.isAdmin && <span className="ml-2 rounded bg-ink px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[.1em] text-paper">Author</span>}{c.pinned && <span className="ml-2 text-[11px] font-semibold uppercase tracking-[.1em] text-gold">Pinned</span>}<span className="ml-2 text-xs text-soft">{ago(c.createdAt)}{c.editedAt ? ' · edited' : ''}</span></div>
        {editing === c.id ? (
          <form className="mt-2 grid gap-2" onSubmit={async (e) => {
            e.preventDefault()
            const r = await editFn({ data: { id: c.id, name: editName, body: editBody } })
            if (r.ok) { setEditing(null); toast('Comment updated.'); void refresh() } else toast(r.error ?? 'Could not save.')
          }}>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={40} aria-label="Name" className="rounded-[3px] border border-line bg-paper px-3 py-1.5 font-ui text-sm" />
            <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} maxLength={1200} rows={4} aria-label="Comment" className="rounded-[3px] border border-line bg-paper px-3 py-2 font-body text-[17px]" />
            <div className="flex gap-2 font-ui text-sm"><button className="rounded-[3px] bg-teal px-3 py-1.5 font-semibold text-teal-ink">Save</button><button type="button" onClick={() => setEditing(null)} className="rounded-[3px] border border-line px-3 py-1.5">Cancel</button></div>
          </form>
        ) : <p className="my-1 whitespace-pre-wrap break-words text-[17px] leading-relaxed">{c.body}</p>}
        <div className="flex flex-wrap gap-4 font-ui text-xs text-soft">
          {!nested && <button type="button" className="hover:text-accent" onClick={() => { setParent(c); document.getElementById('comment-body')?.focus() }}>Reply</button>}
          {!viewerIsAdmin && <button type="button" className="hover:text-accent" onClick={async () => { await report({ data: { id: c.id } }); toast('Thanks, we will take a look.') }}>Report</button>}
          {viewerIsAdmin && c.isAdmin && editing !== c.id && <button type="button" className="hover:text-accent" onClick={() => { setEditing(c.id); setEditName(c.name); setEditBody(c.body) }}>Edit</button>}
          {viewerIsAdmin && <button type="button" className="text-accent hover:underline" onClick={async () => { if (!window.confirm('Delete this comment' + (nested ? '?' : ' and its replies?'))) return; await act({ data: { id: c.id, action: 'delete' } }); toast('Comment deleted.'); void refresh() }}>Delete</button>}
        </div>
      </div>
    </div>
  )

  return (
    <section id="comments" aria-labelledby="comments-h" className="mt-14 scroll-mt-24">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 id="comments-h" className="display text-2xl font-bold">Comments{count ? ` (${count})` : ''}</h2>
        {query.data?.mode === 'demo' && <span className="rounded bg-gold/25 px-2 py-0.5 font-ui text-[11px] font-semibold uppercase tracking-wide">Demo mode: comments are not saved permanently</span>}
        {viewerIsAdmin && <span className="rounded bg-ink px-2 py-0.5 font-ui text-[11px] font-semibold uppercase tracking-wide text-paper">Signed in as author</span>}
      </div>
      <div className="mb-6 rounded bg-teal p-5 text-teal-ink">
        <div className="eyebrow opacity-80">Reflection</div>
        <p className="display mt-1 text-xl leading-snug">{prompt}</p>
      </div>
      <form className="grid gap-3 rounded border border-line bg-card p-4 font-ui" onSubmit={(e) => { e.preventDefault(); setDone(''); setError(''); submit.mutate() }}>
        {parent && <div className="flex items-center justify-between rounded bg-paper px-3 py-2 text-sm">Replying to {parent.name}<button type="button" className="text-accent" onClick={() => setParent(null)}>Cancel</button></div>}
        <div>
          <label htmlFor="comment-name" className="text-xs font-medium text-soft">Name or nickname</label>
          <input id="comment-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required placeholder="e.g. Ate Mia" autoComplete="nickname"
            className="mt-1 w-full rounded-[3px] border border-line bg-paper px-3 py-2 text-[15px]" />
        </div>
        <div>
          <label htmlFor="comment-body" className="text-xs font-medium text-soft">Share your kwento</label>
          <textarea id="comment-body" value={body} onChange={(e) => setBody(e.target.value)} maxLength={1200} required minLength={3} rows={4} placeholder="Kind, specific, and about your own experience."
            className="mt-1 w-full rounded-[3px] border border-line bg-paper px-3 py-2 font-body text-[17px]" />
        </div>
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label></div>
        {SITE_KEY && <div ref={tsRef} />}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-soft">
          <span>{body.length}/1200 · Comments post right away. No links, please.</span>
          <button type="submit" disabled={submit.isPending || (Boolean(SITE_KEY) && !token)} className="min-h-11 rounded-[3px] bg-teal px-5 text-sm font-semibold text-teal-ink disabled:opacity-60">{submit.isPending ? 'Posting…' : 'Post comment'}</button>
        </div>
        {error && <p role="alert" className="text-sm font-medium text-accent">{error}</p>}
        {done && <p role="status" className="text-sm font-medium text-teal">{done}</p>}
      </form>
      <p className="my-3 font-ui text-xs text-soft">Be kind, don’t name relatives, and please don’t give mental-health advice. <a className="text-accent" href="/community">Comment policy</a></p>
      {query.isLoading ? <p className="font-ui text-sm text-soft">Loading comments…</p> : tops.length === 0 ? (
        <p className="border-t border-line py-6 font-ui text-sm text-soft">No comments yet. Be the first to share your kwento.</p>
      ) : (
        <div>
          {tops.map((c) => (
            <div key={c.id}>
              {item(c)}
              {replies(c.id).map((x) => item(x, true))}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
