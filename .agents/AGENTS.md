# neural365 COMMUNITY — Project Rules

## Branding
- The site name in ALL page `<title>` tags and metadata is **neural365 COMMUNITY** (not "neural365apps").
- Example: `title: 'The Pulse — neural365 COMMUNITY'`

## Supabase Client Setup
- The correct env variable name is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (NOT `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Client helpers live at `utils/supabase/client.ts`, `utils/supabase/server.ts`, `utils/supabase/middleware.ts`.
- The server client must receive `cookieStore` — always call `await cookies()` first:
  ```ts
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  ```
- Never call `createClient()` without `cookieStore` in server components/actions.

## SEED_PULSE Fallback Pattern
- The shared source of truth for all pulse items is `lib/seed-pulse.ts` (type `PulseItem` is also defined here).
- Do NOT import `PulseItem` from `components/pulse-grid`.
- Wherever a page queries Supabase for `pulse_items`, ALWAYS add a fallback to `SEED_PULSE` when the result is empty, so the site never goes blank before the DB is seeded:
  ```ts
  const { data } = await supabase.from('pulse_items').select('*')
  const items = (data && data.length > 0) ? data : SEED_PULSE
  ```

## SEED_BLOG Fallback Pattern
- The shared source of truth for all blog articles is `lib/seed-blog.ts` (type `BlogPost` is defined here).
- Wherever a page queries Supabase for `blog_posts`, ALWAYS add a fallback to `SEED_BLOG` when the result is empty:
  ```ts
  const { data } = await supabase.from('blog_posts').select('*').eq('status', 'live')
  const posts = (data && data.length > 0) ? data : SEED_BLOG
  ```

## generateStaticParams — Do Not Use cookies()
- Next.js does NOT allow `cookies()` inside `generateStaticParams` — it runs at build time without an HTTP request.
- For any dynamic page that queries Supabase with cookies, use `export const dynamic = 'force-dynamic'` instead of `generateStaticParams`.

## next.config.js (NOT .ts)
- This environment does NOT support `next.config.ts`. Always use `next.config.js`.

## .env.local Format
- The `.env.local` file must contain ONLY valid shell key=value pairs.
- Do NOT include plain English sentences or backtick characters anywhere in the file.

## Admin Editorial Pipeline Architecture
- `/admin/review` — text review queue for Pulse. Shows `pulse_items` where `status = 'draft'`.
- `/admin/media` — media review queue for Pulse. Shows items where `status = 'media_pending'`.
- `/admin/blog-review` — text review queue for Blog. Shows `blog_posts` where `status = 'draft'`.
- `/admin/blog-media` — media review queue for Blog. Shows items where `status = 'media_pending'`.
- After text approval → `status` moves to `'media_pending'` (triggers Open Notebook / video worker).
- After media approval → `status` moves to `'live'` (visible on public Pulse feed / Blog feed).
- The review pages are split into Server Component (fetches DB) and Client Component (handles editing state + server actions).

## Multimedia Pipeline Rules
- **Podcasts (.mp3)**: Stored in Supabase Storage (`pulse-podcasts` bucket). NotebookLM does not offer public embeds; storing `.mp3` enables custom chapter scrubbing via `podcast_chapters`.
- **Shorts (.mp4 / YouTube)**: Staged in Supabase Storage (`neural-shorts` bucket) for admin review, then published to YouTube Shorts (`short_video_url` points to YouTube URL on live release) to eliminate heavy video egress bills.
- **Worker Queue**: Local laptop Antigravity worker queries `status = 'media_pending' AND video_brief IS NOT NULL AND short_video_url IS NULL ORDER BY created_at ASC`.
- **Hermes Ingestion Endpoints**: `/api/hermes/*` routes use `createAdminClient()` (`SUPABASE_SECRET_KEY`) to safely bypass RLS on server-side agent writes.
