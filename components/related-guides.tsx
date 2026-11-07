'use client'

export interface GuideStub {
  slug:      string
  title:     string
  isPremium?: boolean
}

interface RelatedGuidesProps {
  guides: GuideStub[]
  eyebrowLabel?: string
}

/**
 * RelatedGuides — shows upcoming guides as a teaser section.
 * Hidden on all 4 pillar pages until the guides feature is ready to launch.
 */
export default function RelatedGuides({ guides, eyebrowLabel = 'Guides' }: RelatedGuidesProps) {
  // Hidden across all 4 pillars until ready to launch
  const SHOW_GUIDES = false
  if (!SHOW_GUIDES || guides.length === 0) return null

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">
            <span className="dot" />
            {eyebrowLabel}
          </div>
          <h2>Hands-on guides for this pillar</h2>
        </div>

        {/* Upcoming banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(242,181,68,0.07)',
          border: '1px solid rgba(242,181,68,0.3)',
          borderRadius: 'var(--radius)',
          padding: '12px 18px',
          marginBottom: 24,
        }}>
          <span style={{ fontSize: '1.1rem' }}>🚧</span>
          <span style={{
            fontSize: '0.84rem',
            color: 'var(--lane-coming)',
            fontFamily: '"IBM Plex Mono", monospace',
            letterSpacing: '0.02em',
          }}>
            <strong>Upcoming feature</strong> — Hands-on guides are currently in development and will launch soon on this community hub.
          </span>
        </div>

        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {guides.map(guide => (
            <div
              key={guide.slug}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          12,
                border:       '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                background:   'var(--panel)',
                padding:      '16px 18px',
                opacity:      0.55,
                cursor:       'default',
                userSelect:   'none',
              }}
              title="Coming soon"
            >
              <span style={{ fontSize: '1rem', flexShrink: 0, color: 'var(--text-muted)' }}>
                📋
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, flex: 1, color: 'var(--text-muted)' }}>
                {guide.title}
              </span>
              <span style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.65rem',
                color: 'var(--lane-coming)',
                border: '1px solid rgba(242,181,68,0.4)',
                borderRadius: 4,
                padding: '2px 6px',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}>
                COMING SOON
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
