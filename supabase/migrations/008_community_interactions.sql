-- neural365 COMMUNITY — Migration 008: Community Interactions (Comments & Bookmarks)
-- Run this in the Supabase SQL editor

-- ─── 1. Comments Table (Open Commenting: Name + Email) ────────────────────────
create table if not exists comments (
  id           uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('pulse', 'blog')),
  content_id   text not null,  -- matches pulse item id or blog slug/id
  author_name  text not null,
  author_email text not null,
  body         text not null,
  status       text not null default 'approved' check (status in ('approved', 'hidden', 'flagged')),
  created_at   timestamptz not null default now()
);

-- Index for speedy thread loading
create index if not exists idx_comments_content
  on comments (content_type, content_id, created_at desc);

-- Enable RLS
alter table comments enable row level security;

-- Public read for approved comments
drop policy if exists "comments: public read approved" on comments;
create policy "comments: public read approved"
  on comments for select
  using (status = 'approved');

-- Public open insert
drop policy if exists "comments: public insert" on comments;
create policy "comments: public insert"
  on comments for insert
  with check (true);

-- Admin full control
drop policy if exists "comments: admin all" on comments;
create policy "comments: admin all"
  on comments for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Service role full control
drop policy if exists "comments: service role all" on comments;
create policy "comments: service role all"
  on comments for all
  using ((select auth.role()) = 'service_role');


-- ─── 2. User Bookmarks Table (For Authenticated Reading Lists) ───────────────
create table if not exists user_bookmarks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  content_type text not null check (content_type in ('pulse', 'blog')),
  content_id   text not null,
  title        text not null,
  pillar       text not null,
  created_at   timestamptz not null default now(),
  constraint uq_user_bookmark unique (user_id, content_type, content_id)
);

-- Index for user reading list queries
create index if not exists idx_user_bookmarks_user
  on user_bookmarks (user_id, created_at desc);

-- Enable RLS
alter table user_bookmarks enable row level security;

-- Users can only read their own bookmarks
drop policy if exists "user_bookmarks: select own" on user_bookmarks;
create policy "user_bookmarks: select own"
  on user_bookmarks for select
  using (auth.uid() = user_id);

-- Users can insert their own bookmarks
drop policy if exists "user_bookmarks: insert own" on user_bookmarks;
create policy "user_bookmarks: insert own"
  on user_bookmarks for insert
  with check (auth.uid() = user_id);

-- Users can delete their own bookmarks
drop policy if exists "user_bookmarks: delete own" on user_bookmarks;
create policy "user_bookmarks: delete own"
  on user_bookmarks for delete
  using (auth.uid() = user_id);
