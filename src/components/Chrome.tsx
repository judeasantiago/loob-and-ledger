import { createPortal } from 'react-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import MiniSearch from 'minisearch'
import { Mark } from './Hero'
import { GLOSSARY, SITE, SOURCES } from '~/lib/site'
import { usePosts } from '~/lib/usePosts'
import type { Post } from '~/lib/posts'

const NAV = [
  { to: '/journal', label: 'Journal' },
  { to: '/series', label: 'Series' },
  { to: '/study', label: 'The Study' },
  { to: '/glossary', label: 'Glossary' },
] as const

function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 font-display text-[22px] font-bold tracking-tight text-ink no-underline ${className}`} aria-label="Loob & Ledger, home">
      <Mark className="h-7 w-7" />
      <span>Loob <em className="font-medium italic text-accent">&amp;</em> Ledger</span>
    </Link>
  )
}

function ThemeToggle() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const el = document.documentElement
    setDark(el.dataset.theme === 'dark')
  }, [])
  return (
    <button type="button" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title="Light / dark"
      onClick={() => {
        const next = dark ? 'light' : 'dark'
        document.documentElement.dataset.theme = next
        try { localStorage.setItem('ll_theme', next) } catch { /* ignore */ }
        setDark(!dark)
      }}
      className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-card">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {dark ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></> : <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />}
      </svg>
    </button>
  )
}

type Hit = { id: string; kind: 'Post' | 'Term' | 'Source'; title: string; sub: string; to: string; hash?: string }
function buildIndex(POSTS: Post[]) {
  const docs: Hit[] = [
    ...POSTS.map((p) => ({ id: `p-${p.slug}`, kind: 'Post' as const, title: p.title, sub: p.deck, to: `/journal/${p.slug}`, text: p.body })),
    ...GLOSSARY.map((t) => ({ id: `t-${t.slug}`, kind: 'Term' as const, title: t.term, sub: t.short, to: '/glossary', hash: t.slug, text: t.long })),
    ...SOURCES.map((s) => ({ id: `s-${s.key}`, kind: 'Source' as const, title: s.short, sub: s.full, to: '/sources', hash: s.key, text: s.full })),
  ]
  const ms = new MiniSearch({ fields: ['title', 'sub', 'text'], storeFields: ['kind', 'title', 'sub', 'to', 'hash'], searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 3 } } })
  ms.addAll(docs)
  return ms
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const posts = usePosts()
  const ms = useMemo(() => buildIndex(posts), [posts])
  const hits = q.trim() ? ms.search(q).slice(0, 8) : []
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    ref.current?.focus()
    // Escape closes from anywhere, and the page behind does not scroll while the dialog is open.
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[70] grid place-items-start justify-items-center bg-black/50 px-4 pt-[8vh] sm:pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xl overflow-hidden rounded-lg border border-line bg-card shadow-2xl">
        <div className="flex items-center gap-1 border-b border-line pr-2">
          <input ref={ref} type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts, terms, and sources" aria-label="Search"
            className="min-w-0 flex-1 bg-transparent px-4 py-3.5 font-ui text-base outline-none focus-visible:outline-none" />
          {q && (
            <button type="button" onClick={() => { setQ(''); ref.current?.focus() }} aria-label="Clear search" title="Clear"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-soft hover:bg-paper hover:text-ink">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></svg>
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Close search"
            className="shrink-0 rounded-[3px] border border-line px-2.5 py-1.5 font-ui text-xs font-semibold text-soft hover:bg-paper hover:text-ink">Close</button>
        </div>
        <ul className="max-h-[50vh] overflow-auto">
          {q && hits.length === 0 && <li className="px-4 py-6 font-ui text-sm text-soft">Nothing found for “{q}”.</li>}
          {hits.map((h) => (
            <li key={h.id}>
              <a href={`${h.to}${h.hash ? `#${h.hash}` : ''}`} onClick={onClose} className="block px-4 py-3 text-ink no-underline hover:bg-paper">
                <span className="eyebrow mr-2 text-accent">{h.kind as string}</span>
                <span className="font-display text-base font-bold">{h.title as string}</span>
                <span className="mt-0.5 line-clamp-1 block font-ui text-xs text-soft">{h.sub as string}</span>
              </a>
            </li>
          ))}
          {!q && <li className="px-4 py-5 font-ui text-sm text-soft">Try “kapwa”, “pressure”, or “Likert”.</li>}
        </ul>
      </div>
    </div>
  )
}

export function Header() {
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const closeSearch = useCallback(() => setSearch(false), [])
  useEffect(() => {
    const on = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch(true) } }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-6 font-ui text-sm font-medium md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="border-b-2 border-transparent py-1 text-soft no-underline hover:text-ink" activeProps={{ className: 'border-accent !text-ink' }}>{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setSearch(true)} aria-label="Search" className="flex h-10 items-center gap-2 rounded-full px-3 font-ui text-sm text-soft hover:bg-card">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            <span className="hidden sm:inline">Search</span><kbd className="hidden rounded border border-line px-1.5 text-[11px] lg:inline">⌘K</kbd>
          </button>
          <ThemeToggle />
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full hover:bg-card md:hidden" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">{menu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
          </button>
        </div>
      </div>
      {menu && (
        <nav aria-label="Mobile" className="border-t border-line bg-paper px-4 pb-3 md:hidden">
          {[...NAV, { to: '/sources', label: 'Sources' }, { to: '/about', label: 'About' }].map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setMenu(false)} className="block border-b border-line py-3 font-ui text-base text-ink no-underline last:border-0">{n.label}</Link>
          ))}
        </nav>
      )}
      {search && createPortal(<SearchDialog onClose={closeSearch} />, document.body)}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm font-ui text-sm text-soft">{SITE.tagline}</p>
          <p className="mt-4 font-ui text-xs text-soft">
            By {SITE.authors.join(', ')}.<br />{SITE.university} · {SITE.program}
          </p>
        </div>
        <div className="font-ui text-sm">
          <div className="eyebrow mb-3 text-soft">Read</div>
          <ul className="grid gap-2"><li><Link to="/journal">All posts</Link></li><li><Link to="/series">The series</Link></li><li><Link to="/glossary">Glossary</Link></li><li><a href="/rss.xml">RSS feed</a></li></ul>
        </div>
        <div className="font-ui text-sm">
          <div className="eyebrow mb-3 text-soft">About</div>
          <ul className="grid gap-2"><li><Link to="/study">The study</Link></li><li><Link to="/sources">Sources</Link></li><li><Link to="/about">The team</Link></li><li><Link to="/community">Comment policy and privacy</Link></li></ul>
        </div>
      </div>
      <div className="border-t border-line px-4 py-4 text-center font-ui text-xs text-soft">
        These posts are explanatory essays based on a research proposal in progress. They are not peer-reviewed findings.
      </div>
    </footer>
  )
}
