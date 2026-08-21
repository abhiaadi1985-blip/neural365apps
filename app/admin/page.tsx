import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Metadata } from 'next'
import DashboardCharts from './dashboard-charts'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Dashboard — neural365 COMMUNITY Admin',
}

const PILLARS = [
  { slug: 'd365-fo', label: 'D365 ERP', color: '#2f86ff' },
  { slug: 'dataverse-power-platform', label: 'Dataverse & Power Platform', color: '#a855f7' },
  { slug: 'copilot-ai-agents', label: 'Copilot & AI Agents', color: '#06b6d4' },
  { slug: 'industry-solutions', label: 'Industry Solutions', color: '#f59e0b' },
]

export default async function AdminDashboardPage() {
  const adminClient = createAdminClient()
  const cookieStore = await cookies()
  const supabase = adminClient ?? createClient(cookieStore)

  // ── Fetch subscriber stats ──
  const { data: subscribers } = await supabase
    .from('subscribers')
    .select('email, subscribed_at, subscribed_topics, confirmed')

  const allSubs = subscribers ?? []
  const totalSubscribers = allSubs.length

  // Subscribers this week
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const subsThisWeek = allSubs.filter(s => new Date(s.subscribed_at) >= oneWeekAgo).length

  // Subscribers by topic
  const topicCounts: Record<string, number> = {}
  for (const p of PILLARS) topicCounts[p.slug] = 0
  for (const s of allSubs) {
    const topics: string[] = s.subscribed_topics ?? PILLARS.map(p => p.slug)
    for (const t of topics) {
      if (topicCounts[t] !== undefined) topicCounts[t]++
    }
  }

  // Daily subscriber growth (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const dailyGrowth: { date: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const count = allSubs.filter(s => s.subscribed_at?.slice(0, 10) === dateStr).length
    dailyGrowth.push({ date: dateStr, count })
  }

  // ── Fetch pulse stats ──
  const { data: pulseItems } = await supabase
    .from('pulse_items')
    .select('status')

  const allPulse = pulseItems ?? []
  const pulseLive = allPulse.filter(p => p.status === 'live').length
  const pulseDraft = allPulse.filter(p => p.status === 'draft').length
  const pulseMediaPending = allPulse.filter(p => p.status === 'media_pending').length
  const pulseTotal = allPulse.length

  const topicData = PILLARS.map(p => ({
    slug: p.slug,
    label: p.label,
    color: p.color,
    count: topicCounts[p.slug],
  }))

  return (
    <div style={{ padding: '40px 48px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.82rem',
          fontFamily: '"IBM Plex Mono", monospace',
        }}>
          neural365 COMMUNITY overview
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 40,
      }}>
        <StatCard label="Total Subscribers" value={totalSubscribers} color="#2f86ff" />
        <StatCard label="Subscribers This Week" value={subsThisWeek} color="#06b6d4" />
        <StatCard label="Pulse Live" value={pulseLive} color="#22c55e" />
        <StatCard label="Pulse Draft" value={pulseDraft} color="#f59e0b" />
        <StatCard label="Media Pending" value={pulseMediaPending} color="#a855f7" />
        <StatCard label="Total Pulse Items" value={pulseTotal} color="#64748b" />
      </div>

      {/* ── Charts (Client Component) ── */}
      <DashboardCharts
        topicData={topicData}
        dailyGrowth={dailyGrowth}
        pulseStatus={{ live: pulseLive, draft: pulseDraft, mediaPending: pulseMediaPending }}
      />
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      border: '1px solid var(--line)',
      borderRadius: 12,
      background: 'var(--panel)',
      padding: '24px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${color}, transparent)`,
      }} />
      <div style={{
        fontSize: '0.68rem',
        color: 'var(--text-muted)',
        fontFamily: '"IBM Plex Mono", monospace',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 10,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '2rem',
        fontWeight: 800,
        color: 'var(--text)',
        fontFamily: 'var(--font-display, "Sora", sans-serif)',
      }}>
        {value}
      </div>
    </div>
  )
}
