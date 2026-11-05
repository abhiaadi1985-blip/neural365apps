import type { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { SEED_BLOG } from '@/lib/seed-blog'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://community.neural365ltd.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()

  // Static community routes
  const staticRoutes = [
    '',
    '/pulse',
    '/blog',
    '/guides',
    '/d365-fo',
    '/dataverse-power-platform',
    '/copilot-ai-agents',
    '/industry-solutions',
    '/sign-in',
    '/sign-up',
  ]

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '' || route === '/pulse' || route === '/blog' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1.0 : route === '/pulse' || route === '/blog' ? 0.9 : 0.7,
  }))

  // Dynamic live blog posts
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('status', 'live')

    const posts = (blogPosts && blogPosts.length > 0) ? blogPosts : SEED_BLOG.map(p => ({ slug: p.slug, updated_at: now }))

    const blogEntries: MetadataRoute.Sitemap = posts.map(post => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updated_at || now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [...staticEntries, ...blogEntries]
  } catch {
    return staticEntries
  }
}
