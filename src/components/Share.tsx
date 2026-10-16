import { useCallback, useEffect, useRef, useState } from 'react'
import { siFacebook, siMessenger, siReddit, siTelegram, siWhatsapp, siX, siGmail } from 'simple-icons'
import { SITE } from '~/lib/site'

type Platform = { id: string; label: string; path?: string; text?: string; href: (u: string, t: string) => string }
const enc = encodeURIComponent
const PLATFORMS: Platform[] = [
  { id: 'facebook', label: 'Facebook', path: siFacebook.path, href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${enc(u)}` },
  { id: 'messenger', label: 'Messenger', path: siMessenger.path, href: (u) => `fb-messenger://share/?link=${enc(u)}` },
  { id: 'x', label: 'X', path: siX.path, href: (u, t) => `https://twitter.com/intent/tweet?url=${enc(u)}&text=${enc(t)}` },
  { id: 'linkedin', label: 'LinkedIn', text: 'in', href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${enc(u)}` },
  { id: 'whatsapp', label: 'WhatsApp', path: siWhatsapp.path, href: (u, t) => `https://wa.me/?text=${enc(`${t} ${u}`)}` },
  { id: 'telegram', label: 'Telegram', path: siTelegram.path, href: (u, t) => `https://t.me/share/url?url=${enc(u)}&text=${enc(t)}` },
  { id: 'reddit', label: 'Reddit', path: siReddit.path, href: (u, t) => `https://www.reddit.com/submit?url=${enc(u)}&title=${enc(t)}` },
  { id: 'email', label: 'Email', path: siGmail.path, href: (u, t) => `mailto:?subject=${enc(t)}&body=${enc(`${t}\n\n${u}`)}` },
]

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent('ll-toast', { detail: message }))
}
export function Toaster() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const on = (e: Event) => { setMsg((e as CustomEvent<string>).detail); clearTimeout(t); t = setTimeout(() => setMsg(null), 2200) }
    window.addEventListener('ll-toast', on)
    return () => { window.removeEventListener('ll-toast', on); clearTimeout(t) }
  }, [])
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(80px+env(safe-area-inset-bottom))] z-[80] flex justify-center lg:bottom-8">
      {msg && <div className="rounded-full bg-ink px-4 py-2 font-ui text-sm text-paper shadow-lg">{msg}</div>}
    </div>
  )
}

export function useShare(path: string, title: string) {
  const [origin, setOrigin] = useState<string>(SITE.url)
  useEffect(() => setOrigin(window.location.origin), [])
  const url = `${origin}${path}`
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'
      document.body.appendChild(ta); ta.select()
      try { document.execCommand('copy') } catch { /* ignore */ }
      ta.remove()
    }
    toast('Link copied')
  }, [url])
  const open = useCallback((p: Platform) => {
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent)
    if (p.id === 'messenger' && !isMobile) {
      void copy()
      window.open('https://www.messenger.com/', '_blank', 'noopener')
      return
    }
    const href = p.href(url, title)
    if (p.id === 'email' || p.id === 'messenger') window.location.href = href
    else window.open(href, '_blank', 'noopener,noreferrer,width=640,height=560')
  }, [url, title, copy])
  const native = useCallback(async () => {
    if (typeof navigator.share === 'function') {
      try { await navigator.share({ title, url }); return true } catch { return true /* user dismissed */ }
    }
    return false
  }, [title, url])
  return { url, copy, open, native }
}

function Glyph({ p, size = 18 }: { p: Platform; size?: number }) {
  if (p.text) return <span aria-hidden="true" className="font-ui text-[13px] font-bold leading-none">{p.text}</span>
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor"><path d={p.path} /></svg>
}
const CopyIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
  </svg>
)
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12M8 7l4-4 4 4M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" />
  </svg>
)

type Props = { path: string; title: string }

/** Desktop: vertical icon rail beside the article. */
export function ShareRail({ path, title }: Props) {
  const { open, copy } = useShare(path, title)
  return (
    <div className="sticky top-24 flex flex-col gap-2" role="group" aria-label="Share this article">
      {PLATFORMS.filter((p) => ['facebook', 'messenger', 'x', 'linkedin', 'whatsapp'].includes(p.id)).map((p) => (
        <button key={p.id} type="button" onClick={() => open(p)} aria-label={`Share on ${p.label}`} title={p.label}
          className="grid h-10 w-10 place-items-center rounded-full border border-line bg-card text-ink transition-colors hover:border-accent hover:text-accent"><Glyph p={p} /></button>
      ))}
      <button type="button" onClick={copy} aria-label="Copy link" title="Copy link"
        className="grid h-10 w-10 place-items-center rounded-full border border-line bg-card text-ink transition-colors hover:border-accent hover:text-accent"><CopyIcon /></button>
    </div>
  )
}

/** Header button with the full list in a popover. Uses the native share sheet on phones. */
export function ShareButton({ path, title }: Props) {
  const { open, copy, native } = useShare(path, title)
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!show) return
    const on = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setShow(false) }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setShow(false)
    document.addEventListener('mousedown', on); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', on); document.removeEventListener('keydown', esc) }
  }, [show])
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={show} aria-haspopup="true"
        onClick={async () => { if (window.matchMedia('(pointer: coarse)').matches && (await native())) return; setShow((s) => !s) }}
        className="inline-flex items-center gap-2 rounded-[3px] bg-accent px-3.5 py-2 font-ui text-[13px] font-semibold text-on-accent"><ShareIcon />Share</button>
      {show && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 grid w-60 gap-0.5 rounded-md border border-line bg-card p-2 shadow-xl" role="menu">
          {PLATFORMS.map((p) => (
            <button key={p.id} role="menuitem" type="button" onClick={() => { open(p); setShow(false) }}
              className="flex items-center gap-3 rounded px-2.5 py-2 text-left font-ui text-sm hover:bg-paper"><span className="grid h-6 w-6 place-items-center rounded-full bg-teal text-teal-ink"><Glyph p={p} size={13} /></span>{p.label}</button>
          ))}
          <button role="menuitem" type="button" onClick={() => { void copy(); setShow(false) }}
            className="flex items-center gap-3 rounded px-2.5 py-2 text-left font-ui text-sm hover:bg-paper"><span className="grid h-6 w-6 place-items-center rounded-full bg-teal text-teal-ink"><CopyIcon /></span>Copy link</button>
        </div>
      )}
    </div>
  )
}

/** End-of-article row with labelled buttons. */
export function ShareRow({ path, title }: Props) {
  const { open, copy } = useShare(path, title)
  return (
    <section aria-labelledby="pass-on" className="mt-12 border-t border-line pt-6">
      <h2 id="pass-on" className="display text-2xl font-bold">Pass this on</h2>
      <p className="mt-1 font-ui text-sm text-soft">Know someone who carries this at home? Send it their way.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <button key={p.id} type="button" onClick={() => open(p)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 font-ui text-sm hover:border-accent hover:text-accent"><Glyph p={p} size={16} />{p.label}</button>
        ))}
        <button type="button" onClick={copy} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-teal px-4 font-ui text-sm font-semibold text-teal-ink"><CopyIcon />Copy link</button>
      </div>
    </section>
  )
}

/** Phone: slim bottom bar with comment count, reading progress, and Share (native sheet first, bottom sheet fallback). */
export function MobileBar({ path, title, commentCount }: Props & { commentCount: number }) {
  const { open, copy, native, url } = useShare(path, title)
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sheet, setSheet] = useState(false)
  const last = useRef(0)
  useEffect(() => {
    const on = () => {
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, y / max) : 0)
      setVisible(y > 360 && (y < last.current || y < 700))
      last.current = y
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <>
      <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] transition-transform duration-200 lg:hidden ${visible || sheet ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ paddingLeft: 'max(16px, env(safe-area-inset-left))', paddingRight: 'max(16px, env(safe-area-inset-right))' }}>
        <div className="flex items-center gap-3 py-2">
          <a href="#comments" className="inline-flex min-h-11 items-center gap-1.5 font-ui text-sm text-ink no-underline"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" /></svg><span>{commentCount}</span><span className="sr-only">comments</span></a>
          <div className="h-1 flex-1 overflow-hidden rounded bg-line" aria-hidden="true"><div className="h-full bg-accent" style={{ width: `${progress * 100}%` }} /></div>
          <button type="button" onClick={async () => { if (!(await native())) setSheet(true) }} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 font-ui text-sm font-semibold text-on-accent"><ShareIcon />Share</button>
        </div>
      </div>
      {sheet && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Share this post">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-line bg-card px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded bg-line" />
            <h2 className="mb-3 font-ui text-sm font-semibold">Share this post</h2>
            <div className="grid grid-cols-4 gap-y-4 text-center font-ui text-[11px] text-soft">
              {PLATFORMS.map((p) => (
                <button key={p.id} type="button" onClick={() => { open(p); setSheet(false) }} className="grid justify-items-center gap-1.5"><span className="grid h-12 w-12 place-items-center rounded-full bg-teal text-teal-ink"><Glyph p={p} size={20} /></span>{p.label}</button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-line py-2 pl-3 pr-2 font-ui text-xs text-soft">
              <span className="min-w-0 truncate">{url.replace(/^https?:\/\//, '')}</span>
              <button type="button" onClick={() => { void copy(); setSheet(false) }} className="min-h-11 shrink-0 rounded-md bg-teal px-4 font-semibold text-teal-ink">Copy link</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/** Highlight a sentence inside the article to share it as a quote. */
export function QuoteShare({ path, title }: Props) {
  const { url } = useShare(path, title)
  const [sel, setSel] = useState<{ text: string; x: number; y: number } | null>(null)
  useEffect(() => {
    const check = () => {
      const s = window.getSelection()
      const text = s?.toString().trim() ?? ''
      if (!s || s.rangeCount === 0 || text.length < 12 || text.length > 240) return setSel(null)
      const node = s.anchorNode?.parentElement
      if (!node?.closest('[data-quotable]')) return setSel(null)
      const r = s.getRangeAt(0).getBoundingClientRect()
      setSel({ text, x: r.left + r.width / 2, y: r.top })
    }
    const delayed = () => setTimeout(check, 10)
    document.addEventListener('mouseup', delayed)
    document.addEventListener('keyup', delayed)
    document.addEventListener('selectionchange', () => { if (!window.getSelection()?.toString()) setSel(null) })
    return () => { document.removeEventListener('mouseup', delayed); document.removeEventListener('keyup', delayed) }
  }, [])
  if (!sel) return null
  const quote = `“${sel.text}”`
  const go = (href: string) => { window.open(href, '_blank', 'noopener,noreferrer,width=640,height=560'); setSel(null) }
  return (
    <div className="fixed z-[60] hidden -translate-x-1/2 -translate-y-full items-center gap-1 rounded-md bg-ink p-1 font-ui text-xs text-paper shadow-xl lg:flex" style={{ left: Math.max(120, Math.min(sel.x, window.innerWidth - 120)), top: sel.y - 8 }} role="toolbar" aria-label="Share this quote">
      <span className="px-2 opacity-70">Share quote</span>
      <button type="button" className="rounded px-2 py-1 hover:bg-white/15" onClick={() => go(`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(quote)}`)}>X</button>
      <button type="button" className="rounded px-2 py-1 hover:bg-white/15" onClick={() => go(`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(quote)}`)}>Facebook</button>
      <button type="button" className="rounded px-2 py-1 hover:bg-white/15" onClick={async () => { try { await navigator.clipboard.writeText(`${quote} ${url}`) } catch { /* ignore */ } toast('Quote copied'); setSel(null) }}>Copy</button>
    </div>
  )
}
