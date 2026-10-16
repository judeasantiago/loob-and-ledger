import { useState } from 'react'
import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Hero, HERO_IDS } from '~/components/Hero'
import { Markdown } from '~/lib/markdown'
import { GLOSSARY, PARTS, SOURCES } from '~/lib/site'
import { adminGetPost, adminSavePost } from '~/server/posts'

export const Route = createFileRoute('/admin/posts/$slug')({
  loader: ({ params }) => adminGetPost({ data: { slug: params.slug } }).catch(() => ({ ok: false as const })),
  component: Editor,
})

const slugify = (t: string) => t.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
const field = 'mt-1 w-full rounded-[3px] border border-line bg-card px-3 py-2 font-ui text-[15px]'
const label = 'font-ui text-xs font-semibold uppercase tracking-wide text-soft'

function Editor() {
  const { slug: routeSlug } = Route.useParams()
  const data = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()
  const save = useServerFn(adminSavePost)
  const isNew = routeSlug === 'new'
  const existing = data.ok ? data.post : null

  const [title, setTitle] = useState(existing?.title ?? '')
  const [slug, setSlug] = useState(isNew ? '' : routeSlug)
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [n, setN] = useState(String(existing?.n ?? (data.ok ? data.nextN : 1)))
  const [part, setPart] = useState(String(existing?.part ?? 1))
  const [hero, setHero] = useState(existing?.hero ?? HERO_IDS[0])
  const [published, setPublished] = useState(existing?.published ?? new Date().toISOString().slice(0, 10))
  const [deck, setDeck] = useState(existing?.deck ?? '')
  const [prompt, setPrompt] = useState(existing?.prompt ?? '')
  const [terms, setTerms] = useState<string[]>(existing?.terms ?? [])
  const [sources, setSources] = useState<string[]>(existing?.sources ?? [])
  const [body, setBody] = useState(existing?.body ?? '')
  const [preview, setPreview] = useState(false)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  if (!data.ok) return <p className="font-ui text-sm">Please sign in again.</p>
  if (!isNew && !existing) return <p className="font-ui text-sm">That post was not found. <Link to="/admin" className="text-accent">Back to posts</Link></p>

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setMsg('')
    const r = await save({ data: { slug, n, title, deck, part, hero, published, terms, sources, prompt, body } })
    setBusy(false)
    if (!r.ok) { setMsg(r.error); return }
    await router.invalidate()
    void navigate({ to: '/admin' })
  }

  return (
    <form onSubmit={onSave} className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-3xl font-bold">{isNew ? 'New post' : 'Edit post'}</h1>
        <div className="flex gap-2 font-ui text-sm">
          <Link to="/admin" className="rounded-[3px] border border-line px-4 py-2 no-underline">Cancel</Link>
          <button disabled={busy} className="rounded-[3px] bg-accent px-4 py-2 font-semibold text-on-accent disabled:opacity-60">{busy ? 'Saving…' : 'Save post'}</button>
        </div>
      </div>
      {msg && <p role="alert" className="rounded border border-accent bg-card px-3 py-2 font-ui text-sm font-medium text-accent">{msg}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className={label} htmlFor="t">Title</label>
          <input id="t" required value={title} onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)) }} className={field} /></div>
        <div><label className={label} htmlFor="s">Address (slug)</label>
          <input id="s" required value={slug} disabled={!isNew} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }} className={`${field} disabled:opacity-60`} />
          <p className="mt-1 font-ui text-xs text-soft">/journal/{slug || 'your-post'}{!isNew && ' (fixed once published)'}</p></div>
        <div><label className={label} htmlFor="d">Publish date</label>
          <input id="d" type="date" required value={published} onChange={(e) => setPublished(e.target.value)} className={field} /></div>
        <div><label className={label} htmlFor="p">Part of the series</label>
          <select id="p" value={part} onChange={(e) => setPart(e.target.value)} className={field}>{PARTS.map((x) => <option key={x.n} value={x.n}>Part {x.n}: {x.name}</option>)}</select></div>
        <div><label className={label} htmlFor="n">Order number</label>
          <input id="n" type="number" min={1} required value={n} onChange={(e) => setN(e.target.value)} className={field} />
          <p className="mt-1 font-ui text-xs text-soft">Posts are sorted by this number.</p></div>
        <div className="sm:col-span-2"><label className={label} htmlFor="k">Summary (deck)</label>
          <textarea id="k" required rows={2} value={deck} onChange={(e) => setDeck(e.target.value)} className={field} /></div>
        <div className="sm:col-span-2"><label className={label} htmlFor="q">Reflection question (shown above the comments)</label>
          <input id="q" value={prompt} onChange={(e) => setPrompt(e.target.value)} className={field} /></div>
      </div>

      <fieldset>
        <legend className={label}>Illustration</legend>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {HERO_IDS.map((id) => (
            <label key={id} className={`cursor-pointer overflow-hidden rounded border-2 ${hero === id ? 'border-accent' : 'border-line'}`}>
              <input type="radio" name="hero" className="sr-only" checked={hero === id} onChange={() => setHero(id)} />
              <div className="aspect-[16/10] bg-teal"><Hero id={id} className="h-full w-full" /></div>
              <div className="px-2 py-1 font-ui text-xs">{id}</div>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset><legend className={label}>Key terms shown beside the post</legend>
          <div className="mt-2 grid max-h-52 gap-1 overflow-auto rounded border border-line bg-card p-3 font-ui text-sm">
            {GLOSSARY.map((g) => <label key={g.slug} className="flex items-center gap-2"><input type="checkbox" checked={terms.includes(g.slug)} onChange={() => toggle(terms, setTerms, g.slug)} />{g.term}</label>)}
          </div></fieldset>
        <fieldset><legend className={label}>Sources the post draws on</legend>
          <div className="mt-2 grid max-h-52 gap-1 overflow-auto rounded border border-line bg-card p-3 font-ui text-sm">
            {SOURCES.map((s) => <label key={s.key} className="flex items-center gap-2"><input type="checkbox" checked={sources.includes(s.key)} onChange={() => toggle(sources, setSources, s.key)} />{s.short}</label>)}
          </div></fieldset>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className={label} htmlFor="b">Body</label>
          <div className="flex gap-2 font-ui text-xs" role="tablist">
            <button type="button" role="tab" aria-selected={!preview} onClick={() => setPreview(false)} className={`rounded-full border px-3 py-1 ${!preview ? 'border-ink bg-ink text-paper' : 'border-line'}`}>Write</button>
            <button type="button" role="tab" aria-selected={preview} onClick={() => setPreview(true)} className={`rounded-full border px-3 py-1 ${preview ? 'border-ink bg-ink text-paper' : 'border-line'}`}>Preview</button>
          </div>
        </div>
        {preview
          ? <div className="prose-ll mt-2 min-h-[20rem] rounded border border-line bg-card p-5"><Markdown source={body || '_Nothing to preview yet._'} /></div>
          : <textarea id="b" required rows={24} value={body} onChange={(e) => setBody(e.target.value)} className={`${field} font-mono text-[14px] leading-relaxed`} spellCheck />}
        <details className="mt-2 font-ui text-sm text-soft">
          <summary className="cursor-pointer">Formatting guide</summary>
          <pre className="mt-2 overflow-auto rounded border border-line bg-card p-3 text-xs leading-relaxed">{`## A heading
A paragraph. Leave a blank line between paragraphs.
_Utang na loob_ makes a Filipino term italic. *Emphasis* and **bold** work too.
[a link](https://example.com)
Cite a source from the list with [@abogadie2025] or [@lim2022; @casino2025].

- A bullet
- Another bullet

> A pull quote
> — Who said it

!note Box title
Text inside the highlighted box.`}</pre>
        </details>
      </div>
      <div className="flex justify-end gap-2 font-ui text-sm">
        <Link to="/admin" className="rounded-[3px] border border-line px-4 py-2 no-underline">Cancel</Link>
        <button disabled={busy} className="rounded-[3px] bg-accent px-4 py-2 font-semibold text-on-accent disabled:opacity-60">{busy ? 'Saving…' : 'Save post'}</button>
      </div>
    </form>
  )
}
