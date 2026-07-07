import type { Metadata } from 'next'
import HeroMesh from '@/components/hero-mesh'
import { PulseGrid } from '@/components/pulse-grid'
import type { PulseItem } from '@/components/pulse-grid'
import RelatedGuides from '@/components/related-guides'
import type { GuideStub } from '@/components/related-guides'

export const metadata: Metadata = {
  title: 'D365 Finance & Operations — neural365apps',
  description: 'Track AI and Copilot capabilities landing in Dynamics 365 Finance & Operations — from variance narratives to autonomous reconciliation agents.',
}

const PILLAR_ITEMS: PulseItem[] = [
  { id: 'f1', lane: 'new',          pillar: 'd365-fo', title: 'Finance Copilot: variance narratives',  summary: 'Auto-generated written explanations for budget-to-actual variances, surfaced directly in the workspace.',           sourceUrl: '#', sourceName: 'Microsoft Learn', publishedAt: '2d ago'  },
  { id: 'f2', lane: 'new',          pillar: 'd365-fo', title: 'Supply Chain anomaly alerts',           summary: 'Real-time exception flags for inventory and demand forecasts, tuned per warehouse.',                               sourceUrl: '#', sourceName: 'Release Wave',   publishedAt: '3d ago'  },
  { id: 'f3', lane: 'coming',       pillar: 'd365-fo', title: 'Autonomous reconciliation agents',      summary: 'Preview agents that propose and explain journal matches, with a human approval step before posting.',               sourceUrl: '#', sourceName: 'Roadmap',        publishedAt: 'roadmap' },
  { id: 'f4', lane: 'architecture', pillar: 'd365-fo', title: 'Unified dev environment changes',       summary: 'Build and deploy pipeline updates for the unified D365 developer experience, fewer manual sync steps.',             sourceUrl: '#', sourceName: 'Microsoft Blog',  publishedAt: '6d ago'  },
]

const RELATED_GUIDES: GuideStub[] = [
  { slug: 'finance-variance-narratives',   title: 'Enable Finance Copilot variance narratives',    isPremium: false },
  { slug: 'supply-chain-alerts',           title: 'Configure Supply Chain anomaly alerts',          isPremium: false },
  { slug: 'reconciliation-agents-setup',   title: 'Set up autonomous reconciliation agents',        isPremium: true  },
]

export default function D365FOPage() {
  return (
    <>
      <section className="hero" style={{ paddingTop: 72, paddingBottom: 60 }}>
        <HeroMesh intensity="reduced" />
        <div className="wrap hero-inner">
          <div className="eyebrow"><span className="dot" />D365 Finance &amp; Operations</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, maxWidth: 720 }}>
            Finance, Supply Chain &amp; ERP — AI-accelerated.
          </h1>
          <p style={{ marginTop: 16, maxWidth: 580, color: 'var(--text-muted)', fontSize: '1rem' }}>
            Track the latest Copilot capabilities landing in D365 F&amp;O — from variance narratives to autonomous reconciliation agents — and get hands-on guides to configure them in your environment.
          </p>
          {/* DECISIONS.md FLAG: intro copy above drafted by agent; review before public launch */}
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow"><span className="dot" />Pulse — D365 F&amp;O</div>
            <h2>Latest updates for this pillar</h2>
          </div>
          <PulseGrid items={PILLAR_ITEMS} limit={10} />
        </div>
      </section>

      <RelatedGuides guides={RELATED_GUIDES} eyebrowLabel="D365 F&O Guides" />
    </>
  )
}
