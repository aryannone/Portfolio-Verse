-- Publishing: each signed-in person can put one site live at portfolio-verse-tau.vercel.app/u/<username>.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run again.

-- When the person's site went live; set and cleared only by the server.
alter table public.profiles add column if not exists published_at timestamptz;

-- Published sites: one HTML file per person at sites/<user id>/index.html, up to 10 MB. The bucket is private:
-- visitors reach a site only through /u/<username>, which the server serves.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sites', 'sites', false, 10485760, array['text/html'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = array['text/html'];

-- Each person may read, upload, replace and delete only their own site file.
drop policy if exists "Users read their own site" on storage.objects;
create policy "Users read their own site" on storage.objects for select to authenticated
  using (bucket_id = 'sites' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users upload their own site" on storage.objects;
create policy "Users upload their own site" on storage.objects for insert to authenticated
  with check (bucket_id = 'sites' and name = (select auth.uid())::text || '/index.html');
drop policy if exists "Users replace their own site" on storage.objects;
create policy "Users replace their own site" on storage.objects for update to authenticated
  using (bucket_id = 'sites' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'sites' and name = (select auth.uid())::text || '/index.html');
drop policy if exists "Users delete their own site" on storage.objects;
create policy "Users delete their own site" on storage.objects for delete to authenticated
  using (bucket_id = 'sites' and (storage.foldername(name))[1] = (select auth.uid())::text);
