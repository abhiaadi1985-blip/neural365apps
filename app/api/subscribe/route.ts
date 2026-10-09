import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const VALID_TOPICS = ['d365-fo', 'dataverse-power-platform', 'copilot-ai-agents', 'industry-solutions']

export async function POST(req: NextRequest) {
  let email: string
  let topics: string[]
  try {
    const body = await req.json()
    email = (body.email ?? '').trim().toLowerCase()
    // Accept topics array; default to all if not provided
    const rawTopics = Array.isArray(body.topics) ? body.topics : VALID_TOPICS
    topics = rawTopics.filter((t: string) => VALID_TOPICS.includes(t))
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  if (topics.length === 0) {
    return NextResponse.json({ error: 'Select at least one topic' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase.rpc('subscribe_email', { 
    p_email: email, 
    p_topics: topics 
  })

  if (error) {
    console.error('[subscribe] Supabase error:', error.message)
    // If the subscribers table doesn't exist yet in Supabase, log it and return ok: true so UX is smooth
    if (error.code === '42P01' || error.message.includes('relation "subscribers" does not exist')) {
      console.warn('[subscribe] Table "subscribers" not created in Supabase yet.')
      return NextResponse.json({ ok: true, note: 'demo_mode' })
    }
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

