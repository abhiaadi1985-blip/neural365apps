import React from 'react'
import { Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { MeshBackground } from '../components/MeshBackground'
import { PulsePill } from '../components/PulsePill'
import { theme } from '../theme'

export const Scene4Practitioners: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const headOpacity = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: 'clamp' })
  const pipelineScale = spring({ frame: frame - 20, fps, config: { damping: 14 } })

  const steps = [
    {
      num: '01',
      title: 'Official Sources',
      desc: 'Microsoft Learn, Wave Roadmaps & Previews',
      color: theme.colors.textMuted,
    },
    {
      num: '02',
      title: 'Hermes Pipeline',
      desc: 'Automated ingest & deduplication',
      color: theme.colors.azure,
    },
    {
      num: '03',
      title: 'Practitioner Review',
      desc: 'Tested in sandbox environments',
      color: theme.colors.laneComing,
    },
    {
      num: '04',
      title: 'Live Hub & Feeds',
      desc: 'Guides, Pulse items, shorts & podcasts',
      color: theme.colors.laneNew,
    },
  ]

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.bg,
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
        overflow: 'hidden',
      }}
    >
      <Audio src={staticFile('media/voiceover/scene4.mp3')} startFrom={0} volume={1} />
      <MeshBackground intensity="subtle" />

      {/* Header */}
      <div
        style={{
          opacity: headOpacity,
          textAlign: 'center',
          marginBottom: 48,
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <PulsePill label="Independent & Verified" color={theme.colors.azure} />
        </div>
        <h2
          style={{
            fontFamily: theme.fonts.display,
            fontSize: '3rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: '0 0 10px 0',
            color: '#FFFFFF',
          }}
        >
          Built by Practitioners, for Practitioners
        </h2>
        <p style={{ margin: 0, fontSize: '1.25rem', color: theme.colors.textMuted }}>
          Tested in real sandboxes by developers and architects who build on Dynamics daily.
        </p>
      </div>

      {/* Visual Pipeline Flow */}
      <div
        style={{
          transform: `scale(${Math.max(0, pipelineScale)})`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          maxWidth: 1540,
          zIndex: 1,
        }}
      >
        {steps.map((s, idx) => (
          <React.Fragment key={idx}>
            <div
              style={{
                backgroundColor: theme.colors.panel,
                border: `1.5px solid ${theme.colors.line}`,
                borderRadius: 14,
                padding: '28px 24px',
                width: 310,
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  fontFamily: theme.fonts.mono,
                  fontSize: '0.88rem',
                  color: s.color,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}
              >
                PHASE {s.num}
              </div>
              <div style={{ fontFamily: theme.fonts.display, fontSize: '1.35rem', fontWeight: 700, color: '#FFF' }}>
                {s.title}
              </div>
              <div style={{ fontSize: '0.95rem', color: theme.colors.textMuted, lineHeight: 1.5 }}>{s.desc}</div>
            </div>

            {idx < steps.length - 1 && (
              <div
                style={{
                  color: theme.colors.azure,
                  fontSize: '1.8rem',
                  fontFamily: theme.fonts.mono,
                  opacity: 0.8,
                }}
              >
                ➔
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
