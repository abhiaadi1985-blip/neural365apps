'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function approveMedia(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase
    .from('pulse_items')
    .update({ status: 'live' })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/media')
  revalidatePath('/pulse')
}

export async function rejectMedia(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase
    .from('pulse_items')
    .update({ status: 'draft' })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/media')
  revalidatePath('/admin/review')
}

export async function updateMediaUrls(id: string, podcast_audio_url?: string | null, short_video_url?: string | null) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const updates: Record<string, string | null> = {}
  if (podcast_audio_url !== undefined) updates.podcast_audio_url = podcast_audio_url
  if (short_video_url !== undefined) updates.short_video_url = short_video_url

  const { error } = await supabase
    .from('pulse_items')
    .update(updates)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/media')
  revalidatePath('/pulse')
}
