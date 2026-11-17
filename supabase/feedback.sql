-- The feedback wall's table. Run this once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Only the site's server (with the service role key) reads and writes it; visitors never reach it directly.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 30),
  topic text not null,
  message text not null check (char_length(message) between 8 and 220),
  color text not null,
  font text not null,
  -- A random id kept in the visitor's browser: one note per browser.
  client_id text not null unique check (char_length(client_id) between 16 and 64),
  approved boolean not null default false,
  -- Set by the owner from the admin page: pinned notes sit at the top of the wall; a reply shows under the note.
  pinned boolean not null default false,
  reply text check (reply is null or char_length(reply) between 1 and 160),
  created_at timestamptz not null default now()
);

create index if not exists feedback_approved_created on public.feedback (approved, created_at desc);

-- Row level security on, with no policies: the public keys can do nothing; only the server's service role can.
alter table public.feedback enable row level security;

-- Added later: run these on a table made before pinned notes and replies existed (safe to run again).
alter table public.feedback add column if not exists pinned boolean not null default false;
alter table public.feedback add column if not exists reply text check (reply is null or char_length(reply) between 1 and 160);

-- Added later: notes belong to a Google account (one note each); the browser id is no longer used for new notes.
alter table public.feedback add column if not exists user_id uuid unique references auth.users (id) on delete cascade;
alter table public.feedback alter column client_id drop not null;
