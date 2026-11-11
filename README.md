# PORTFOLIO-VERSE

A free portfolio builder for students and beginner professionals.
Next.js (Vercel) + Supabase (Google login, Postgres, storage).

## What is built so far

- Foundation: Next.js app, design system (`app/globals.css`), Supabase client
- Landing page (`/`) and template gallery (`/templates`)
- Placeholder pages for `/dashboard`, `/privacy`, `/terms`, `/report`
- Login is switched off for now: every page is open to everyone, and `/dashboard` links to the original builder at `/studio`

## Folders

- `app/` pages and routes
- `components/` shared UI
- `lib/` config, template list, Supabase client
- `supabase/schema.sql` database tables and security rules (run once in the Supabase SQL editor)
- `legacy-builder/` the original single-file builder, kept for porting the editor engine

## Environment variables

See `.env.example`. They are not used while login is switched off.
