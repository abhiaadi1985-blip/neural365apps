import Link from 'next/link'
import type { Lane, Pillar } from '@/lib/design-tokens'
import { laneLabels } from '@/lib/design-tokens'

import type { PulseItem } from '@/lib/seed-pulse'

// ── PulseCard ──────────────────────────────────────────────
export function PulseCard({ item }: { item: PulseItem }) {
  const rawDate = item.published_at || item.publishedAt || ''
  const relativeTime = formatRelative(rawDate)
  const pillarShort  = pillarShortLabel(item.pillar)

  return (
    <Link href={`/pulse/${item.id}`}
      className="pulse-card" style={{ display: 'block' }}>
      <h4>{item.title}</h4>
      <p>{item.summary}</p>
      <div className="pulse-meta">
        <span>{pillarShort}</span>
        <span>{relativeTime}</span>
      </div>
    </Link>
  )
}

// ── PulseGrid ──────────────────────────────────────────────
const lanes: Lane[] = ['new', 'coming', 'architecture']

export function PulseGrid({
  items,
  limit = 3,
  showSampleNote = false,
}: {
  items: PulseItem[]
  limit?: number
  showSampleNote?: boolean
}) {
  const byLane = (lane: Lane) =>
    items.filter(i => i.lane === lane).slice(0, limit)

  return (
    <>
      <div className="pulse-grid">
        {lanes.map(lane => (
          <div key={lane} className={`lane ${lane === 'architecture' ? 'arch' : lane}`}>
            <h3>
              <span className="swatch" />
              {laneLabels[lane]}
            </h3>
            <div className="lane-stack">
              {byLane(lane).map(item => (
                <PulseCard key={item.id} item={item} />
              ))}
              {byLane(lane).length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                  No items yet — check back after the next Hermes run.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {showSampleNote && (
        <p className="sample-note">
          ↑ sample cards shown for layout — live cards populate automatically once connected to source feeds.
        </p>
      )}
    </>
  )
}

// ── Helpers ────────────────────────────────────────────────
function formatRelative(iso?: string | null): string {
  if (!iso) return ''
  // If already a label (e.g. "2d ago", "roadmap") pass through
  if (!/^\d{4}/.test(iso)) return iso
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'today'
  if (days === 1) return '1d ago'
  if (days < 7)  return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return weeks === 1 ? '1w ago' : `${weeks}w ago`
}

function pillarShortLabel(pillar: Pillar): string {
  const map: Record<Pillar, string> = {
    'd365-fo':                    'D365 ERP',
    'dataverse-power-platform':   'Power Platform',
    'copilot-ai-agents':          'Copilot & AI Agents',
    'industry-solutions':         'Industry Solutions',
  }
  return map[pillar]
}
