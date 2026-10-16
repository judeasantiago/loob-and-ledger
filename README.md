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

## Database (Supabase, free)

Comments and posts edited in the admin are stored in Postgres. Create a free Supabase project, then open Project Settings → Database → Connection string → **Transaction pooler** and copy the URI (port 6543). Put your database password into it and set it as `DATABASE_URL`. The tables are created automatically with row level security on. Without `DATABASE_URL` the site still runs, but comments and admin edits live in memory and disappear on restart.

## Admin

Set `ADMIN_PASSWORD` and `SESSION_SECRET` (a long random string), then sign in at `/admin`. You can add, edit, delete and restore posts, and edit, pin, hide and delete comments. When you are signed in, your own comments publish with an Author badge and you can edit or delete comments right on the article page. Posts that ship in `src/content/posts` are hidden rather than erased when deleted, so they can be restored.

Comments from visitors post immediately. Optional free spam layers: Cloudflare Turnstile and Upstash Redis (see `.env.example`).

## Deploy

Import the GitHub repo into Vercel (Hobby plan) and add the variables from `.env.example`. Nitro detects Vercel automatically.

## Content note

The research has not collected data. No post reports findings.
