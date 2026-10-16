import { createFileRoute } from '@tanstack/react-router'
import { loadPosts } from '~/server/posts.server'
import { SITE } from '~/lib/site'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const POSTS = await loadPosts()
        const pages = ['', '/journal', '/series', '/study', '/glossary', '/sources', '/about', '/community'].map((p) => `<url><loc>${SITE.url}${p}</loc></url>`)
        const posts = POSTS.map((p) => `<url><loc>${SITE.url}/journal/${p.slug}</loc><lastmod>${p.published}</lastmod></url>`)
        const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...pages, ...posts].join('')}</urlset>`
        return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
      },
    },
  },
})
