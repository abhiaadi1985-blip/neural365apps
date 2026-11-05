-- 009_hermes_multimedia_bundle.sql
-- Consolidates Hermes Multimedia Pipeline:
-- 1. Long-form podcast support on blog_posts (podcast_kind, duration, chapters)
-- 2. Unified created_at timestamp on pulse_items
-- 3. video_brief specification for targeted Antigravity shorts worker pickup
-- 4. render_attempts, render_last_error, render_last_attempt_at for 48h watchdog

-- ── 1. Long-form podcast columns (blog_posts) ─────────────────────────────
alter table blog_posts
  add column if not exists podcast_kind text not null default 'article'
    check (podcast_kind in ('article', 'long')),
  add column if not exists podcast_duration_sec int,
  add column if not exists podcast_chapters jsonb,
  add column if not exists podcast_generated_at timestamptz;

create index if not exists blog_posts_podcast_kind_idx on blog_posts (podcast_kind)
  where podcast_kind = 'long';

-- ── 2. Timestamp alignment (pulse_items) ─────────────────────────────────
-- pulse_items initially used ingested_at; add created_at defaulting to now()
-- and backfill from ingested_at so worker can query ORDER BY created_at ASC uniformly
alter table pulse_items
  add column if not exists created_at timestamptz not null default now();

update pulse_items
  set created_at = ingested_at
  where ingested_at is not null;

-- ── 3. Video brief columns (pulse_items & blog_posts) ─────────────────────
alter table pulse_items
  add column if not exists video_brief jsonb;

alter table blog_posts
  add column if not exists video_brief jsonb;

-- ── 4. Render failure & watchdog columns ──────────────────────────────────
alter table pulse_items
  add column if not exists render_attempts int not null default 0,
  add column if not exists render_last_error text,
  add column if not exists render_last_attempt_at timestamptz;

alter table blog_posts
  add column if not exists render_attempts int not null default 0,
  add column if not exists render_last_error text,
  add column if not exists render_last_attempt_at timestamptz;

-- ── 5. Partial indexes matching worker pickup predicate ───────────────────
create index if not exists pulse_items_pending_video_idx on pulse_items (created_at asc)
  where status = 'media_pending' and video_brief is not null and short_video_url is null;

create index if not exists blog_posts_pending_video_idx on blog_posts (created_at asc)
  where status = 'media_pending' and video_brief is not null and short_video_url is null;
