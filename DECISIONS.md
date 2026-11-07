# neural365apps — DECISIONS.md

This file documents all architectural decisions, agent assumptions, and items flagged for human review before public launch.

---

## Decisions Made by Agent

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | **Tailwind CSS v4** | Spec said "agent's choice". Tailwind v4 ships CSS-native config, zero-runtime, and aligns well with the design token approach. |
| D2 | **Email + password auth (v1)** | Microsoft OAuth scaffolded but not enabled. Reduces initial complexity; can be unlocked by adding the OAuth provider in Supabase dashboard. |
| D3 | **Single Stripe tier (flexible schema)** | `subscriptions` table supports multiple tiers via `status`/`current_period_end`. Pricing structure deferred — confirm price point and tier names before enabling Stripe Checkout. |
| D4 | **Rules-based classifier first** | Hermes uses keyword/source-type matching (no LLM per item). Only escalate to LLM classification if rule coverage proves insufficient after real-world testing. |
| D5 | **Seed data from reference HTML** | The 9 sample cards in `neural365apps_hub_landing.html` are used as seed rows for both landing page preview and the `/pulse` page until Hermes is running live. |
| D6 | **Naive MDX rendering (MVP)** | Guide `body_mdx` is rendered as pre-wrapped text with media markers replaced inline. Full MDX compilation (remark/rehype pipeline) deferred to post-v1 polish. |
| D7 | **Multimedia Delivery Strategy (Podcasts via Supabase, Shorts via YouTube)** | Podcasts (.mp3) are stored in Supabase Storage (`pulse-podcasts`) because NotebookLM does not provide embeddable public CDN links, and audio is lightweight (~5-10MB/ep with chapter scrubbing). Shorts (.mp4) are staged in Supabase Storage (`neural-shorts`) strictly for the admin preview queue, then published to YouTube Shorts (`short_video_url` stores the YouTube link) to eliminate video egress bandwidth costs and leverage YouTube discovery. |
| D8 | **Decoupled Video Worker via Supabase Partial Index** | Local laptop Antigravity CLI worker queries `status = 'media_pending' AND video_brief IS NOT NULL AND short_video_url IS NULL ORDER BY created_at ASC`. Protects against NAT/offline laptop states and avoids polling items awaiting podcasts only. |
| D9 | **Service-Role Ingestion Layer** | `/api/hermes/*` routes authenticate via `HERMES_INGEST_SECRET` and execute DB operations through `createAdminClient()` (`SUPABASE_SECRET_KEY`), safely bypassing RLS since external agents do not carry browser cookies. |
| D10 | **Migration 010: Two-Stage Shorts Delivery & Admin-Gated Podcasts** | Formalizes decisions 11-15: separates internal review short storage (`short_storage_url`) from public YouTube release (`short_video_url`). Admin text review gates NotebookLM audio generation via `podcast_candidate` and `podcast_approved`. Antigravity local worker (`worker/shorts/two-stage-worker.ts`) handles Stage 1 HyperFrames render + Storage upload and Stage 2 YouTube upload with `publish_last_error` tracking. |

---

## Items Flagged for Human Review

### 🔴 Must review before public launch

- **[PILLAR COPY]** All four pillar page intro paragraphs (hero h1 + lead text) were drafted by the agent. Review for accuracy, tone, and brand voice before going live. Flagged with `/* DECISIONS.md FLAG */` inline in each pillar page.

- **[LEGAL]** Footer disclaimer: "Independent community hub — not an official Microsoft product." Confirm trademark/branding framing with whoever owns legal risk before this is publicly indexed.

- **[STRIPE PRICING]** Stripe `PRICE_ID` placeholder in `lib/stripe/index.ts` — insert your actual Stripe Price ID before enabling checkout. Decide pricing tier structure (single vs. multiple tiers) based on hands-on lab testing.

- **[MEDIA]** *(Resolved)* Multimedia pipeline is wired end-to-end. Podcasts generated via NotebookLM on VPS (`pulse-podcasts` bucket), Neural Shorts rendered locally via Antigravity into `neural-shorts` for preview, then published to YouTube Shorts (`short_video_url`). Both media types gated by human admin review in `/admin/review` and `/admin/media`.

### 🟡 Review before enabling features

- **[MICROSOFT OAUTH]** Add `microsoft` as a Supabase OAuth provider in your project's Auth settings. Update `sign-in` and `sign-up` pages to include the OAuth button. No code changes needed beyond adding the button and enabling the provider.

- **[HERMES SOURCES]** `community-blogs.config.ts` pre-populated with 3 starter URLs. Add/remove trusted community sources before first cron run. Verify each source's robots.txt and ToS before adding.

- **[HERMES WATERMARK]** Current implementation uses a fixed 8-day lookback for weekly cron runs (`0 6 * * 1` Mondays at 06:00 UTC). For production, persist a per-source `last_run_at` watermark in a JSON file or Supabase table to avoid re-processing on every run.

- **[NEWSLETTER CONFIRMATION]** Subscribers are inserted with `confirmed: false`. Double-opt-in email flow not yet implemented. Add a confirmation email step before sending any bulk emails to subscribers.
