# neural365 COMMUNITY — Hermes Advanced Integration & Docker Deployment Guide

> This guide covers the **Hermes Agent-orchestrated content & multimedia pipeline**
> (Pulse items, Blog posts, Neural Shorts, and Podcasts), **direct NotebookLM MCP integration for long-form podcasts**, the **n8n Video Factory for Neural Shorts**, **Docker-based deployment architecture**, and the **API contracts**. For bare-metal VPS deployment with pm2/systemd, see [`deploy.md`](./deploy.md).

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Hermes Agent Orchestration Model](#2-hermes-agent-orchestration-model)
3. [Multimedia Ingestion: Shorts & Podcasts](#3-multimedia-ingestion-shorts--podcasts)
4. [Content Sources](#4-content-sources)
5. [Classification Engine](#5-classification-engine)
6. [Database Schema](#6-database-schema)
7. [API Contract — Pulse Ingest](#7-api-contract--pulse-ingest)
8. [API Contract — Blog Ingest](#8-api-contract--blog-ingest)
9. [API Contract — Multimedia Ingest](#9-api-contract--multimedia-ingest)
10. [NotebookLM MCP Integration (Long-Form Podcasts)](#10-notebooklm-mcp-integration-long-form-podcasts)
11. [n8n Video Factory Pipeline (Neural Shorts)](#11-n8n-video-factory-pipeline-neural-shorts)
12. [Admin Editorial Pipeline](#12-admin-editorial-pipeline)
13. [Docker Deployment Architecture](#13-docker-deployment-architecture)
14. [Environment Variables](#14-environment-variables)
15. [Troubleshooting & Verification](#15-troubleshooting--verification)

---

## 1. Architecture Overview

The neural365 COMMUNITY platform operates a **Hermes Agent-centric orchestration architecture**. Hermes serves as the single brain: it ingests technical signals, classifies and summarizes content, directly invokes the **NotebookLM MCP** for long-form conversational podcasts, and dispatches rendering jobs to a dedicated **n8n Video Factory** for vertical Neural Shorts:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              HERMES AGENT (CENTRAL ORCHESTRATOR)                       │
│                                                                                        │
│   Weekly Content Ingestion                Direct MCP Integration     Video Factory Dispatch
│   - Microsoft Learn & Release Waves      ┌──────────────────────┐   ┌────────────────────────┐
│   - Preview & Tech Community Blogs       │    NotebookLM MCP    │   │      n8n Workflows     │
│   - Curated Expert RSS Feeds             │ (Direct Hermes Tool) │   │ (Called by Hermes ONLY)│
│               │                          └──────────┬───────────┘   └───────────┬────────────┘
│               ▼                                     ▼                           ▼
│   Text Dedupe, Classification               Long-Form Podcasts            Neural Shorts
│   & Ingestion Generation                 (Audio Overviews / MP3)    (9:16 Vertical Video / MP4)
└───────────────┬─────────────────────────────────────┼───────────────────────────┼──────────────┘
                │                                     │                           │
                │         AUTHENTICATED HTTP INGESTION LAYER                      │
                │          (Bearer: HERMES_INGEST_SECRET)                         │
                ▼                                     ▼                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                NEXT.JS APPLICATION CORE                                │
│                                                                                        │
│   POST /api/hermes/ingest       POST /api/hermes/blog-ingest   POST /api/hermes/media-ingest
│   (short-form pulse feed)       (long-form deep dive blogs)    (attach podcasts & shorts)
│               │                             │                             │            │
│               ▼                             ▼                             ▼            │
│     ┌──────────────────┐          ┌───────────────────┐         ┌───────────────────┐  │
│     │   pulse_items    │          │    blog_posts     │         │   Storage Buckets │  │
│     │ status: draft    │          │  status: draft    │         │  - pulse-podcasts │  │
│     │  media_pending   │          │   media_pending   │         │  - neural-shorts  │  │
│     │  live            │          │   live            │         │  - blog-assets    │  │
│     └─────────┬────────┘          └─────────┬─────────┘         └───────────────────┘  │
│               │                             │                                          │
│               ▼                             ▼                                          │
│    /admin/review & /media       /admin/blog-review & /blog-media                       │
│    (pulse editorial queue)      (blog editorial queue)                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

| Service | Role | Runtime / Schedule |
|---------|------|--------------------|
| **Next.js Web** | Public portal, admin dashboard, ingest API endpoints | Always-on (Port 3000) |
| **Hermes Agent** | Central orchestrator: scrapes feeds, dedupes, directly interfaces with **NotebookLM MCP** for audio, and calls **n8n** for video | Cron: weekly on Mondays at 06:00 UTC |
| **NotebookLM MCP Server** | Model Context Protocol server exposing NotebookLM capabilities directly to Hermes Agent for long-form podcast generation | Local process / Container (stdio or SSE) |
| **n8n Video Factory** | Specialized video rendering pipeline **called by Hermes Agent only** to generate 9:16 vertical Neural Shorts | Internal service (Webhook triggered) |
| **Media Worker** | Batch runner executing NotebookLM MCP + n8n dispatch loop for approved items awaiting media (`media_pending`) | Cron / On-demand |

---

## 2. Hermes Agent Orchestration Model

In this architecture, responsibilities are strictly demarcated:

1. **Hermes Agent is the Exclusive Orchestrator:**
   - It scrapes upstream documentation, release waves, and community blogs.
   - It deduplicates entries (`sha256(normalized_title + domain)`).
   - It generates concise summaries and comprehensive markdown deep dives.
   - It decides which items require long-form audio discussions and vertical demo shorts.

2. **Podcasts via Direct NotebookLM MCP:**
   - Hermes interfaces **directly** with the **NotebookLM MCP** server via Model Context Protocol.
   - Hermes feeds the source markdown guide or release specification into a dedicated notebook.
   - It requests an Audio Overview / 2-host conversational podcast debate.
   - Once generated, Hermes uploads the `.mp3` file to Supabase Storage (`pulse-podcasts` bucket) and assigns `podcast_audio_url`.

3. **Neural Shorts via n8n Video Factory:**
   - n8n is **not** an independent scraper or ingestion engine. It is Hermes Agent's dedicated **Video Factory**.
   - Hermes generates a structured video brief (title, 3-point narration script, code/config snippet, visual cues).
   - Hermes calls the n8n webhook (`POST https://n8n.internal/webhook/video-factory`) with the payload.
   - n8n orchestrates scene composition (motion graphics, Remotion / FFmpeg, subtitle burning, voiceover timing) and exports 9:16 vertical MP4s.
   - n8n uploads the output to Supabase Storage (`neural-shorts` bucket) and updates the record via `/api/hermes/media-ingest`.

---

## 3. Multimedia Ingestion: Shorts & Podcasts

Content flows through the system in two primary patterns:

### Pattern 1: Asynchronous Two-Phase Pipeline (Recommended)
This pattern separates text editorial approval from compute-intensive media rendering:

1. **Phase 1 (Text Ingestion):** Hermes scrapes, summarizes, and inserts the item into `/api/hermes/ingest` or `/api/hermes/blog-ingest` with `status: 'draft'`.
2. **Phase 2 (Human Text Gate):** Community editors review and polish the text in `/admin/review` (Pulse) or `/admin/blog-review` (Blog). Approving text advances status to `media_pending`.
3. **Phase 3 (Hermes Multimedia Execution):**
   - **Podcasts:** Hermes Agent uses **NotebookLM MCP** directly to generate the long-form audio debate and uploads `.mp3` to `pulse-podcasts`.
   - **Neural Shorts:** Hermes Agent dispatches the script to the **n8n Video Factory** webhook, which renders the vertical `.mp4` and uploads to `neural-shorts`.
   - Either Hermes or n8n calls `POST /api/hermes/media-ingest` to attach both CDN links.
4. **Phase 4 (Human Media Gate):** Editors review audio playback and video preview in `/admin/media` or `/admin/blog-media`. Approval transitions status to `live`.

### Pattern 2: Bundled Ingestion (Direct Pre-Render)
When Hermes runs a batch with pre-rendered assets:
- Supply `podcast_audio_url` and `short_video_url` directly in the payload to:
  - `POST /api/hermes/ingest` (Pulse)
  - `POST /api/hermes/blog-ingest` (Blog)
- Both text and media enter the editorial review queues simultaneously.

---

## 4. Content Sources

### Pulse Sources (Scraped by Hermes)
Configured in `worker/hermes/sources/`:
- **Microsoft Learn:** Release documentation & roadmap updates.
- **Microsoft Release Wave:** Major seasonal feature releases (Wave 1 & Wave 2).
- **Preview Blogs:** Tech preview articles and early announcements.
- **Community Blogs:** Curated expert feeds in `community-blogs.config.ts`.

### Multimedia Generators
- **NotebookLM MCP (Direct):** Direct agent-to-tool MCP connection used by Hermes to synthesize two-host conversational audio deep dives.
- **n8n Video Factory (Sub-service):** Private automation workflow called exclusively by Hermes Agent to produce vertical Neural Shorts.

---

## 5. Classification Engine

The rules-based classification engine maps incoming text to lanes and pillars:

### Lanes (Pulse)
- `new`: GA, launched, released, now available.
- `coming`: Preview, roadmap, coming soon, wave 1/2.
- `architecture`: Deprecations, migrations, breaking changes, quotas, connectors.

### Pillars (Pulse & Blog)
- `copilot-ai-agents`: Copilot Studio, AI Agents, Autonomous Agents, AI Builder.
- `d365-fo`: Finance & Operations, Supply Chain, ERP, AX.
- `dataverse-power-platform`: Dataverse, Power Apps, Power Automate, Power Pages.
- `industry-solutions`: Healthcare, Retail, Financial Services, Manufacturing Cloud.

---

## 6. Database Schema

### `pulse_items` Table
```sql
create table pulse_items (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  summary           text not null,
  lane              text not null check (lane in ('new', 'coming', 'architecture')),
  pillar            text not null check (pillar in ('d365-fo', 'dataverse-power-platform', 'copilot-ai-agents', 'industry-solutions')),
  source_name       text not null,
  source_url        text not null,
  published_at      timestamptz not null,
  dedupe_hash       text unique not null,
  content_md        text,
  demo_scenario_md  text,
  status            text not null default 'draft' check (status in ('draft', 'media_pending', 'live')),
  podcast_audio_url text,    -- Public CDN link to .mp3 (generated via NotebookLM MCP)
  short_video_url   text,    -- Public CDN link to .mp4 (rendered via n8n Video Factory)
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
```

### `blog_posts` Table (Migration 007)
```sql
create table blog_posts (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  subtitle          text,
  summary           text not null,
  body_md           text not null,
  pillar            text not null check (pillar in ('d365-fo', 'dataverse-power-platform', 'copilot-ai-agents', 'industry-solutions')),
  tags              text[] not null default '{}',
  author_name       text not null default 'neural365',
  hero_image_url    text,
  estimated_read_min int,
  featured          boolean not null default false,
  status            text not null default 'draft' check (status in ('draft', 'media_pending', 'live')),
  podcast_audio_url text,    -- Public CDN link to article .mp3 (NotebookLM MCP)
  short_video_url   text,    -- Public CDN link to demo .mp4 (n8n Video Factory)
  source_url        text,
  source_name       text,
  dedupe_hash       text unique,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
```

### Storage Buckets (Migration 005)
- `pulse-podcasts` (50MB limit): Stores `.mp3` podcasts generated by Hermes via NotebookLM MCP.
- `neural-shorts` (100MB limit): Stores `.mp4` video demos generated by the n8n Video Factory.
- `blog-assets` (10MB limit): Stores cover images and diagrams.
- `site-videos` (500MB limit): Stores extended walkthroughs.

---

## 7. API Contract — Pulse Ingest

### `POST /api/hermes/ingest`

**Headers:**
```http
Authorization: Bearer <HERMES_INGEST_SECRET>
Content-Type: application/json
```

**Payload:**
```json
{
  "items": [
    {
      "title": "Autonomous Copilot Agents GA in D365",
      "summary": "Microsoft announces GA of autonomous agent capabilities...",
      "lane": "new",
      "pillar": "copilot-ai-agents",
      "source_name": "Microsoft Learn",
      "source_url": "https://learn.microsoft.com/en-us/...",
      "published_at": "2026-10-15T00:00:00.000Z",
      "dedupe_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "podcast_audio_url": "https://<supabase-url>/storage/v1/object/public/pulse-podcasts/copilot-ai-agents/2026-10/copilot-ga.mp3",
      "short_video_url": "https://<supabase-url>/storage/v1/object/public/neural-shorts/copilot-ai-agents/2026-10/copilot-ga.mp4",
      "status": "draft"
    }
  ]
}
```

---

## 8. API Contract — Blog Ingest

### `POST /api/hermes/blog-ingest`

**Headers:**
```http
Authorization: Bearer <HERMES_INGEST_SECRET>
Content-Type: application/json
```

**Payload:**
```json
{
  "items": [
    {
      "slug": "enterprise-copilot-studio-agents-architecture",
      "title": "Building Enterprise-Grade Copilot Studio Agents",
      "subtitle": "Architecture, governance, and real-world deployment patterns",
      "summary": "A deep architectural guide to deploying autonomous agents in Dataverse...",
      "body_md": "# Architecture Overview\n\nWhen deploying Copilot Studio...",
      "pillar": "copilot-ai-agents",
      "tags": ["copilot-studio", "architecture", "ai-agents"],
      "author_name": "neural365",
      "hero_image_url": "https://<supabase-url>/storage/v1/object/public/blog-assets/hero.webp",
      "estimated_read_min": 8,
      "featured": true,
      "podcast_audio_url": "https://<supabase-url>/storage/v1/object/public/pulse-podcasts/blog-audio.mp3",
      "short_video_url": "https://<supabase-url>/storage/v1/object/public/neural-shorts/blog-walkthrough.mp4",
      "dedupe_hash": "c4ca4238a0b923820dcc509a6f75849b",
      "status": "draft"
    }
  ]
}
```

---

## 9. API Contract — Multimedia Ingest

### `POST /api/hermes/media-ingest`

Used by Hermes or the n8n Video Factory to attach generated media URLs to existing records.

**Headers:**
```http
Authorization: Bearer <HERMES_INGEST_SECRET>
Content-Type: application/json
```

**Payload:**
```json
{
  "updates": [
    {
      "target": "pulse",
      "identifier": {
        "dedupe_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      },
      "podcast_audio_url": "https://<supabase-url>/storage/v1/object/public/pulse-podcasts/copilot-ai-agents/2026-10/copilot-ga.mp3",
      "short_video_url": "https://<supabase-url>/storage/v1/object/public/neural-shorts/copilot-ai-agents/2026-10/copilot-ga.mp4",
      "status": "media_pending"
    },
    {
      "target": "blog",
      "identifier": {
        "slug": "enterprise-copilot-studio-agents-architecture"
      },
      "podcast_audio_url": "https://<supabase-url>/storage/v1/object/public/pulse-podcasts/copilot-ai-agents/2026-10/blog-audio.mp3",
      "short_video_url": "https://<supabase-url>/storage/v1/object/public/neural-shorts/copilot-ai-agents/2026-10/blog-walkthrough.mp4"
    }
  ]
}
```

**Response (200):**
```json
{
  "updated": 2,
  "received": 2
}
```

---

## 10. NotebookLM MCP Integration (Long-Form Podcasts)

Hermes Agent connects directly to the **NotebookLM MCP Server** to generate high-fidelity, two-host conversational podcasts ("Audio Overviews") from technical documentation and blog guides.

### How Hermes Interacts with NotebookLM MCP

```
┌─────────────────┐       MCP Tool Call: notebook_create / add_source        ┌──────────────────────┐
│                 ├─────────────────────────────────────────────────────────►│                      │
│                 │       Payload: Title + Markdown Guide / Spec             │                      │
│  Hermes Agent   │                                                          │    NotebookLM MCP    │
│  Orchestrator   │◄─────────────────────────────────────────────────────────┤        Server        │
│                 │       MCP Response: { notebook_id: "nb_12345" }          │                      │
│                 │                                                          │                      │
│                 │       MCP Tool Call: generate_audio_overview             │                      │
│                 ├─────────────────────────────────────────────────────────►│                      │
│                 │       Options: format: "deep_dive", focus: "practical"   │                      │
│                 │                                                          │                      │
│                 │◄─────────────────────────────────────────────────────────┤                      │
│                 │       Returns audio binary / download stream (.mp3)      └──────────────────────┘
└────────┬────────┘
         │
         │ Upload to Supabase Storage: 'pulse-podcasts'
         ▼
┌─────────────────┐
│ Supabase Bucket ├──► Sets podcast_audio_url in pulse_items / blog_posts
└─────────────────┘
```

### Typical MCP Execution Flow in Hermes

1. **Notebook Initialization:** Hermes calls MCP tool `create_notebook` with the article title.
2. **Source Attachment:** Hermes passes the full technical text (`body_md` or `summary` + `content_md`) via `add_text_source`.
3. **Trigger Audio Generation:** Hermes calls `generate_audio_overview(notebook_id, { style: "deep-dive-discussion" })`.
4. **Fetch & Upload:** Once the audio overview generation completes, Hermes streams the `.mp3` bytes directly to Supabase Storage:
   ```ts
   const audioPath = `${pillar}/${yearMonth}/${slug}_podcast.mp3`
   await supabase.storage.from('pulse-podcasts').upload(audioPath, audioBuffer, {
     contentType: 'audio/mpeg',
     upsert: true,
   })
   ```
5. **Metadata Update:** Hermes records the resulting public CDN link in `podcast_audio_url`.

---

## 11. n8n Video Factory Pipeline (Neural Shorts)

n8n is invoked **strictly by Hermes Agent** to serve as the platform's automated **Video Factory**. It does not perform upstream scraping; rather, it receives structured video scripts and renders 9:16 vertical video shorts (60-second configurations and architectural highlights).

### Hermes-to-n8n Communication Flow

```
┌──────────────────────┐   POST /webhook/neural-shorts-factory   ┌───────────────────────────┐
│     Hermes Agent     ├────────────────────────────────────────►│     n8n Video Factory     │
│ (Generates script,   │   Headers: X-Hermes-Secret: <secret>    │                           │
│  code, visual cues)  │                                         │ 1. Validate Brief         │
└──────────────────────┘                                         │ 2. Synthesize Voiceover   │
                                                                 │ 3. Compose Scene Graph    │
                                                                 │ 4. FFmpeg/Remotion Render │
                                                                 │ 5. Upload .mp4 to Storage │
                                                                 └─────────────┬─────────────┘
                                                                               │
                               POST /api/hermes/media-ingest                   │
                         (short_video_url = CDN link)                          │
┌──────────────────────┐◄──────────────────────────────────────────────────────┘
│ Next.js Ingest API   │
└──────────────────────┘
```

### Hermes &rarr; n8n Webhook Payload Schema

Hermes dispatches a request to `N8N_SHORTS_WEBHOOK_URL`:

```json
{
  "job_id": "job_short_98765",
  "target": "pulse",
  "identifier": {
    "dedupe_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  "metadata": {
    "title": "Set Up Copilot Autonomous Reconciliation in D365",
    "pillar": "d365-fo",
    "lane": "new",
    "aspect_ratio": "9:16",
    "target_duration_sec": 58
  },
  "storyboard": {
    "hook": "Stop manual journal reconciliation in Dynamics 365 Finance.",
    "steps": [
      {
        "title": "1. Enable Agent Feature Flight",
        "action_text": "Feature Management > Copilot General Ledger Reconciliation",
        "code_snippet": "Flighting::enable('LedgerCopilotReconciliationAgent');"
      },
      {
        "title": "2. Configure Variance Tolerance",
        "action_text": "Set auto-matching confidence threshold to >= 95%."
      },
      {
        "title": "3. Human-in-the-Loop Sign-off",
        "action_text": "Agent flags edge cases into the Review Queue before posting."
      }
    ],
    "call_to_action": "Read full configuration guide on community.neural365ltd.com"
  },
  "callback_url": "https://community.neural365ltd.com/api/hermes/media-ingest"
}
```

### What n8n Executes

1. **Scene Composition:** Assembles dark-mode branded canvas (1080×1920) with azure glowing accents and IBM Plex Mono code callouts.
2. **Audio Narration:** Generates voiceover via ElevenLabs / Edge-TTS synchronized to visual beats.
3. **Motion Rendering:** Compiles frames using Remotion or FFmpeg template.
4. **Storage Upload:** Uploads rendered MP4 into Supabase Storage `neural-shorts` bucket.
5. **Callback:** Sends `POST /api/hermes/media-ingest` with `short_video_url` referencing the item.

---

## 12. Admin Editorial Pipeline

Both content types pass through human-in-the-loop (HITL) quality gates before public visibility:

```
[Hermes Scrapes Sources]
          │
          ▼
    status: draft
          │
          ▼
 ┌─────────────────┐
 │ /admin/review   │ ──► Editor approves / edits text
 └────────┬────────┘
          │
          ▼
 status: media_pending
          │
          ├──► Hermes directly calls NotebookLM MCP ──► Generates & uploads Podcast (.mp3)
          │
          └──► Hermes dispatches job to n8n        ──► Renders & uploads Neural Short (.mp4)
          │
          ▼
 ┌─────────────────┐
 │ /admin/media    │ ──► Editor previews podcast audio & video short
 └────────┬────────┘
          │
          ▼
    status: live   ──► Visible on public Pulse / Blog feeds
```

| Stage | Pulse Route | Blog Route | Trigger / Next State |
|-------|-------------|------------|----------------------|
| **1. Text Review** | `/admin/review` | `/admin/blog-review` | Approving text moves item from `draft` &rarr; `media_pending`. |
| **2. Media Generation** | Hermes Agent | Hermes Agent | Direct NotebookLM MCP (podcasts) + n8n webhook (shorts). |
| **3. Media Review** | `/admin/media` | `/admin/blog-media` | Audio/video preview + approve moves item to `live`. |

---

## 13. Docker Deployment Architecture

### Docker Compose Service Layout

The production deployment runs on the host VPS using Docker Compose. The n8n Video Factory and Hermes Worker share the internal network:

```yaml
# docker-compose.yml
services:
  web:
    build: .
    container_name: neural365-web
    ports:
      - "3000:3000"
    env_file: .env.local
    command: npm start
    restart: unless-stopped
    networks:
      - shared_net

  hermes-agent:
    build: .
    container_name: neural365-hermes-agent
    env_file: .env.local
    command: npx ts-node worker/hermes/run.ts
    restart: "no"
    depends_on:
      - web
      - notebooklm-mcp
    networks:
      - shared_net

  notebooklm-mcp:
    image: node:20-alpine
    container_name: neural365-notebooklm-mcp
    working_dir: /app
    volumes:
      - ./mcp/notebooklm:/app
    environment:
      - NOTEBOOKLM_API_KEY=${NOTEBOOKLM_API_KEY}
    command: npm start
    restart: unless-stopped
    networks:
      - shared_net

  n8n-video-factory:
    image: n8nio/n8n:latest
    container_name: neural365-n8n-factory
    environment:
      - N8N_HOST=n8n.internal
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://n8n-video-factory:5678/
      - HERMES_INGEST_SECRET=${HERMES_INGEST_SECRET}
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped
    networks:
      - shared_net

  nginx:
    image: nginx:alpine
    container_name: neural365-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - web
    restart: unless-stopped
    networks:
      - shared_net

networks:
  shared_net:
    external: true

volumes:
  n8n_data:
```

---

## 14. Environment Variables

Configure these keys in `.env.local`:

### Core Application & Database
| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Web + Hermes | Supabase project endpoint |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Web | Client-safe publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Web + Hermes | Privileged DB and Storage access |
| `NEXT_PUBLIC_SITE_URL` | Web | Canonical site domain (`https://community.neural365ltd.com`) |

### Ingestion & Inter-Service Security
| Variable | Scope | Purpose |
|----------|-------|---------|
| `HERMES_INGEST_SECRET` | Web + Hermes + n8n | Shared secret for all `/api/hermes/*` endpoints |
| `HERMES_BASE_URL` | Hermes + n8n | Base URL of Next.js web application |

### Multimedia & MCP Services
| Variable | Scope | Purpose |
|----------|-------|---------|
| `NOTEBOOKLM_MCP_SERVER_URL` | Hermes Agent | Connection endpoint for NotebookLM MCP server |
| `NOTEBOOKLM_API_KEY` | NotebookLM MCP | Authentication key for NotebookLM |
| `N8N_SHORTS_WEBHOOK_URL` | Hermes Agent | Private webhook URL for n8n Video Factory |
| `N8N_WEBHOOK_SECRET` | Hermes + n8n | Shared secret validating calls from Hermes only |

---

## 15. Troubleshooting & Verification

### 1. Test Pulse Ingestion
```bash
curl -X POST http://localhost:3000/api/hermes/ingest \
  -H "Authorization: Bearer YOUR_HERMES_INGEST_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "title": "Copilot Studio Autonomous Routing",
      "summary": "Microsoft releases multi-agent orchestration pattern.",
      "lane": "new",
      "pillar": "copilot-ai-agents",
      "source_name": "Microsoft Learn",
      "source_url": "https://learn.microsoft.com/en-us/...",
      "published_at": "2026-10-15T00:00:00Z",
      "dedupe_hash": "test-pulse-copilot-01"
    }]
  }'
```

### 2. Verify NotebookLM MCP Connection
```bash
# Verify Hermes Agent can communicate with NotebookLM MCP server
npx ts-node worker/media/test-notebooklm-mcp.ts
```

### 3. Test n8n Video Factory Webhook Dispatch
```bash
curl -X POST http://localhost:5678/webhook/neural-shorts-factory \
  -H "X-Hermes-Secret: YOUR_N8N_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test_short_01",
    "target": "pulse",
    "identifier": { "dedupe_hash": "test-pulse-copilot-01" },
    "metadata": { "title": "Test Short", "pillar": "copilot-ai-agents" },
    "storyboard": { "hook": "Test hook", "steps": [] }
  }'
```

### 4. Test Media Attachment API
```bash
curl -X POST http://localhost:3000/api/hermes/media-ingest \
  -H "Authorization: Bearer YOUR_HERMES_INGEST_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [{
      "target": "pulse",
      "identifier": { "dedupe_hash": "test-pulse-copilot-01" },
      "podcast_audio_url": "https://example.com/podcast.mp3",
      "short_video_url": "https://example.com/short.mp4"
    }]
  }'
```

### 5. Check TypeScript Build
```bash
npx tsc --noEmit
```
