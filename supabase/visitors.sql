-- Unique visitors for the home page. Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run again.
-- Each browser has a random, anonymous id (cookie pv_vid) and is recorded once. A browser that signs in is linked
-- to that Google account, so one person signed in on several devices counts once.
-- Visitors = signed-in people + browsers that never signed in. Only the site's server can read or write it.

create table if not exists public.site_visitors (
  browser_id text primary key check (browser_id ~ '^[a-z0-9-]{16,64}$'),
  user_id uuid references auth.users (id) on delete set null,
  first_seen timestamptz not null default now()
);
alter table public.site_visitors enable row level security;
create index if not exists site_visitors_user on public.site_visitors (user_id);

create or replace function public.record_visit(browser text, account uuid)
returns void language sql set search_path = '' as $$
  insert into public.site_visitors (browser_id, user_id) values (browser, account)
  on conflict (browser_id) do update set user_id = coalesce(excluded.user_id, public.site_visitors.user_id);
$$;

create or replace function public.visitor_count()
returns bigint language sql stable set search_path = '' as $$
  select count(distinct coalesce(user_id::text, browser_id)) from public.site_visitors;
$$;

revoke all on function public.record_visit(text, uuid) from public, anon, authenticated;
revoke all on function public.visitor_count() from public, anon, authenticated;
grant execute on function public.record_visit(text, uuid) to service_role;
grant execute on function public.visitor_count() to service_role;
