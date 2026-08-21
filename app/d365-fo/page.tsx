import type { Metadata } from 'next'
import HeroMesh from '@/components/hero-mesh'
import { PulseGrid } from '@/components/pulse-grid'
import RelatedGuides from '@/components/related-guides'
import type { GuideStub } from '@/components/related-guides'
import { SEED_PULSE } from '@/lib/seed-pulse'

export const metadata: Metadata = {
  title: 'D365 ERP — neural365 COMMUNITY',
  description: 'Track AI and Copilot capabilities landing in Dynamics 365 ERP — from variance narratives to autonomous reconciliation agents.',
}

const PILLAR_ITEMS = SEED_PULSE.filter(i => i.pillar === 'd365-fo')

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
          <div className="eyebrow"><span className="dot" />D365 ERP</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, maxWidth: 720 }}>
            Finance, Supply Chain & ERP — AI-accelerated.
          </h1>
          <p style={{ marginTop: 16, maxWidth: 580, color: 'var(--text-muted)', fontSize: '1rem' }}>
            Track the latest Copilot capabilities landing in D365 ERP — from variance narratives to autonomous reconciliation agents — and get hands-on guides to configure them in your environment.
          </p>
          {/* DECISIONS.md FLAG: intro copy above drafted by agent; review before public launch */}
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow"><span className="dot" />Pulse — D365 ERP</div>
            <h2>Latest updates for this pillar</h2>
          </div>
          <PulseGrid items={PILLAR_ITEMS} limit={10} />
        </div>
      </section>

      <RelatedGuides guides={RELATED_GUIDES} eyebrowLabel="D365 ERP Guides" />
    </>
  )
}
