import type { Metadata } from 'next'
import HeroMesh from '@/components/hero-mesh'
import Link from 'next/link'

/**
 * Guide page — temporarily shows an "upcoming feature" state.
 * Supabase gating and Stripe premium access are disabled for the current launch phase.
 * When guides go live, restore the full implementation from git history.
 */
export const metadata: Metadata = {
  title: 'Guides — Coming Soon | neural365 Community',
  description: 'Hands-on guides for Dynamics 365 and Power Platform are coming soon to the neural365 Community hub.',
}

export default async function GuidePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero" style={{ paddingTop: 72, paddingBottom: 60 }}>
        <HeroMesh intensity="reduced" />
        <div className="wrap hero-inner">
          {/* Upcoming badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(242,181,68,0.08)', border: '1px solid rgba(242,181,68,0.35)',
            borderRadius: 6, padding: '4px 10px', fontSize: '0.76rem',
            fontFamily: '"IBM Plex Mono", monospace', color: 'var(--lane-coming)',
            marginBottom: 16,
          }}>
            🚧 Upcoming feature
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, maxWidth: 720 }}>
            Hands-on Guides — Coming Soon
          </h1>
          <p style={{ marginTop: 16, maxWidth: 560, color: 'var(--text-muted)', fontSize: '1rem' }}>
            We&apos;re building a library of interactive, step-by-step guides for Dynamics 365 ERP,
            Dataverse, Power Platform, and Copilot &amp; AI Agents. Stay tuned — they&apos;ll be
            available in an upcoming release of the neural365 Community hub.
          </p>
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: '48px 0 84px' }}>
        <div className="wrap" style={{ maxWidth: 680 }}>
          {/* Placeholder card */}
          <div style={{
            border: '1px solid rgba(242,181,68,0.3)',
            borderRadius: 'var(--radius)',
            background: 'rgba(242,181,68,0.04)',
            padding: '40px 36px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🚧</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 12, color: 'var(--lane-coming)' }}>
              This guide is in development
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.65, marginBottom: 28 }}>
              Guides — including inline Neural Shorts and Micro-podcasts — are currently being
              authored and will be published progressively. Check back soon, or subscribe below
              to get notified when content goes live.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/" className="btn btn-primary">
                Back to Home
              </Link>
              <Link href="/pulse" style={{
                display: 'inline-flex', alignItems: 'center',
                border: '1px solid var(--line)', borderRadius: 8,
                padding: '10px 20px', fontSize: '0.9rem',
                color: 'var(--text-muted)', background: 'transparent',
                transition: 'border-color 0.15s',
              }}>
                Browse the Pulse feed →
              </Link>
            </div>
          </div>

          {/* What&apos;s coming list */}
          <div style={{ marginTop: 48 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>
              <span className="dot" />What&apos;s coming in guides
            </div>
            {[
              'Step-by-step walkthroughs for every Copilot feature',
              'Inline Neural Shorts (short-form videos) embedded in guides',
              'Micro-podcasts generated via NotebookLM on each topic',
              'Premium deep-dives on advanced ERP and agent configurations',
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 0',
                borderBottom: i < 3 ? '1px solid var(--line)' : 'none',
              }}>
                <span style={{ color: 'var(--azure)', flexShrink: 0, marginTop: 2 }}>▸</span>
                <span style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
