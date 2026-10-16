import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { adminAct, adminList, adminLogin, adminLogout, adminStatus } from '~/server/comments'

export const Route = createFileRoute('/admin/comments')({
  head: () => ({ meta: [{ title: 'Moderation · Loob & Ledger' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  loader: async () => {
    const status = await adminStatus()
    const list = status.signedIn ? await adminList() : { ok: false as const, comments: [] }
    return { status, comments: list.comments }
  },
  component: Admin,
})

function Admin() {
  const { status, comments } = Route.useLoaderData()
  const router = useRouter()
  const login = useServerFn(adminLogin)
  const logout = useServerFn(adminLogout)
  const act = useServerFn(adminAct)
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')

  if (!status.signedIn) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="display text-3xl font-bold">Moderation</h1>
        {!status.configured && <p className="mt-3 rounded border border-line bg-card p-3 font-ui text-sm">ADMIN_PASSWORD is not set. Add it to your environment variables to enable sign-in.</p>}
        <form className="mt-6 grid gap-3" onSubmit={async (e) => { e.preventDefault(); const r = await login({ data: { password: pw } }); if (r.ok) router.invalidate(); else setErr(r.error ?? 'Could not sign in') }}>
          <label htmlFor="pw" className="font-ui text-sm font-semibold">Password</label>
          <input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="rounded-[3px] border border-line bg-card px-3 py-2" autoComplete="current-password" />
          {err && <p role="alert" className="font-ui text-sm text-accent">{err}</p>}
          <button className="rounded-[3px] bg-ink px-4 py-2 font-ui text-sm font-semibold text-paper">Sign in</button>
        </form>
      </div>
    )
  }

  const shown = comments.filter((c) => filter === 'all' || c.status === filter)
  const run = async (id: string, action: 'approve' | 'reject' | 'delete' | 'pin' | 'unpin') => { await act({ data: { id, action } }); router.invalidate() }
  const counts = (s: string) => comments.filter((c) => c.status === s).length

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-3xl font-bold">Moderation</h1>
        <div className="flex items-center gap-3 font-ui text-sm">
          <span className="rounded-full bg-gold/30 px-3 py-1">{status.mode === 'demo' ? 'Demo mode · comments reset on restart' : 'Database connected'}</span>
          <button onClick={async () => { await logout(); router.invalidate() }} className="underline">Sign out</button>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 font-ui text-sm" role="tablist">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={`rounded-full border px-3 py-1 ${filter === f ? 'border-ink bg-ink text-paper' : 'border-line'}`}>
            {f}{f !== 'all' && ` (${counts(f)})`}
          </button>
        ))}
      </div>
      <ul className="mt-6 grid gap-4">
        {shown.length === 0 && <li className="font-ui text-sm text-soft">Nothing here.</li>}
        {shown.map((c) => (
          <li key={c.id} className="rounded border border-line bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 font-ui text-xs text-soft">
              <span><b className="text-ink">{c.name}</b> on <a className="text-accent" href={`/journal/${c.slug}`}>{c.slug}</a> · {new Date(c.createdAt).toLocaleString()}</span>
              <span>{c.status}{c.pinned ? ' · pinned' : ''}{c.reports ? ` · ${c.reports} report(s)` : ''}{c.parentId ? ' · reply' : ''}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap">{c.body}</p>
            <div className="mt-3 flex flex-wrap gap-2 font-ui text-sm">
              {c.status !== 'approved' && <button onClick={() => run(c.id, 'approve')} className="rounded-[3px] bg-teal px-3 py-1 text-teal-ink">Approve</button>}
              {c.status !== 'rejected' && <button onClick={() => run(c.id, 'reject')} className="rounded-[3px] border border-line px-3 py-1">Reject</button>}
              <button onClick={() => run(c.id, c.pinned ? 'unpin' : 'pin')} className="rounded-[3px] border border-line px-3 py-1">{c.pinned ? 'Unpin' : 'Pin'}</button>
              <button onClick={() => { if (confirm('Delete this comment permanently?')) run(c.id, 'delete') }} className="rounded-[3px] border border-accent px-3 py-1 text-accent">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
