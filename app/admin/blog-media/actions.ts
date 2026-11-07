'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function approveBlogMedia(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase
    .from('blog_posts')
    .update({ status: 'live' })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/blog-media')
  revalidatePath('/blog')
  revalidatePath('/')
}

export async function rejectBlogMedia(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase
    .from('blog_posts')
    .update({ status: 'draft' })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/blog-media')
  revalidatePath('/admin/blog-review')
}

export async function updateBlogMediaUrls(
  id: string,
  podcast_audio_url?: string | null,
  short_video_url?: string | null,
  short_storage_url?: string | null
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const updates: Record<string, string | null> = {}
  if (podcast_audio_url !== undefined) updates.podcast_audio_url = podcast_audio_url
  if (short_video_url !== undefined) updates.short_video_url = short_video_url
  if (short_storage_url !== undefined) updates.short_storage_url = short_storage_url

  const { error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/blog-media')
  revalidatePath('/blog')
}
