/**
 * Hermes Pipeline
 * fetch → extract → dedupe → categorize → summarize → write
 *
 * Each source runs independently — a single source failure does not block others.
 * Results are written to the web app via /api/hermes/ingest.
 */

import * as crypto from 'crypto'

// ── Types ──────────────────────────────────────────────────────────────────
export type Lane   = 'new' | 'coming' | 'architecture'
export type Pillar = 'd365-fo' | 'dataverse-power-platform' | 'copilot-ai-agents' | 'industry-solutions'

export interface RawItem {
  title:       string
  body:        string   // truncated body or summary from source
  sourceUrl:   string
  sourceName:  string
  publishedAt: Date
}

export interface PulseItem {
  title:        string
  summary:      string
  lane:         Lane
  pillar:       Pillar
  source_name:  string
  source_url:   string
  published_at: string
  dedupe_hash:  string
}

// ── Step 1: Deduplicate ────────────────────────────────────────────────────
export function dedupeHash(title: string, sourceDomain: string): string {
  const normalized = `${title.toLowerCase().replace(/\s+/g, ' ').trim()}||${sourceDomain}`
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 32)
}

export function extractDomain(url: string): string {
  try { return new URL(url).hostname } catch { return url }
}

// ── Step 2: Rules-based classifier ────────────────────────────────────────
// Keyword + source-type matching. Only add LLM classification if rules prove insufficient.
const NEW_SIGNALS      = ['generally available', ' ga ', 'now available', 'launched', 'released', 'live now']
const COMING_SIGNALS   = ['preview', 'roadmap', 'coming soon', 'planned', 'upcoming', 'wave 2', 'wave 1']
const ARCH_SIGNALS     = ['architecture', 'deprecat', 'retirement', 'migration', 'limit', 'quota', 'breaking change', 'connector', 'policy']

const PILLAR_RULES: { pillar: Pillar; keywords: string[] }[] = [
  { pillar: 'copilot-ai-agents',        keywords: ['copilot studio', 'ai agent', 'autonomous agent', 'ai builder', 'generative ai', 'llm', 'prompt'] },
  { pillar: 'd365-fo',                  keywords: ['finance & operations', 'finance and operations', 'd365 fo', 'f&o', 'supply chain', 'manufacturing', 'erp', 'ax ', 'axapta'] },
  { pillar: 'dataverse-power-platform', keywords: ['dataverse', 'power platform', 'power apps', 'power automate', 'power bi', 'power pages', 'virtual table'] },
  { pillar: 'industry-solutions',       keywords: ['industry', 'retail', 'healthcare', 'financial services', 'energy', 'manufacturing cloud'] },
]

export function classifyLane(text: string): Lane {
  const t = text.toLowerCase()
  if (ARCH_SIGNALS.some(s => t.includes(s)))    return 'architecture'
  if (COMING_SIGNALS.some(s => t.includes(s)))  return 'coming'
  if (NEW_SIGNALS.some(s => t.includes(s)))     return 'new'
  return 'new' // default: treat unknown as new
}

export function classifyPillar(text: string, hint?: Pillar): Pillar {
  const t = text.toLowerCase()
  for (const rule of PILLAR_RULES) {
    if (rule.keywords.some(k => t.includes(k))) return rule.pillar
  }
  return hint ?? 'copilot-ai-agents' // default to most-requested pillar
}

// ── Step 3: Summarize ─────────────────────────────────────────────────────
// Truncate body to ≤240 chars, stripping HTML tags, no marketing language
export function summarize(body: string): string {
  const clean = body
    .replace(/<[^>]+>/g, ' ')     // strip HTML
    .replace(/\s+/g, ' ')
    .trim()

  if (clean.length <= 240) return clean

  // Truncate at word boundary
  const truncated = clean.slice(0, 237)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…'
}

// ── Step 4: Transform raw items → PulseItems ──────────────────────────────
export function transform(raw: RawItem, pillarHint?: Pillar): PulseItem {
  const combined = `${raw.title} ${raw.body}`
  const lane     = classifyLane(combined)
  const pillar   = classifyPillar(combined, pillarHint)
  const summary  = raw.body.length > 30 ? summarize(raw.body) : raw.title
  const hash     = dedupeHash(raw.title, extractDomain(raw.sourceUrl))

  return {
    title:        raw.title.slice(0, 200),
    summary,
    lane,
    pillar,
    source_name:  raw.sourceName,
    source_url:   raw.sourceUrl,
    published_at: raw.publishedAt.toISOString(),
    dedupe_hash:  hash,
  }
}

// ── Step 5: Write to API ───────────────────────────────────────────────────
export async function writeToApi(items: PulseItem[]): Promise<{ inserted: number; received: number }> {
  const baseUrl = process.env.HERMES_BASE_URL ?? 'http://localhost:3000'
  const secret  = process.env.HERMES_INGEST_SECRET

  if (!secret) throw new Error('HERMES_INGEST_SECRET not set')
  if (items.length === 0) return { inserted: 0, received: 0 }

  const res = await fetch(`${baseUrl}/api/hermes/ingest`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${secret}`,
    },
    body: JSON.stringify({ items }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ingest API error ${res.status}: ${text}`)
  }

  return res.json()
}
