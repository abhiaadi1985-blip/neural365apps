-- 011_reject_and_feedback.sql
-- Add revision_requested and rejected statuses plus review_feedback tracking
-- for both pulse_items and blog_posts.

alter table pulse_items
  drop constraint if exists pulse_items_status_check;

alter table pulse_items
  add constraint pulse_items_status_check
  check (status in ('draft', 'media_pending', 'live', 'revision_requested', 'rejected'));

alter table pulse_items
  add column if not exists review_feedback text,
  add column if not exists reviewed_at timestamptz;

alter table blog_posts
  drop constraint if exists blog_posts_status_check;

alter table blog_posts
  add constraint blog_posts_status_check
  check (status in ('draft', 'media_pending', 'live', 'revision_requested', 'rejected'));

alter table blog_posts
  add column if not exists review_feedback text,
  add column if not exists reviewed_at timestamptz;

create index if not exists idx_pulse_items_revision_requested
  on pulse_items (reviewed_at desc)
  where status = 'revision_requested';

create index if not exists idx_blog_posts_revision_requested
  on blog_posts (reviewed_at desc)
  where status = 'revision_requested';
