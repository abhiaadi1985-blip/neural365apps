import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import ClientReviewQueue from './client-page'
import type { PulseItem } from '@/lib/seed-pulse'

export const metadata = {
  title: 'Text Review Queue — Admin',
}

export const dynamic = 'force-dynamic'

export default async function TextReviewPage() {
  // Use anon client so it relies on public read policies for now 
  // (In production this would use server client with auth policies)
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  // Fetch drafts from Supabase
  const { data } = await supabase
    .from('pulse_items')
    .select('*')
    .eq('status', 'draft')
    .order('ingested_at', { ascending: false })

  const drafts = data || []
  
  return <ClientReviewQueue initialDrafts={drafts as unknown as PulseItem[]} />
}
