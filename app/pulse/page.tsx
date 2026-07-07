import type { Metadata } from 'next'
import Link from 'next/link'
import { PulseGrid } from '@/components/pulse-grid'
import type { PulseItem } from '@/components/pulse-grid'
import { landing } from '@/app/copy'

export const metadata: Metadata = {
  title: 'The Pulse — neural365apps',
  description: 'Full filterable feed of Microsoft Dynamics 365, Power Platform, and Copilot AI feature updates — new, coming, and architecture shifts.',
}

// Seed data — same 9 cards as landing, seeded for layout validation.
// Live data will come from /api/pulse once Hermes is running.
const SEED: PulseItem[] = [
  { id: '1', lane: 'new',          pillar: 'd365-fo',                  title: 'Finance Copilot: variance narratives',     summary: 'Auto-generated written explanations for budget-to-actual variances, surfaced directly in the workspace.', sourceUrl: '#', sourceName: 'Microsoft Learn',  publishedAt: '2d ago'  },
  { id: '2', lane: 'new',          pillar: 'dataverse-power-platform', title: 'Dataverse generative answers GA',           summary: 'Generally available grounding over Dataverse tables for Copilot Studio agents, no plug-in required.',       sourceUrl: '#', sourceName: 'Microsoft Blog',  publishedAt: '3d ago'  },
  { id: '3', lane: 'new',          pillar: 'd365-fo',                  title: 'Supply Chain anomaly alerts',              summary: 'Real-time exception flags for inventory and demand forecasts, tuned per warehouse.',                         sourceUrl: '#', sourceName: 'Release Wave',   publishedAt: '3d ago'  },
  { id: '4', lane: 'coming',       pillar: 'copilot-ai-agents',        title: 'Autonomous reconciliation agents',         summary: 'Preview agents that propose and explain journal matches, with a human approval step before posting.',          sourceUrl: '#', sourceName: 'Roadmap',        publishedAt: 'roadmap' },
  { id: '5', lane: 'coming',       pillar: 'dataverse-power-platform', title: 'Cross-app agent handoffs',                summary: 'An agent started in Power Apps that can hand off context to a Copilot Studio agent mid-task.',                sourceUrl: '#', sourceName: 'Roadmap',        publishedAt: 'roadmap' },
  { id: '6', lane: 'coming',       pillar: 'industry-solutions',       title: 'Industry agent templates: Manufacturing',  summary: 'Pre-built agent scaffolds for shop-floor exception handling and planner co-review.',                           sourceUrl: '#', sourceName: 'Roadmap',        publishedAt: 'roadmap' },
  { id: '7', lane: 'architecture', pillar: 'dataverse-power-platform', title: 'Fabric-linked retention defaults',        summary: 'Long-term Dataverse retention now flows through Fabric-managed policies by default for new environments.',      sourceUrl: '#', sourceName: 'Microsoft Learn',  publishedAt: '5d ago'  },
  { id: '8', lane: 'architecture', pillar: 'd365-fo',                  title: 'Unified dev environment changes',          summary: 'Build and deploy pipeline updates for the unified D365 developer experience, fewer manual sync steps.',         sourceUrl: '#', sourceName: 'Microsoft Blog',  publishedAt: '6d ago'  },
  { id: '9', lane: 'architecture', pillar: 'dataverse-power-platform', title: 'Virtual table connector limits',           summary: 'Updated throughput guidance for virtual tables against high-volume external systems.',                          sourceUrl: '#', sourceName: 'Microsoft Learn',  publishedAt: '1w ago'  },
]

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

// This is a Server Component; filter state is passed via searchParams
export default async function PulsePage({
  searchParams,
}: {
  searchParams: Promise<{ pillar?: string; lane?: string }>
}) {
  const params = await searchParams
  const activePillar = params.pillar ?? 'all'
  const activeLane   = params.lane   ?? 'all'

  const filtered = SEED.filter(item =>
    (activePillar === 'all' || item.pillar === activePillar) &&
    (activeLane   === 'all' || item.lane   === activeLane)
  )

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
      <section style={{ padding: '24px 0', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
        <div className="wrap" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
              }}
            >
              {p.label}
            </Link>
          ))}
          <span style={{ color: 'var(--line)' }}>|</span>
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
          {filtered.length > 0
            ? <PulseGrid items={filtered} limit={100} />
            : (
              <p style={{ color: 'var(--text-muted)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.88rem' }}>
                No items match this filter combination.
              </p>
            )
          }
        </div>
      </section>
    </>
  )
}
