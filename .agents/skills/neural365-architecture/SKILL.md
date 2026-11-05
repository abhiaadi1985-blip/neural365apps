---
name: neural365-architecture
description: "Reference guide for the neural365 COMMUNITY Next.js project. Use when working on this site to understand data flow, component structure, Supabase schema, admin pipeline, and key architectural patterns. Always read this skill before editing pages, components, or database queries."
---

# neural365 COMMUNITY — Architecture Reference

## Tech Stack
- **Framework**: Next.js 16.2.9 (Turbopack, App Router). Config in `next.config.js` (NOT .ts).
- **Styling**: Vanilla CSS in `app/globals.css`. Design tokens as CSS variables.
- **Database**: Supabase (hosted). Client helpers in `utils/supabase/`.
- **Markdown rendering**: `react-markdown` (installed).

## Key Files & Directories

| Path | Purpose |
|------|---------|
| `lib/seed-pulse.ts` | Source of truth for all pulse items. Also defines `PulseItem` interface. |
| `lib/design-tokens.ts` | Defines `Lane` and `Pillar` types. |
| `components/pulse-grid.tsx` | `PulseCard` and `PulseGrid` components. Imports `PulseItem` from `lib/seed-pulse`. |
| `components/signup-form.tsx` | Subscriber email + topic checkboxes form. Posts to `/api/subscribe`. |
| `app/pulse/page.tsx` | Public filterable Pulse feed. Queries Supabase with SEED_PULSE fallback. |
| `app/pulse/[id]/page.tsx` | Dynamic Pulse detail page. Uses `force-dynamic`. Queries Supabase with SEED_PULSE fallback. |
| `app/admin/layout.tsx` | Client component. Shows sidebar (Dashboard, Review, Media, Sign Out) for admin pages; hides sidebar on `/admin/login`. |
| `app/admin/page.tsx` | Admin dashboard. Stat cards + charts (subscriber counts, topic breakdown, pulse status). |
| `app/admin/login/page.tsx` | Dedicated admin login page. Posts to `/api/auth/admin-sign-in`. |
| `app/admin/review/page.tsx` | Server Component. Fetches `status='draft'` items from Supabase. |
| `app/admin/review/client-page.tsx` | Client Component. Handles edit/approve/reject UI with `useTransition`. |
| `app/admin/review/actions.ts` | Server Actions: `saveDraftContent`, `approveDraft`, `seedDatabase`. |
| `app/admin/media/page.tsx` | Media review queue (currently empty state). |
| `app/admin/dashboard-charts.tsx` | Client component. Vanilla SVG charts for dashboard. |
| `middleware.ts` | Root middleware. Protects `/admin/*` routes (except `/admin/login`). Checks auth + admin role. |
| `utils/supabase/server.ts` | Server Supabase client (uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` + cookieStore). |
| `utils/supabase/client.ts` | Browser Supabase client. |
| `utils/supabase/middleware.ts` | Middleware Supabase client. Returns `{ supabase, supabaseResponse }`. |
| `supabase/migrations/` | SQL migration files. |

## User Types

| Type | Auth | Storage | Access |
|------|------|---------|--------|
| **Subscriber** | None (email-only) | `subscribers` table | Gets Pulse newsletter emails |
| **Admin** | Supabase Auth (email+password) | `auth.users` + `profiles` (role='admin') | `/admin/*` routes |
| **Hands-on User** | Supabase Auth (email+password) | `auth.users` + `profiles` (role='handson_user') | `/sign-in`, `/sign-up`, `/account` (hidden for now) |

- Admin accounts are manually promoted in Supabase dashboard (update `profiles.role` to `'admin'`).
- Hands-on user profiles auto-created by DB trigger `on_auth_user_created`.
- Subscribers are NOT auth users — they just provide an email + topic preferences.

## Supabase Schema: `pulse_items`

```sql
id             uuid primary key
title          text
summary        text
lane           text  -- 'new' | 'coming' | 'architecture'
pillar         text  -- 'd365-fo' | 'dataverse-power-platform' | 'copilot-ai-agents' | 'industry-solutions'
source_name    text
source_url     text
published_at   timestamptz
ingested_at    timestamptz default now()
dedupe_hash    text unique
status         text  -- 'draft' | 'media_pending' | 'live'
content_md     text  -- Long-form blog post (nullable)
demo_scenario_md text -- Hands-on demo example (nullable)
podcast_audio_url text
short_video_url   text
```

## Supabase Schema: `blog_posts`

```sql
id                 uuid primary key default gen_random_uuid()
slug               text not null unique
title              text not null
subtitle           text
summary            text not null
body_md            text not null
pillar             text not null  -- 'd365-fo' | 'dataverse-power-platform' | 'copilot-ai-agents' | 'industry-solutions'
tags               text[] not null default '{}'
author_name        text not null default 'neural365'
hero_image_url     text
estimated_read_min int
featured           boolean not null default false
status             text not null default 'draft' check (status in ('draft', 'media_pending', 'live'))
podcast_audio_url  text
short_video_url    text
source_url         text
source_name        text
dedupe_hash        text unique
published_at       timestamptz
created_at         timestamptz default now()
updated_at         timestamptz default now()
```

## Supabase Schema: `profiles`

```sql
id         uuid primary key references auth.users(id) on delete cascade
role       text not null default 'handson_user'  -- 'admin' | 'handson_user'
created_at timestamptz default now()
```

## Supabase Schema: `subscribers`

```sql
id               uuid primary key
email            text unique
subscribed_at    timestamptz default now()
confirmed        boolean default false
subscribed_topics text[]  -- array of pillar slugs, defaults to all 4
```

## Admin Proxy Protection

Root `proxy.ts` (Next.js 16 convention, replaces `middleware.ts`) intercepts `/admin/*` routes (except `/admin/login`):
1. Creates Supabase client from request cookies
2. Calls `supabase.auth.getUser()` — if no user, redirect to `/admin/login`
3. Queries `profiles` for `role = 'admin'` — if not admin, sign out and redirect

## Hermes & n8n Pipeline Flow

```
Pulse Flow:
Microsoft sources / Hermes scrape
  └─▶ POST /api/hermes/ingest (status='draft', optional podcast/video URLs)
        └─▶ /admin/review — Human edits/approves text
              └─▶ status → 'media_pending'
                    └─▶ Open Notebook / n8n / media worker generates podcast + video
                          └─▶ POST /api/hermes/media-ingest (attaches URLs)
                                └─▶ /admin/media — Human approves media
                                      └─▶ status → 'live' (visible on /pulse)

Blog Flow:
Hermes / n8n in-depth scraper & generator
  └─▶ POST /api/hermes/blog-ingest (status='draft', optional podcast/video URLs)
        └─▶ /admin/blog-review — Human edits/approves text
              └─▶ status → 'media_pending'
                    └─▶ Open Notebook / n8n / video worker generates media
                          └─▶ POST /api/hermes/media-ingest (attaches URLs)
                                └─▶ /admin/blog-media — Human approves media
                                      └─▶ status → 'live' (visible on /blog & pillar pages)
```

## Pillar Pages
- `/d365-fo`, `/dataverse-power-platform`, `/copilot-ai-agents`, `/industry-solutions`
- Each pillar page queries Supabase for `pulse_items` and `blog_posts` with fallbacks to `SEED_PULSE` and `SEED_BLOG`.
- Do NOT maintain separate local arrays in pillar pages.

## Pulse & Blog Detail Page Pattern
```ts
// Always use force-dynamic — cannot use generateStaticParams with cookies()
export const dynamic = 'force-dynamic'

// Always fall back to SEED_BLOG if DB is empty
let { data: post } = await supabase.from('blog_posts').select('*').eq('slug', slug).single()
if (!post) post = SEED_BLOG.find(p => p.slug === slug) || null
if (!post) notFound()
```

