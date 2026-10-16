import { Link } from '@tanstack/react-router'
import { Hero } from './Hero'
import { PARTS } from '~/lib/site'
import type { Post } from '~/lib/posts'

export function PostCard({ post, priority }: { post: Post; priority?: boolean }) {
  const part = PARTS.find((p) => p.n === post.part)!
  return (
    <article className="group flex min-w-0 flex-col gap-3">
      <Link to="/journal/$slug" params={{ slug: post.slug }} className="block aspect-[16/10] overflow-hidden rounded-[3px] bg-teal" aria-hidden="true" tabIndex={-1}>
        <Hero id={post.hero} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]" />
      </Link>
      <div className="eyebrow text-soft">Part {part.n} · {part.name} · {post.minutes} min</div>
      <h3 className="display text-[22px] font-bold leading-[1.18]">
        <Link to="/journal/$slug" params={{ slug: post.slug }} className="no-underline hover:text-accent">{post.title}</Link>
      </h3>
      <p className="text-base leading-snug text-soft" data-priority={priority}>{post.deck}</p>
    </article>
  )
}
