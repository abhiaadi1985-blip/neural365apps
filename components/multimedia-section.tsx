'use client'

import { useState } from 'react'
import { MediaRow } from '@/components/media-row'
import type { MediaItem } from '@/components/media-row'
import ModalPlayer from '@/components/modal-player'
import { landing } from '@/app/copy'

const SEED_SHORTS: MediaItem[] = [
  {
    id: 's-ns03',
    kind: 'short',
    badge: 'NS03',
    category: 'Agent Architecture',
    title: 'D365 Procurement Agent: Blast Radius & Pegging Analysis',
    durationSec: 81,
    href: '/guides/procurement-agent-impact-analysis',
    src: '/shorts/ns03-procurement-agent.mp4',
    thumbnailUrl: '/shorts/ns03-thumb.png',
  },
  {
    id: 's1',
    kind: 'short',
    badge: 'NS01',
    category: 'Orchestration Explainer',
    title: 'Multi-Agent Intent Routing & Dynamic Fallbacks in Copilot Studio',
    durationSec: 92,
    href: '/guides/copilot-studio-dataverse',
  },
  {
    id: 's2',
    kind: 'short',
    badge: 'NS02',
    category: 'AI Reasoning Breakdown',
    title: 'How Autonomous Finance Agents Reason Over Ledger Variances',
    durationSec: 76,
    href: '/guides/finance-variance-narratives',
  },
  {
    id: 's3',
    kind: 'short',
    badge: 'NS04',
    category: 'Data Platform Deep Dive',
    title: 'Dataverse Virtual Tables & External REST APIs Demystified',
    durationSec: 85,
    href: '/guides/virtual-table-api',
  },
  {
    id: 's4',
    kind: 'short',
    badge: 'NS05',
    category: 'Process Automation',
    title: 'Supply Chain Anomaly Detection & Autonomous Escalation Gates',
    durationSec: 70,
    href: '/guides/supply-chain-alerts',
  },
]

const SEED_PODCASTS: MediaItem[] = [
  {
    id: 'p-deep-1',
    kind: 'podcast',
    badge: 'DEEP DIVE',
    category: 'Roundtable Analysis',
    title: 'Architecting Autonomous Enterprise Agents: Memory, Grounding & Safety Gates',
    durationSec: 1042,
    href: '/guides/autonomous-agents-architecture',
  },
  {
    id: 'p1',
    kind: 'podcast',
    badge: 'MICRO-BRIEF',
    category: 'Executive Strategy',
    title: 'Why reconciliation agents need an autonomous human gate',
    durationSec: 294,
    href: '/guides/reconciliation-agents',
  },
  {
    id: 'p-deep-2',
    kind: 'podcast',
    badge: 'DEEP DIVE',
    category: 'Data Platform Debate',
    title: 'Dataverse to Microsoft Fabric Direct Lake: Storage Governance & Cost Model',
    durationSec: 915,
    href: '/guides/fabric-retention',
  },
  {
    id: 'p3',
    kind: 'podcast',
    badge: 'MICRO-BRIEF',
    category: 'Ecosystem Shift',
    title: 'Cross-app agent handoffs: Dynamics 365 meets Microsoft 365 Copilot',
    durationSec: 330,
    href: '/guides/agent-handoffs',
  },
]

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function MultimediaSection({
  shorts = SEED_SHORTS,
  podcasts = SEED_PODCASTS,
}: {
  shorts?: MediaItem[]
  podcasts?: MediaItem[]
}) {
  const [modalSrc, setModalSrc] = useState<string | null>(null)
  const [modalKind, setModalKind] = useState<'video' | 'audio'>('video')
  const [modalIsVertical, setModalIsVertical] = useState(false)
  const [modalLabel, setModalLabel] = useState(landing.modal.label)
  const [modalOpen, setModalOpen] = useState(false)

  function openMediaItem(item: MediaItem) {
    setModalSrc(item.src || null)
    setModalKind(item.kind === 'podcast' ? 'audio' : 'video')
    setModalIsVertical(item.kind === 'short')
    setModalLabel(`${item.title} · ${formatDuration(item.durationSec)}`)
    setModalOpen(true)
  }

  return (
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
          items={shorts}
          title={landing.multimedia.shorts.title}
          cadenceLabel={landing.multimedia.shorts.cadence}
          onItemPlay={openMediaItem}
        />

        <MediaRow
          kind="podcast"
          items={podcasts}
          title={landing.multimedia.podcasts.title}
          cadenceLabel={landing.multimedia.podcasts.cadence}
          onItemPlay={openMediaItem}
        />
      </div>

      <ModalPlayer
        src={modalSrc}
        kind={modalKind}
        isVertical={modalIsVertical}
        label={modalLabel}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}
