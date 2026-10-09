-- neural365 COMMUNITY — Migration 005: Storage Buckets for Media & Blog Assets
-- Run this in the Supabase SQL editor

-- ─── 1. Add Media Columns to pulse_items ──────────────────────────────────
alter table pulse_items
  add column if not exists podcast_audio_url text,
  add column if not exists short_video_url text;

-- ─── 2. Provision Storage Buckets ──────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('blog-assets', 'blog-assets', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']),
  ('pulse-podcasts', 'pulse-podcasts', true, 52428800, array['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/x-m4a']),
  ('neural-shorts', 'neural-shorts', true, 104857600, array['video/mp4', 'video/webm', 'video/quicktime']),
  ('site-videos', 'site-videos', true, 524288000, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ─── 2. Storage RLS Policies ───────────────────────────────────────────────

-- Public read for all 4 community buckets
drop policy if exists "Community media: public select" on storage.objects;
create policy "Community media: public select"
  on storage.objects for select
  using (
    bucket_id in ('blog-assets', 'pulse-podcasts', 'neural-shorts', 'site-videos')
  );

-- Admin insert/upload permissions
drop policy if exists "Community media: admin insert" on storage.objects;
create policy "Community media: admin insert"
  on storage.objects for insert
  with check (
    bucket_id in ('blog-assets', 'pulse-podcasts', 'neural-shorts', 'site-videos')
    and (
      (select auth.role()) = 'service_role'
      or exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
      )
    )
  );

-- Admin update permissions
drop policy if exists "Community media: admin update" on storage.objects;
create policy "Community media: admin update"
  on storage.objects for update
  using (
    bucket_id in ('blog-assets', 'pulse-podcasts', 'neural-shorts', 'site-videos')
    and (
      (select auth.role()) = 'service_role'
      or exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
      )
    )
  );

-- Admin delete permissions
drop policy if exists "Community media: admin delete" on storage.objects;
create policy "Community media: admin delete"
  on storage.objects for delete
  using (
    bucket_id in ('blog-assets', 'pulse-podcasts', 'neural-shorts', 'site-videos')
    and (
      (select auth.role()) = 'service_role'
      or exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
      )
    )
  );
