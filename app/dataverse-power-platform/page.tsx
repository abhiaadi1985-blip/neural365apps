import type { Metadata } from 'next'
import HeroMesh from '@/components/hero-mesh'
import { PulseGrid } from '@/components/pulse-grid'
import RelatedGuides from '@/components/related-guides'
import type { GuideStub } from '@/components/related-guides'
import { SEED_PULSE } from '@/lib/seed-pulse'

export const metadata: Metadata = {
  title: 'Dataverse & Power Platform — neural365 COMMUNITY',
  description: 'Follow shifts in Dataverse and Power Platform that change what low-code makers can do — generative answers, virtual tables, and more.',
}

const PILLAR_ITEMS = SEED_PULSE.filter(i => i.pillar === 'dataverse-power-platform')

const RELATED_GUIDES: GuideStub[] = [
  { slug: 'copilot-studio-dataverse',   title: 'Set up a Copilot Studio agent in Dataverse',    isPremium: false },
  { slug: 'virtual-table-api',          title: 'Wire a virtual table to an external API',         isPremium: false },
  { slug: 'fabric-retention',           title: 'What the new Dataverse retention policy means for your data', isPremium: true  },
]

export default function DataversePage() {
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
          {/* DECISIONS.md FLAG: intro copy above drafted by agent; review before public launch */}
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow"><span className="dot" />Pulse — Dataverse & Power Platform</div>
            <h2>Latest updates for this pillar</h2>
          </div>
          <PulseGrid items={PILLAR_ITEMS} limit={10} />
        </div>
      </section>
      <RelatedGuides guides={RELATED_GUIDES} eyebrowLabel="Dataverse &amp; Power Platform Guides" />
    </>
  )
}
