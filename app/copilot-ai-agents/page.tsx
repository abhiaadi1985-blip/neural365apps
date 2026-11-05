import type { Metadata } from 'next'
import Link from 'next/link'
import HeroMesh from '@/components/hero-mesh'
import { PulseGrid } from '@/components/pulse-grid'
import { BlogGrid } from '@/components/blog-grid'
import { SEED_PULSE } from '@/lib/seed-pulse'
import { SEED_BLOG } from '@/lib/seed-blog'
import RelatedGuides from '@/components/related-guides'
import type { GuideStub } from '@/components/related-guides'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Copilot & AI Agents — neural365 COMMUNITY',
  description: 'Copilot Studio, multi-agent orchestration, cross-app handoffs — focused coverage of everything that moves the needle for D365 AI implementers.',
}

const RELATED_GUIDES: GuideStub[] = [
  { slug: 'copilot-studio-dataverse',   title: 'Set up a Copilot Studio agent in Dataverse',     isPremium: false },
  { slug: 'agent-handoffs',             title: 'Cross-app agent handoffs, explained',              isPremium: false },
  { slug: 'reconciliation-agents-setup', title: 'Set up autonomous reconciliation agents',         isPremium: true  },
]

export default async function CopilotPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: dbPulse } = await supabase
    .from('pulse_items')
    .select('*')
    .eq('pillar', 'copilot-ai-agents')
    .order('published_at', { ascending: false })
  const pulseItems = (dbPulse && dbPulse.length > 0) ? dbPulse : SEED_PULSE.filter(i => i.pillar === 'copilot-ai-agents')

  const { data: dbBlogs } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('pillar', 'copilot-ai-agents')
    .eq('status', 'live')
    .order('published_at', { ascending: false })
  const blogPosts = (dbBlogs && dbBlogs.length > 0) ? dbBlogs : SEED_BLOG.filter(b => b.pillar === 'copilot-ai-agents')

  return (
    <>
      <section className="hero" style={{ paddingTop: 72, paddingBottom: 60 }}>
        <HeroMesh intensity="reduced" />
        <div className="wrap hero-inner">
          <div className="eyebrow"><span className="dot" />Copilot & AI Agents</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, maxWidth: 720 }}>
            Autonomous agents for Microsoft business apps — now.
          </h1>
          <p style={{ marginTop: 16, maxWidth: 580, color: 'var(--text-muted)', fontSize: '1rem' }}>
            Cut through the AI noise with focused coverage of Copilot Studio, multi-agent orchestration, cross-app handoffs, and everything else that moves the needle for implementers in the Microsoft AI ecosystem.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow"><span className="dot" />Pulse — Copilot & AI Agents</div>
            <h2>Latest updates for this pillar</h2>
          </div>
          <PulseGrid items={pulseItems} limit={10} />
        </div>
      </section>

      {/* ── Latest Blog Posts for Copilot & AI Agents ── */}
      <section className="section" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow"><span className="dot" />Articles &amp; Deep Dives</div>
            <h2>In-Depth Copilot &amp; Agent Analysis</h2>
            <p>Architectural blueprints, orchestration frameworks, and practical implementation guides.</p>
          </div>
          <BlogGrid posts={blogPosts} limit={6} />
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Link href="/blog?pillar=copilot-ai-agents" style={{ color: 'var(--azure)', fontSize: '0.88rem', fontFamily: '"IBM Plex Mono", monospace' }}>
              View all Copilot &amp; AI Agent articles →
            </Link>
          </div>
        </div>
      </section>

      <RelatedGuides guides={RELATED_GUIDES} eyebrowLabel="Copilot &amp; AI Agent Guides" />
    </>
  )
}
