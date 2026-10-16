import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { SOURCES } from '~/lib/site'
import { POSTS } from '~/lib/posts'
import { seo } from '~/lib/seo'

export const Route = createFileRoute('/sources')({
  head: () => seo({ title: 'Sources', description: 'The 26 references behind the series, with links and the posts that use them.', path: '/sources' }),
  component: Sources,
})

function Sources() {
  const [q, setQ] = useState('')
  const list = SOURCES.filter((s) => s.full.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="eyebrow text-accent">Sources</div>
      <h1 className="display mt-1 text-4xl font-bold sm:text-5xl">What we read</h1>
      <p className="mt-3 text-xl text-soft">The {SOURCES.length} references from the research proposal, in alphabetical order. Each shows which posts draw on it.</p>
      <label htmlFor="src-q" className="sr-only">Filter sources</label>
      <input id="src-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by author, topic, or journal" className="mt-6 w-full rounded-[3px] border border-line bg-card px-4 py-3 font-ui text-base" />
      <ol className="mt-8 grid gap-6">
        {list.map((s) => {
          const used = POSTS.filter((p) => p.sources.includes(s.key))
          return (
            <li key={s.key} id={s.key} className="scroll-mt-24 border-t border-line pt-4">
              <p className="text-[17px] leading-snug">{s.full}</p>
              <p className="mt-2 font-ui text-sm"><a className="break-all text-accent" href={s.url} target="_blank" rel="noopener noreferrer">{s.url}</a></p>
              {used.length > 0 && <p className="mt-1 font-ui text-xs text-soft">Used in: {used.map((p, i) => <span key={p.slug}>{i > 0 && ', '}<a href={`/journal/${p.slug}`} className="hover:text-accent">Post {p.n}</a></span>)}</p>}
            </li>
          )
        })}
        {list.length === 0 && <li className="font-ui text-sm text-soft">No sources match “{q}”.</li>}
      </ol>
    </div>
  )
}
