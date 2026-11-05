import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import ClientBlogReviewQueue from './client-page'
import type { BlogPost } from '@/lib/seed-blog'

export const metadata = {
  title: 'Blog Review Queue — Admin',
}

export const dynamic = 'force-dynamic'

export default async function BlogReviewPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch drafts from Supabase
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })

  const drafts = data || []

  return <ClientBlogReviewQueue initialDrafts={drafts as unknown as BlogPost[]} />
}
