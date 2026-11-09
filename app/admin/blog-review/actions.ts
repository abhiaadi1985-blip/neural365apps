'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function saveBlogDraft(id: string, body_md: string, subtitle: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase
    .from('blog_posts')
    .update({ body_md, subtitle })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/blog-review')
}

export async function toggleBlogPodcastApproval(id: string, approved: boolean) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase
    .from('blog_posts')
    .update({ podcast_approved: approved })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/blog-review')
}

export async function approveBlogDraft(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase
    .from('blog_posts')
    .update({ status: 'media_pending' })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/blog-review')
  revalidatePath('/admin/blog-media')
  revalidatePath('/blog')
}

export async function publishBlogLiveDirectly(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase
    .from('blog_posts')
    .update({ status: 'live' })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/blog-review')
  revalidatePath('/admin/blog-media')
  revalidatePath('/blog')
  revalidatePath('/')
}

export async function seedBlogDatabase() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { SEED_BLOG } = await import('@/lib/seed-blog')

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

  const itemsToInsert = SEED_BLOG.map(item => {
    return {
      title: item.title,
      subtitle: item.subtitle || null,
      summary: item.summary,
      slug: item.slug,
      pillar: item.pillar,
      tags: item.tags,
      body_md: item.body_md,
      author_name: item.author_name,
      hero_image_url: item.hero_image_url || null,
      estimated_read_min: item.estimated_read_min || null,
      featured: item.featured ?? false,
      status: item.status || 'draft',
      source_name: item.source_name || null,
      source_url: item.source_url || null,
      published_at: parseRelativeDate(item.published_at || item.publishedAt || ''),
      dedupe_hash: `seed-blog-${item.slug}`
    }
  })

  const { error } = await supabase
    .from('blog_posts')
    .insert(itemsToInsert)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/blog-review')
  revalidatePath('/blog')
}
