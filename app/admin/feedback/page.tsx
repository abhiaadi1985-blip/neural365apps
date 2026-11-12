import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import ClientFeedbackQueue from './client-page'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Feedback & Rejected Queue — Admin',
}

export interface FeedbackQueueItem {
  id: string
  type: 'pulse' | 'blog'
  title: string
  summary: string
  pillar: string
  status: 'revision_requested' | 'rejected'
  review_feedback: string | null
  reviewed_at: string | null
  source_url?: string | null
}

export default async function FeedbackQueuePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [pulseRes, blogRes] = await Promise.all([
    supabase
      .from('pulse_items')
      .select('id, title, summary, pillar, status, review_feedback, reviewed_at, source_url')
      .in('status', ['revision_requested', 'rejected'])
      .order('reviewed_at', { ascending: false }),
    supabase
      .from('blog_posts')
      .select('id, title, summary, pillar, status, review_feedback, reviewed_at, source_url')
      .in('status', ['revision_requested', 'rejected'])
      .order('reviewed_at', { ascending: false }),
  ])

  const items: FeedbackQueueItem[] = [
    ...(pulseRes.data ?? []).map((p) => ({
      id: p.id as string,
      type: 'pulse' as const,
      title: p.title as string,
      summary: p.summary as string,
      pillar: p.pillar as string,
      status: p.status as 'revision_requested' | 'rejected',
      review_feedback: (p.review_feedback as string | null) ?? null,
      reviewed_at: (p.reviewed_at as string | null) ?? null,
      source_url: (p.source_url as string | null) ?? null,
    })),
    ...(blogRes.data ?? []).map((b) => ({
      id: b.id as string,
      type: 'blog' as const,
      title: b.title as string,
      summary: b.summary as string,
      pillar: b.pillar as string,
      status: b.status as 'revision_requested' | 'rejected',
      review_feedback: (b.review_feedback as string | null) ?? null,
      reviewed_at: (b.reviewed_at as string | null) ?? null,
      source_url: (b.source_url as string | null) ?? null,
    })),
  ].sort((a, b) => {
    const tA = a.reviewed_at ? new Date(a.reviewed_at).getTime() : 0
    const tB = b.reviewed_at ? new Date(b.reviewed_at).getTime() : 0
    return tB - tA
  })

  return <ClientFeedbackQueue initialItems={items} />
}
