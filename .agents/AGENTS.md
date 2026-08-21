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

## generateStaticParams — Do Not Use cookies()
- Next.js does NOT allow `cookies()` inside `generateStaticParams` — it runs at build time without an HTTP request.
- For any dynamic page that queries Supabase with cookies, use `export const dynamic = 'force-dynamic'` instead of `generateStaticParams`.

## next.config.js (NOT .ts)
- This environment does NOT support `next.config.ts`. Always use `next.config.js`.

## .env.local Format
- The `.env.local` file must contain ONLY valid shell key=value pairs.
- Do NOT include plain English sentences or backtick characters anywhere in the file.

## Admin Editorial Pipeline Architecture
- `/admin/review` — text review queue. Shows `pulse_items` where `status = 'draft'`.
- `/admin/media` — media review queue. Shows items where `status = 'media_pending'`.
- After text approval → `status` moves to `'media_pending'` (triggers NotebookLM worker).
- After media approval → `status` moves to `'live'` (visible on public Pulse feed).
- The review page is split: `app/admin/review/page.tsx` (Server Component, fetches DB) and `app/admin/review/client-page.tsx` (Client Component, handles editing state + server actions).
- Server actions are in `app/admin/review/actions.ts`.
