import React from 'react'
import { Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { MeshBackground } from '../components/MeshBackground'
import { PulsePill } from '../components/PulsePill'
import { theme } from '../theme'

export const Scene1Mission: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Transitions
  const logoScale = spring({ frame: frame - 10, fps, config: { damping: 14 } })
  const titleOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: 'clamp' })
  const titleY = interpolate(frame, [25, 45], [30, 0], { extrapolateRight: 'clamp' })

  const leadOpacity = interpolate(frame, [50, 75], [0, 1], { extrapolateRight: 'clamp' })
  const leadY = interpolate(frame, [50, 75], [20, 0], { extrapolateRight: 'clamp' })

  const pillsOpacity = interpolate(frame, [80, 105], [0, 1], { extrapolateRight: 'clamp' })

  // Ticker scroll
  const tickerX = interpolate(frame, [0, 750], [0, -350])

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
      <Audio src={staticFile('media/voiceover/scene1.mp3')} startFrom={0} volume={1} />
      <MeshBackground intensity="full" />

      {/* Main Content Card Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1280,
          textAlign: 'center',
          padding: '0 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Animated Brand Badge & Logo */}
        <div
          style={{
            transform: `scale(${Math.max(0, logoScale)})`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: 'rgba(47, 134, 255, 0.12)',
              border: '2px solid rgba(47, 134, 255, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 35px rgba(47, 134, 255, 0.35)',
            }}
          >
            {/* Logo Mark SVG */}
            <svg width="42" height="42" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#2F86FF" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
              <path d="M12 20L20 12L28 20L20 28Z" fill="#2F86FF" fillOpacity="0.3" stroke="#2F86FF" strokeWidth="2" />
              <circle cx="20" cy="20" r="4" fill="#34D8B0" />
            </svg>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div
              style={{
                fontFamily: theme.fonts.display,
                fontSize: '1.45rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
              }}
            >
              neural365 <span style={{ color: theme.colors.azure, fontWeight: 600 }}>COMMUNITY</span>
            </div>
            <div
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: '0.82rem',
                color: theme.colors.laneNew,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Independent Microsoft AI & ERP Hub
            </div>
          </div>
        </div>

        {/* Hero Eyebrow Pill */}
        <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, marginBottom: 20 }}>
          <PulsePill label="Community Research · Hands-on Architecture" color={theme.colors.azure} />
        </div>

        {/* Hero Title */}
        <h1
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontFamily: theme.fonts.display,
            fontSize: '3.8rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            margin: '0 0 24px 0',
            maxWidth: 1100,
            background: 'linear-gradient(180deg, #FFFFFF 30%, #A5B6D4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Explore Microsoft AI Agents & ERP — Together.
        </h1>

        {/* Lead Narrative */}
        <p
          style={{
            opacity: leadOpacity,
            transform: `translateY(${leadY}px)`,
            fontSize: '1.45rem',
            lineHeight: 1.6,
            color: theme.colors.textMuted,
            maxWidth: 960,
            margin: '0 auto 36px auto',
          }}
        >
          Skip dry 200-page release docs. Learn upcoming Dynamics 365, Dataverse, and Copilot AI features through
          interactive guides, video shorts, and real-world execution.
        </p>

        {/* Strategic Lane Badges */}
        <div
          style={{
            opacity: pillsOpacity,
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <PulsePill label="Weekly Cadence" lane="new" />
          <PulsePill label="Hands-on Sandboxes" lane="coming" />
          <PulsePill label="Practitioner Curated" lane="architecture" />
        </div>
      </div>

      {/* Bottom Live Telemetry Strip */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 52,
          backgroundColor: 'rgba(11, 18, 32, 0.95)',
          borderTop: `1px solid ${theme.colors.line}`,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          padding: '0 30px',
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: '0.85rem',
            color: theme.colors.azure,
            marginRight: 24,
            fontWeight: 600,
            letterSpacing: '0.05em',
            flexShrink: 0,
          }}
        >
          LIVE RADAR //
        </div>
        <div
          style={{
            display: 'flex',
            gap: 36,
            transform: `translateX(${tickerX}px)`,
            whiteSpace: 'nowrap',
            fontFamily: theme.fonts.mono,
            fontSize: '0.85rem',
            color: theme.colors.textMuted,
          }}
        >
          <span>▸ D365 F&O: Autonomous Reconciliation Agent GA</span>
          <span>▸ Dataverse: Generative Answers Deep Integration</span>
          <span>▸ Copilot Studio: Cross-App Agent Handoff Protocols</span>
          <span>▸ Industry Solutions: Pre-built Agent Accelerator Templates</span>
          <span>▸ D365 F&O: Financial Variance Narratives Wave 1</span>
        </div>
      </div>
    </div>
  )
}
