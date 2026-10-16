import { Link } from '@tanstack/react-router'
import { Hero } from './Hero'

export function NotFound() {
  return (
    <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-16 sm:px-6 md:grid-cols-2">
      <div>
        <div className="eyebrow text-accent">404</div>
        <h1 className="display mt-2 text-4xl font-bold sm:text-5xl">This thread leads nowhere.</h1>
        <p className="mt-4 text-soft">The page you were looking for isn’t here. It may have moved, or the link may be misspelled.</p>
        <Link to="/journal" className="mt-6 inline-block rounded-[3px] bg-teal px-5 py-3 font-ui text-sm font-semibold text-teal-ink no-underline">Browse the journal</Link>
      </div>
      <div className="aspect-[16/10] overflow-hidden rounded"><Hero id="taut" /></div>
    </div>
  )
}
