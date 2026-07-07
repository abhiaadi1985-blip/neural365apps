import type { Metadata } from 'next'
import HeroMesh from '@/components/hero-mesh'
import { PulseGrid } from '@/components/pulse-grid'
import type { PulseItem } from '@/components/pulse-grid'
import RelatedGuides from '@/components/related-guides'
import type { GuideStub } from '@/components/related-guides'

export const metadata: Metadata = {
  title: 'Dataverse & Power Platform — neural365apps',
  description: 'Follow shifts in Dataverse and Power Platform that change what low-code makers can do — generative answers, virtual tables, and more.',
}

const PILLAR_ITEMS: PulseItem[] = [
  { id: 'd1', lane: 'new', pillar: 'dataverse-power-platform', title: 'Dataverse generative answers GA', summary: 'Generally available grounding over Dataverse tables for Copilot Studio agents, no plug-in required.', sourceUrl: '#', sourceName: 'Microsoft Blog', publishedAt: '3d ago' },
  { id: 'd2', lane: 'coming', pillar: 'dataverse-power-platform', title: 'Cross-app agent handoffs', summary: 'An agent started in Power Apps that can hand off context to a Copilot Studio agent mid-task.', sourceUrl: '#', sourceName: 'Roadmap', publishedAt: 'roadmap' },
  { id: 'd3', lane: 'architecture', pillar: 'dataverse-power-platform', title: 'Fabric-linked retention defaults', summary: 'Long-term Dataverse retention now flows through Fabric-managed policies by default for new environments.', sourceUrl: '#', sourceName: 'Microsoft Learn', publishedAt: '5d ago' },
  { id: 'd4', lane: 'architecture', pillar: 'dataverse-power-platform', title: 'Virtual table connector limits', summary: 'Updated throughput guidance for virtual tables against high-volume external systems.', sourceUrl: '#', sourceName: 'Microsoft Learn', publishedAt: '1w ago' },
]

const RELATED_GUIDES: GuideStub[] = [
  { slug: 'copilot-studio-dataverse',   title: 'Set up a Copilot Studio agent in Dataverse',    isPremium: false },
  { slug: 'virtual-table-api',          title: 'Wire a virtual table to an external API',         isPremium: false },
  { slug: 'fabric-retention',           title: "What Fabric-linked retention means for you",       isPremium: true  },
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
