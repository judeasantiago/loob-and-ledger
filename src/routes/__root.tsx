import type { ReactNode } from 'react'
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import appCss from '~/styles.css?url'
import { Header, Footer } from '~/components/Chrome'
import { WeaveDefs } from '~/components/Hero'
import { Toaster } from '~/components/Share'
import { SITE } from '~/lib/site'
import { getPosts } from '~/server/posts'

export const Route = createRootRoute({
  loader: () => getPosts(),
  staleTime: 30_000,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { title: `${SITE.name} · ${SITE.tagline}` },
      { name: 'description', content: 'A ten-part editorial series on utang na loob and family obligation among Filipino youth, from a BS Psychology research proposal at the University of Caloocan City.' },
      { name: 'theme-color', content: '#1F4A4C' },
      { property: 'og:site_name', content: SITE.name },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'alternate', type: 'application/rss+xml', title: SITE.name, href: '/rss.xml' },
    ],
    scripts: [{ children: `try{var t=localStorage.getItem('ll_theme');if(t==='dark')document.documentElement.dataset.theme='dark'}catch(e){}` }],
  }),
  component: Root,
})

function Root() {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <WeaveDefs />
        <Header />
        <main id="main"><Outlet /></main>
        <Footer />
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}
