import React from 'react'
import { Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion'
import { ExecutivePresenterBadge } from './components/ExecutivePresenterBadge'
import { PulsePill } from './components/PulsePill'
import { theme } from './theme'

export const KeynotePresentation: React.FC = () => {
  const frame = useCurrentFrame()

  // Stage 1: Hero & Mission (Frames 0 - 660, ~22s)
  // Stage 2: 4 Strategic Pillars (Frames 660 - 1560, ~30s)
  // Stage 3: The Pulse Weekly Radar (Frames 1560 - 2360, ~26s)
  // Stage 4: Architectural Blog & Sandboxes (Frames 2360 - 2860, ~17s)
  // Stage 5: Call to Action (Frames 2860 - 3220, ~12s)

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
      {/* ── Authentic Voice Narration ── */}
      <Audio src={staticFile('presenter/voice.wav')} volume={1} />

      {/* ── Scene 1: Hero Landing (0 - 660 frames) ── */}
      <Sequence from={0} durationInFrames={660}>
        <SceneHero />
      </Sequence>

      {/* ── Scene 2: 4 Strategic Pillars (660 - 1560 frames) ── */}
      <Sequence from={660} durationInFrames={900}>
        <ScenePillars />
      </Sequence>

      {/* ── Scene 3: The Pulse Radar & Multimedia (1560 - 2360 frames) ── */}
      <Sequence from={1560} durationInFrames={800}>
        <ScenePulse />
      </Sequence>

      {/* ── Scene 4: Architectural Guides & Sandboxes (2360 - 2860 frames) ── */}
      <Sequence from={2360} durationInFrames={500}>
        <SceneBlog />
      </Sequence>

      {/* ── Scene 5: Community Call to Action (2860 - 3220 frames) ── */}
      <Sequence from={2860} durationInFrames={360}>
        <SceneCTA />
      </Sequence>

      {/* Top Permanent Telemetry Ribbon */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          backgroundColor: 'rgba(6, 10, 18, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${theme.colors.line}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          zIndex: 60,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: 'rgba(47, 134, 255, 0.2)',
              border: '1px solid #2F86FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#2F86FF' }}>⚡</span>
          </div>
          <span style={{ fontFamily: theme.fonts.display, fontWeight: 700, fontSize: '0.95rem', color: '#FFF' }}>
            neural365 <span style={{ color: theme.colors.azure }}>COMMUNITY</span>
          </span>
          <span style={{ fontFamily: theme.fonts.mono, fontSize: '0.75rem', color: theme.colors.textMuted }}>
            // Official Product & Architecture Walkthrough
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <PulsePill label="Weekly Cadence" lane="new" />
          <span style={{ fontFamily: theme.fonts.mono, fontSize: '0.78rem', color: theme.colors.textMuted }}>
            community.neural365ltd.com
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Scene 1: Hero Landing Showcase                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
const SceneHero: React.FC = () => {
  const frame = useCurrentFrame()

  // Smooth cinematic Ken Burns zoom
  const scale = interpolate(frame, [0, 660], [1.0, 1.08], { extrapolateRight: 'clamp' })
  const translateY = interpolate(frame, [0, 660], [0, -30], { extrapolateRight: 'clamp' })

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Real Website Screenshot */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${scale}) translateY(${translateY}px)`,
          transformOrigin: 'center 30%',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <Img
          src={staticFile('screenshots/01-hero-landing.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Focus Highlight Frame over Main Hero Headline */}
      <div
        style={{
          position: 'absolute',
          top: 140,
          left: 120,
          maxWidth: 900,
          padding: '24px 32px',
          backgroundColor: 'rgba(6, 10, 18, 0.88)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(47, 134, 255, 0.4)',
          borderRadius: 16,
          boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(47, 134, 255, 0.2)',
          zIndex: 40,
        }}
      >
        <PulsePill label="Independent Community Research Hub" color={theme.colors.azure} />
        <h1
          style={{
            fontFamily: theme.fonts.display,
            fontSize: '2.4rem',
            fontWeight: 800,
            margin: '12px 0 8px 0',
            color: '#FFFFFF',
            lineHeight: 1.2,
          }}
        >
          Explore Microsoft AI Agents & ERP — Together.
        </h1>
        <p style={{ margin: 0, fontSize: '1.15rem', color: theme.colors.textMuted, lineHeight: 1.5 }}>
          Skip dry 200-page release docs. Learn through interactive guides, video shorts, and real-world execution.
        </p>
      </div>

      <ExecutivePresenterBadge bottom={40} right={40} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Scene 2: Four Strategic Pillars                                            */
/* ─────────────────────────────────────────────────────────────────────────── */
const ScenePillars: React.FC = () => {
  const frame = useCurrentFrame()

  const panY = interpolate(frame, [0, 900], [0, -60], { extrapolateRight: 'clamp' })
  const scale = interpolate(frame, [0, 900], [1.02, 1.07], { extrapolateRight: 'clamp' })

  // Cycle through highlighting the 4 pillars
  const activePillar = frame < 225 ? 0 : frame < 450 ? 1 : frame < 675 ? 2 : 3
  const pillarNames = [
    { name: '1. D365 Finance & Operations', desc: 'Autonomous reconciliation & variance narratives' },
    { name: '2. Dataverse & Power Platform', desc: 'Generative answers & virtual table architectures' },
    { name: '3. Copilot Studio & AI Agents', desc: 'Multi-agent orchestration & cross-app handoffs' },
    { name: '4. Industry Solutions', desc: 'Pre-built vertical AI templates across various industries' },
  ]

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${scale}) translateY(${panY}px)`,
          transformOrigin: 'center 40%',
        }}
      >
        <Img
          src={staticFile('screenshots/03-copilot-agents-pillar.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Floating Active Pillar Callout Banner */}
      <div
        style={{
          position: 'absolute',
          top: 90,
          right: 60,
          width: 520,
          backgroundColor: 'rgba(11, 18, 32, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(52, 216, 176, 0.4)',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 20px 45px rgba(0,0,0,0.7)',
          zIndex: 40,
        }}
      >
        <PulsePill label="Strategic Pillar Focus" lane="new" />
        <h3
          style={{
            fontFamily: theme.fonts.display,
            fontSize: '1.5rem',
            fontWeight: 700,
            margin: '12px 0 6px 0',
            color: '#FFFFFF',
          }}
        >
          {pillarNames[activePillar].name}
        </h3>
        <p style={{ margin: 0, fontSize: '1.05rem', color: theme.colors.textMuted }}>
          {pillarNames[activePillar].desc}
        </p>

        {/* Pillar selector tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              style={{
                height: 4,
                flex: 1,
                borderRadius: 2,
                backgroundColor: idx === activePillar ? theme.colors.azure : theme.colors.line,
              }}
            />
          ))}
        </div>
      </div>

      <ExecutivePresenterBadge bottom={40} left={40} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Scene 3: The Pulse Weekly Radar                                            */
/* ─────────────────────────────────────────────────────────────────────────── */
const ScenePulse: React.FC = () => {
  const frame = useCurrentFrame()

  const panY = interpolate(frame, [0, 800], [0, -180], { extrapolateRight: 'clamp' })
  const scale = interpolate(frame, [0, 800], [1.03, 1.08], { extrapolateRight: 'clamp' })

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${scale}) translateY(${panY}px)`,
          transformOrigin: 'center center',
        }}
      >
        <Img
          src={staticFile('screenshots/02-pulse-radar.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Floating Radar Badge */}
      <div
        style={{
          position: 'absolute',
          top: 90,
          left: 60,
          width: 500,
          backgroundColor: 'rgba(11, 18, 32, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(47, 134, 255, 0.45)',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 20px 45px rgba(0,0,0,0.7)',
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.4rem' }}>⚡</span>
          <span style={{ fontFamily: theme.fonts.display, fontSize: '1.4rem', fontWeight: 700, color: '#FFF' }}>
            The Pulse — Live Radar
          </span>
          <PulsePill label="Weekly" lane="new" />
        </div>
        <p style={{ margin: '12px 0 0 0', fontSize: '1.05rem', color: theme.colors.textMuted, lineHeight: 1.5 }}>
          Tracks Microsoft Learn, release waves, and preview blogs across <span style={{ color: theme.colors.laneNew }}>New</span>, <span style={{ color: theme.colors.laneComing }}>Coming</span>, and <span style={{ color: theme.colors.laneArch }}>Architecture</span> shifts.
        </p>
      </div>

      <ExecutivePresenterBadge bottom={40} right={40} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Scene 4: Architectural Deep Dives & Sandbox Guides                         */
/* ─────────────────────────────────────────────────────────────────────────── */
const SceneBlog: React.FC = () => {
  const frame = useCurrentFrame()

  const panY = interpolate(frame, [0, 500], [0, -100], { extrapolateRight: 'clamp' })
  const scale = interpolate(frame, [0, 500], [1.02, 1.06], { extrapolateRight: 'clamp' })

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${scale}) translateY(${panY}px)`,
          transformOrigin: 'center 40%',
        }}
      >
        <Img
          src={staticFile('screenshots/05-blog-guides.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Verified Pipeline Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 90,
          right: 60,
          width: 520,
          backgroundColor: 'rgba(11, 18, 32, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(155, 140, 255, 0.4)',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 20px 45px rgba(0,0,0,0.7)',
          zIndex: 40,
        }}
      >
        <PulsePill label="Practitioner Curated" lane="architecture" />
        <h3
          style={{
            fontFamily: theme.fonts.display,
            fontSize: '1.45rem',
            fontWeight: 700,
            margin: '12px 0 8px 0',
            color: '#FFFFFF',
          }}
        >
          Tested in Sandbox Environments
        </h3>
        <p style={{ margin: 0, fontSize: '1.05rem', color: theme.colors.textMuted, lineHeight: 1.5 }}>
          Verified and curated by experienced practitioners who write code and configure systems daily. Zero vendor fluff.
        </p>
      </div>

      <ExecutivePresenterBadge bottom={40} left={40} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Scene 5: Community Call to Action                                           */
/* ─────────────────────────────────────────────────────────────────────────── */
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame()

  const scale = interpolate(frame, [0, 360], [1.0, 1.04], { extrapolateRight: 'clamp' })

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: `scale(${scale})` }}>
        <Img
          src={staticFile('screenshots/01-hero-landing.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Center Final Action Card */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 780,
          backgroundColor: 'rgba(6, 10, 18, 0.94)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(47, 134, 255, 0.5)',
          borderRadius: 20,
          padding: '40px 48px',
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(47, 134, 255, 0.3)',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <PulsePill label="Join the Community" color={theme.colors.laneNew} />
        <h2
          style={{
            fontFamily: theme.fonts.display,
            fontSize: '2.6rem',
            fontWeight: 800,
            margin: 0,
            color: '#FFFFFF',
            lineHeight: 1.2,
          }}
        >
          Shape the Future of Microsoft AI — Together.
        </h2>
        <p style={{ margin: 0, fontSize: '1.2rem', color: theme.colors.textMuted, maxWidth: 640 }}>
          Subscribe to your favorite pillars for weekly roadmap updates, or dive directly into The Pulse.
        </p>

        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
          <div
            style={{
              padding: '14px 32px',
              borderRadius: 8,
              backgroundColor: theme.colors.azure,
              color: '#FFF',
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              fontSize: '1.1rem',
              boxShadow: '0 4px 20px rgba(47, 134, 255, 0.5)',
            }}
          >
            Explore Latest AI Features →
          </div>
          <div
            style={{
              padding: '14px 24px',
              borderRadius: 8,
              backgroundColor: 'transparent',
              border: `1.5px solid ${theme.colors.line}`,
              color: theme.colors.text,
              fontFamily: theme.fonts.mono,
              fontSize: '1rem',
            }}
          >
            community.neural365ltd.com
          </div>
        </div>
      </div>

      <ExecutivePresenterBadge bottom={40} right={40} />
    </div>
  )
}
