import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// This endpoint is called ONLY by the Hermes worker process — not the browser.
// Authenticated via a shared secret in the Authorization header.

interface IngestPayload {
  items: {
    title:        string
    summary:      string
    lane:         'new' | 'coming' | 'architecture'
    pillar:       'copilot-ai-agents' | 'd365-fo' | 'dataverse-power-platform' | 'industry-solutions'
    source_name:  string
    source_url:   string
    published_at: string   // ISO 8601
    dedupe_hash:  string
  }[]
}

export async function POST(req: NextRequest) {
  // ── Auth check ─────────────────────────────────────────────────────────
  const authHeader = req.headers.get('authorization') ?? ''
  const expected   = `Bearer ${process.env.HERMES_INGEST_SECRET}`
  if (!process.env.HERMES_INGEST_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // ── Parse body ─────────────────────────────────────────────────────────
  let payload: IngestPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return NextResponse.json({ error: 'items array is required' }, { status: 400 })
  }

  // ── Insert with dedupe (conflict = skip) ───────────────────────────────
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pulse_items')
    .upsert(payload.items, { onConflict: 'dedupe_hash', ignoreDuplicates: true })
    .select('id')

  if (error) {
    console.error('[hermes/ingest] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    inserted: data?.length ?? 0,
    received: payload.items.length,
  })
}
