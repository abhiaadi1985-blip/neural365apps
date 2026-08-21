'use client'

import { useState } from 'react'
import Link from 'next/link'
import HeroMesh from '@/components/hero-mesh'
import { PulseGrid } from '@/components/pulse-grid'
import { MediaRow }  from '@/components/media-row'
import type { MediaItem } from '@/components/media-row'
import SignupForm from '@/components/signup-form'
import ModalPlayer from '@/components/modal-player'
import { landing } from '@/app/copy'
import type { PulseItem } from '@/lib/seed-pulse'

// ── Seed data (mirrors the 9 reference HTML sample cards) ──
const SEED_PULSE: PulseItem[] = [
  {
    id: '1', lane: 'new', pillar: 'd365-fo',
    title:     'Finance Copilot: variance narratives',
    summary:   'Auto-generated written explanations for budget-to-actual variances, surfaced directly in the workspace.',
    sourceUrl: '#', sourceName: 'Microsoft Learn', publishedAt: '2d ago',
  },
  {
    id: '2', lane: 'new', pillar: 'dataverse-power-platform',
    title:     'Dataverse generative answers GA',
    summary:   'Generally available grounding over Dataverse tables for Copilot Studio agents, no plug-in required.',
    sourceUrl: '#', sourceName: 'Microsoft Blog', publishedAt: '3d ago',
  },
  {
    id: '3', lane: 'new', pillar: 'd365-fo',
    title:     'Supply Chain anomaly alerts',
    summary:   'Real-time exception flags for inventory and demand forecasts, tuned per warehouse.',
    sourceUrl: '#', sourceName: 'Release Wave', publishedAt: '3d ago',
  },
  {
    id: '4', lane: 'coming', pillar: 'copilot-ai-agents',
    title:     'Autonomous reconciliation agents',
    summary:   'Preview agents that propose and explain journal matches, with a human approval step before posting.',
    sourceUrl: '#', sourceName: 'Roadmap', publishedAt: 'roadmap',
  },
  {
    id: '5', lane: 'coming', pillar: 'dataverse-power-platform',
    title:     'Cross-app agent handoffs',
    summary:   'An agent started in Power Apps that can hand off context to a Copilot Studio agent mid-task.',
    sourceUrl: '#', sourceName: 'Roadmap', publishedAt: 'roadmap',
  },
  {
    id: '6', lane: 'coming', pillar: 'industry-solutions',
    title:     'Industry agent templates: Manufacturing',
    summary:   'Pre-built agent scaffolds for shop-floor exception handling and planner co-review.',
    sourceUrl: '#', sourceName: 'Roadmap', publishedAt: 'roadmap',
  },
  {
    id: '7', lane: 'architecture', pillar: 'dataverse-power-platform',
    title:     'Dataverse long-term retention via Fabric link',
    summary:   'Dataverse environments on the new retention policy use Fabric as the underlying storage link — what that means for your data lifecycle.',
    sourceUrl: '#', sourceName: 'Microsoft Learn', publishedAt: '5d ago',
  },
  {
    id: '8', lane: 'architecture', pillar: 'd365-fo',
    title:     'Unified dev environment changes',
    summary:   'Build and deploy pipeline updates for the unified D365 developer experience, fewer manual sync steps.',
    sourceUrl: '#', sourceName: 'Microsoft Blog', publishedAt: '6d ago',
  },
  {
    id: '9', lane: 'architecture', pillar: 'dataverse-power-platform',
    title:     'Virtual table connector limits',
    summary:   'Updated throughput guidance for virtual tables against high-volume external systems.',
    sourceUrl: '#', sourceName: 'Microsoft Learn', publishedAt: '1w ago',
  },
]

const SEED_SHORTS: MediaItem[] = [
  { id: 's1', kind: 'short', title: 'Set up a Copilot Studio agent in Dataverse', durationSec: 58,  href: '/guides/copilot-studio-dataverse' },
  { id: 's2', kind: 'short', title: 'Enable Finance variance narratives',          durationSec: 62,  href: '/guides/finance-variance-narratives' },
  { id: 's3', kind: 'short', title: 'Wire a virtual table to an external API',     durationSec: 54,  href: '/guides/virtual-table-api' },
  { id: 's4', kind: 'short', title: 'Configure Supply Chain anomaly alerts',       durationSec: 60,  href: '/guides/supply-chain-alerts' },
]

const SEED_PODCASTS: MediaItem[] = [
  { id: 'p1', kind: 'podcast', title: 'Why reconciliation agents need a human gate',    durationSec: 312, href: '/guides/reconciliation-agents' },
  { id: 'p2', kind: 'podcast', title: 'What the new Dataverse retention policy means for your data',  durationSec: 285, href: '/guides/fabric-retention' },
  { id: 'p3', kind: 'podcast', title: 'Cross-app agent handoffs, explained',             durationSec: 330, href: '/guides/agent-handoffs' },
]

// ── Page ───────────────────────────────────────────────────
export default function HomePage() {
  const [modalSrc,   setModalSrc]   = useState<string | null>(null)
  const [modalKind,  setModalKind]  = useState<'video' | 'audio'>('video')
  const [modalLabel, setModalLabel] = useState(landing.modal.label)

  function openIntroModal() {
    setModalSrc(null)        // placeholder — no real video yet
    setModalKind('video')
    setModalLabel(landing.modal.label)
  }

  function openMediaItem(item: MediaItem) {
    setModalSrc(null)        // placeholder until real media URLs exist
    setModalKind(item.kind === 'podcast' ? 'audio' : 'video')
    setModalLabel(`${item.title} · ${formatDuration(item.durationSec)}`)
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <HeroMesh intensity="full" />
        <div className="wrap hero-inner">
          <div className="eyebrow">
            <span className="dot" />
            {landing.hero.eyebrow}
          </div>
          <h1 style={{ fontSize: 'clamp(2.3rem, 5vw, 3.7rem)', fontWeight: 800, maxWidth: 820 }}>
            {landing.hero.h1}
          </h1>
          <p className="lead" style={{ marginTop: 20, maxWidth: 600, color: 'var(--text-muted)', fontSize: '1.08rem' }}>
            {landing.hero.lead}
          </p>
          <div className="hero-cta">
            <Link href="/pulse" className="btn btn-primary">
              {landing.hero.ctaPrimary}
            </Link>
            <button suppressHydrationWarning className="btn btn-ghost" onClick={openIntroModal}>
              {landing.hero.ctaSecondary}
            </button>
          </div>
        </div>
      </section>

      {/* ── Pulse Preview ── */}
      <section className="section" id="pulse">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">
              <span className="dot" />
              {landing.pulse.eyebrow}
            </div>
            <h2>{landing.pulse.h2}</h2>
            <p className="cadence">{landing.pulse.cadence}</p>
          </div>

          <PulseGrid items={SEED_PULSE} limit={3} showSampleNote />

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Link href="/pulse" style={{ color: 'var(--azure)', fontSize: '0.88rem', fontFamily: '"IBM Plex Mono", monospace' }}>
              {landing.pulse.seeAll}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Multimedia Hub ── */}
      <section className="section" id="multimedia">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">
              <span className="dot" />
              {landing.multimedia.eyebrow}
            </div>
            <h2>{landing.multimedia.h2}</h2>
            <p>{landing.multimedia.lead}</p>
          </div>

          <MediaRow
            kind="short"
            items={SEED_SHORTS}
            title={landing.multimedia.shorts.title}
            cadenceLabel={landing.multimedia.shorts.cadence}
            onItemPlay={openMediaItem}
          />

          <MediaRow
            kind="podcast"
            items={SEED_PODCASTS}
            title={landing.multimedia.podcasts.title}
            cadenceLabel={landing.multimedia.podcasts.cadence}
            onItemPlay={openMediaItem}
          />
        </div>
      </section>

      {/* ── Newsletter ── */}
      <SignupForm />

      {/* ── Modal ── */}
      <ModalPlayer
        src={modalSrc}
        kind={modalKind}
        label={modalLabel}
        onClose={() => setModalSrc(null)}
      />
    </>
  )
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
