import React from 'react'
import { Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, Video } from 'remotion'
import { theme } from './theme'

export const CapKeynotePresentation: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Scene timing mapping to the master audio (exact 3,220 frames @ 30fps = 107.33s)
  // Scene 1: 0 - 555 frames (18.5s) - Landing Hero & Welcome
  // Scene 2: 555 - 1275 frames (24.0s) - The Pulse Radar
  // Scene 3: 1275 - 1935 frames (22.0s) - Copilot & Autonomous Agents
  // Scene 4: 1935 - 2595 frames (22.0s) - Industry Solutions & ERP Modernization
  // Scene 5: 2595 - 3220 frames (20.83s) - Hands-on Guides & Community CTA

  const progress = interpolate(frame, [0, 3220], [0, 100], { extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#060A12',
        overflow: 'hidden',
        fontFamily: theme.fonts.body,
      }}
    >
      {/* ── Master Studio Audio (Clean, uncompressed, zero pauses) ── */}
      <Audio src={staticFile('presenter/voice.wav')} volume={1} />

      {/* ── Scene 1: Welcome & Mission (0 - 555 frames) ── */}
      <Sequence from={0} durationInFrames={555}>
        <SceneVideo
          videoSrc={staticFile('cap_segments/scene1.mp4')}
          badge="WELCOME & MISSION"
          title="The Intelligence Hub for Microsoft Dynamics 365 & Copilot"
          subtitle="Real-world sandbox for enterprise AI implementers & architects"
          accentColor="#2F86FF"
        />
      </Sequence>

      {/* ── Scene 2: The Pulse Radar (555 - 1275 frames) ── */}
      <Sequence from={555} durationInFrames={720}>
        <SceneVideo
          videoSrc={staticFile('cap_segments/scene2.mp4')}
          badge="WEEKLY RADAR"
          title="The Pulse: Weekly AI Signals & Architecture Shifts"
          subtitle="Continuous tracking across Microsoft Learn, preview roadmaps & Copilot Studio"
          accentColor="#34D8B0"
        />
      </Sequence>

      {/* ── Scene 3: Copilot & Autonomous Agents (1275 - 1935 frames) ── */}
      <Sequence from={1275} durationInFrames={660}>
        <SceneVideo
          videoSrc={staticFile('cap_segments/scene3.mp4')}
          badge="AUTONOMOUS AGENTS"
          title="Copilot Studio & Multi-Agent Workflows"
          subtitle="Orchestrating autonomous agents with cross-app handoffs & Dataverse grounding"
          accentColor="#9B8CFF"
        />
      </Sequence>

      {/* ── Scene 4: Industry Solutions & ERP Modernization (1935 - 2595 frames) ── */}
      <Sequence from={1935} durationInFrames={660}>
        <SceneVideo
          videoSrc={staticFile('cap_segments/scene4.mp4')}
          badge="ENTERPRISE MODERNIZATION"
          title="Dynamics 365 Finance & Operations AI"
          subtitle="Mission-critical ERP telemetry, variance narratives & supply chain anomaly alerts"
          accentColor="#F2B544"
        />
      </Sequence>

      {/* ── Scene 5: Hands-on Guides & Community CTA (2595 - 3220 frames) ── */}
      <Sequence from={2595} durationInFrames={625}>
        <SceneVideo
          videoSrc={staticFile('cap_segments/scene5.mp4')}
          badge="COMMUNITY ACTION"
          title="Hands-on Guides & Spoke Demo Labs"
          subtitle="Step-by-step technical guides, verified code repos & active community discussions"
          accentColor="#2F86FF"
        />
      </Sequence>

      {/* ── Persistent Top Brand Telemetry Ribbon ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          background: 'linear-gradient(180deg, rgba(6, 10, 18, 0.95) 0%, rgba(6, 10, 18, 0.4) 80%, transparent 100%)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          zIndex: 50,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #2F86FF 0%, #34D8B0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 18,
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(47, 134, 255, 0.5)',
            }}
          >
            N
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span
              style={{
                fontFamily: theme.fonts.display,
                fontSize: 18,
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              neural365
            </span>
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: 11,
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
        </div>

        {/* Live Presentation Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 20,
              background: 'rgba(6, 10, 18, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#34D8B0',
                boxShadow: '0 0 10px #34D8B0',
              }}
            />
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: 11,
                fontWeight: 600,
                color: '#E0E7FF',
                letterSpacing: '0.06em',
              }}
            >
              EXECUTIVE PRODUCT WALKTHROUGH
            </span>
          </div>
        </div>
      </div>

      {/* ── Persistent Bottom Progress Ticker ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
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

interface SceneVideoProps {
  videoSrc: string
  badge: string
  title: string
  subtitle: string
  accentColor: string
}

const SceneVideo: React.FC<SceneVideoProps> = ({
  videoSrc,
  badge,
  title,
  subtitle,
  accentColor,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Smooth entrance of feature callout
  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  })

  const cardOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })
  const cardTranslateY = interpolate(badgeSpring, [0, 1], [-20, 0])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#060A12',
      }}
    >
      {/* ── Conformed Cap Screen Recording Video ── */}
      <Video
        src={videoSrc}
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
          boxShadow: 'inset 0 0 120px rgba(6, 10, 18, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      />

      {/* ── Dynamic Top-Left Feature Callout Card ── */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 40,
          maxWidth: 520,
          padding: '16px 22px',
          borderRadius: 14,
          backgroundColor: 'rgba(6, 10, 18, 0.85)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${accentColor}44`,
          boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${accentColor}22`,
          opacity: cardOpacity,
          transform: `translateY(${cardTranslateY}px)`,
          zIndex: 40,
        }}
      >
        {/* Category Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: accentColor,
              boxShadow: `0 0 8px ${accentColor}`,
            }}
          />
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 10,
              fontWeight: 700,
              color: accentColor,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {badge}
          </span>
        </div>

        {/* Feature Title */}
        <h3
          style={{
            fontFamily: theme.fonts.display,
            fontSize: 17,
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.3,
            marginBottom: 6,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h3>

        {/* Subtitle / Key Takeaway */}
        <p
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 13,
            color: '#94A3B8',
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  )
}
