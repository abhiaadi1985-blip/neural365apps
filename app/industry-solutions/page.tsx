import type { Metadata } from 'next'
import HeroMesh from '@/components/hero-mesh'
import { PulseGrid } from '@/components/pulse-grid'
import RelatedGuides from '@/components/related-guides'
import type { GuideStub } from '@/components/related-guides'
import { SEED_PULSE } from '@/lib/seed-pulse'

export const metadata: Metadata = {
  title: 'Industry Solutions — neural365 COMMUNITY',
  description: 'Purpose-built AI for Manufacturing, Retail, Healthcare and beyond — pre-built agent templates, vertical Copilot features, and the roadmap items that matter for your sector.',
}

const PILLAR_ITEMS = SEED_PULSE.filter(i => i.pillar === 'industry-solutions')

const RELATED_GUIDES: GuideStub[] = [
  { slug: 'manufacturing-agents',   title: 'Industry agent templates: Manufacturing overview',  isPremium: false },
  { slug: 'retail-copilot',         title: 'Copilot for Retail: what\'s shipping in Wave 2',     isPremium: true  },
]

export default function IndustrySolutionsPage() {
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
          {/* DECISIONS.md FLAG: intro copy above drafted by agent; review before public launch */}
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow"><span className="dot" />Pulse — Industry Solutions</div>
            <h2>Latest updates for this pillar</h2>
          </div>
          <PulseGrid items={PILLAR_ITEMS} limit={10} />
        </div>
      </section>
      <RelatedGuides guides={RELATED_GUIDES} eyebrowLabel="Industry Solution Guides" />
    </>
  )
}
