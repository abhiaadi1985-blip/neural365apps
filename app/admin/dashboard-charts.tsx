'use client'

interface TopicDatum {
  slug: string
  label: string
  color: string
  count: number
}

interface DashboardChartsProps {
  topicData: TopicDatum[]
  dailyGrowth: { date: string; count: number }[]
  pulseStatus: { live: number; draft: number; mediaPending: number }
}

export default function DashboardCharts({ topicData, dailyGrowth, pulseStatus }: DashboardChartsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* ── Subscribers by Topic ── */}
      <ChartPanel title="Subscribers by Topic">
        <TopicBarChart data={topicData} />
      </ChartPanel>

      {/* ── Pulse Status Breakdown ── */}
      <ChartPanel title="Pulse Status">
        <PulseStatusChart {...pulseStatus} />
      </ChartPanel>

      {/* ── Subscriber Growth (30 days) ── */}
      <div style={{ gridColumn: '1 / -1' }}>
        <ChartPanel title="Subscriber Growth (Last 30 Days)">
          <GrowthLineChart data={dailyGrowth} />
        </ChartPanel>
      </div>
    </div>
  )
}

/* ── Shared panel wrapper ── */
function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      border: '1px solid var(--line)',
      borderRadius: 12,
      background: 'var(--panel)',
      padding: '24px 20px',
    }}>
      <div style={{
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        fontFamily: '"IBM Plex Mono", monospace',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 20,
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

/* ── Horizontal bar chart for topic distribution ── */
function TopicBarChart({ data }: { data: TopicDatum[] }) {
  const max = Math.max(...data.map(d => d.count), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {data.map(d => (
        <div key={d.slug}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 5,
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text)' }}>{d.label}</span>
            <span style={{
              fontSize: '0.78rem',
              color: d.color,
              fontFamily: '"IBM Plex Mono", monospace',
              fontWeight: 600,
            }}>{d.count}</span>
          </div>
          <div style={{
            width: '100%',
            height: 8,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${(d.count / max) * 100}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${d.color}, ${d.color}88)`,
              borderRadius: 4,
              transition: 'width 0.6s ease-out',
              minWidth: d.count > 0 ? 4 : 0,
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Pulse status stacked bar ── */
function PulseStatusChart({ live, draft, mediaPending }: { live: number; draft: number; mediaPending: number }) {
  const total = live + draft + mediaPending
  if (total === 0) {
    return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No pulse items yet.</p>
  }

  const segments = [
    { label: 'Live', count: live, color: '#22c55e' },
    { label: 'Draft', count: draft, color: '#f59e0b' },
    { label: 'Media Pending', count: mediaPending, color: '#a855f7' },
  ]

  return (
    <div>
      {/* Stacked bar */}
      <div style={{
        display: 'flex',
        height: 24,
        borderRadius: 6,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.04)',
        marginBottom: 16,
      }}>
        {segments.map(s => s.count > 0 && (
          <div key={s.label} style={{
            width: `${(s.count / total) * 100}%`,
            height: '100%',
            background: s.color,
            transition: 'width 0.6s ease-out',
          }} />
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20 }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.label}</span>
            <span style={{
              fontSize: '0.78rem',
              color: 'var(--text)',
              fontFamily: '"IBM Plex Mono", monospace',
              fontWeight: 600,
            }}>{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Line chart for subscriber growth ── */
function GrowthLineChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const svgWidth = 900
  const svgHeight = 160
  const padX = 40
  const padY = 20
  const chartW = svgWidth - padX * 2
  const chartH = svgHeight - padY * 2

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padY + chartH - (d.count / max) * chartH,
    ...d,
  }))

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  const areaD = pathD +
    ` L ${points[points.length - 1].x} ${padY + chartH}` +
    ` L ${points[0].x} ${padY + chartH} Z`

  // Show date labels every 7 days
  const dateLabels = points.filter((_, i) => i % 7 === 0 || i === points.length - 1)

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto' }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(frac => {
        const y = padY + chartH - frac * chartH
        return (
          <g key={frac}>
            <line x1={padX} y1={y} x2={svgWidth - padX} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            <text x={padX - 6} y={y + 3} textAnchor="end"
              fill="#4a5568" fontSize="9" fontFamily='"IBM Plex Mono", monospace'>
              {Math.round(frac * max)}
            </text>
          </g>
        )
      })}

      {/* Area fill */}
      <path d={areaD} fill="url(#growthGradient)" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="#2f86ff" strokeWidth={2} strokeLinejoin="round" />

      {/* Dots */}
      {points.map((p, i) => p.count > 0 && (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#2f86ff" />
      ))}

      {/* Date labels */}
      {dateLabels.map(p => (
        <text key={p.date} x={p.x} y={svgHeight - 2} textAnchor="middle"
          fill="#4a5568" fontSize="8" fontFamily='"IBM Plex Mono", monospace'>
          {p.date.slice(5)}
        </text>
      ))}

      {/* Gradient def */}
      <defs>
        <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f86ff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2f86ff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
