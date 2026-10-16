import { createFileRoute } from '@tanstack/react-router'
import { loadPosts } from '~/server/posts.server'
import { SITE } from '~/lib/site'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const Route = createFileRoute('/rss.xml')({
  server: {
    handlers: {
      GET: async () => {
        const POSTS = await loadPosts()
        const items = [...POSTS].sort((a, b) => b.n - a.n).map((p) => `<item><title>${esc(p.title)}</title><link>${SITE.url}/journal/${p.slug}</link><guid>${SITE.url}/journal/${p.slug}</guid><pubDate>${new Date(p.published).toUTCString()}</pubDate><description>${esc(p.deck)}</description></item>`).join('')
        const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(SITE.name)}</title><link>${SITE.url}</link><description>${esc(SITE.tagline)}</description>${items}</channel></rss>`
        return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
      },
    },
  },
})
