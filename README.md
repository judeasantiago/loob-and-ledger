# Loob & Ledger

An editorial blog about utang na loob and family obligation among Filipino youth, based on a BS Psychology research proposal from the University of Caloocan City.

Built with React, TanStack Start (Router, Query, server functions), Vite and Tailwind CSS v4. Deploys to Vercel's free Hobby plan.

## Develop

    pnpm install
    pnpm dev        # http://localhost:3000
    pnpm build
    pnpm typecheck

## Add a post

Create `src/content/posts/NN-slug.md` with frontmatter: `n, slug, title, deck, part, hero, published, terms, sources, prompt`. `terms` are glossary slugs and `sources` are keys from `src/lib/site.ts`. Body syntax: `## Heading`, `> quote` plus `— cite`, `- list`, `!note Title` + text, `_Filipino term_`, `[@sourcekey]` citations.

## Comments and moderation

Comments are pre-moderated. Without `DATABASE_URL` they live in memory (demo mode, reset on restart). To make them permanent, create a free Neon database and set `DATABASE_URL`. Set `ADMIN_PASSWORD` and `SESSION_SECRET`, then review comments at `/admin/comments`. Optional free spam layers: Cloudflare Turnstile and Upstash Redis (see `.env.example`).

## Deploy

Import the GitHub repo into Vercel (Hobby plan) and add the variables from `.env.example`. Nitro detects Vercel automatically.

## Content note

The research has not collected data. No post reports findings.
