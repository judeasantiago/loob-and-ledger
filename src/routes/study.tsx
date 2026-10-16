import { createFileRoute, Link } from '@tanstack/react-router'
import { SITE } from '~/lib/site'
import { seo } from '~/lib/seo'

export const Route = createFileRoute('/study')({
  head: () => seo({ title: 'The Study at a Glance', description: 'Question, framework, hypotheses, instrument, and analysis plan for the utang na loob and family obligation study.', path: '/study' }),
  component: Study,
})

const SCALE: [string, string, string][] = [
  ['4.21–5.00', 'Napakataas', 'Very high'],
  ['3.41–4.20', 'Mataas', 'High'],
  ['2.61–3.40', 'Katamtaman', 'Moderate'],
  ['1.81–2.60', 'Mababa', 'Low'],
  ['1.00–1.80', 'Napakababa', 'Very low'],
]

function Box({ children, tone = 'plain' }: { children: React.ReactNode; tone?: 'plain' | 'teal' | 'gold' }) {
  const t = tone === 'teal' ? 'bg-teal text-teal-ink border-teal' : tone === 'gold' ? 'bg-gold text-[#1F1A17] border-gold' : 'bg-card border-line'
  return <div className={`rounded border px-4 py-3 text-center font-ui text-sm font-semibold ${t}`}>{children}</div>
}

function Study() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="eyebrow text-accent">The study</div>
      <h1 className="display mt-2 text-4xl font-bold sm:text-5xl">“Retirement Plan Yarn?”</h1>
      <p className="mt-3 text-xl text-soft"><em>Isang Korelasyonal na Pag-aaral ng Utang na Loob at Obligasyon sa Pamilya ng mga Kabataang Pilipino.</em> A correlational study of utang na loob and family obligation among Filipino youth.</p>
      <p className="mt-3 font-ui text-sm text-soft">By {SITE.authors.join(', ')} · {SITE.university}, {SITE.program}. Prepared as part of the course Kontekstwalisadong Komunikasyon sa Filipino, July 2026.</p>

      <section className="mt-12" aria-labelledby="q">
        <h2 id="q" className="display text-2xl font-bold">The question</h2>
        <p className="mt-2">Does a higher level of <i lang="fil">utang na loob sa pamilya</i> go along with a higher level of <i lang="fil">obligasyon sa pamilya</i>? The study does not claim one causes the other. It asks whether there is a statistically significant relationship between the two.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded border border-line bg-card p-4"><div className="eyebrow text-soft">Utang na loob sa pamilya</div><p className="mt-1 text-[16px] leading-snug">Recognizing and valuing the sacrifices and care received from family, and the wish to return the kindness received.</p></div>
          <div className="rounded border border-line bg-card p-4"><div className="eyebrow text-soft">Obligasyon sa pamilya</div><p className="mt-1 text-[16px] leading-snug">A child’s responsibility to show care, give support, help, and fulfill duties within the family.</p></div>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="fw">
        <h2 id="fw" className="display text-2xl font-bold">Framework</h2>
        <p className="mt-2 text-soft">Two traditions, one question. Utang na loob comes from Filipino Psychology. Family obligation comes from Social Psychology.</p>
        <figure className="mt-5 rounded border border-line bg-card p-5" aria-label="Theoretical framework diagram">
          <div className="grid gap-3 sm:grid-cols-2"><Box>Filipino Psychology</Box><Box>Social Psychology</Box></div>
          <div className="my-2 grid grid-cols-2 text-center text-soft" aria-hidden="true"><span>↓</span><span>↓</span></div>
          <div className="grid gap-3 sm:grid-cols-2"><Box tone="teal">Utang na loob sa pamilya</Box><Box tone="gold">Obligasyon sa pamilya</Box></div>
          <div className="my-2 text-center text-soft" aria-hidden="true">↓ &nbsp; ↓</div>
          <Box>Significant relationship? (Pearson r)</Box>
        </figure>
      </section>

      <section className="mt-12" aria-labelledby="hy">
        <h2 id="hy" className="display text-2xl font-bold">Hypotheses</h2>
        <dl className="mt-4 grid gap-3">
          <div className="rounded border border-line bg-card p-4"><dt className="font-ui text-sm font-bold">H₀ · Null</dt><dd>There is no significant relationship between the level of utang na loob sa pamilya and the level of obligasyon sa pamilya of Filipino youth.</dd></div>
          <div className="rounded border border-line bg-card p-4"><dt className="font-ui text-sm font-bold">H₁ · Alternative</dt><dd>There is a significant relationship between the two.</dd></div>
          <div className="rounded border border-line bg-card p-4"><dt className="font-ui text-sm font-bold">H₂ · Directional</dt><dd>A higher level of utang na loob sa pamilya goes with a higher level of obligasyon sa pamilya.</dd></div>
        </dl>
      </section>

      <section className="mt-12" aria-labelledby="who">
        <h2 id="who" className="display text-2xl font-bold">Who and how</h2>
        <ul className="mt-3 grid gap-2 pl-5 [&>li]:list-disc [&>li]:marker:text-accent">
          <li><b>Respondents.</b> Filipino youth aged 18–25 who are college students at the {SITE.university}, Congress Campus, in academic year 2026–2027.</li>
          <li><b>Design.</b> Quantitative and correlational. The researchers do not manipulate either variable.</li>
          <li><b>Instrument.</b> A researcher-made questionnaire in three parts: demographic profile (age, sex, educational level, program), 15 items on utang na loob, and 15 items on family obligation, answered on a 5-point Likert scale from “Lubos na Hindi Sumasang-ayon” (1) to “Lubos na Sumasang-ayon” (5).</li>
          <li><b>Analysis.</b> Frequency and percentage for the profile; weighted mean and standard deviation for each variable; one-way ANOVA for differences by age and educational level; Pearson product-moment correlation for the main question.</li>
        </ul>
        <h3 className="display mt-8 text-xl font-bold">How scores are read</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse font-ui text-sm">
            <caption className="sr-only">Interpretation of mean scores</caption>
            <thead><tr className="border-b-2 border-ink text-left"><th className="py-2 pr-4">Mean score</th><th className="py-2 pr-4">Level</th><th className="py-2">In English</th></tr></thead>
            <tbody>{SCALE.map((r) => <tr key={r[0]} className="border-b border-line"><td className="py-2 pr-4 tabular-nums">{r[0]}</td><td className="py-2 pr-4" lang="fil">{r[1]}</td><td className="py-2 text-soft">{r[2]}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 rounded border border-line bg-card p-5" aria-labelledby="lim">
        <h2 id="lim" className="display text-2xl font-bold">What the study will not claim</h2>
        <p className="mt-2 text-[17px]">It will not say utang na loob causes family obligation, or the reverse. It will not cover other Filipino Psychology concepts, other campuses, or people outside its sample. Results will reflect the honesty and mood of the respondents’ answers. These limits come from the proposal itself.</p>
        <p className="mt-3 text-[17px]">New to the ideas? Begin with <Link to="/journal/$slug" params={{ slug: 'retirement-plan-yarn' }} className="text-accent">“Retirement Plan, Yarn?”</Link></p>
      </section>
    </div>
  )
}
