import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { adminDeletePost, adminListPosts } from '~/server/posts'

export const Route = createFileRoute('/admin/')({
  loader: () => adminListPosts(),
  component: Posts,
})

const BADGE: Record<string, string> = { original: 'bg-line/60', edited: 'bg-gold/40', new: 'bg-teal text-teal-ink', deleted: 'bg-accent/20 text-accent' }

function Posts() {
  const { posts } = Route.useLoaderData()
  const router = useRouter()
  const del = useServerFn(adminDeletePost)
  const run = async (slug: string, restore = false) => { await del({ data: { slug, restore } }); void router.invalidate() }
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-3xl font-bold">Posts</h1>
        <Link to="/admin/posts/$slug" params={{ slug: 'new' }} className="rounded-[3px] bg-accent px-4 py-2 font-ui text-sm font-semibold text-on-accent no-underline">New post</Link>
      </div>
      <ul className="mt-6 grid gap-3">
        {posts.map((p) => (
          <li key={p.slug} className={`flex flex-wrap items-center justify-between gap-3 rounded border border-line bg-card px-4 py-3 ${p.state === 'deleted' ? 'opacity-60' : ''}`}>
            <div className="min-w-0">
              <div className="font-ui text-xs text-soft">#{p.n} · Part {p.part} · {p.published} <span className={`ml-2 rounded px-1.5 py-0.5 font-semibold ${BADGE[p.state]}`}>{p.state}</span></div>
              <div className="display truncate text-lg font-bold">{p.title}</div>
            </div>
            <div className="flex gap-2 font-ui text-sm">
              {p.state !== 'deleted' && <a href={`/journal/${p.slug}`} className="rounded-[3px] border border-line px-3 py-1.5 no-underline">View</a>}
              {p.state !== 'deleted' && <Link to="/admin/posts/$slug" params={{ slug: p.slug }} className="rounded-[3px] bg-teal px-3 py-1.5 text-teal-ink no-underline">Edit</Link>}
              {p.state === 'deleted' || p.state === 'edited'
                ? <button onClick={() => run(p.slug, true)} className="rounded-[3px] border border-line px-3 py-1.5">{p.state === 'deleted' ? 'Restore' : 'Revert to original'}</button> : null}
              {p.state !== 'deleted' && <button onClick={() => { if (window.confirm(`Delete “${p.title}”?${p.state === 'original' || p.state === 'edited' ? ' Original posts are hidden, and you can restore them later.' : ' This cannot be undone.'}`)) void run(p.slug) }} className="rounded-[3px] border border-accent px-3 py-1.5 text-accent">Delete</button>}
            </div>
          </li>
        ))}
        {posts.length === 0 && <li className="font-ui text-sm text-soft">No posts yet.</li>}
      </ul>
    </div>
  )
}
