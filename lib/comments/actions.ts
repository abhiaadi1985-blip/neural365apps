'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface CommentItem {
  id: string
  content_type: 'pulse' | 'blog'
  content_id: string
  author_name: string
  author_email: string
  body: string
  created_at: string
}

export async function getComments(
  contentType: 'pulse' | 'blog',
  contentId: string
): Promise<CommentItem[]> {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })

    if (error) {
      // If migration 008 has not been applied yet, silently return [] so pages load without error
      if (!error.message?.includes('schema cache') && !error.message?.includes('does not exist')) {
        console.warn('[getComments] Note:', error.message)
      }
      return []
    }
    return (data || []) as CommentItem[]
  } catch {
    return []
  }
}

export async function addComment(
  contentType: 'pulse' | 'blog',
  contentId: string,
  authorName: string,
  authorEmail: string,
  body: string,
  revalidateUrl?: string
): Promise<{ success: boolean; error?: string; comment?: CommentItem }> {
  const trimmedName = authorName.trim()
  const trimmedEmail = authorEmail.trim().toLowerCase()
  const trimmedBody = body.trim()

  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, error: 'Please enter a valid display name (min 2 characters).' }
  }
  if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
    return { success: false, error: 'Please enter a valid email address.' }
  }
  if (!trimmedBody || trimmedBody.length < 5) {
    return { success: false, error: 'Comment must be at least 5 characters long.' }
  }

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
      .from('comments')
      .insert({
        content_type: contentType,
        content_id: contentId,
        author_name: trimmedName,
        author_email: trimmedEmail,
        body: trimmedBody,
        status: 'approved',
      })
      .select()
      .single()

    if (error) {
      if (error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        return {
          success: false,
          error: 'Comments table is not yet created in Supabase. Please execute migration 008_community_interactions.sql in the Supabase SQL editor.',
        }
      }
      return { success: false, error: error.message }
    }

    if (revalidateUrl) {
      revalidatePath(revalidateUrl)
    }

    return { success: true, comment: data as CommentItem }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function toggleBookmark(
  contentType: 'pulse' | 'blog',
  contentId: string,
  title: string,
  pillar: string
): Promise<{ isBookmarked: boolean; error?: string }> {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { isBookmarked: false, error: 'Please sign in to save bookmarks.' }
    }

    // Check if already bookmarked
    const { data: existing, error: checkError } = await supabase
      .from('user_bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .maybeSingle()

    if (checkError) {
      if (checkError.message?.includes('schema cache') || checkError.message?.includes('does not exist')) {
        return {
          isBookmarked: false,
          error: 'Bookmarks table is not yet created in Supabase. Please execute migration 008_community_interactions.sql in the Supabase SQL editor.',
        }
      }
    }

    if (existing) {
      // Remove
      await supabase.from('user_bookmarks').delete().eq('id', existing.id)
      return { isBookmarked: false }
    } else {
      // Add
      const { error: insertError } = await supabase.from('user_bookmarks').insert({
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
        title,
        pillar,
      })
      if (insertError) {
        if (insertError.message?.includes('schema cache') || insertError.message?.includes('does not exist')) {
          return {
            isBookmarked: false,
            error: 'Bookmarks table is not yet created in Supabase. Please execute migration 008_community_interactions.sql in the Supabase SQL editor.',
          }
        }
        return { isBookmarked: false, error: insertError.message }
      }
      return { isBookmarked: true }
    }
  } catch (err) {
    return { isBookmarked: false, error: (err as Error).message }
  }
}

export async function getUserBookmarks() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return data || []
  } catch {
    return []
  }
}
