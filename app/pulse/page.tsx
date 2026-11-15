import type { Metadata } from 'next'
import Link from 'next/link'
import { PulseGrid } from '@/components/pulse-grid'
import type { PulseItem } from '@/lib/seed-pulse'
import { landing } from '@/app/copy'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { getPulseCutoffDate } from '@/lib/pulse-lifecycle'

export const metadata: Metadata = {
  title: 'The Pulse — neural365 COMMUNITY',
  description: 'Full filterable feed of Microsoft Dynamics 365, Power Platform, and Copilot AI feature updates — new, coming, and architecture shifts.',
}

import { SEED_PULSE } from '@/lib/seed-pulse'

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

// This is a Server Component; filter state is passed via searchParams
export default async function PulsePage({
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
    .gte('published_at', cutoff)
    .order('published_at', { ascending: false })
    
  if (activePillar !== 'all') {
    query = query.eq('pillar', activePillar)
  }
  if (activeLane !== 'all') {
    query = query.eq('lane', activeLane)
  }

  const { data, error } = await query
  
  // If Supabase returns no data (DB unconfigured / dev fallback), fallback only when data is null
  let dbItems: PulseItem[] = []
  if (data !== null) {
    dbItems = data as unknown as PulseItem[]
  } else if (process.env.NODE_ENV !== 'production') {
    dbItems = SEED_PULSE.filter(item =>
      (activePillar === 'all' || item.pillar === activePillar) &&
      (activeLane   === 'all' || item.lane   === activeLane)
    ) as unknown as PulseItem[]
  }
  
  const filtered = dbItems

  return (
    <>
      {/* ── Page header ── */}
      <section style={{ padding: '64px 0 48px', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="eyebrow"><span className="dot" />{landing.pulse.eyebrow}</div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, maxWidth: 720, marginTop: 12 }}>
            {landing.pulse.h2}
          </h1>
          <p className="cadence" style={{ marginTop: 12 }}>{landing.pulse.cadence}</p>
        </div>
      </section>

      {/* ── Filters ── */}
      <section style={{ padding: '16px 0', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
        <div className="wrap filter-bar">
          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
            FILTER:
          </span>
          {PILLARS.map(p => (
            <Link key={p.value}
              href={`/pulse?pillar=${p.value}&lane=${activeLane}`}
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
              href={`/pulse?pillar=${activePillar}&lane=${l.value}`}
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

          <span style={{ color: 'var(--line)', flexShrink: 0 }}>|</span>
          <Link
            href="/pulse/archive"
            style={{
              padding: '6px 14px',
              borderRadius: 7,
              fontSize: '0.82rem',
              fontWeight: 500,
              border: '1px solid var(--line)',
              color: 'var(--text-muted)',
              background: 'transparent',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              marginLeft: 'auto',
            }}
          >
            Archive (90d+) →
          </Link>
        </div>
      </section>

      {/* ── Grid ── */}
      <section style={{ padding: '48px 0 84px' }}>
        <div className="wrap">
          {filtered.length > 0
            ? <PulseGrid items={filtered} limit={100} />
            : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px 24px',
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>📦</div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text)', marginBottom: 8, fontWeight: 600 }}>
                  No pulses found in the last 90 days
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.5 }}>
                  {activePillar !== 'all' || activeLane !== 'all'
                    ? 'No fresh items match this filter combination. Check the archive for older releases.'
                    : 'All older releases and architecture shifts are preserved in the permanent archive.'}
                </p>
                <Link href={`/pulse/archive?pillar=${activePillar}&lane=${activeLane}`} className="btn btn-secondary btn-sm">
                  View in Archive (90d+) →
                </Link>
              </div>
            )
          }
        </div>
      </section>
    </>
  )
}
