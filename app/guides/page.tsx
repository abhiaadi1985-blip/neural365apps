import type { Metadata } from 'next'
import HeroMesh from '@/components/hero-mesh'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Hands-on Guides & Sandboxes — neural365 COMMUNITY',
  description: 'Interactive step-by-step implementation guides and sandbox labs for Microsoft Dynamics 365 ERP, Dataverse, and Copilot AI Agents.',
}

const upcomingGuides = [
  {
    pillar: 'copilot-ai-agents',
    title: 'Copilot Studio: Autonomous Reconciliation Agent in Dataverse',
    description: 'Hands-on lab deploying an autonomous matching agent with human-in-the-loop sign-off before ERP journal posting.',
    estDuration: '25 min lab',
    format: 'Lab sandbox + short demo',
  },
  {
    pillar: 'd365-fo',
    title: 'Finance Copilot: Variance Narrative Configuration',
    description: 'Step-by-step configuration of generative variance narratives in Dynamics 365 Finance workspace.',
    estDuration: '15 min lab',
    format: 'Guided walkthrough',
  },
  {
    pillar: 'dataverse-power-platform',
    title: 'Virtual Table Architecture with External REST Endpoints',
    description: 'Configuring virtual entity providers with high-throughput batching against legacy core services.',
    estDuration: '30 min lab',
    format: 'Deep dive + template',
  },
  {
    pillar: 'industry-solutions',
    title: 'Shop-Floor Exception Handler for Manufacturing Cloud',
    description: 'Deploying Copilot proactive exception monitors on top of production order management.',
    estDuration: '20 min lab',
    format: 'Interactive sandbox',
  },
]

export default function GuidesIndexPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="hero" style={{ paddingTop: 72, paddingBottom: 60 }}>
        <HeroMesh intensity="reduced" />
        <div className="wrap hero-inner">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(242,181,68,0.08)', border: '1px solid rgba(242,181,68,0.35)',
            borderRadius: 6, padding: '4px 10px', fontSize: '0.76rem',
            fontFamily: '"IBM Plex Mono", monospace', color: 'var(--lane-coming)',
            marginBottom: 16,
          }}>
            🚧 Upcoming Feature Roadmap
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 800, maxWidth: 760 }}>
            Hands-on Guides &amp; Spoke Labs
          </h1>
          <p style={{ marginTop: 16, maxWidth: 620, color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            We are engineering a curriculum of interactive, step-by-step technical guides
            backed by isolated Microsoft demo sandboxes. Each guide is paired with an inline
            Neural Short (visual explainer breakdown) and an audio podcast (topic briefing or deep dive).
          </p>

          <div style={{ display: 'flex', gap: 14, marginTop: 28, flexWrap: 'wrap' }}>
            <Link href="/blog" className="btn btn-primary">
              Explore Live Blog Deep Dives
            </Link>
            <Link href="/pulse" className="btn btn-secondary">
              Browse The Pulse Feed
            </Link>
          </div>
        </div>
      </section>

      {/* ── Guides Roadmap Grid ── */}
      <section style={{ padding: '64px 0 84px', background: 'var(--bg-2)', borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <div style={{ marginBottom: 32 }}>
            <div className="eyebrow" style={{ color: 'var(--azure)' }}>
              <span className="dot" />
              LAB PIPELINE
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: 8 }}>
              Guides in Staging &amp; Recording
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: 6 }}>
              The spoke demo tenants are currently provisioned in LCS and Power Platform Developer environments for screen capture.
            </p>
          </div>

          <div
            className="guides-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 24,
            }}
          >
            {upcomingGuides.map((guide, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)',
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 14,
                  }}>
                    <span style={{
                      fontFamily: '"IBM Plex Mono", monospace',
                      fontSize: '0.68rem',
                      color: 'var(--azure)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {guide.pillar.replace('-', ' ')}
                    </span>
                    <span style={{
                      fontFamily: '"IBM Plex Mono", monospace',
                      fontSize: '0.68rem',
                      color: 'var(--lane-coming)',
                      background: 'rgba(242,181,68,0.1)',
                      border: '1px solid rgba(242,181,68,0.3)',
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}>
                      In Production
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 10, lineHeight: 1.4 }}>
                    {guide.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 20 }}>
                    {guide.description}
                  </p>
                </div>

                <div style={{
                  borderTop: '1px solid var(--line)',
                  paddingTop: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  fontFamily: '"IBM Plex Mono", monospace',
                  color: 'var(--text-muted)',
                }}>
                  <span>⏱️ {guide.estDuration}</span>
                  <span>🎬 {guide.format}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Callout box */}
          <div style={{
            marginTop: 48,
            padding: 32,
            background: 'var(--panel)',
            border: '1px dashed var(--line)',
            borderRadius: 'var(--radius)',
            textAlign: 'center',
            maxWidth: 680,
            margin: '48px auto 0',
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>
              Want to request a specific guide or architecture demo?
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Our editorial and spoke recording team prioritizes guides voted by the community.
            </p>
            <Link href="/pulse" className="btn btn-secondary btn-sm">
              Review current architectural topics on Pulse &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
