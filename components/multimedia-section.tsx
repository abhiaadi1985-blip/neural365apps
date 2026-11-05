'use client'

import { useState } from 'react'
import { MediaRow } from '@/components/media-row'
import type { MediaItem } from '@/components/media-row'
import ModalPlayer from '@/components/modal-player'
import { landing } from '@/app/copy'

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
  const [modalLabel, setModalLabel] = useState(landing.modal.label)
  const [modalOpen, setModalOpen] = useState(false)

  function openMediaItem(item: MediaItem) {
    setModalSrc(null) // placeholder until direct streaming CDN links exist
    setModalKind(item.kind === 'podcast' ? 'audio' : 'video')
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
        label={modalLabel}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}
