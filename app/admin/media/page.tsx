import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import ClientMediaQueue from './client-page'
import type { PulseItem } from '@/lib/seed-pulse'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Media Review Queue — Admin',
}

export default async function MediaReviewPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from('pulse_items')
    .select('*')
    .eq('status', 'media_pending')
    .order('ingested_at', { ascending: false })

  const items = data || []

  return <ClientMediaQueue initialItems={items as unknown as PulseItem[]} />
}
