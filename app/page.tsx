import Link from 'next/link'
import HeroSection from '@/components/hero-section'
import { PulseGrid } from '@/components/pulse-grid'
import MultimediaSection from '@/components/multimedia-section'
import SignupForm from '@/components/signup-form'
import { landing } from '@/app/copy'
import { SEED_PULSE } from '@/lib/seed-pulse'
import type { PulseItem } from '@/lib/seed-pulse'
import { BlogGrid } from '@/components/blog-grid'
import { SEED_BLOG } from '@/lib/seed-blog'
import type { BlogPost } from '@/lib/seed-blog'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'neural365 COMMUNITY — Microsoft AI & Copilot Architecture Hub',
  description: 'Independent community research hub for Microsoft Dynamics 365 ERP, Power Platform, and Copilot AI Agents.',
}

export default async function HomePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Fetch latest pulse items with SEED_PULSE fallback
  const { data: pulseData } = await supabase
    .from('pulse_items')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(3)

  const pulseItems: PulseItem[] = (pulseData && pulseData.length > 0)
    ? pulseData as unknown as PulseItem[]
    : SEED_PULSE.slice(0, 3)

  // 2. Fetch latest live blog posts with SEED_BLOG fallback
  const { data: blogData } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'live')
    .order('published_at', { ascending: false })
    .limit(3)

  const blogPosts: BlogPost[] = (blogData && blogData.length > 0)
    ? blogData as unknown as BlogPost[]
    : SEED_BLOG.slice(0, 3)

  return (
    <>
      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Pulse Preview ── */}
      <section className="section" id="pulse">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">
              <span className="dot" />
              {landing.pulse.eyebrow}
            </div>
            <h2>{landing.pulse.h2}</h2>
            <p className="cadence">{landing.pulse.cadence}</p>
          </div>

          <PulseGrid items={pulseItems} limit={3} showSampleNote={!pulseData || pulseData.length === 0} />

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Link href="/pulse" style={{ color: 'var(--azure)', fontSize: '0.88rem', fontFamily: '"IBM Plex Mono", monospace' }}>
              {landing.pulse.seeAll}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Interactive Multimedia Hub (Placed above Blog as requested) ── */}
      <MultimediaSection />

      {/* ── Latest Blog Posts ── */}
      <section className="section" id="blog" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">
              <span className="dot" />
              {landing.blog.eyebrow}
            </div>
            <h2>{landing.blog.h2}</h2>
            <p>{landing.blog.lead}</p>
          </div>

          <BlogGrid posts={blogPosts} limit={3} showSampleNote={!blogData || blogData.length === 0} />

          <div style={{ marginTop: 32, textAlign: 'right' }}>
            <Link href="/blog" style={{ color: 'var(--azure)', fontSize: '0.88rem', fontFamily: '"IBM Plex Mono", monospace' }}>
              {landing.blog.seeAll}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <SignupForm />
    </>
  )
}
