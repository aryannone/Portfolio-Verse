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
  created_at timestamptz not null default now()
);

create index if not exists feedback_approved_created on public.feedback (approved, created_at desc);

-- Row level security on, with no policies: the public keys can do nothing; only the server's service role can.
alter table public.feedback enable row level security;
