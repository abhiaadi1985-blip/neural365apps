# neural365 Community — domain decision & launch plan

**Status:** Domain decision locked: **Option B — `community.neural365ltd.com`**; execution underway.
**Prepared:** 2026-10-15 · **Origin repo:** `neural365ltd` (company site) · **Hub repo:** `C:\Users\USER\.gemini\antigravity\scratch\neural365` → `github.com/abhiaadi1985-blip/neural365apps`
**Purpose:** self-contained handoff. Copy this file into the hub repo; it records the architecture verdict, the domain pros/cons (SEO / marketing / credibility), what already exists, the pre-launch gaps, and the launch runbook.

---

## 0. Context & verdict

The neural365 Community is the firm's free research hub for Dynamics 365 & Power
Platform AI — long-form deep dives, the **Pulse** auto-refreshed news feed, Neural
Shorts (60-second video configs), and micro-podcasts. On the company site it is
product #1 (`docs/products-plan.md` §4) and the credibility asset behind the
"audit our thinking before you book a call" positioning.

**Verdict — separate app: yes, and this is already settled by reality.** The hub
is a full platform (Next.js 16, Supabase auth/DB/storage, Stripe, Hermes content
pipeline, HITL admin). None of that belongs inside the marketing site, and both
repos already declare "no code dependency — cross-links are plain links."

**Verdict — domain: Decided: Option B (`community.neural365ltd.com`).**

---

## 1. The domain decision — `neural365ltd.com` vs `community.neural365apps.com`

### What the 2025 SEO literature says

- **Subfolders inherit root-domain authority directly and rank faster**; subdomains
  can perform equally but take longer ([Backlinko, Jun 2025](https://backlinko.com/subdirectory-vs-subdomain)).
- **Subdomains are treated semi-independently** by Google — links to a subdomain
  don't fully benefit the root; case studies of moving `blog.site.com` →
  `site.com/blog` show traffic gains ([Backlinko](https://backlinko.com/subdirectory-vs-subdomain),
  [NameSilo](https://www.namesilo.com/blog/en/marketing-tips/how-subdomains-impact-site-authority-in-modern-seo)).
- **Subdomains are the pragmatic choice when the content runs on separate
  infrastructure/platforms** — different app, auth, and deploy pipeline
  ([Semrush](https://www.semrush.com/blog/should-i-use-a-subdomain-or-subfolder-for-international-seo)).
- **Equalizer:** both root domains are brand-new with near-zero authority today.
  Nothing is being "split" yet — but every backlink earned from launch onward
  (LinkedIn posts, newsletters, community threads) compounds wherever it lands,
  so the choice shapes how fast authority accumulates.

### The three concrete options

**Option A — `neural365ltd.com/community` (path on the company domain)**

- ✅ **SEO: best.** All backlinks compound on the single domain that also sells
  the services — the hub lifts the money pages, not just itself.
- ✅ **Credibility: strongest.** The firm's own domain in the address bar; the
  hub visibly belongs to neural365 Ltd; matches the positioning story exactly.
- ✅ **Marketing: cleanest.** One Search Console property, one GA4 property,
  every campaign URL reinforces one brand.
- ❌ **Ops: heaviest.** The hub is a separate Supabase-auth + Stripe app. Path
  hosting requires Next.js `basePath=/community`, Supabase redirect-URL
  rewrites, Stripe checkout/webhook URL changes, nginx path proxying, and
  careful cookie scoping — permanent coupling on every future upgrade.
- ❌ Deploy independence is lost: hub releases touch the company site's domain.

**Option B — `community.neural365ltd.com` (subdomain of the company domain)** — *recommended*

- ✅ **SEO: middle.** Semi-independent ranking like any subdomain, but the brand
  entity ("neural365 Ltd") is anchored to one root domain family; Search
  Console/Bing webmaster tools handle subdomains fine.
- ✅ **Credibility: strong.** Visitors see `…neural365ltd.com` — the hub reads
  as the firm's publication, not a third-party site.
- ✅ **Marketing: nearly as clean as A** (cross-domain GA4 config + one extra
  Search Console property — one-time setup).
- ✅ **Ops: cheap.** One Cloudflare DNS record in the existing `neural365ltd.com`
  zone + one nginx vhost + one certbot cert. Matches the deployment topology
  already planned (own container, shared VPS). Zero app code changes.
- ❌ Link equity consolidates a bit slower than the path option (A).

**Option C — `community.neural365apps.com` (current standing decision)**

- ✅ **Ops: cleanest** — it is the already-planned, already-documented setup
  (DNS record, vhost, cert workflow all written for this name).
- ✅ Brand headroom: the "neural365apps" family can carry future product sites
  without touching the company domain.
- ❌ **SEO: weakest.** The equity lands on a second root domain (`neural365apps.com`)
  that is itself new and whose apex serves a future *products portal* — the
  community's authority would pre-fund an unrelated domain.
- ❌ **Credibility: weakest.** A second brand domain adds a trust hop, and
  "apps" framing mismatches a research community (a community is not an app).
- ❌ **Marketing:** every mention has to explain the relationship; analytics and
  Search Console split across two domains.

### Scorecard

| Criterion                     | A — `/community` path | B — `community.neural365ltd.com` | C — `community.neural365apps.com` |
| ----------------------------- | --------------------- | -------------------------------- | --------------------------------- |
| SEO authority consolidation   | ★★★                   | ★★                               | ★                                 |
| Marketing / public reach      | ★★★                   | ★★★                              | ★★                                |
| Credibility ("who's behind")  | ★★★                   | ★★★                              | ★                                 |
| Ops cost (build + forever)    | ★ (heavy coupling)    | ★★★ (one DNS + vhost)            | ★★★ (already planned)             |
| Migration risk if switched    | n/a                   | Low **now**, high after launch   | Low **now**, high after launch    |

### Lock-in rule

Whichever wins must be fixed **before public launch** — canonicals, sitemap,
JSON-LD, OG tags, the company-site `communityUrl`, and every early backlink
follow it. Switching after launch means 301 churn and measurable equity loss.

### Recommendation

**Option B — `community.neural365ltd.com`.** It captures nearly all of the
path option's credibility and marketing value (one brand family, firm's domain
visible) while keeping the hub a fully independent deployment (subdomain ≈ the
separate-infrastructure case the SEO literature deems appropriate). Option C
remains viable if absolute ops minimalism is preferred; Option A only if SEO is
weighted above every other factor and the basePath coupling is acceptable.
Implementation delta for B vs C is one DNS record in a different Cloudflare
zone — everything else in this plan is identical.

---

## 2. Current state (what already exists)

- **Repo:** `C:\Users\USER\.gemini\antigravity\scratch\neural365` — remote
  `github.com/abhiaadi1985-blip/neural365apps`, branch `main`, 4 commits;
  **uncommitted WIP** in progress (blog/HITL: `app/admin/blog-review/`,
  `app/api/hermes/blog-ingest/`, `app/blog/[slug]/`, `007_blog_posts.sql`).
- **Stack:** Next.js 16.2.9 + React 19, `@supabase/ssr` + service-role client,
  Stripe, Tailwind v4 (`@theme` in `app/globals.css`), `react-markdown`.
  Node ≥ 22.19. Supabase email+password auth (MS OAuth scaffolded, disabled).
- **Public routes:** `/`, `/pulse` + `/pulse/[id]`, `/blog` + `/blog/[slug]`,
  `/guides/[slug]`, four pillar pages (`/d365-fo`, `/dataverse-power-platform`,
  `/copilot-ai-agents`, `/industry-solutions`), `/sign-in`, `/sign-up`, `/account`.
- **Admin (HITL):** `/admin`, `/admin/login`, `/admin/review` (pulse queue),
  `/admin/blog-review`, `/admin/media`, `/admin/blog-media`.
- **APIs:** `api/hermes/ingest`, `api/hermes/blog-ingest` (worker-only,
  `HERMES_INGEST_SECRET` bearer), `api/pulse`, `api/subscribe`,
  `api/checkout`, `api/stripe/webhook`, `api/auth/*`.
- **Data:** migrations `001–007` — `pulse_items`, `blog_posts`
  (slug, pillar, tags, `status: draft → media_pending → live`,
  `podcast_audio_url`), profiles/topics, subscribers + subscribe RPC, storage
  buckets.
- **Content engine:** Hermes worker (`worker/hermes/`) — weekly cron
  (`0 6 * * 1` Mondays at 06:00 UTC, pm2/systemd), 8-day lookback; sources: Microsoft Learn,
  release-wave roadmaps, preview blogs, trusted community blogs
  (`community-blogs.config.ts`); pipeline fetch → extract → dedupe (sha256 of
  title+domain) → rules-based lane/pillar classify → summarize → ingest.
  Lane colors: new `#34D8B0` / coming `#F2B544` / architecture `#9B8CFF`.
- **Media:** Hermes Agent connects directly to NotebookLM MCP for long-form podcasts (`pulse-podcasts`), and calls n8n workflows exclusively as its Video Factory for Neural Shorts (`neural-shorts`); `worker/media/generate-podcasts.ts` orchestrates items in `media_pending`; Supabase storage buckets (`005_storage_buckets.sql`).
- **SEO:** `app/sitemap.ts` (pillars + /pulse daily) and `public/robots.txt`
  (disallows `/admin/`, `/api/`, `/account/`) exist. **No RSS output feed.**
- **Deploy topology:** shared VPS (2 vCPU/8GB) running Docker network
  `shared.net` (hub container `neural365-community`, plus company site, Cal.com,
  n8n, Hermes/Open Notebook stack); nginx vhost per site; certs via certbot;
  DNS on Cloudflare. Hub deploy docs live in the hub repo (`docs/deploy.md`,
  `docs/spoke-environments.md`); its nginx vhost currently references the
  retired `neural365.org` name and needs re-issuing for the chosen domain.
- **Env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `STRIPE_PRICE_ID`, `HERMES_INGEST_SECRET`, `HERMES_BASE_URL`,
  `NEXT_PUBLIC_SITE_URL` (set to the chosen domain).

---

## 3. Design family spec (brand contract)

**Shared with the company site** (`lib/design-tokens.ts` in both repos):

| Token        | Value                   | Use                       |
| ------------ | ----------------------- | ------------------------- |
| `bg`         | `#060A12`               | page background           |
| `bg2`        | `#0B1220`               | secondary background      |
| `panel`      | `#0E1726`               | card background           |
| `line`       | `#1E293D`               | borders                   |
| `text`       | `#E7ECF5` / `#8C9AB3`   | primary / muted text      |
| `azure`      | `#2F86FF`               | primary accent            |
| `azure-deep` | `#0B63CE`               | button gradient bottom    |
| `azure-dim`  | `rgba(47,134,255,0.14)` | tints, badges             |

- Typography: Sora (headings), Inter (body), IBM Plex Mono (eyebrows/badges).
- Logo: the shared "N" globe/wing navy-to-teal mark at ~44–52px header height,
  with the hub's "COMMUNITY" suffix pill.
- Motion split (deliberate, per company spec §4): the **hub is the more animated
  sibling** — drifting animated gradient-mesh hero; the company site stays
  static-glow calm. Keep `prefers-reduced-motion` handling everywhere.
- Hub-only lane accents (use sparingly, never for brand elements): teal/amber/violet.
- Footer disclaimer (keep verbatim): *"Independent community hub — not an
  official Microsoft product. Pulse feed content is aggregated and summarised
  from public sources for educational purposes; always confirm against official
  Microsoft documentation before making implementation decisions."*
- Voice: stage-honest in both directions — the hub never implies the consultancy
  has capabilities it hasn't shown; the company site never claims hub content
  exists before it does.

---

## 4. Pre-launch gap list (from the 2026-10-15 survey)

1. **Sample content is rendering in prod paths.** Homepage Pulse cards and blog
   cards are hardcoded layout samples ("sample cards shown for layout — live
   cards populate automatically…"). Never launch with samples: connect the
   pipeline, run HITL, and gate each section to render only real rows (empty
   states otherwise).
2. **Uncommitted WIP in the hub repo** — blog-review UI, blog-ingest API,
   `007_blog_posts.sql`, `/blog` pages. Commit and push to `origin/main`.
3. **No RSS output.** Add `/feed.xml` (live posts; optionally per-lane Pulse
   feeds). RSS is the cheapest distribution channel for a research hub.
4. **Stripe is wired but unconfigured** (no keys in `.env.local`). Decide:
   launch free with checkout parked, or configure the single tier
   (`STRIPE_PRICE_ID`) before launch.
5. **Newsletter delivery** behind the `subscribe` RPC is unspecified — pick a
   sender (e.g. SMTP via Zoho, or Resend) + double opt-in + unsubscribe path.
6. **AI chat assistant** (chosen MVP feature) — not yet built on the hub; spec
   in §5.
7. **SEO extras:** dynamic per-post OG images, site/org JSON-LD, canonicals to
   the chosen domain. (Sitemap + robots already exist.)
8. **Repo hygiene:** the repo lives under `C:\Users\USER\.gemini\antigravity\scratch\`
   — a tool-managed scratch dir at risk of cleanup. Relocate to
   `C:\Users\USER\source\repos\neural365apps`. Consider moving the GitHub remote
   under the `abhi-neural365` account for consistency with `company_site`.
9. **Next.js 16 caveats:** the repo's `AGENTS.md`/`CLAUDE.md` warn that this is
   not the Next.js you know (16.x breaking changes) — keep those bundled docs in
   context for any agent-assisted hub work.

---

## 5. AI chat assistant spec (hub MVP feature)

- **Goal:** reader-facing Q&A over the hub's published research ("ask the
  research"), reinforcing the audit-our-thinking positioning.
- **Reuse the company site's proven pattern:** Azure OpenAI on the **v1 API
  surface** with **Entra ID service-principal auth** (cached bearer tokens, no
  API keys — see company `DECISIONS.md` §14 and `lib/ai/azure-client.ts`).
  Same subscription/resource family; separate deployment is optional.
- **Hub-specific difference — dynamic knowledge base:** the company site builds
  its RAG index at build time; the hub's content lives in Supabase and changes
  via the pipeline. Build the embedding index from `blog_posts`
  (`status = 'live'`) + approved `pulse_items`, and **rebuild on publish**
  (worker step or Supabase edge function after HITL approval) — never at page
  build time.
- **Guardrails:** never cite drafts or `media_pending` items; keep the
  independent-community + "confirm against official Microsoft docs" framing;
  same no-transcript-retention disclosure as the company chat footer.
- **Access:** public (no sign-in) with rate limiting; signed-in users can get a
  higher quota later.

---

## 6. Integration contract with the company site (`neural365ltd` repo)

At hub launch (and only then):

1. Set `siteConfig.communityUrl` to the chosen domain (§1) in `lib/site.ts`.
2. Flip `communityComingSoon: false`.
3. Re-add the hidden links (all commented "returns at launch" in source):
   header nav item + footer crossLink (`lib/content.ts`), hero credibility card
   (`hero.credibility` + `components/hero/hero.tsx`), homepage ProofBand
   (`app/page.tsx`), JSON-LD `sameAs` (`lib/seo.ts`). Full checklist:
   `docs/products-plan.md` §5.
4. Update `knowledge/firm-overview.md` community entry from "launching soon" to
   the live description; run `npm run build-knowledge`.
5. Rules: plain `<a>` links only — no code dependency between repos; each site
   stays stage-honest about the other; the hub must have real approved content
   before the company site relinks.

---

## 7. Hub launch runbook

1. **Lock the domain (§1).** Set `NEXT_PUBLIC_SITE_URL`; update sitemap/canonical/OG base.
2. **Supabase prod project:** run migrations `001–007`; create storage buckets;
   capture service-role key.
3. **Env wiring on the VPS** (container env, not build args — same hygiene as
   the company site): all vars from §2.
4. **Container:** build + run `neural365-community` on Docker network `shared.net`.
5. **DNS + TLS:** Cloudflare record for the chosen domain → VPS IP; re-issue the
   nginx vhost (currently named for retired `neural365.org`) + certbot cert.
6. **Hermes:** pm2/systemd cron on the VPS; set `HERMES_BASE_URL` +
   `HERMES_INGEST_SECRET`; first run; review via `/admin/review` + `/admin/blog-review`.
7. **Seed the launch catalogue:** HITL-approve an initial set (target: ~5 live
   deep dives + ~10–15 approved pulse items) before public announcement; run
   the media worker for launch-post podcasts.
8. **QA pass:** sitemap/robots/RSS/OG, newsletter end-to-end (double opt-in),
   sign-in + admin auth, Stripe (if enabled), mobile layout, `prefers-reduced-motion`.
9. **Company-site relink** per §6 + DECISIONS entry.

## 8. Post-launch ops

- **HITL rhythm:** a short daily review pass — approve/edit/reject pipeline
  drafts; the queue is the quality bar, keep it honest.
- **Sources tuning:** adjust `community-blogs.config.ts` as signal quality
  becomes clear; dedupe hash does the rest.
- **Analytics:** GA4 (or Plausible) + Search Console property for the chosen
  domain; submit the sitemap; watch Pulse/blog indexing weekly for the first
  month.
- **Cadence target:** ~1 deep dive/week + automatic weekly Pulse refresh (Mondays) +
  monthly "what changed and what to do" digest per pillar.
- Defer personalization/paywalls/MS-OAuth until traction data says otherwise.
