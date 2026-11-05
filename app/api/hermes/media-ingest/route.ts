import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

// This endpoint is called by Hermes worker / n8n pipelines to attach or update
// multimedia assets (shorts & podcasts) for Pulse items and Blog posts.
// Authenticated via shared secret in the Authorization header.

interface MediaUpdatePayload {
  updates: {
    target: 'pulse' | 'blog'
    identifier: {
      id?: string
      dedupe_hash?: string
      slug?: string
    }
    podcast_audio_url?: string | null
    short_video_url?: string | null
    video_brief?: Record<string, unknown> | null
    status?: 'draft' | 'media_pending' | 'live'
    podcast_kind?: 'article' | 'long'
    podcast_duration_sec?: number | null
    podcast_chapters?: { t: number; title: string }[] | null
    render_attempts?: number
    render_last_error?: string | null
    render_last_attempt_at?: string | null
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
  let payload: MediaUpdatePayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!Array.isArray(payload.updates) || payload.updates.length === 0) {
    return NextResponse.json({ error: 'updates array is required' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  let updatedCount = 0

  for (const item of payload.updates) {
    const table = item.target === 'blog' ? 'blog_posts' : 'pulse_items'
    const updateData: Record<string, unknown> = {}

    if (item.podcast_audio_url !== undefined) {
      updateData.podcast_audio_url = item.podcast_audio_url
    }
    if (item.short_video_url !== undefined) {
      updateData.short_video_url = item.short_video_url
    }
    if (item.video_brief !== undefined) {
      updateData.video_brief = item.video_brief
    }
    if (item.status !== undefined) {
      updateData.status = item.status
    }
    if (item.render_attempts !== undefined) {
      updateData.render_attempts = item.render_attempts
    }
    if (item.render_last_error !== undefined) {
      updateData.render_last_error = item.render_last_error
    }
    if (item.render_last_attempt_at !== undefined) {
      updateData.render_last_attempt_at = item.render_last_attempt_at
    }

    if (item.target === 'blog') {
      if (item.podcast_kind !== undefined && (item.podcast_kind === 'article' || item.podcast_kind === 'long')) {
        updateData.podcast_kind = item.podcast_kind
      }
      if (item.podcast_duration_sec !== undefined && typeof item.podcast_duration_sec === 'number' && item.podcast_duration_sec > 0) {
        updateData.podcast_duration_sec = Math.round(item.podcast_duration_sec)
      }
      if (item.podcast_chapters !== undefined && (Array.isArray(item.podcast_chapters) || item.podcast_chapters === null)) {
        updateData.podcast_chapters = item.podcast_chapters
      }
      if (item.podcast_audio_url) {
        updateData.podcast_generated_at = new Date().toISOString()
      }
    }

    if (Object.keys(updateData).length === 0) {
      continue
    }

    let query = supabase.from(table).update(updateData)

    if (item.identifier.id) {
      query = query.eq('id', item.identifier.id)
    } else if (item.identifier.slug && item.target === 'blog') {
      query = query.eq('slug', item.identifier.slug)
    } else if (item.identifier.dedupe_hash) {
      query = query.eq('dedupe_hash', item.identifier.dedupe_hash)
    } else {
      continue
    }

    const { error, data } = await query.select('id')
    if (error) {
      console.error(`[hermes/media-ingest] Error updating ${table}:`, error.message)
    } else if (data && data.length > 0) {
      updatedCount += data.length
    }
  }

  return NextResponse.json({
    updated: updatedCount,
    received: payload.updates.length,
  })
}
