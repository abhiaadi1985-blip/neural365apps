import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'


export const runtime = 'nodejs'

// This endpoint is called ONLY by the Hermes worker process — not the browser.
// Authenticated via a shared secret in the Authorization header.

interface BlogIngestPayload {
  items: {
    slug: string
    title: string
    subtitle?: string
    summary: string
    body_md: string
    pillar: 'd365-fo' | 'dataverse-power-platform' | 'copilot-ai-agents' | 'industry-solutions'
    tags?: string[]
    author_name?: string
    hero_image_url?: string
    estimated_read_min?: number
    featured?: boolean
    status?: 'draft' | 'media_pending' | 'live'
    podcast_audio_url?: string
    short_video_url?: string
    video_brief?: Record<string, unknown>
    podcast_kind?: 'article' | 'long'
    podcast_duration_sec?: number
    podcast_chapters?: { t: number; title: string }[]
    source_url?: string
    source_name?: string
    dedupe_hash?: string
    published_at?: string // ISO 8601
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
  let payload: BlogIngestPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return NextResponse.json({ error: 'items array is required' }, { status: 400 })
  }

  // ── Insert with dedupe (conflict = skip) ───────────────────────────────

  const supabase = createAdminClient()
  if (!supabase) {
    console.error('[hermes/blog-ingest] SUPABASE_SECRET_KEY is not set')
    return NextResponse.json({ error: 'Server misconfiguration: admin client unavailable' }, { status: 500 })
  }
  const { data, error } = await supabase
    .from('blog_posts')
    .upsert(payload.items, { onConflict: 'dedupe_hash', ignoreDuplicates: true })
    .select('id')

  if (error) {
    console.error('[hermes/blog-ingest] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    inserted: data?.length ?? 0,
    received: payload.items.length,
  })
}
