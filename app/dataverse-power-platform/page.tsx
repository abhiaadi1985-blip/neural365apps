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
  title: 'Dataverse & Power Platform — neural365 COMMUNITY',
  description: 'Follow shifts in Dataverse and Power Platform that change what low-code makers can do — generative answers, virtual tables, and more.',
}

const RELATED_GUIDES: GuideStub[] = [
  { slug: 'copilot-studio-dataverse',   title: 'Set up a Copilot Studio agent in Dataverse',    isPremium: false },
  { slug: 'virtual-table-api',          title: 'Wire a virtual table to an external API',         isPremium: false },
  { slug: 'fabric-retention',           title: 'What the new Dataverse retention policy means for your data', isPremium: true  },
]

export default async function DataversePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: dbPulse } = await supabase
    .from('pulse_items')
    .select('*')
    .eq('pillar', 'dataverse-power-platform')
    .eq('status', 'live')
    .order('published_at', { ascending: false })
  const pulseItems = (dbPulse && dbPulse.length > 0) ? dbPulse : SEED_PULSE.filter(i => i.pillar === 'dataverse-power-platform')

  const { data: dbBlogs } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('pillar', 'dataverse-power-platform')
    .eq('status', 'live')
    .order('published_at', { ascending: false })
  const blogPosts = (dbBlogs && dbBlogs.length > 0) ? dbBlogs : SEED_BLOG.filter(b => b.pillar === 'dataverse-power-platform')

  return (
    <>
      <section className="hero" style={{ paddingTop: 72, paddingBottom: 60 }}>
        <HeroMesh intensity="reduced" />
        <div className="wrap hero-inner">
          <div className="eyebrow"><span className="dot" />Dataverse & Power Platform</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, maxWidth: 720 }}>
            Build smarter apps on the data platform that powers everything.
          </h1>
          <p style={{ marginTop: 16, maxWidth: 580, color: 'var(--text-muted)', fontSize: '1rem' }}>
            From generative answers going GA to virtual table connector updates, follow the shifts in Dataverse and Power Platform that change what low-code makers can do without writing a line of code.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow"><span className="dot" />Pulse — Dataverse & Power Platform</div>
            <h2>Latest updates for this pillar</h2>
          </div>
          <PulseGrid items={pulseItems} limit={10} />
        </div>
      </section>

      {/* ── Latest Blog Posts for Dataverse & Power Platform ── */}
      <section className="section" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow"><span className="dot" />Articles &amp; Deep Dives</div>
            <h2>In-Depth Dataverse &amp; Power Platform Analysis</h2>
            <p>Direct Lake integrations, architecture patterns, and enterprise low-code execution.</p>
          </div>
          <BlogGrid posts={blogPosts} limit={6} />
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Link href="/blog?pillar=dataverse-power-platform" style={{ color: 'var(--azure)', fontSize: '0.88rem', fontFamily: '"IBM Plex Mono", monospace' }}>
              View all Dataverse &amp; Power Platform articles →
            </Link>
          </div>
        </div>
      </section>

      <RelatedGuides guides={RELATED_GUIDES} eyebrowLabel="Dataverse &amp; Power Platform Guides" />
    </>
  )
}
