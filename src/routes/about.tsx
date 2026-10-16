import { createFileRoute } from '@tanstack/react-router'
import { SITE } from '~/lib/site'
import { seo } from '~/lib/seo'

export const Route = createFileRoute('/about')({
  head: () => seo({ title: 'About', description: 'The research team and the University of Caloocan City.', path: '/about' }),
  component: About,
})

function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="eyebrow text-accent">About</div>
      <h1 className="display mt-1 text-4xl font-bold sm:text-5xl">The team behind the question</h1>
      <p className="mt-3 text-xl text-soft">Loob &amp; Ledger turns a BS Psychology research proposal into a series for anyone who has ever wondered what they owe their family.</p>
      <h2 className="display mt-10 text-2xl font-bold">Researchers</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {SITE.authors.map((a) => <li key={a} className="rounded border border-line bg-card px-4 py-3 font-display text-lg font-bold">{a}</li>)}
      </ul>
      <p className="mt-4 text-soft">{SITE.program}, {SITE.university}, Congressional Road Extension, Barangay 171, Caloocan, Metro Manila.</p>
      <h2 className="display mt-10 text-2xl font-bold">About the posts</h2>
      <p className="mt-2">The ten posts are explanatory essays based on Chapters 1 to 3 of the team’s research proposal. They summarize the literature the proposal cites and explain how the study will be run.</p>
      <h2 className="display mt-10 text-2xl font-bold">How to cite</h2>
      <p className="mt-2 rounded border border-line bg-card p-4 font-ui text-sm">Santiago, J. C., Pangan, R. G., Suaybaguio, A. N. G., &amp; Tagubase, P. A. P. (2026). <i>“Retirement Plan Yarn?”: Isang korelasyonal na pag-aaral ng utang na loob at obligasyon sa pamilya ng mga kabataang Pilipino</i> [Research proposal]. University of Caloocan City.</p>
    </div>
  )
}
