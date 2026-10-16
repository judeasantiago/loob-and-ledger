import { createFileRoute } from '@tanstack/react-router'
import { GLOSSARY } from '~/lib/site'
import { POSTS } from '~/lib/posts'
import { seo } from '~/lib/seo'

export const Route = createFileRoute('/glossary')({
  head: () => seo({ title: 'Glossary', description: 'Plain-language definitions of the Filipino terms used in the series.', path: '/glossary' }),
  component: Glossary,
})

function Glossary() {
  const terms = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term))
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="eyebrow text-accent">Glossary</div>
      <h1 className="display mt-1 text-4xl font-bold sm:text-5xl">Words we keep using</h1>
      <p className="mt-3 text-xl text-soft">Short definitions, drawn from the literature cited in the series. Each links to the posts that use it.</p>
      <dl className="mt-10 grid gap-8">
        {terms.map((t) => {
          const used = POSTS.filter((p) => p.terms.includes(t.slug))
          return (
            <div key={t.slug} id={t.slug} className="scroll-mt-24 border-t border-line pt-4">
              <dt className="display text-2xl font-bold" lang="fil">{t.term}</dt>
              <dd className="mt-1 text-lg">{t.short}</dd>
              <dd className="mt-2 text-[17px] text-soft">{t.long}</dd>
              {used.length > 0 && <dd className="mt-3 font-ui text-sm">Appears in: {used.map((p, i) => <span key={p.slug}>{i > 0 && ', '}<a className="text-accent" href={`/journal/${p.slug}`}>{p.title}</a></span>)}</dd>}
            </div>
          )
        })}
      </dl>
    </div>
  )
}
