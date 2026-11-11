-- PORTFOLIO-VERSE database. Run once in Supabase > SQL Editor.

-- 1. Profiles: one row per signed-in user.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text,
  photo text,
  username text unique,
  created_at timestamptz not null default now(),
  constraint username_format check (username is null or username ~ '^[a-z0-9][a-z0-9-]{2,29}$')
);

-- 2. Portfolios: the site a user builds.
create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references public.profiles (id) on delete cascade,
  name text not null default 'My portfolio',
  template text not null,
  content jsonb not null default '{}'::jsonb,
  design jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  published_html text,
  updated_at timestamptz not null default now()
);

create index if not exists portfolios_owner_idx on public.portfolios (owner);

-- 3. Reports: abuse reports from visitors.
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  site text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- 4. Security: each user can only touch their own rows.
alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.reports enable row level security;

create policy "Users read their own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Owners read their portfolios" on public.portfolios
  for select using (auth.uid() = owner);
create policy "Owners create portfolios" on public.portfolios
  for insert with check (auth.uid() = owner);
create policy "Owners update their portfolios" on public.portfolios
  for update using (auth.uid() = owner);
create policy "Owners delete their portfolios" on public.portfolios
  for delete using (auth.uid() = owner);

create policy "Anyone can file a report" on public.reports
  for insert with check (true);

-- 5. Create a profile automatically when someone signs in for the first time.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, photo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Reading published sites by visitors, the 1-site limit and the storage bucket
-- are added in the publish step, together with the code that uses them.
