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
status         text  -- 'draft' | 'live' (added in migration 002)
content_md     text  -- Long-form blog post (nullable)
demo_scenario_md text -- Hands-on demo example (nullable)
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

## Admin Middleware Protection

Root `middleware.ts` intercepts `/admin/*` routes (except `/admin/login`):
1. Creates Supabase client from request cookies
2. Calls `supabase.auth.getUser()` — if no user, redirect to `/admin/login`
3. Queries `profiles` for `role = 'admin'` — if not admin, sign out and redirect

## Hermes Pipeline Flow

```
Firecrawl (scrape Microsoft sources every 3 days)
  └─▶ Gemini generates: summary + content_md + demo_scenario_md
        └─▶ Saved to Supabase with status='draft'
              └─▶ /admin/review — Human edits/approves text
                    └─▶ status → 'media_pending'
                          └─▶ Open Notebook (Docker) generates podcast + video
                                └─▶ /admin/media — Human approves media
                                      └─▶ status → 'live'
                                            └─▶ Visible on /pulse feed
```

## Pillar Pages
- `/d365-fo`, `/dataverse-power-platform`, `/copilot-ai-agents`, `/industry-solutions`
- Each pillar page imports `SEED_PULSE` from `lib/seed-pulse.ts` and filters by `pillar`.
- Do NOT maintain separate local arrays in pillar pages.

## Pulse Detail Page Pattern
```ts
// Always use force-dynamic — cannot use generateStaticParams with cookies()
export const dynamic = 'force-dynamic'

// Always fall back to SEED_PULSE if DB is empty
let { data: item } = await supabase.from('pulse_items').select('*').eq('id', id).single()
if (!item) item = SEED_PULSE.find(i => i.id === id) || null
if (!item) notFound()
```

