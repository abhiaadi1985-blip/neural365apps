'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function saveDraftContent(id: string, content_md: string, demo_scenario_md: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase
    .from('pulse_items')
    .update({ content_md, demo_scenario_md })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/review')
}

export async function togglePodcastApproval(id: string, approved: boolean) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase
    .from('pulse_items')
    .update({ podcast_approved: approved })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/review')
}

export async function approveDraft(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase
    .from('pulse_items')
    .update({ status: 'media_pending' })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/review')
  revalidatePath('/admin/media')
  revalidatePath('/pulse')
}

export async function publishLiveDirectly(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase
    .from('pulse_items')
    .update({ status: 'live' })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/review')
  revalidatePath('/admin/media')
  revalidatePath('/pulse')
  revalidatePath('/')
}

export async function seedDatabase() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  
  const { SEED_PULSE } = await import('@/lib/seed-pulse')
  
  // Helper to convert relative seed date strings into actual Date objects for timestamptz
  const parseRelativeDate = (rel?: string | null): string => {
    const now = new Date()
    if (!rel) return now.toISOString()
    if (rel === 'roadmap') {
      // Roadmap items are set to a future date
      now.setDate(now.getDate() + 30)
      return now.toISOString()
    }
    const match = rel.match(/^(\d+)([dw])\s+ago$/)
    if (match) {
      const amount = parseInt(match[1], 10)
      const unit = match[2]
      if (unit === 'd') now.setDate(now.getDate() - amount)
      if (unit === 'w') now.setDate(now.getDate() - (amount * 7))
      return now.toISOString()
    }
    const parsed = Date.parse(rel)
    if (!isNaN(parsed)) {
      return new Date(parsed).toISOString()
    }
    return now.toISOString()
  }

  const itemsToInsert = SEED_PULSE.map(item => {
    return {
      title: item.title,
      summary: item.summary,
      lane: item.lane,
      pillar: item.pillar,
      source_name: item.source_name || item.sourceName || 'Microsoft',
      source_url: item.source_url || item.sourceUrl || null,
      published_at: parseRelativeDate(item.published_at || item.publishedAt),
      status: item.content_md ? 'draft' : 'live',
      content_md: item.content_md || null,
      demo_scenario_md: item.demo_scenario_md || null,
      dedupe_hash: `seed-${item.id}`
    }
  })

  const { error } = await supabase
    .from('pulse_items')
    .insert(itemsToInsert)
    
  if (error) throw new Error(error.message)
  revalidatePath('/admin/review')
  revalidatePath('/pulse')
}
