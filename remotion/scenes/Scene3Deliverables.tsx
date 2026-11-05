import React from 'react'
import { Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { MeshBackground } from '../components/MeshBackground'
import { PulsePill } from '../components/PulsePill'
import { theme } from '../theme'

export const Scene3Deliverables: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const headOpacity = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: 'clamp' })
  const leftCardScale = spring({ frame: frame - 20, fps, config: { damping: 15 } })
  const rightCardScale = spring({ frame: frame - 45, fps, config: { damping: 15 } })

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
      <Audio src={staticFile('media/voiceover/scene3.mp3')} startFrom={0} volume={1} />
      <MeshBackground intensity="full" />

      {/* Header */}
      <div
        style={{
          opacity: headOpacity,
          textAlign: 'center',
          marginBottom: 36,
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <PulsePill label="Practitioner Formats" color={theme.colors.laneNew} />
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
          Built for How Modern Teams Actually Learn
        </h2>
        <p style={{ margin: 0, fontSize: '1.25rem', color: theme.colors.textMuted }}>
          From weekly roadmap radar to 60-second video walkthroughs and commute audio.
        </p>
      </div>

      {/* Split Deliverable Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: 32,
          maxWidth: 1500,
          zIndex: 1,
          width: '100%',
          padding: '0 40px',
        }}
      >
        {/* Left Column: The Pulse (Weekly Radar) */}
        <div
          style={{
            transform: `scale(${Math.max(0, leftCardScale)})`,
            backgroundColor: theme.colors.panel,
            border: `1.5px solid ${theme.colors.line}`,
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 20px 45px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.4rem' }}>⚡</span>
              <span style={{ fontFamily: theme.fonts.display, fontSize: '1.5rem', fontWeight: 700, color: '#FFF' }}>
                The Pulse
              </span>
            </div>
            <PulsePill label="Updated Weekly" lane="new" />
          </div>

          <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: '1.05rem', lineHeight: 1.5 }}>
            Automated intelligence radar monitoring Microsoft Learn, public previews, and release wave roadmaps.
          </p>

          {/* Sample Pulse Card representation */}
          <div
            style={{
              backgroundColor: theme.colors.bg2,
              border: `1px solid ${theme.colors.line}`,
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', gap: 10 }}>
              <PulsePill label="NEW" lane="new" />
              <PulsePill label="D365 F&O" color={theme.colors.azure} />
            </div>
            <h4 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 600, color: theme.colors.text }}>
              Autonomous Account Reconciliation Agent enters Public Preview
            </h4>
            <p style={{ margin: 0, fontSize: '0.95rem', color: theme.colors.textMuted, lineHeight: 1.5 }}>
              Reconciliation agents match sub-ledger to general ledger entries autonomously with human-in-the-loop audit gates.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontFamily: theme.fonts.mono, fontSize: '0.85rem', color: theme.colors.laneNew }}>
              ● What's New
            </span>
            <span style={{ fontFamily: theme.fonts.mono, fontSize: '0.85rem', color: theme.colors.laneComing }}>
              ● What's Coming
            </span>
            <span style={{ fontFamily: theme.fonts.mono, fontSize: '0.85rem', color: theme.colors.laneArch }}>
              ● Architecture Shifts
            </span>
          </div>
        </div>

        {/* Right Column: Multimedia Hub */}
        <div
          style={{
            transform: `scale(${Math.max(0, rightCardScale)})`,
            backgroundColor: theme.colors.panel,
            border: `1.5px solid ${theme.colors.line}`,
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 20px 45px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.4rem' }}>🎬</span>
              <span style={{ fontFamily: theme.fonts.display, fontSize: '1.5rem', fontWeight: 700, color: '#FFF' }}>
                Multimedia Hub
              </span>
            </div>
            <PulsePill label="Video & Audio" color={theme.colors.azure} />
          </div>

          {/* Neural Shorts Box */}
          <div
            style={{
              backgroundColor: theme.colors.bg2,
              border: `1px solid ${theme.colors.line}`,
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                backgroundColor: 'rgba(47, 134, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors.azure,
                fontSize: '1.3rem',
                flexShrink: 0,
              }}
            >
              ▶
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#FFF' }}>Neural Shorts</div>
              <div style={{ fontSize: '0.88rem', color: theme.colors.textMuted }}>
                60-second vertical screen recordings of actual configurations
              </div>
            </div>
          </div>

          {/* Micro-podcasts Box */}
          <div
            style={{
              backgroundColor: theme.colors.bg2,
              border: `1px solid ${theme.colors.line}`,
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                backgroundColor: 'rgba(155, 140, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors.laneArch,
                fontSize: '1.3rem',
                flexShrink: 0,
              }}
            >
              🎧
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#FFF' }}>Micro-podcasts</div>
              <div style={{ fontSize: '0.88rem', color: theme.colors.textMuted }}>
                5-minute architectural breakdowns for strategy and commute listening
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
