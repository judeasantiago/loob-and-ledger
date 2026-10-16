import { createFileRoute, Link } from '@tanstack/react-router'
import { Hero } from '~/components/Hero'
import { PostCard } from '~/components/PostCard'
import { POSTS } from '~/lib/posts'
import { PARTS, SITE } from '~/lib/site'
import { seo } from '~/lib/seo'

export const Route = createFileRoute('/')({
  head: () => seo({ title: `${SITE.name}, ${SITE.tagline}`, description: 'A ten-part editorial series on gratitude, obligation, and the Filipino family.', path: '/' }),
  component: Home,
})

function Home() {
  const first = POSTS[0]
  return (
    <>
      <section className="bg-teal text-teal-ink">
        <div className="mx-auto grid max-w-6xl md:grid-cols-[1.05fr_1fr]">
          <div className="flex flex-col justify-center gap-5 px-4 py-12 sm:px-6 md:py-16">
            <div className="eyebrow opacity-80">A ten-part series · Utang na loob and family obligation</div>
            <h1 className="display text-[clamp(38px,6vw,64px)] font-bold leading-[1.02]">Retirement Plan, <em className="font-medium text-gold">Yarn?</em></h1>
            <p className="max-w-[36ch] text-xl opacity-95">Is helping family a debt we feel, or a duty we were handed? Notes on gratitude, obligation, and the homes that raised us.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/journal/$slug" params={{ slug: first.slug }} className="rounded-[3px] bg-paper px-5 py-3 font-ui text-sm font-semibold text-ink no-underline">Start reading</Link>
              <Link to="/series" className="rounded-[3px] border border-teal-ink/40 px-5 py-3 font-ui text-sm font-semibold no-underline hover:bg-white/10">See the series</Link>
            </div>
          </div>
          <div className="min-h-[260px] md:min-h-[420px]"><Hero id="piggy" className="h-full w-full" label="Illustration: a paper-cut house shaped like a piggy bank, with a thread leading to a small figure carrying a bag" /></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <h2 className="display text-3xl font-bold">Four parts, one question</h2>
        <p className="mt-1 text-soft">Read in order, or start with the part that sounds like your house.</p>
        <div className="mt-6 grid border-t-2 border-ink sm:grid-cols-2 lg:grid-cols-4">
          {PARTS.map((p) => (
            <Link key={p.n} to="/series" hash={`part-${p.n}`} className="group border-b border-line p-4 pl-0 text-ink no-underline lg:border-b-0 lg:border-r lg:pr-5 lg:last:border-r-0 lg:[&:not(:first-child)]:pl-5">
              <div className="eyebrow text-accent">Part {p.n}</div>
              <h3 className="display mt-1 text-xl font-bold group-hover:text-accent">{p.name}</h3>
              <p className="mt-1 text-[15px] leading-snug text-soft">{p.blurb}</p>
              <div className="mt-2 font-ui text-xs text-soft">{p.range}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="display text-3xl font-bold">From the journal</h2>
          <Link to="/journal" className="font-ui text-sm font-semibold text-accent no-underline">All {POSTS.length} posts →</Link>
        </div>
        <div className="mt-6 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {POSTS.slice(0, 6).map((p, i) => <PostCard key={p.slug} post={p} priority={i < 3} />)}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 rounded border border-line bg-card p-6 sm:p-8 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <div className="eyebrow text-accent">The research behind it</div>
            <h2 className="display mt-1 text-2xl font-bold">A study still in progress</h2>
            <p className="mt-2 text-soft">These essays grow out of a BS Psychology research proposal at the {SITE.university}. The study will test whether a stronger sense of utang na loob goes with a stronger sense of family obligation. No results exist yet, and the posts say so.</p>
            <Link to="/study" className="mt-4 inline-block font-ui text-sm font-semibold text-accent no-underline">Read the study at a glance →</Link>
          </div>
          <dl className="grid grid-cols-2 gap-4 font-ui text-sm">
            <div><dt className="text-soft">Design</dt><dd className="font-semibold">Quantitative, correlational</dd></div>
            <div><dt className="text-soft">Survey</dt><dd className="font-semibold">30 items, 5-point scale</dd></div>
            <div><dt className="text-soft">Test</dt><dd className="font-semibold">Pearson r</dd></div>
            <div><dt className="text-soft">Status</dt><dd className="font-semibold">Data collection pending</dd></div>
          </dl>
        </div>
      </section>
    </>
  )
}
