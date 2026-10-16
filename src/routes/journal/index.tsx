import { createFileRoute, Link } from '@tanstack/react-router'
import { PostCard } from '~/components/PostCard'
import { usePosts } from '~/lib/usePosts'
import { PARTS } from '~/lib/site'
import { seo } from '~/lib/seo'

export const Route = createFileRoute('/journal/')({
  validateSearch: (s: Record<string, unknown>): { part?: number } => {
    const n = Number(s.part)
    return n >= 1 && n <= 4 ? { part: n } : {}
  },
  head: () => seo({ title: 'The Journal', description: 'All ten posts in the Loob & Ledger series.', path: '/journal' }),
  component: Journal,
})

function Journal() {
  const { part } = Route.useSearch()
  const POSTS = usePosts()
  const list = part ? POSTS.filter((p) => p.part === part) : POSTS
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="eyebrow text-accent">The journal</div>
      <h1 className="display mt-1 text-4xl font-bold sm:text-5xl">Ten essays, four parts</h1>
      <nav aria-label="Filter by part" className="mt-6 flex flex-wrap gap-2 font-ui text-sm">
        <Link to="/journal" search={{}} className={`rounded-full border px-4 py-2 no-underline ${!part ? 'border-teal bg-teal text-teal-ink' : 'border-line hover:border-accent'}`}>All</Link>
        {PARTS.map((p) => (
          <Link key={p.n} to="/journal" search={{ part: p.n }} className={`rounded-full border px-4 py-2 no-underline ${part === p.n ? 'border-teal bg-teal text-teal-ink' : 'border-line hover:border-accent'}`}>{p.name}</Link>
        ))}
      </nav>
      <div className="mt-10 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => <PostCard key={p.slug} post={p} />)}
      </div>
    </div>
  )
}
