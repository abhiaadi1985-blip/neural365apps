'use client'

import Link from 'next/link'

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
 * RelatedGuides — compact list of guide links for pillar pages.
 * Shows a lock icon for premium guides.
 */
export default function RelatedGuides({ guides, eyebrowLabel = 'Guides' }: RelatedGuidesProps) {
  if (guides.length === 0) return null

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

        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {guides.map(guide => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          12,
                border:       '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                background:   'var(--panel)',
                padding:      '16px 18px',
                transition:   'border-color 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--azure)'
                e.currentTarget.style.transform   = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--line)'
                e.currentTarget.style.transform   = 'translateY(0)'
              }}
            >
              <span style={{
                fontSize: '1rem',
                flexShrink: 0,
                color: guide.isPremium ? 'var(--lane-coming)' : 'var(--azure)',
              }}>
                {guide.isPremium ? '🔒' : '▶'}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, flex: 1 }}>
                {guide.title}
              </span>
              {guide.isPremium && (
                <span style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '0.68rem',
                  color: 'var(--lane-coming)',
                  border: '1px solid var(--lane-coming)',
                  borderRadius: 4,
                  padding: '2px 6px',
                  flexShrink: 0,
                }}>
                  PREMIUM
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
