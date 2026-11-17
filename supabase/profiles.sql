-- Profiles for people who sign in with Google. Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- A profile row is made automatically on first sign-in, from the Google name and photo.
-- Each person can read and change only their own row, and only its name and username.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- The link to a published site: /u/username.
  username text unique check (username ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$'),
  display_name text check (char_length(display_name) between 1 and 60),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Users read their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Users update their own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

revoke insert, update, delete, truncate, references, trigger on public.profiles from anon, authenticated;
revoke select on public.profiles from anon;
grant select on public.profiles to authenticated;
grant update (display_name, username) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)), 60),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create or replace trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create or replace trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
