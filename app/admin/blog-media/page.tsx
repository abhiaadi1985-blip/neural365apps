import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import ClientBlogMediaQueue from './client-page'
import type { BlogPost } from '@/lib/seed-blog'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog Media Review Queue — Admin',
}

export default async function BlogMediaReviewPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'media_pending')
    .order('created_at', { ascending: false })

  const items = data || []

  return <ClientBlogMediaQueue initialItems={items as unknown as BlogPost[]} />
}
