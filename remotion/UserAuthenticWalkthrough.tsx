import React from 'react'
import { interpolate, staticFile, useCurrentFrame, useVideoConfig, Video } from 'remotion'
import { theme } from './theme'

export const UserAuthenticWalkthrough: React.FC = () => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()

  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: 'clamp',
  })

  // Fade in at the very beginning
  const introFade = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })

  // Intro watermark pill subtle fade
  const pillOpacity = interpolate(frame, [0, 20, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#060A12',
        overflow: 'hidden',
        fontFamily: theme.fonts.body,
        opacity: introFade,
      }}
    >
      {/* ── Jump-Cut conformed Authentic User Video with Mastered Audio ── */}
      <Video
        src={staticFile('user_walkthrough_jumpcut.mp4')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />

      {/* Subtle Ambient Vignette Border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 100px rgba(6, 10, 18, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      />

      {/* ── Top Executive Telemetry Ribbon ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: 'linear-gradient(180deg, rgba(6, 10, 18, 0.92) 0%, rgba(6, 10, 18, 0.5) 75%, transparent 100%)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          zIndex: 40,
          opacity: pillOpacity,
        }}
      >
        {/* Brand Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #2F86FF, #34D8B0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 12,
              color: '#060A12',
            }}
          >
            N
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#F0F4F8', letterSpacing: '-0.02em' }}>
            neural365
          </span>
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 10,
              fontWeight: 600,
              color: '#34D8B0',
              background: 'rgba(52, 216, 176, 0.12)',
              border: '1px solid rgba(52, 216, 176, 0.3)',
              borderRadius: 4,
              padding: '2px 8px',
              letterSpacing: '0.08em',
            }}
          >
            COMMUNITY
          </span>
        </div>

        {/* Live Presentation Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              borderRadius: 20,
              background: 'rgba(6, 10, 18, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#34D8B0',
                boxShadow: '0 0 8px #34D8B0',
              }}
            />
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: 11,
                fontWeight: 600,
                color: '#34D8B0',
                letterSpacing: '0.06em',
              }}
            >
              EXECUTIVE PRODUCT WALKTHROUGH
            </span>
          </div>

          <div
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 11,
              color: 'rgba(240, 244, 248, 0.6)',
              padding: '4px 10px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            D365 & COPILOT ECOSYSTEM
          </div>
        </div>
      </div>

      {/* ── Bottom Glowing Progress Bar ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          zIndex: 50,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #2F86FF, #34D8B0)',
            boxShadow: '0 0 10px #34D8B0',
          }}
        />
      </div>
    </div>
  )
}
