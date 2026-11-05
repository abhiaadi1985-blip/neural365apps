-- neural365 COMMUNITY — Migration 007: Blog Posts Table
-- Run this in the Supabase SQL editor or as a migration

create table if not exists blog_posts (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  subtitle          text,
  summary           text not null,
  body_md           text not null,
  pillar            text not null check (pillar in (
    'd365-fo', 'dataverse-power-platform', 'copilot-ai-agents', 'industry-solutions'
  )),
  tags              text[] not null default '{}',
  author_name       text not null default 'neural365',
  hero_image_url    text,
  estimated_read_min int,
  featured          boolean not null default false,
  status            text not null default 'draft' check (status in ('draft', 'media_pending', 'live')),
  podcast_audio_url text,
  short_video_url   text,
  source_url        text,
  source_name       text,
  dedupe_hash       text unique,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Enable RLS
alter table blog_posts enable row level security;

-- Public read for live rows
drop policy if exists "blog_posts: public read live" on blog_posts;
create policy "blog_posts: public read live"
  on blog_posts for select
  using (status = 'live');

-- Admin all (check profiles.role = 'admin')
drop policy if exists "blog_posts: admin all" on blog_posts;
create policy "blog_posts: admin all"
  on blog_posts for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Service role all
drop policy if exists "blog_posts: service role all" on blog_posts;
create policy "blog_posts: service role all"
  on blog_posts for all
  using ((select auth.role()) = 'service_role');

-- Index on (status, published_at desc) for the blog listing page query
create index if not exists idx_blog_posts_status_published_at
  on blog_posts (status, published_at desc);
