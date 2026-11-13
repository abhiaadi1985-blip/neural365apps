import type { Metadata } from 'next'
import Link from 'next/link'
import HeroMesh from '@/components/hero-mesh'
import { PulseGrid } from '@/components/pulse-grid'
import { BlogGrid } from '@/components/blog-grid'
import RelatedGuides from '@/components/related-guides'
import type { GuideStub } from '@/components/related-guides'
import { SEED_PULSE } from '@/lib/seed-pulse'
import { SEED_BLOG } from '@/lib/seed-blog'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'D365 ERP — neural365 COMMUNITY',
  description: 'Track AI and Copilot capabilities landing in Dynamics 365 ERP — from variance narratives to autonomous reconciliation agents.',
}

const RELATED_GUIDES: GuideStub[] = [
  { slug: 'finance-variance-narratives',   title: 'Enable Finance Copilot variance narratives',    isPremium: false },
  { slug: 'supply-chain-alerts',           title: 'Configure Supply Chain anomaly alerts',          isPremium: false },
  { slug: 'reconciliation-agents-setup',   title: 'Set up autonomous reconciliation agents',        isPremium: true  },
]

export default async function D365FOPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: dbPulse } = await supabase
    .from('pulse_items')
    .select('*')
    .eq('pillar', 'd365-fo')
    .eq('status', 'live')
    .order('published_at', { ascending: false })
  const pulseItems = (dbPulse && dbPulse.length > 0) ? dbPulse : SEED_PULSE.filter(i => i.pillar === 'd365-fo')

  const { data: dbBlogs } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('pillar', 'd365-fo')
    .eq('status', 'live')
    .order('published_at', { ascending: false })
  const blogPosts = (dbBlogs && dbBlogs.length > 0) ? dbBlogs : SEED_BLOG.filter(b => b.pillar === 'd365-fo')

  return (
    <>
      <section className="hero" style={{ paddingTop: 72, paddingBottom: 60 }}>
        <HeroMesh intensity="reduced" />
        <div className="wrap hero-inner">
          <div className="eyebrow"><span className="dot" />D365 ERP</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, maxWidth: 720 }}>
            Finance, Supply Chain & ERP — AI-accelerated.
          </h1>
          <p style={{ marginTop: 16, maxWidth: 580, color: 'var(--text-muted)', fontSize: '1rem' }}>
            Track the latest Copilot capabilities landing in D365 ERP — from variance narratives to autonomous reconciliation agents — and get hands-on guides to configure them in your environment.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow"><span className="dot" />Pulse — D365 ERP</div>
            <h2>Latest updates for this pillar</h2>
          </div>
          <PulseGrid items={pulseItems} limit={10} />
        </div>
      </section>

      {/* ── Latest Blog Posts for D365 ERP ── */}
      <section className="section" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow"><span className="dot" />Articles &amp; Deep Dives</div>
            <h2>In-Depth D365 ERP Analysis</h2>
            <p>Architectural breakdowns, real-world case studies, and strategic guidance.</p>
          </div>
          <BlogGrid posts={blogPosts} limit={6} />
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Link href="/blog?pillar=d365-fo" style={{ color: 'var(--azure)', fontSize: '0.88rem', fontFamily: '"IBM Plex Mono", monospace' }}>
              View all D365 ERP articles →
            </Link>
          </div>
        </div>
      </section>

      <RelatedGuides guides={RELATED_GUIDES} eyebrowLabel="D365 ERP Guides" />
    </>
  )
}
