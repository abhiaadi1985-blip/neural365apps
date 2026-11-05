-- 009b_media_pending_status.sql
-- Ensure status CHECK constraint includes 'media_pending' for both pulse_items and blog_posts
-- Resolves handoff blockage for the §16 render queue

alter table pulse_items
  drop constraint if exists pulse_items_status_check;

alter table pulse_items
  add constraint pulse_items_status_check
  check (status in ('draft', 'media_pending', 'live'));

alter table blog_posts
  drop constraint if exists blog_posts_status_check;

alter table blog_posts
  add constraint blog_posts_status_check
  check (status in ('draft', 'media_pending', 'live'));
