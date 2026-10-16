import { useState } from 'react'
import { createFileRoute, Link, Outlet, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { adminLogin, adminLogout, adminStatus } from '~/server/comments'

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [{ title: 'Admin · Loob & Ledger' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  loader: () => adminStatus(),
  component: AdminLayout,
})

function AdminLayout() {
  const status = Route.useLoaderData()
  const router = useRouter()
  const login = useServerFn(adminLogin)
  const logout = useServerFn(adminLogout)
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')

  if (!status.signedIn) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="display text-3xl font-bold">Admin sign in</h1>
        {!status.configured && <p className="mt-3 rounded border border-line bg-card p-3 font-ui text-sm">ADMIN_PASSWORD and SESSION_SECRET are not set yet. Add both in your environment variables, redeploy, then sign in.</p>}
        <form className="mt-6 grid gap-3" onSubmit={async (e) => { e.preventDefault(); const r = await login({ data: { password: pw } }); if (r.ok) { setErr(''); void router.invalidate() } else setErr(r.error ?? 'Could not sign in') }}>
          <label htmlFor="pw" className="font-ui text-sm font-semibold">Password</label>
          <input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="rounded-[3px] border border-line bg-card px-3 py-2" autoComplete="current-password" />
          {err && <p role="alert" className="font-ui text-sm text-accent">{err}</p>}
          <button className="rounded-[3px] bg-ink px-4 py-2 font-ui text-sm font-semibold text-paper">Sign in</button>
        </form>
      </div>
    )
  }

  const tab = 'border-b-2 border-transparent py-2 text-soft no-underline hover:text-ink'
  const on = { className: 'border-accent !text-ink' }
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line font-ui text-sm font-medium">
        <nav className="flex gap-6" aria-label="Admin">
          <Link to="/admin" activeOptions={{ exact: true }} className={tab} activeProps={on}>Posts</Link>
          <Link to="/admin/comments" className={tab} activeProps={on}>Comments</Link>
          <Link to="/" className={tab}>View site</Link>
        </nav>
        <div className="flex items-center gap-3 pb-2">
          <span className="rounded-full bg-gold/30 px-3 py-1 text-xs">{status.mode === 'demo' ? 'Demo mode · nothing is saved permanently' : 'Database connected'}</span>
          <button onClick={async () => { await logout(); void router.invalidate() }} className="underline">Sign out</button>
        </div>
      </div>
      <div className="mt-8"><Outlet /></div>
    </div>
  )
}
