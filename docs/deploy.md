# neural365 COMMUNITY — Deployment Guide

## Overview

The application runs as two separate processes on a VPS:
1. **Next.js web server** — handles the public site and API routes
2. **Hermes worker** — runs as a scheduled cron job to populate the pulse feed

---

## Requirements

| Component | Requirement |
|-----------|-------------|
| Node.js   | LTS (pin via `.nvmrc` — see below) |
| npm       | ≥ 10 |
| Process manager | pm2 (recommended) or systemd |
| Reverse proxy   | nginx (TLS termination, compression, caching) |
| Database  | Supabase (managed Postgres — no self-hosting needed) |

### Pin Node version

```bash
# .nvmrc
node --version > .nvmrc   # pin the version you built with
nvm use   # on the server, enforces the pinned version
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
nano .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — public publishable key (safe for client)
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only**, never expose
- `STRIPE_SECRET_KEY` — Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — from `stripe listen` or Stripe dashboard
- `HERMES_INGEST_SECRET` — random string shared with the worker
- `HERMES_BASE_URL` — public URL of your Next.js app (e.g. `https://community.neural365ltd.com`)

---

## Build & Start

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start (using pm2)
pm2 start npm --name "neural365-web" -- start
pm2 save
pm2 startup   # generate systemd startup script
```

---

## Hermes Worker (cron)

The worker runs as a separate process — **not inline with web requests**.

### pm2 cron approach (recommended)

```bash
# Run once manually to verify
npx ts-node worker/hermes/run.ts

# Add as a pm2 cron — weekly on Mondays at 06:00 UTC
pm2 start worker/hermes/run.ts \
  --name "neural365-hermes" \
  --cron "0 6 * * 1" \
  --no-autorestart \
  --interpreter "npx ts-node"

pm2 save
```

### systemd timer approach (alternative)

```ini
# /etc/systemd/system/neural365-hermes.service
[Unit]
Description=neural365 COMMUNITY Hermes content worker

[Service]
Type=oneshot
WorkingDirectory=/var/www/neural365
ExecStart=/usr/bin/npx ts-node worker/hermes/run.ts
EnvironmentFile=/var/www/neural365/.env.local
```

```ini
# /etc/systemd/system/neural365-hermes.timer
[Unit]
Description=Run Hermes weekly on Mondays

[Timer]
OnCalendar=Mon *-*-* 06:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
systemctl enable --now neural365-hermes.timer
```

---

## nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/neural365
server {
    listen 443 ssl http2;
    server_name community.neural365ltd.com;

    # TLS — use certbot/Let's Encrypt
    ssl_certificate     /etc/letsencrypt/live/community.neural365ltd.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/community.neural365ltd.com/privkey.pem;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    brotli on;
    brotli_types text/plain text/css application/json application/javascript;

    # Static asset caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Everything else → Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name community.neural365ltd.com;
    return 301 https://$host$request_uri;
}
```

```bash
# Enable site + test
ln -s /etc/nginx/sites-available/neural365 /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## Stripe Webhook

Register your webhook endpoint in the Stripe dashboard:
- **URL:** `https://community.neural365ltd.com/api/stripe/webhook`
- **Events to listen for:**
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET` in `.env.local`.

---

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run **all** migration SQL files in order in the **SQL Editor**:
   ```
   supabase/migrations/001_initial.sql
   supabase/migrations/002_hermes_blogs.sql
   supabase/migrations/003_profiles_and_topics.sql
   supabase/migrations/004_subscribers_admin_policy.sql
   supabase/migrations/005_storage_buckets.sql
   supabase/migrations/006_subscribe_rpc.sql
   supabase/migrations/007_blog_posts.sql
   supabase/migrations/008_community_interactions.sql
   ```
3. Copy your project URL + publishable key + service role key into `.env.local`
4. Enable **Email auth** in Authentication → Providers
5. (Optional) Enable Microsoft OAuth → Authentication → Providers → Azure

> For details on the Hermes content pipeline, Blog pipeline, Docker deployment,
> and n8n integration, see [`hermes-docker-guide.md`](./hermes-docker-guide.md).

---

## Monitoring

```bash
# View web server logs
pm2 logs neural365-web

# View Hermes worker logs (last run)
pm2 logs neural365-hermes

# Check all processes
pm2 list
```
