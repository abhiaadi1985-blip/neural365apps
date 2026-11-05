import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { SEED_BLOG } from '@/lib/seed-blog'
import { SEED_PULSE } from '@/lib/seed-pulse'

export const dynamic = 'force-dynamic'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://community.neural365ltd.com'
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Fetch live blog posts with seed fallback
  const { data: blogData } = await supabase
    .from('blog_posts')
    .select('slug, title, summary, pillar, author_name, published_at')
    .eq('status', 'live')
    .order('published_at', { ascending: false })
    .limit(20)

  const posts = (blogData && blogData.length > 0) ? blogData : SEED_BLOG.slice(0, 10).map(p => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    pillar: p.pillar,
    author_name: p.author_name || p.authorName || 'neural365',
    published_at: p.published_at || p.publishedAt || new Date().toISOString(),
  }))

  // 2. Fetch live pulse items with seed fallback
  const { data: pulseData } = await supabase
    .from('pulse_items')
    .select('id, title, summary, pillar, published_at')
    .order('published_at', { ascending: false })
    .limit(20)

  const pulses = (pulseData && pulseData.length > 0) ? pulseData : SEED_PULSE.slice(0, 10).map(p => ({
    id: p.id,
    title: p.title,
    summary: p.summary,
    pillar: p.pillar,
    published_at: (p as unknown as { published_at?: string; publishedAt?: string }).published_at || (p as unknown as { published_at?: string; publishedAt?: string }).publishedAt || new Date().toISOString(),
  }))

  const nowRfc822 = new Date().toUTCString()

  // Generate RSS 2.0 items
  const blogXmlItems = posts.map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <description>${escapeXml(post.summary || '')}</description>
      <category>${escapeXml(post.pillar || 'general')}</category>
      <author>${escapeXml(post.author_name || 'neural365')}</author>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
    </item>`).join('\n')

  const pulseXmlItems = pulses.map(pulse => `
    <item>
      <title>[Pulse] ${escapeXml(pulse.title)}</title>
      <link>${siteUrl}/pulse/${pulse.id}</link>
      <guid isPermaLink="true">${siteUrl}/pulse/${pulse.id}</guid>
      <description>${escapeXml(pulse.summary || '')}</description>
      <category>${escapeXml(pulse.pillar || 'general')}</category>
      <pubDate>${new Date(pulse.published_at).toUTCString()}</pubDate>
    </item>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>neural365 COMMUNITY</title>
    <link>${siteUrl}</link>
    <description>Independent research community hub for Microsoft Dynamics 365, Dataverse, and Copilot AI Agents.</description>
    <language>en</language>
    <lastBuildDate>${nowRfc822}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${blogXmlItems}
${pulseXmlItems}
  </channel>
</rss>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
