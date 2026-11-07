alter table pulse_items
  add column if not exists short_storage_url text,
  add column if not exists podcast_candidate boolean not null default false,
  add column if not exists podcast_approved boolean not null default false,
  add column if not exists publish_last_error text;

alter table blog_posts
  add column if not exists short_storage_url text,
  add column if not exists podcast_candidate boolean not null default false,
  add column if not exists podcast_approved boolean not null default false,
  add column if not exists publish_last_error text;

create index if not exists pulse_render_stuck_idx on pulse_items (created_at)
  where status = 'media_pending' and video_brief is not null and short_storage_url is null;
create index if not exists blog_render_stuck_idx on blog_posts (created_at)
  where status = 'media_pending' and video_brief is not null and short_storage_url is null;
create index if not exists pulse_publish_stuck_idx on pulse_items (created_at)
  where status = 'live' and short_storage_url is not null and short_video_url is null;
create index if not exists blog_publish_stuck_idx on blog_posts (created_at)
  where status = 'live' and short_storage_url is not null and short_video_url is null;
create index if not exists pulse_podcast_queue_idx on pulse_items (created_at)
  where podcast_approved = true and podcast_audio_url is null;
create index if not exists blog_podcast_queue_idx on blog_posts (created_at)
  where podcast_approved = true and podcast_audio_url is null;
