# PORTFOLIO-VERSE

A free portfolio builder for students and beginner professionals.
Next.js (Vercel) + Supabase (Google login, Postgres, storage).

## What is built so far

- Foundation: Next.js app, design system (`app/globals.css`), Supabase client, Google login flow
- Landing page (`/`) and template gallery (`/templates`)
- Placeholder pages for `/dashboard`, `/privacy`, `/terms`, `/report`

## Folders

- `app/` pages and routes
- `components/` shared UI
- `lib/` config, template list, Supabase client
- `supabase/schema.sql` database tables and security rules (run once in the Supabase SQL editor)
- `legacy-builder/` the original single-file builder, kept for porting the editor engine

## Environment variables

See `.env.example`. Without them the site still runs; the Google button shows a "being set up" message.

## Admin access

Set `ADMIN_KEY` in Vercel, redeploy, then open `/admin` and enter the key. That browser can then open login-only pages (such as `/dashboard`) without Google sign-in for 30 days. Without `ADMIN_KEY`, admin access is off.
