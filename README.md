# AI Agents Platform

Course delivery platform for the AI Agents Course. Self-paced learning + live workshops.

## Stack

- **Next.js 15** (App Router) — frontend + API
- **Supabase** — auth, Postgres, row-level security
- **MDX** — content rendering from vault exports
- **Resend** — transactional email
- **Vercel** — hosting

## Getting Started

1. Copy `.env.local.example` to `.env.local` and fill in values
2. Create a Supabase project at supabase.com
3. Run the migration: paste `supabase/migrations/001_initial_schema.sql` into the Supabase SQL editor
4. `npm install && npm run dev`

## Project Structure

```
app/
  (marketing)/        ← public pages: landing, about
  (learner)/
    dashboard/        ← enrolled modules, progress
    modules/[slug]/   ← module overview
      [lesson]/       ← individual lesson page
    workshops/        ← upcoming + past workshops
  (instructor)/
    dashboard/        ← enrollment stats, progress view
    workshops/new/    ← schedule a workshop
  api/
    progress/         ← update module progress
    workshops/        ← workshop registration

lib/
  supabase/           ← client + server Supabase helpers
  types.ts            ← shared TypeScript types

supabase/
  migrations/         ← SQL schema migrations

content/
  modules/            ← MDX files exported from Obsidian vault
```

## Content

Module content is authored in the Obsidian vault and exported as MDX into `content/modules/`. Do not edit MDX files directly — edit the vault and re-export.

## Architecture decisions

See the Obsidian vault: `wiki/platform-architecture.md`
