import { SITE } from './site'

export function seo({ title, description, path, type = 'website' }: { title: string; description: string; path: string; type?: 'website' | 'article' }) {
  const url = `${SITE.url}${path}`
  return {
    meta: [
      { title: `${title} · ${SITE.name}` },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:type', content: type },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}
