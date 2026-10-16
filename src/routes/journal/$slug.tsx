import { useEffect, useState } from 'react'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Hero } from '~/components/Hero'
import { Markdown } from '~/lib/markdown'
import { Comments, useCommentCount } from '~/components/Comments'
import { MobileBar, QuoteShare, ShareButton, ShareRail, ShareRow } from '~/components/Share'
import { findPost, neighbors } from '~/lib/posts'
import { usePosts } from '~/lib/usePosts'
import { PARTS, SITE, sourceByKey, termBySlug } from '~/lib/site'
import { seo } from '~/lib/seo'

export const Route = createFileRoute('/journal/$slug')({
  loader: async ({ params, parentMatchPromise }) => {
    const posts = (await parentMatchPromise).loaderData ?? []
    const post = findPost(posts, params.slug)
    if (!post) throw notFound()
    return { post }
  },
  head: ({ loaderData }) => {
    const p = loaderData?.post
    if (!p) return {}
    const base = seo({ title: p.title, description: p.deck, path: `/journal/${p.slug}`, type: 'article' })
    return {
      ...base,
      scripts: [{
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: p.deck, datePublished: p.published,
          author: SITE.authors.map((name) => ({ '@type': 'Person', name })), publisher: { '@type': 'Organization', name: SITE.name }, inLanguage: 'en',
        }),
      }],
    }
  },
  component: Article,
})

function ReadingProgress() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const on = () => { const max = document.documentElement.scrollHeight - window.innerHeight; setP(max > 0 ? Math.min(1, window.scrollY / max) : 0) }
    on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on)
  }, [])
  return <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent" aria-hidden="true"><div className="h-full bg-accent" style={{ width: `${p * 100}%` }} /></div>
}

function Article() {
  const { slug } = Route.useParams()
  const posts = usePosts()
  const post = findPost(posts, slug) ?? Route.useLoaderData().post
  const part = PARTS.find((x) => x.n === post.part)!
  const { prev, next } = neighbors(posts, post)
  const { count } = useCommentCount(post.slug)
  const path = `/journal/${post.slug}`
  const terms = post.terms.map(termBySlug).filter(Boolean)
  const sources = post.sources.map(sourceByKey).filter(Boolean)
  const date = new Date(post.published).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <>
      <ReadingProgress />
      <div className="aspect-[16/9] max-h-[460px] w-full bg-teal sm:aspect-[21/8]">
        <Hero id={post.hero} className="h-full w-full" />
      </div>
      <div className="mx-auto grid max-w-6xl gap-x-10 px-4 pb-16 pt-9 sm:px-6 lg:grid-cols-[56px_minmax(0,680px)_240px] lg:justify-center">
        <div className="hidden lg:block"><ShareRail path={path} title={post.title} /></div>
        <article className="min-w-0">
          <div className="eyebrow text-accent">Part {part.n} · {part.name} · Post {post.n} of 10</div>
          <h1 className="display mt-3 text-[clamp(34px,5.4vw,52px)] font-bold leading-[1.05]">{post.title}</h1>
          <p className="mt-4 text-[21px] leading-snug text-soft">{post.deck}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-line py-3 font-ui text-[13px] text-soft">
            <span>By the research team</span><span aria-hidden="true">·</span><span>{date}</span><span aria-hidden="true">·</span><span>{post.minutes} min read</span>
            <span className="flex-1" />
            <a href="#comments" className="hidden min-h-9 items-center gap-1.5 rounded-[3px] border border-line px-3 text-ink no-underline hover:border-accent sm:inline-flex">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" /></svg>{count}<span className="sr-only"> comments</span>
            </a>
            <div className="hidden sm:block"><ShareButton path={path} title={post.title} /></div>
          </div>
          <div className="prose-ll mt-8" data-quotable>
            <Markdown source={post.body} />
          </div>
          {sources.length > 0 && (
            <section className="mt-10 border-t border-line pt-5 font-ui text-sm" aria-labelledby="src-h">
              <h2 id="src-h" className="eyebrow mb-3 text-soft">Sources used in this post</h2>
              <ul className="grid gap-2">
                {sources.map((s) => <li key={s!.key}><a className="link text-ink" href={`/sources#${s!.key}`}>{s!.short}</a></li>)}
              </ul>
            </section>
          )}
          <ShareRow path={path} title={post.title} />
          <Comments slug={post.slug} prompt={post.prompt} />
          <nav aria-label="Series" className="mt-12 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link to="/journal/$slug" params={{ slug: prev.slug }} className="rounded border border-line bg-card p-4 text-ink no-underline hover:border-accent">
                <div className="eyebrow text-soft">← Previous</div><div className="display mt-1 text-lg font-bold">{prev.title}</div>
              </Link>
            ) : <span />}
            {next && (
              <Link to="/journal/$slug" params={{ slug: next.slug }} className="rounded border border-line bg-card p-4 text-right text-ink no-underline hover:border-accent">
                <div className="eyebrow text-soft">Next in the series →</div><div className="display mt-1 text-lg font-bold">{next.title}</div>
              </Link>
            )}
          </nav>
        </article>
        <aside className="hidden lg:block">
          <div className="sticky top-24 grid gap-4 font-ui text-sm">
            {terms.length > 0 && (
              <div className="rounded border border-line bg-card p-4">
                <h2 className="eyebrow mb-2 text-soft">Key terms</h2>
                <dl>
                  {terms.map((t) => (
                    <div key={t!.slug} className="mb-3 last:mb-0">
                      <dt className="display text-base font-bold" lang="fil"><Link to="/glossary" hash={t!.slug} className="no-underline hover:text-accent">{t!.term}</Link></dt>
                      <dd className="text-[13px] leading-snug text-soft">{t!.short}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            <div className="rounded border border-line bg-card p-4 text-[13px] leading-snug text-soft">
              <h2 className="eyebrow mb-2">About this series</h2>
              Essays based on a research proposal from the {SITE.university}. <Link to="/study" className="text-accent">The study at a glance</Link>
            </div>
          </div>
        </aside>
      </div>
      <QuoteShare path={path} title={post.title} />
      <MobileBar path={path} title={post.title} commentCount={count} />
    </>
  )
}
