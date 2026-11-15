import type { Metadata } from 'next'
import Link from 'next/link'
import { PulseGrid } from '@/components/pulse-grid'
import type { PulseItem } from '@/lib/seed-pulse'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { getPulseCutoffDate } from '@/lib/pulse-lifecycle'

export const metadata: Metadata = {
  title: 'Pulse Archive — neural365 COMMUNITY',
  description: 'Historical archive of Microsoft Dynamics 365, Power Platform, and Copilot AI updates older than 90 days.',
}

const PILLARS = [
  { value: 'all',                       label: 'All pillars' },
  { value: 'd365-fo',                   label: 'D365 F&O' },
  { value: 'dataverse-power-platform',  label: 'Dataverse & Power Platform' },
  { value: 'copilot-ai-agents',         label: 'Copilot & AI Agents' },
  { value: 'industry-solutions',        label: 'Industry Solutions' },
]

const LANES = [
  { value: 'all',          label: 'All lanes' },
  { value: 'new',          label: "What's New" },
  { value: 'coming',       label: "What's Coming" },
  { value: 'architecture', label: 'Architecture Shifts' },
]

export const dynamic = 'force-dynamic'

export default async function PulseArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ pillar?: string; lane?: string }>
}) {
  const params = await searchParams
  const activePillar = params.pillar ?? 'all'
  const activeLane   = params.lane   ?? 'all'

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const cutoff = getPulseCutoffDate()

  let query = supabase
    .from('pulse_items')
    .select('*')
    .eq('status', 'live')
    .lt('published_at', cutoff)
    .order('published_at', { ascending: false })

  if (activePillar !== 'all') {
    query = query.eq('pillar', activePillar)
  }
  if (activeLane !== 'all') {
    query = query.eq('lane', activeLane)
  }

  const { data } = await query
  const items: PulseItem[] = (data as unknown as PulseItem[]) || []

  return (
    <>
      {/* ── Page header ── */}
      <section style={{ padding: '64px 0 48px', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span className="dot" style={{ background: 'var(--text-muted)' }} />
            <span>ARCHIVE (OLDER THAN 90 DAYS)</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, maxWidth: 720, marginTop: 12 }}>
            Pulse Archive
          </h1>
          <p className="cadence" style={{ marginTop: 12, color: 'var(--text-muted)' }}>
            Historical Microsoft release-wave features and architecture shifts. Looking for active wave items?{' '}
            <Link href="/pulse" style={{ color: 'var(--azure)', textDecoration: 'none' }}>
              View Fresh Feed (last 90 days) →
            </Link>
          </p>
        </div>
      </section>

      {/* ── Filters ── */}
      <section style={{ padding: '16px 0', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
        <div className="wrap filter-bar">
          <Link
            href="/pulse"
            style={{
              padding: '6px 14px',
              borderRadius: 7,
              fontSize: '0.82rem',
              fontWeight: 500,
              border: '1px solid var(--azure)',
              color: 'var(--azure)',
              background: 'var(--azure-dim)',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            ← Fresh Feed
          </Link>
          <span style={{ color: 'var(--line)', flexShrink: 0 }}>|</span>
          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
            FILTER ARCHIVE:
          </span>
          {PILLARS.map(p => (
            <Link key={p.value}
              href={`/pulse/archive?pillar=${p.value}&lane=${activeLane}`}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                fontSize: '0.82rem',
                fontWeight: 500,
                border: '1px solid',
                borderColor: activePillar === p.value ? 'var(--azure)' : 'var(--line)',
                color:       activePillar === p.value ? 'var(--azure)' : 'var(--text-muted)',
                background:  activePillar === p.value ? 'var(--azure-dim)' : 'transparent',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {p.label}
            </Link>
          ))}
          <span style={{ color: 'var(--line)', flexShrink: 0 }}>|</span>
          {LANES.map(l => (
            <Link key={l.value}
              href={`/pulse/archive?pillar=${activePillar}&lane=${l.value}`}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                fontSize: '0.82rem',
                fontWeight: 500,
                border: '1px solid',
                borderColor: activeLane === l.value ? 'var(--azure)' : 'var(--line)',
                color:       activeLane === l.value ? 'var(--azure)' : 'var(--text-muted)',
                background:  activeLane === l.value ? 'var(--azure-dim)' : 'transparent',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Grid ── */}
      <section style={{ padding: '48px 0 84px' }}>
        <div className="wrap">
          {items.length > 0 ? (
            <PulseGrid items={items} limit={100} />
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🏛️</div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text)', marginBottom: 8, fontWeight: 600 }}>
                No archived items found
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.5 }}>
                {activePillar !== 'all' || activeLane !== 'all'
                  ? 'No archived pulses match this filter combination.'
                  : 'Items automatically move to this archive 90 days after publication.'}
              </p>
              <Link href="/pulse" className="btn btn-secondary btn-sm">
                ← Back to Fresh Feed
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
