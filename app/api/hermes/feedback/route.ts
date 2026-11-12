import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

/**
 * Authenticated via Bearer HERMES_INGEST_SECRET.
 * GET:  Hermes polls for pulse_items and blog_posts with status = 'revision_requested'
 *       so it can read `review_feedback` and rewrite the draft.
 * POST: Hermes submits revised content for a given item ID and returns it to status = 'draft'
 *       for human re-review.
 */
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization') ?? ''
  const expected = `Bearer ${process.env.HERMES_INGEST_SECRET}`
  return Boolean(process.env.HERMES_INGEST_SECRET && authHeader === expected)
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Server misconfiguration: admin client unavailable' }, { status: 500 })
  }

  const [pulseRes, blogRes] = await Promise.all([
    supabase
      .from('pulse_items')
      .select('id, title, summary, lane, pillar, content_md, demo_scenario_md, source_name, source_url, review_feedback, reviewed_at')
      .eq('status', 'revision_requested')
      .order('reviewed_at', { ascending: false }),
    supabase
      .from('blog_posts')
      .select('id, slug, title, subtitle, summary, pillar, body_md, source_name, source_url, review_feedback, reviewed_at')
      .eq('status', 'revision_requested')
      .order('reviewed_at', { ascending: false }),
  ])

  if (pulseRes.error || blogRes.error) {
    return NextResponse.json(
      { error: pulseRes.error?.message || blogRes.error?.message || 'Database query failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    pulse_items: pulseRes.data ?? [],
    blog_posts: blogRes.data ?? [],
  })
}

interface RevisionPayload {
  type: 'pulse' | 'blog'
  id: string
  title?: string
  summary?: string
  content_md?: string
  demo_scenario_md?: string
  body_md?: string
  subtitle?: string
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: RevisionPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.id || (body.type !== 'pulse' && body.type !== 'blog')) {
    return NextResponse.json({ error: 'type ("pulse" | "blog") and id are required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Server misconfiguration: admin client unavailable' }, { status: 500 })
  }

  const table = body.type === 'pulse' ? 'pulse_items' : 'blog_posts'
  const updates: Record<string, unknown> = {
    status: 'draft',
    review_feedback: null,
  }

  if (body.title !== undefined) updates.title = body.title
  if (body.summary !== undefined) updates.summary = body.summary

  if (body.type === 'pulse') {
    if (body.content_md !== undefined) updates.content_md = body.content_md
    if (body.demo_scenario_md !== undefined) updates.demo_scenario_md = body.demo_scenario_md
  } else {
    if (body.body_md !== undefined) updates.body_md = body.body_md
    if (body.subtitle !== undefined) updates.subtitle = body.subtitle
  }

  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', body.id)
    .select('id, status')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ updated: true, item: data })
}
