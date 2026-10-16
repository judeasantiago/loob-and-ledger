import type { ReactNode } from 'react'
import { sourceByKey } from './site'

/** Tiny renderer for the post format: ## headings, > pull quotes (— cite), - lists, !note blocks, paragraphs.
 *  Inline: _filipino term_ (lang=fil), *emphasis*, **bold**, [text](url), [@sourcekey] citation markers. */
function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|\[@[a-z0-9]+\]|\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let i = 0
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push(text.slice(last, m.index))
    const t = m[0]
    const k = `${key}-${i++}`
    if (t.startsWith('**')) out.push(<strong key={k}>{t.slice(2, -2)}</strong>)
    else if (t.startsWith('*')) out.push(<em key={k}>{t.slice(1, -1)}</em>)
    else if (t.startsWith('_')) out.push(<em key={k} lang="fil">{t.slice(1, -1)}</em>)
    else if (t.startsWith('[@')) {
      const s = sourceByKey(t.slice(2, -1))
      out.push(
        s ? (
          <a key={k} className="cite-ref no-underline hover:underline" href={`/sources#${s.key}`} title={s.full}>
            [{s.short}]
          </a>
        ) : null,
      )
    } else {
      const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(t)!
      out.push(<a key={k} href={mm[2]}>{mm[1]}</a>)
    }
    last = m.index! + t.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.split(/\n{2,}/)
  return (
    <>
      {blocks.map((b, i) => {
        const key = `b${i}`
        if (b.startsWith('## ')) return <h2 key={key}>{inline(b.slice(3), key)}</h2>
        if (b.startsWith('> ')) {
          const lines = b.split('\n').map((l) => l.replace(/^> ?/, ''))
          const cite = lines.find((l) => l.startsWith('— '))
          const quote = lines.filter((l) => !l.startsWith('— ')).join(' ')
          return (
            <blockquote key={key}>
              {inline(quote, key)}
              {cite && <cite>{inline(cite.slice(2), key + 'c')}</cite>}
            </blockquote>
          )
        }
        if (b.startsWith('!note ')) {
          const [head, ...rest] = b.slice(6).split('\n')
          return (
            <aside key={key} className="note">
              <strong>{head}</strong>
              {inline(rest.join(' '), key)}
            </aside>
          )
        }
        if (b.startsWith('- ')) {
          return (
            <ul key={key}>
              {b.split('\n').map((l, j) => (
                <li key={j}>{inline(l.replace(/^- /, ''), `${key}-${j}`)}</li>
              ))}
            </ul>
          )
        }
        return <p key={key}>{inline(b.replace(/\n/g, ' '), key)}</p>
      })}
    </>
  )
}
