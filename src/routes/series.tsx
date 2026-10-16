import { createFileRoute, Link } from '@tanstack/react-router'
import { Hero } from '~/components/Hero'
import { usePosts } from '~/lib/usePosts'
import { PARTS } from '~/lib/site'
import { seo } from '~/lib/seo'

export const Route = createFileRoute('/series')({
  head: () => seo({ title: 'The Series', description: 'The four-part reading order for the Loob & Ledger series.', path: '/series' }),
  component: Series,
})

function Series() {
  const POSTS = usePosts()
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="eyebrow text-accent">The series</div>
      <h1 className="display mt-1 text-4xl font-bold sm:text-5xl">A reading order</h1>
      <p className="mt-3 max-w-[56ch] text-xl text-soft">The posts follow the research’s own logic: first the two ideas, then the link between them, then what comes next. Start at post 1 and you’ll be ready to read the study itself.</p>
      <div className="mt-12 grid gap-14">
        {PARTS.map((part) => (
          <section key={part.n} id={`part-${part.n}`} className="scroll-mt-24">
            <div className="flex items-baseline gap-3 border-t-2 border-ink pt-4">
              <span className="eyebrow text-accent">Part {part.n}</span>
              <h2 className="display text-3xl font-bold">{part.name}</h2>
            </div>
            <p className="mt-2 text-soft">{part.blurb}</p>
            <ol className="mt-5 grid gap-5">
              {POSTS.filter((p) => p.part === part.n).map((p) => (
                <li key={p.slug}>
                  <Link to="/journal/$slug" params={{ slug: p.slug }} className="group grid items-center gap-4 text-ink no-underline sm:grid-cols-[200px_1fr]">
                    <div className="aspect-[16/10] overflow-hidden rounded-[3px] bg-teal"><Hero id={p.hero} className="h-full w-full" /></div>
                    <div>
                      <div className="eyebrow text-soft">Post {p.n} · {p.minutes} min</div>
                      <h3 className="display text-xl font-bold group-hover:text-accent">{p.title}</h3>
                      <p className="text-[15px] leading-snug text-soft">{p.deck}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}
