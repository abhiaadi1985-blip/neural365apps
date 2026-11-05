# neural365 COMMUNITY — Spoke Environment Setup

## Overview

The "spoke" layer consists of **dedicated Microsoft sandbox tenants** used exclusively to run live D365 F&O / Dataverse / Copilot demos referenced from guides. They are completely isolated from production user data and can be reset at any time.

> **Scope:** This document describes the required tenant setup. Provisioning is **manual** — the web app does not attempt to create or manage these tenants programmatically.

---

## What You Need

| Spoke | Purpose | Licence required |
|-------|---------|-----------------|
| D365 F&O sandbox    | Run Finance & Operations demos, configure Copilot features | Dynamics 365 Finance / Unified Operations |
| Power Platform sandbox | Build and demo Copilot Studio agents, Power Apps, Dataverse | Power Apps Premium / Copilot Studio |

---

## Microsoft 365 Developer Program (free sandboxes)

For non-production demos, use the **Microsoft 365 Developer Program**:

1. Sign up at [developer.microsoft.com/microsoft-365/dev-program](https://developer.microsoft.com/microsoft-365/dev-program)
2. Get a free E5 sandbox tenant (renewable every 90 days if active)
3. This gives you: Exchange, Teams, SharePoint, and the base M365 stack

> ⚠️ The M365 Developer tenant does **not** include D365 Finance & Operations or Copilot Studio licences. See below for those.

---

## D365 Finance & Operations Sandbox

1. **Obtain a trial or partner licence:**
   - Trial: [dynamics.microsoft.com/en-us/dynamics-365-free-trial/](https://dynamics.microsoft.com/en-us/dynamics-365-free-trial/) → Finance
   - Partner: Use your Microsoft Partner Network (MPN) action pack or ISV benefits

2. **Provision environment in LCS (Lifecycle Services):**
   - Go to [lcs.dynamics.com](https://lcs.dynamics.com)
   - Create a new project → Implementation project or Partner project
   - Deploy a Tier-1 sandbox (cloud-hosted or Microsoft-managed)
   - Estimated provisioning time: 2–4 hours

3. **Enable Copilot features:**
   - In D365 F&O → System Administration → Feature Management
   - Enable: `Finance insights`, `Copilot in Finance`, `AI-generated text for products` (as available in your release wave)

4. **Reset policy:** Treat as disposable. Snapshot VM state or use LCS database refresh to reset between guide recordings.

---

## Power Platform / Dataverse Sandbox

1. **Create a developer environment:**
   - Go to [make.powerplatform.com](https://make.powerplatform.com) → Environments → New
   - Type: **Developer** (free, includes Dataverse)
   - Region: Choose closest to your target audience

2. **Copilot Studio licence:**
   - Use the [Copilot Studio trial](https://copilotstudio.microsoft.com) — 30-day free trial
   - Or use M365 Copilot licences if available via MPN

3. **Enable preview features:**
   - Power Platform Admin Center → Environments → [your env] → Settings
   - Enable: `Generative AI features`, `AI Builder credits`

4. **Isolation:** Never connect the spoke environments to the production Supabase database or the neural365 COMMUNITY web server. They exist only as demo environments for content recording.

---

## Security Guidelines

- Use **service accounts** (not personal M365 accounts) for spoke tenants
- Enable **MFA** on all spoke accounts
- **Do not store production user data** in spoke tenants — they are demo-only
- **Do not embed real customer data** in guide screenshots or recordings
- Rotate credentials if a spoke tenant is shared with external collaborators

---

## Recording Workflow for Neural Shorts & Micro-podcasts

1. Set up the feature being demonstrated in the appropriate spoke environment
2. Record the demo (screen capture for Neural Shorts, NotebookLM for Micro-podcasts)
3. Upload media to a CDN or blob storage (e.g. Azure Blob, Cloudflare R2)
4. Add the CDN URL to the guide in Supabase:
   ```sql
   update guides
   set short_video_url   = 'https://cdn.neural365ltd.com/shorts/your-short.mp4',
       podcast_audio_url = 'https://cdn.neural365ltd.com/podcasts/your-podcast.mp3'
   where slug = 'your-guide-slug';
   ```
5. Verify the guide page renders the embedded player correctly

---

## Open Items (from spec §13.4)

- [ ] Confirm who owns recording Neural Shorts (screen capture tooling, editing workflow)
- [ ] Confirm NotebookLM access and podcast generation pipeline
- [ ] Decide on CDN/storage provider for media files
- [x] Established guide recording cadence: weekly updates aligned with Hermes release-wave sync
