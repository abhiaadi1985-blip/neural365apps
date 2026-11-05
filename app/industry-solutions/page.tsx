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
  title: 'Industry Solutions — neural365 COMMUNITY',
  description: 'Purpose-built AI for Manufacturing, Retail, Healthcare and beyond — pre-built agent templates, vertical Copilot features, and the roadmap items that matter for your sector.',
}

const RELATED_GUIDES: GuideStub[] = [
  { slug: 'manufacturing-agents',   title: 'Industry agent templates: Manufacturing overview',  isPremium: false },
  { slug: 'retail-copilot',         title: 'Copilot for Retail: what\'s shipping in Wave 2',     isPremium: true  },
]

export default async function IndustrySolutionsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: dbPulse } = await supabase
    .from('pulse_items')
    .select('*')
    .eq('pillar', 'industry-solutions')
    .order('published_at', { ascending: false })
  const pulseItems = (dbPulse && dbPulse.length > 0) ? dbPulse : SEED_PULSE.filter(i => i.pillar === 'industry-solutions')

  const { data: dbBlogs } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('pillar', 'industry-solutions')
    .eq('status', 'live')
    .order('published_at', { ascending: false })
  const blogPosts = (dbBlogs && dbBlogs.length > 0) ? dbBlogs : SEED_BLOG.filter(b => b.pillar === 'industry-solutions')

  return (
    <>
      <section className="hero" style={{ paddingTop: 72, paddingBottom: 60 }}>
        <HeroMesh intensity="reduced" />
        <div className="wrap hero-inner">
          <div className="eyebrow"><span className="dot" />Industry Solutions</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, maxWidth: 720 }}>
            Purpose-built AI for Manufacturing, Retail, Healthcare & beyond.
          </h1>
          <p style={{ marginTop: 16, maxWidth: 580, color: 'var(--text-muted)', fontSize: '1rem' }}>
            Microsoft&apos;s industry-cloud accelerators are gaining AI layers fast. Track pre-built agent templates, vertical-specific Copilot features, and the roadmap items that matter most for your sector.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow"><span className="dot" />Pulse — Industry Solutions</div>
            <h2>Latest updates for this pillar</h2>
          </div>
          <PulseGrid items={pulseItems} limit={10} />
        </div>
      </section>

      {/* ── Latest Blog Posts for Industry Solutions ── */}
      <section className="section" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow"><span className="dot" />Articles &amp; Deep Dives</div>
            <h2>In-Depth Industry Solutions Analysis</h2>
            <p>Vertical accelerators, industry cloud playbooks, and sector-specific agent templates.</p>
          </div>
          <BlogGrid posts={blogPosts} limit={6} />
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Link href="/blog?pillar=industry-solutions" style={{ color: 'var(--azure)', fontSize: '0.88rem', fontFamily: '"IBM Plex Mono", monospace' }}>
              View all Industry Solution articles →
            </Link>
          </div>
        </div>
      </section>

      <RelatedGuides guides={RELATED_GUIDES} eyebrowLabel="Industry Solution Guides" />
    </>
  )
}
