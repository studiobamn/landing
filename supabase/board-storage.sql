-- =========================================================
-- BOARD (Excalidraw/Yjs) — Supabase Storage bucket + RLS.
-- Run in the Supabase SQL editor. Creates a PRIVATE bucket "board" and policies
-- so that:
--   • projects/{id}/public.gz     → read + write open to EVERYONE (the wall)
--   • projects/{id}/checkpoint.gz → read + write only for AUTHENTICATED (admins)
-- The bucket is private (public = false) so checkpoint.gz isn't world-readable
-- via a public URL; access is gated entirely by the policies below.
-- (Realtime broadcast needs no extra config — it's on by default.)
-- =========================================================

insert into storage.buckets (id, name, public)
values ('board', 'board', false)
on conflict (id) do nothing;

-- ---- public.gz — open to everyone ----
drop policy if exists "board_public_read" on storage.objects;
create policy "board_public_read" on storage.objects
  for select using (bucket_id = 'board' and name like '%/public.gz');

drop policy if exists "board_public_insert" on storage.objects;
create policy "board_public_insert" on storage.objects
  for insert with check (bucket_id = 'board' and name like '%/public.gz');

drop policy if exists "board_public_update" on storage.objects;
create policy "board_public_update" on storage.objects
  for update using (bucket_id = 'board' and name like '%/public.gz')
  with check (bucket_id = 'board' and name like '%/public.gz');

-- ---- checkpoint.gz — authenticated (admin) only ----
drop policy if exists "board_checkpoint_read" on storage.objects;
create policy "board_checkpoint_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'board' and name like '%/checkpoint.gz');

drop policy if exists "board_checkpoint_insert" on storage.objects;
create policy "board_checkpoint_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'board' and name like '%/checkpoint.gz');

drop policy if exists "board_checkpoint_update" on storage.objects;
create policy "board_checkpoint_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'board' and name like '%/checkpoint.gz')
  with check (bucket_id = 'board' and name like '%/checkpoint.gz');
