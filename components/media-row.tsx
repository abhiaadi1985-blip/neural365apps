'use client'

import { useRef } from 'react'

export interface MediaItem {
  id:           string
  title:        string
  durationSec:  number
  thumbnailUrl?: string
  href:         string
  kind:         'short' | 'podcast'
  src?:         string
  category?:    string
  badge?:       string
}

// ── MediaCard ──────────────────────────────────────────────
export function MediaCard({ item, onPlay }: { item: MediaItem; onPlay?: () => void }) {
  const dur = formatDuration(item.durationSec)
  const isShort = item.kind === 'short'

  return (
    <div
      suppressHydrationWarning
      className="media-card"
      onClick={onPlay}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onPlay?.()}
      aria-label={`${item.title} — ${dur}`}
    >
      <div
        className={`media-thumb ${isShort ? 'short' : ''}`}
        style={
          item.thumbnailUrl
            ? {
                backgroundImage: `url(${item.thumbnailUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
              }
            : undefined
        }
      >
        <span
          style={
            item.thumbnailUrl
              ? {
                  background: 'rgba(6, 10, 18, 0.72)',
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(47, 134, 255, 0.45)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                  color: '#FFF',
                  fontSize: '1rem',
                }
              : undefined
          }
        >
          {isShort ? '▶' : '🎧'}
        </span>
      </div>
      <div className="media-body">
        {(item.category || item.badge) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 6,
              flexWrap: 'wrap',
            }}
          >
            {item.badge && (
              <span
                style={{
                  fontSize: '0.62rem',
                  fontFamily: '"IBM Plex Mono", monospace',
                  padding: '1px 6px',
                  borderRadius: 4,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  background: item.badge.includes('DEEP')
                    ? 'rgba(139, 92, 246, 0.15)'
                    : 'rgba(47, 134, 255, 0.12)',
                  color: item.badge.includes('DEEP') ? '#A78BFA' : 'var(--azure)',
                  border: `1px solid ${
                    item.badge.includes('DEEP')
                      ? 'rgba(139, 92, 246, 0.35)'
                      : 'rgba(47, 134, 255, 0.25)'
                  }`,
                }}
              >
                {item.badge}
              </span>
            )}
            {item.category && (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontFamily: '"IBM Plex Mono", monospace',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  fontWeight: 500,
                }}
              >
                {item.category}
              </span>
            )}
          </div>
        )}
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
