-- neural365apps — Supabase Postgres schema
-- Run this in the Supabase SQL editor or as a migration

-- ─── Pulse feed items (written by Hermes worker) ───────────────────────────
create table if not exists pulse_items (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  summary      text not null,           -- agent-written, deduplicated, ≤240 chars
  lane         text not null check (lane in ('new', 'coming', 'architecture')),
  pillar       text not null check (pillar in (
    'd365-fo', 'dataverse-power-platform', 'copilot-ai-agents', 'industry-solutions'
  )),
  source_name  text not null,           -- e.g. "Microsoft Learn", "Release Wave 2026"
  source_url   text not null,
  published_at timestamptz not null,
  ingested_at  timestamptz not null default now(),
  dedupe_hash  text not null unique     -- hash(normalised title + source domain)
);

-- Public read — anyone can read pulse items
alter table pulse_items enable row level security;
create policy "pulse_items: public read"
  on pulse_items for select using (true);

-- ─── Guides (written content + media references) ───────────────────────────
create table if not exists guides (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  pillar            text not null check (pillar in (
    'd365-fo', 'dataverse-power-platform', 'copilot-ai-agents', 'industry-solutions'
  )),
  body_mdx          text not null,
  is_premium        boolean not null default false,
  short_video_url   text,
  podcast_audio_url text,
  published_at      timestamptz,
  updated_at        timestamptz not null default now()
);

-- Public guides (is_premium = false) readable by anyone.
-- Premium body_mdx MUST only be returned server-side after auth check — never client-exposed.
alter table guides enable row level security;
create policy "guides: public read non-premium"
  on guides for select using (is_premium = false or (select auth.uid()) is not null);

-- ─── Newsletter subscribers ────────────────────────────────────────────────
create table if not exists subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  subscribed_at timestamptz not null default now(),
  confirmed     boolean not null default false
);

alter table subscribers enable row level security;
-- Only service role can read/write subscribers
create policy "subscribers: service role only"
  on subscribers for all using ((select auth.role()) = 'service_role');

-- ─── Subscriptions (mirrors Stripe) ───────────────────────────────────────
create table if not exists subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id),
  stripe_customer_id       text not null,
  stripe_subscription_id   text not null unique,
  status                   text not null,   -- active, past_due, canceled, trialing, etc.
  current_period_end       timestamptz not null
);

alter table subscriptions enable row level security;
create policy "subscriptions: owner read"
  on subscriptions for select using (user_id = (select auth.uid()));
create policy "subscriptions: service role all"
  on subscriptions for all using ((select auth.role()) = 'service_role');

-- ─── Seed guide (validates guide template end-to-end) ─────────────────────
insert into guides (slug, title, pillar, body_mdx, is_premium, short_video_url, podcast_audio_url, published_at)
values (
  'copilot-studio-dataverse',
  'Set up a Copilot Studio agent in Dataverse',
  'copilot-ai-agents',
  '# Set up a Copilot Studio agent in Dataverse

This guide walks you through configuring a Copilot Studio agent grounded on a Dataverse table — no custom plug-in required since generative answers are now GA.

## Prerequisites

- A Power Platform environment with a Dataverse database
- Copilot Studio licence
- A Dataverse table containing the data you want the agent to answer questions about

## Step 1: Create your Copilot

Navigate to **make.powerplatform.com** → Copilot Studio → Create.

> **Neural Short** *(embedded below)* — watch a 58-second walkthrough of this step before proceeding.

<!-- NEURAL_SHORT: /shorts/placeholder.mp4 -->

## Step 2: Add a Dataverse knowledge source

In the **Knowledge** tab, choose **Dataverse** from the Add Knowledge menu. Select your table and the columns you want included in the grounding context.

## Step 3: Publish and test

Click **Publish** and use the test chat panel to ask questions that should be answered from your table data. Verify the agent cites rows correctly and does not hallucinate data outside the table.

> **Micro-podcast** *(embedded below)* — strategic context: why grounded Copilot agents need explicit column selection to avoid over-exposure of sensitive fields.

<!-- MICRO_PODCAST: /podcasts/placeholder.mp3 -->

## Troubleshooting

| Symptom | Likely cause |
|---------|-------------|
| Agent says "I don''t know" | Column not included in knowledge source |
| Slow response | Table has no indexed columns on the filter field |
| Wrong data returned | Multiple tables with similar names — verify environment |
',
  false,
  null,
  null,
  now()
)
on conflict (slug) do nothing;
