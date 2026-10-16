import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { adminAct, adminEditComment, adminList } from '~/server/comments'

export const Route = createFileRoute('/admin/comments')({
  loader: () => adminList().catch(() => ({ ok: false as const, comments: [] })),
  component: AdminComments,
})

function AdminComments() {
  const { comments } = Route.useLoaderData()
  const router = useRouter()
  const act = useServerFn(adminAct)
  const edit = useServerFn(adminEditComment)
  const [filter, setFilter] = useState<'all' | 'hidden' | 'reported'>('all')
  const [editing, setEditing] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [msg, setMsg] = useState('')

  const shown = comments.filter((c) => filter === 'all' || (filter === 'hidden' ? c.status !== 'approved' : c.reports > 0))
  const run = async (id: string, action: 'approve' | 'reject' | 'delete' | 'pin' | 'unpin') => { await act({ data: { id, action } }); void router.invalidate() }

  return (
    <div>
      <h1 className="display text-3xl font-bold">Comments</h1>
      <p className="mt-1 font-ui text-sm text-soft">Comments post automatically. Delete anything that does not belong. A comment reported three times is hidden until you restore it.</p>
      <div className="mt-5 flex flex-wrap gap-2 font-ui text-sm" role="tablist">
        {(['all', 'reported', 'hidden'] as const).map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={`rounded-full border px-3 py-1 ${filter === f ? 'border-ink bg-ink text-paper' : 'border-line'}`}>
            {f}{f === 'all' ? ` (${comments.length})` : f === 'reported' ? ` (${comments.filter((c) => c.reports > 0).length})` : ` (${comments.filter((c) => c.status !== 'approved').length})`}
          </button>
        ))}
      </div>
      {msg && <p role="status" className="mt-3 font-ui text-sm text-accent">{msg}</p>}
      <ul className="mt-6 grid gap-4">
        {shown.length === 0 && <li className="font-ui text-sm text-soft">Nothing here.</li>}
        {shown.map((c) => (
          <li key={c.id} className="rounded border border-line bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 font-ui text-xs text-soft">
              <span><b className="text-ink">{c.name}</b>{c.isAdmin ? ' (you)' : ''} on <a className="text-accent" href={`/journal/${c.slug}#comments`}>{c.slug}</a> · {new Date(c.createdAt).toLocaleString()}{c.editedAt ? ' · edited' : ''}</span>
              <span>{c.status === 'approved' ? 'live' : 'hidden'}{c.pinned ? ' · pinned' : ''}{c.reports ? ` · ${c.reports} report(s)` : ''}{c.parentId ? ' · reply' : ''}</span>
            </div>
            {editing === c.id ? (
              <form className="mt-2 grid gap-2" onSubmit={async (e) => { e.preventDefault(); const r = await edit({ data: { id: c.id, name, body } }); if (r.ok) { setEditing(null); setMsg(''); void router.invalidate() } else setMsg(r.error ?? 'Could not save.') }}>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} aria-label="Name" className="rounded-[3px] border border-line bg-paper px-3 py-1.5 font-ui text-sm" />
                <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={1200} rows={4} aria-label="Comment" className="rounded-[3px] border border-line bg-paper px-3 py-2" />
                <div className="flex gap-2 font-ui text-sm"><button className="rounded-[3px] bg-teal px-3 py-1.5 font-semibold text-teal-ink">Save</button><button type="button" onClick={() => setEditing(null)} className="rounded-[3px] border border-line px-3 py-1.5">Cancel</button></div>
              </form>
            ) : <p className="mt-2 whitespace-pre-wrap">{c.body}</p>}
            <div className="mt-3 flex flex-wrap gap-2 font-ui text-sm">
              {c.status !== 'approved' && <button onClick={() => run(c.id, 'approve')} className="rounded-[3px] bg-teal px-3 py-1 text-teal-ink">Restore</button>}
              {c.status === 'approved' && <button onClick={() => run(c.id, 'reject')} className="rounded-[3px] border border-line px-3 py-1">Hide</button>}
              {c.isAdmin && editing !== c.id && <button onClick={() => { setEditing(c.id); setName(c.name); setBody(c.body); setMsg('') }} className="rounded-[3px] border border-line px-3 py-1">Edit</button>}
              <button onClick={() => run(c.id, c.pinned ? 'unpin' : 'pin')} className="rounded-[3px] border border-line px-3 py-1">{c.pinned ? 'Unpin' : 'Pin'}</button>
              <button onClick={() => { if (window.confirm('Delete this comment permanently?')) void run(c.id, 'delete') }} className="rounded-[3px] border border-accent px-3 py-1 text-accent">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
