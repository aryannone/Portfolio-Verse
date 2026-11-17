-- The home page's download count (the 'visitors' row is no longer used: unique visitors are in visitors.sql). Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Only the site's server (with the service role key) reads it and calls increment_stat; visitors never reach it directly.

create table if not exists public.site_stats (
  key text primary key check (key in ('visitors', 'downloads')),
  value bigint not null default 0
);
alter table public.site_stats enable row level security;
insert into public.site_stats (key, value) values ('visitors', 0), ('downloads', 0) on conflict do nothing;

create or replace function public.increment_stat(stat text)
returns void
language sql
set search_path = ''
as $$
  update public.site_stats set value = value + 1 where key = stat;
$$;
revoke all on function public.increment_stat(text) from public, anon, authenticated;
grant execute on function public.increment_stat(text) to service_role;
