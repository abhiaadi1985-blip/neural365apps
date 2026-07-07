# neural365apps — Build Specification

**Audience for this document:** an AI coding agent (e.g. GLM 5.1 running inside Kilo Code) implementing this project end-to-end. Treat every section below as a requirement unless marked "open question." Where a decision hasn't been made, the agent should pick the most reasonable default, implement it, and flag the assumption in a `DECISIONS.md` file at the repo root rather than blocking on it.

A working static reference of the landing page already exists and should be treated as the canonical visual/UX baseline: `neural365apps_hub_landing.html`. Port its structure, copy, and design tokens into the Next.js component system described below — don't redesign from scratch.

---

## 1. Project Identity

**Name:** neural365apps
**Positioning:** An independent (unofficial) premium community hub for the Microsoft Dynamics 365 and Power Platform ecosystem — focused on AI agents, Copilot capabilities, and upcoming/public-preview features. Visual, interactive, video/audio-first; explicitly not a clone of Microsoft Learn.
**Primary user:** D365/Power Platform consultants, implementers, and power users who want to stay current without reading dense release-wave PDFs.

---

## 2. Architecture — Hub and Spoke

### Hub (VPS layer — this repo)
- Frontend web app (public site + authenticated guide content)
- Auth + user/subscription database
- Payment processing (Stripe)
- Interactive step-by-step guide content (premium tier)
- Pulse feed content store (populated by the Hermes agent)

### Spokes (Microsoft cloud layer — external, isolated)
- Dedicated Microsoft 365 Developer / Power Platform sandbox tenants
- Used only to *run* live D365 F&O / Dataverse / Copilot demos referenced from guides
- Never holds production user data; treated as disposable/resettable per-tenant
- Out of scope for this repo's build — document the required tenant setup in `docs/spoke-environments.md` but do not attempt to provision it from app code.

### Tech stack
| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js (App Router) | SSR for SEO on guide/pillar pages, client components for interactive widgets |
| Styling | CSS Modules or Tailwind (agent's choice) + the design tokens in §4 | Do not introduce a second design language |
| Backend/API | Next.js route handlers + Node.js | Keep Hermes agent as a separate worker process, not inline with request handling |
| Database | Supabase (Postgres) | Tables in §7 |
| Auth | Supabase Auth | Email + OAuth (Microsoft account login is a natural fit given the audience — flag as a recommended addition if not in initial scope) |
| Payments | Stripe | Subscription tier gating premium guides/courses |
| Automation | Custom "Hermes" scraper agent | Spec in §8; runs as a scheduled job, not part of the web app's request path |
| Hosting | Generic VPS | Document required Node version, process manager (pm2 or systemd), and reverse proxy (nginx) config in `docs/deploy.md` |

---

## 3. Repository Structure

```
/app
  /(public)
    /page.tsx                  → landing page
    /pulse/page.tsx             → full pulse feed, filterable
    /d365-fo/page.tsx           → pillar: D365 F&O
    /dataverse-power-platform/page.tsx
    /copilot-ai-agents/page.tsx
    /industry-solutions/page.tsx
    /guides/[slug]/page.tsx     → individual guide (multimedia hub layout)
  /(auth)
    /sign-in, /sign-up, /account
  /api
    /pulse/route.ts             → read pulse_items (public)
    /hermes/ingest/route.ts     → internal-only, called by the Hermes worker, not by the browser
    /stripe/webhook/route.ts
/components
  /hero, /pulse-grid, /pulse-card, /media-row, /media-card, /modal-player, /signup-form, /nav, /footer
/lib
  /supabase (client + server helpers)
  /stripe
  /design-tokens.ts             → single source of truth for colors/type, mirrored into CSS variables
/worker
  /hermes
    /sources/                  → one module per source (microsoft-learn.ts, release-wave.ts, preview-blogs.ts, community-blogs.ts)
    /pipeline.ts                → fetch → extract → dedupe → categorize → write
    /run.ts                     → entrypoint for the cron job
/docs
  /deploy.md
  /spoke-environments.md
DECISIONS.md
```

---

## 4. Design System

These tokens are already implemented in `neural365apps_hub_landing.html`; reproduce them exactly as CSS variables / Tailwind theme extensions rather than re-deriving a palette.

### Color
```
--bg:        #060A12   /* page background, deep slate/near-black */
--bg-2:      #0B1220   /* input fields, secondary surfaces */
--panel:     #0E1726   /* cards */
--line:      #1E293D   /* hairline borders */
--text:      #E7ECF5
--text-muted:#8C9AB3
--azure:       #2F86FF   /* primary accent, CTAs, glow */
--azure-deep:  #0B63CE   /* button gradient base */
--azure-dim:   rgba(47,134,255,0.14)
--lane-new:    #34D8B0   /* "What's New" tag */
--lane-coming: #F2B544   /* "What's Coming" tag */
--lane-arch:   #9B8CFF   /* "Architecture Shifts" tag */
```

### Type
- Display: **Sora** (600–800 weight) — headlines only, used with restraint
- Body: **Inter** (400–600 weight)
- Utility/data: **IBM Plex Mono** (400–500) — timestamps, cadence labels, status pills, source tags

### Motion
- Hero background: three soft radial-gradient blobs in `--azure` tones, slow independent drift (22–30s ease-in-out loops), `blur(60px)`, `opacity: 0.55`
- Card hover: 2px lift (`translateY(-2px)`) + colored glow shadow matching the card's lane color
- All animation must respect `prefers-reduced-motion: reduce` (disable drift, allow scroll instead of animated transforms)

### Signature element
The animated azure gradient mesh behind the hero, combined with lane-colored glow borders on Pulse cards. Do not introduce a second "hero treatment" elsewhere on the site — reuse this same mesh component at reduced opacity on pillar pages so the brand stays consistent.

---

## 5. Page Specifications

### 5.1 Landing page (`/`)
- **Hero:** headline "Master Microsoft AI Agents & ERP. Hands-on.", subhead, primary CTA → `/pulse`, secondary CTA → opens video modal (placeholder player until real intro video exists)
- **Pulse preview:** 3-column lane grid (New / Coming / Architecture Shifts), 3 cards per lane, "see all" link → `/pulse`
- **Multimedia hub preview:** horizontal scroll rows for Neural Shorts and Micro-Podcasts, 4 items each, linking to `/guides/[slug]`
- **Newsletter capture:** email → Supabase `subscribers` table (see §7), not Stripe-gated

### 5.2 Pulse feed (`/pulse`)
- Full, paginated/filterable version of the 3-lane grid
- Filters: pillar (D365 F&O / Dataverse & Power Platform / Copilot & AI Agents / Industry Solutions), lane (New/Coming/Architecture), source
- Each card links to its original source URL (outbound, `rel="nofollow noopener"`) and, if a guide exists, to the internal guide

### 5.3 Pillar pages (`/d365-fo`, `/dataverse-power-platform`, `/copilot-ai-agents`, `/industry-solutions`)
- Same shell: pillar-specific hero (smaller, reuse mesh component), pulse items filtered to that pillar, list of related guides
- Pillar-specific copy needed — not yet written; agent should draft one short (2–3 sentence) intro per pillar and flag in `DECISIONS.md` for human review before publishing

### 5.4 Guide page (`/guides/[slug]`) — the "Interactive Multimedia Hub"
- Written walkthrough (MDX or rich text from Supabase) as the primary content
- Inline **Neural Short** (vertical, ~60s) embedded near the relevant step, not just listed at the top
- Inline **Micro-podcast** (~5min audio) embedded near the strategic-context section
- Premium guides gated behind Stripe subscription check; show a paywall card with upgrade CTA if the viewer lacks access
- Comment/discussion section is **out of scope for v1** — do not build it speculatively

---

## 6. Component Inventory

| Component | Responsibility | Key props |
|---|---|---|
| `<HeroMesh />` | Animated gradient background | `intensity` (full / reduced), `seed` |
| `<PulseGrid />` | 3-lane card grid | `items`, `filter`, `limit` |
| `<PulseCard />` | Single pulse item | `title, summary, pillar, lane, sourceUrl, publishedAt` |
| `<MediaRow />` | Horizontal scroll of media cards | `kind` ("short" \| "podcast"), `items` |
| `<MediaCard />` | Thumbnail + title + duration | `title, durationSec, thumbnailUrl, href` |
| `<ModalPlayer />` | Video/audio overlay | `src`, `kind`, `onClose` |
| `<SignupForm />` | Email capture | `onSubmit`, `placeholder` |
| `<PaywallCard />` | Shown when content is gated | `tier`, `ctaHref` |

All copy strings should live in a single `copy.ts`/`copy.json` per page, not inline in JSX, so non-engineers can edit wording without touching component logic.

---

## 7. Data Model (Supabase / Postgres)

```sql
-- Pulse feed items, written by the Hermes worker
create table pulse_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,           -- agent-written, deduped, max ~240 chars
  lane text not null check (lane in ('new','coming','architecture')),
  pillar text not null check (pillar in ('d365-fo','dataverse-power-platform','copilot-ai-agents','industry-solutions')),
  source_name text not null,       -- e.g. "Microsoft Learn", "Release Wave 2026"
  source_url text not null,
  published_at timestamptz not null,
  ingested_at timestamptz not null default now(),
  dedupe_hash text not null unique -- hash of normalized title+source to prevent duplicate ingestion
);

-- Guides (written content + media references)
create table guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  pillar text not null,
  body_mdx text not null,
  is_premium boolean not null default false,
  short_video_url text,
  podcast_audio_url text,
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Newsletter / pulse-in-inbox subscribers
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now(),
  confirmed boolean not null default false
);

-- Subscription state (mirrors Stripe)
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  stripe_customer_id text not null,
  stripe_subscription_id text not null,
  status text not null,            -- active, past_due, canceled, etc.
  current_period_end timestamptz not null
);
```

Row-level security: `pulse_items` and published `guides` (`is_premium = false`) are public-read. Premium `guides.body_mdx` must only be returned server-side after verifying an active subscription — never ship premium MDX to the client unauthenticated, even truncated.

---

## 8. Hermes Agent Spec (automation worker)

**Purpose:** keep `pulse_items` current without manual entry.

**Schedule:** cron, every 3 days (`0 6 */3 * *` as a starting point — confirm timezone with deployment target).

**Sources (one module per source under `/worker/hermes/sources/`):**
1. Microsoft Learn & official technical documentation
2. Microsoft public-preview blogs & release-wave roadmaps
3. Microsoft AI Skill Navigator + official community forum portals
4. A curated list of trusted D365/Power Platform expert blogs (maintain this list in `/worker/hermes/sources/community-blogs.config.ts` so it can be edited without code changes)

**Pipeline (`/worker/hermes/pipeline.ts`):**
1. **Fetch** — pull each source's latest items since the last successful run (track a `last_run_at` watermark per source).
2. **Extract** — pull title, summary/body, canonical URL, published date.
3. **Dedupe** — compute `dedupe_hash` from normalized title + source domain; skip if it already exists in `pulse_items`.
4. **Categorize** — classify into one `pillar` and one `lane` (new / coming / architecture). Start with a rules-based classifier (keyword/source-type matching) and only add an LLM classification step if the rules-based approach proves insufficient — don't default straight to an LLM call per item.
5. **Summarize** — if the source doesn't already provide a short summary, generate one (≤240 chars, no marketing language, state the concrete capability change).
6. **Write** — insert into `pulse_items` via the internal `/api/hermes/ingest` route, authenticated with a server-only secret (never exposed to the client bundle).

**Failure handling:** a single source failing must not block the others. Log per-source success/failure counts; surface a simple run summary (could be as plain as a written log file or a Slack/email webhook — pick one and document it).

**Legal/ethical note to carry into implementation:** respect each source's robots.txt and terms of service; store only short summaries and metadata plus a link back to the original, not full reproduced article text (this is also a copyright concern, not just a style one).

---

## 9. Auth & Payments

- Supabase Auth handles sign-up/sign-in; add Microsoft account OAuth if feasible given the audience.
- Stripe handles subscription billing for the premium guide tier. Use Stripe Checkout (hosted) rather than building a custom card form, to minimize PCI scope.
- Webhook (`/api/stripe/webhook`) updates the `subscriptions` table; this table is the source of truth for gating, not a live Stripe API call on every page load.

---

## 10. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only, never exposed to client
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
HERMES_INGEST_SECRET=             # shared secret between the worker and /api/hermes/ingest
```
Document these in `.env.example`; never commit real values.

---

## 11. Build & Deploy Notes

- Target Node LTS version current at build time — confirm and pin in `.nvmrc` and `package.json` `engines`.
- Run the Hermes worker as its own process (pm2/systemd unit), separate from the Next.js server process, so a long-running scrape can't block web requests.
- Document the nginx reverse-proxy config (TLS termination, gzip/brotli, caching headers for static assets) in `docs/deploy.md`.

---

## 12. Definition of Done (v1)

- [ ] Landing page matches `neural365apps_hub_landing.html` structure and copy, rebuilt as Next.js components using the design tokens in §4
- [ ] `/pulse` page renders live data from `pulse_items` (seed with a handful of real, manually-entered rows if Hermes isn't live yet — never ship fabricated "live" data to production)
- [ ] All four pillar pages exist with at least placeholder intro copy (flagged in `DECISIONS.md` for human review)
- [ ] At least one full guide page exists end-to-end with an embedded short and podcast reference, to validate the template
- [ ] Stripe checkout + webhook gate at least one premium guide correctly (verified by testing both subscribed and unsubscribed states)
- [ ] Hermes worker runs once successfully against at least one real source and writes deduplicated rows to `pulse_items`
- [ ] Reduced-motion and keyboard-focus states verified across hero, cards, and modal
- [ ] `docs/deploy.md` and `docs/spoke-environments.md` exist, even if the spoke environments themselves aren't provisioned yet

---

## 13. Open Questions for Human Review

1. Should sign-in support Microsoft account OAuth in v1, or email-only to start?
2. What's the actual pricing/tier structure for premium guides (single tier vs. multiple)?
3. Confirm the legal framing in the footer disclaimer ("independent community hub… not an official Microsoft product") with whoever owns trademark/branding risk before this goes live publicly.
4. Real Neural Shorts/Micro-podcast media doesn't exist yet — confirm production plan and who owns recording them before the multimedia hub ships with anything beyond placeholders.
