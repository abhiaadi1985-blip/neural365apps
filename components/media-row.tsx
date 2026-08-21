'use client'

import { useRef } from 'react'

export interface MediaItem {
  id:           string
  title:        string
  durationSec:  number
  thumbnailUrl?: string
  href:         string
  kind:         'short' | 'podcast'
}

// ── MediaCard ──────────────────────────────────────────────
export function MediaCard({ item, onPlay }: { item: MediaItem; onPlay?: () => void }) {
  const dur = formatDuration(item.durationSec)
  const isShort = item.kind === 'short'

  return (
    <div suppressHydrationWarning className="media-card" onClick={onPlay} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onPlay?.()}
      aria-label={`${item.title} — ${dur}`}>
      <div className={`media-thumb ${isShort ? 'short' : ''}`}>
        {isShort ? '▶' : '🎧'}
      </div>
      <div className="media-body">
        <h4>{item.title}</h4>
        <div className="dur">{dur}</div>
      </div>
    </div>
  )
}

// ── MediaRow ──────────────────────────────────────────────
export function MediaRow({
  kind,
  items,
  title,
  cadenceLabel,
  onItemPlay,
}: {
  kind:         'short' | 'podcast'
  items:        MediaItem[]
  title:        string
  cadenceLabel: string
  onItemPlay?:  (item: MediaItem) => void
}) {
  const rowRef = useRef<HTMLDivElement>(null)

  return (
    <div className="media-block">
      <div className="media-block-head">
        <h3>{title}</h3>
        <span className="cadence">{cadenceLabel}</span>
      </div>
      <div className="scroll-row" ref={rowRef}>
        {items.map(item => (
          <MediaCard key={item.id} item={item} onPlay={() => onItemPlay?.(item)} />
        ))}
      </div>
    </div>
  )
}

// ── Helper ─────────────────────────────────────────────────
function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
