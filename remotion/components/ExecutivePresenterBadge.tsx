import React from 'react'
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { theme } from '../theme'

export const ExecutivePresenterBadge: React.FC<{
  hostName?: string
  role?: string
  bottom?: number
  left?: number
  right?: number
}> = ({
  hostName = 'neural365 Host',
  role = 'Lead Architect & Founder',
  bottom = 40,
  left,
  right = 40,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const badgeSpring = spring({ frame: frame - 15, fps, config: { damping: 14 } })
  const glowPulse = Math.sin(frame * 0.08) * 0.25 + 0.75

  // Animated Audio Equalizer Bars (simulating real speech frequencies)
  const barHeights = [
    Math.abs(Math.sin(frame * 0.22)) * 18 + 6,
    Math.abs(Math.cos(frame * 0.18)) * 24 + 8,
    Math.abs(Math.sin(frame * 0.25 + 1.2)) * 28 + 10,
    Math.abs(Math.cos(frame * 0.15 + 0.8)) * 22 + 6,
    Math.abs(Math.sin(frame * 0.3 + 2.1)) * 26 + 8,
    Math.abs(Math.cos(frame * 0.28 + 1.5)) * 16 + 6,
  ]

  return (
    <div
      style={{
        position: 'absolute',
        bottom,
        left,
        right,
        zIndex: 50,
        transform: `scale(${Math.max(0, badgeSpring)})`,
        backgroundColor: 'rgba(14, 23, 38, 0.92)',
        backdropFilter: 'blur(16px)',
        border: `1.5px solid ${theme.colors.line}`,
        borderRadius: 16,
        padding: '14px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        boxShadow: `0 16px 40px rgba(0, 0, 0, 0.6), 0 0 ${25 * glowPulse}px rgba(47, 134, 255, 0.25)`,
        maxWidth: 440,
      }}
    >
      {/* Headshot with Glowing Ring */}
      <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
        <div
          style={{
            position: 'absolute',
            inset: -3,
            borderRadius: '50%',
            background: `conic-gradient(from ${frame * 2}deg, ${theme.colors.azure}, ${theme.colors.laneNew}, ${theme.colors.laneArch}, ${theme.colors.azure})`,
            opacity: glowPulse,
          }}
        />
        <div
          style={{
            position: 'relative',
            width: 64,
            height: 64,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #060A12',
            backgroundColor: '#060A12',
          }}
        >
          <Img
            src={staticFile('presenter/headshot.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 20%',
            }}
          />
        </div>

        {/* Live Audio Indicator Dot */}
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: theme.colors.laneNew,
            border: '2px solid #0E1726',
            boxShadow: `0 0 10px ${theme.colors.laneNew}`,
          }}
        />
      </div>

      {/* Host Details & Live Equalizer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 700,
              fontSize: '1.12rem',
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
            }}
          >
            {hostName}
          </span>
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: '0.68rem',
              padding: '2px 8px',
              borderRadius: 4,
              backgroundColor: 'rgba(52, 216, 176, 0.15)',
              color: theme.colors.laneNew,
              border: '1px solid rgba(52, 216, 176, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Live Voice
          </span>
        </div>

        <div
          style={{
            fontFamily: theme.fonts.body,
            fontSize: '0.86rem',
            color: theme.colors.textMuted,
          }}
        >
          {role}
        </div>

        {/* Dancing Audio Equalizer Bars */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 4,
            height: 20,
            marginTop: 4,
          }}
        >
          {barHeights.map((h, i) => (
            <div
              key={i}
              style={{
                width: 3.5,
                height: `${h}px`,
                backgroundColor: i % 2 === 0 ? theme.colors.azure : theme.colors.laneNew,
                borderRadius: 2,
                transition: 'height 0.05s ease',
              }}
            />
          ))}
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: '0.72rem',
              color: theme.colors.textMuted,
              marginLeft: 6,
            }}
          >
            neural365 COMMUNITY
          </span>
        </div>
      </div>
    </div>
  )
}
