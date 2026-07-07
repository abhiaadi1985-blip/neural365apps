import type { Metadata } from 'next'
import HeroMesh from '@/components/hero-mesh'
import { PulseGrid } from '@/components/pulse-grid'
import type { PulseItem } from '@/components/pulse-grid'
import RelatedGuides from '@/components/related-guides'
import type { GuideStub } from '@/components/related-guides'

export const metadata: Metadata = {
  title: 'Copilot & AI Agents — neural365apps',
  description: 'Copilot Studio, multi-agent orchestration, cross-app handoffs — focused coverage of everything that moves the needle for D365 AI implementers.',
}

const PILLAR_ITEMS: PulseItem[] = [
  { id: 'c1', lane: 'new', pillar: 'copilot-ai-agents', title: 'Dataverse generative answers GA', summary: 'GA grounding over Dataverse tables for Copilot Studio agents enables richer, plug-in-free experiences.', sourceUrl: '#', sourceName: 'Microsoft Blog', publishedAt: '3d ago' },
  { id: 'c2', lane: 'coming', pillar: 'copilot-ai-agents', title: 'Autonomous reconciliation agents', summary: 'Preview agents that propose and explain journal matches, with a human approval step before posting.', sourceUrl: '#', sourceName: 'Roadmap', publishedAt: 'roadmap' },
  { id: 'c3', lane: 'coming', pillar: 'copilot-ai-agents', title: 'Cross-app agent handoffs', summary: 'An agent started in Power Apps that can hand off context to a Copilot Studio agent mid-task.', sourceUrl: '#', sourceName: 'Roadmap', publishedAt: 'roadmap' },
]

const RELATED_GUIDES: GuideStub[] = [
  { slug: 'copilot-studio-dataverse',   title: 'Set up a Copilot Studio agent in Dataverse',     isPremium: false },
  { slug: 'agent-handoffs',             title: 'Cross-app agent handoffs, explained',              isPremium: false },
  { slug: 'reconciliation-agents-setup', title: 'Set up autonomous reconciliation agents',         isPremium: true  },
]

export default function CopilotPage() {
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
          {/* DECISIONS.md FLAG: intro copy above drafted by agent; review before public launch */}
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow"><span className="dot" />Pulse — Copilot & AI Agents</div>
            <h2>Latest updates for this pillar</h2>
          </div>
          <PulseGrid items={PILLAR_ITEMS} limit={10} />
        </div>
      </section>
      <RelatedGuides guides={RELATED_GUIDES} eyebrowLabel="Copilot &amp; AI Agent Guides" />
    </>
  )
}
