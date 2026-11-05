import React from 'react'
import { Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { MeshBackground } from '../components/MeshBackground'
import { PulsePill } from '../components/PulsePill'
import { theme } from '../theme'

export const Scene5CallToAction: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const cardScale = spring({ frame: frame - 15, fps, config: { damping: 14 } })
  const glowIntensity = Math.sin(frame * 0.08) * 0.2 + 0.8

  const check1 = frame > 60
  const check2 = frame > 85
  const check3 = frame > 110
  const check4 = frame > 135

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
      <Audio src={staticFile('media/voiceover/scene5.mp3')} startFrom={0} volume={1} />
      <MeshBackground intensity="full" />

      {/* Main CTA Container */}
      <div
        style={{
          transform: `scale(${Math.max(0, cardScale)})`,
          backgroundColor: theme.colors.panel,
          border: `2px solid rgba(47, 134, 255, 0.4)`,
          borderRadius: 20,
          padding: '48px 64px',
          maxWidth: 960,
          width: '100%',
          textAlign: 'center',
          boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 ${40 * glowIntensity}px rgba(47, 134, 255, 0.28)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          zIndex: 1,
        }}
      >
        <PulsePill label="Start Exploring Today" color={theme.colors.laneNew} />

        <h2
          style={{
            fontFamily: theme.fonts.display,
            fontSize: '3.4rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            margin: 0,
            color: '#FFFFFF',
          }}
        >
          Explore Microsoft AI Agents & ERP — Together.
        </h2>

        <p style={{ margin: 0, fontSize: '1.25rem', color: theme.colors.textMuted, maxWidth: 740, lineHeight: 1.55 }}>
          Subscribe to your selected technical pillars for weekly updates, or dive directly into the live radar.
        </p>

        {/* Pillar checkboxes representation */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            justifyContent: 'center',
            margin: '8px 0',
          }}
        >
          <div
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              backgroundColor: check1 ? 'rgba(47, 134, 255, 0.15)' : theme.colors.bg2,
              border: `1px solid ${check1 ? theme.colors.azure : theme.colors.line}`,
              fontFamily: theme.fonts.mono,
              fontSize: '0.88rem',
              color: check1 ? '#FFF' : theme.colors.textMuted,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ color: check1 ? theme.colors.laneNew : theme.colors.textMuted }}>{check1 ? '☑' : '☐'}</span>
            D365 F&O
          </div>

          <div
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              backgroundColor: check2 ? 'rgba(52, 216, 176, 0.15)' : theme.colors.bg2,
              border: `1px solid ${check2 ? theme.colors.laneNew : theme.colors.line}`,
              fontFamily: theme.fonts.mono,
              fontSize: '0.88rem',
              color: check2 ? '#FFF' : theme.colors.textMuted,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ color: check2 ? theme.colors.laneNew : theme.colors.textMuted }}>{check2 ? '☑' : '☐'}</span>
            Dataverse & Power Platform
          </div>

          <div
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              backgroundColor: check3 ? 'rgba(155, 140, 255, 0.15)' : theme.colors.bg2,
              border: `1px solid ${check3 ? theme.colors.laneArch : theme.colors.line}`,
              fontFamily: theme.fonts.mono,
              fontSize: '0.88rem',
              color: check3 ? '#FFF' : theme.colors.textMuted,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ color: check3 ? theme.colors.laneNew : theme.colors.textMuted }}>{check3 ? '☑' : '☐'}</span>
            Copilot & AI Agents
          </div>

          <div
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              backgroundColor: check4 ? 'rgba(242, 181, 68, 0.15)' : theme.colors.bg2,
              border: `1px solid ${check4 ? theme.colors.laneComing : theme.colors.line}`,
              fontFamily: theme.fonts.mono,
              fontSize: '0.88rem',
              color: check4 ? '#FFF' : theme.colors.textMuted,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ color: check4 ? theme.colors.laneNew : theme.colors.textMuted }}>{check4 ? '☑' : '☐'}</span>
            Industry Solutions
          </div>
        </div>

        {/* Buttons / Actions */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div
            style={{
              padding: '16px 36px',
              borderRadius: 10,
              backgroundColor: theme.colors.azure,
              color: '#FFFFFF',
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              fontSize: '1.15rem',
              boxShadow: '0 4px 20px rgba(47, 134, 255, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span>Explore Latest AI Features</span>
            <span style={{ fontSize: '1.2rem' }}>→</span>
          </div>

          <div
            style={{
              padding: '16px 28px',
              borderRadius: 10,
              backgroundColor: 'transparent',
              border: `1.5px solid ${theme.colors.line}`,
              color: theme.colors.text,
              fontFamily: theme.fonts.mono,
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            neural365 COMMUNITY
          </div>
        </div>
      </div>
    </div>
  )
}
