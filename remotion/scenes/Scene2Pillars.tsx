import React from 'react'
import { Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { MeshBackground } from '../components/MeshBackground'
import { PulsePill } from '../components/PulsePill'
import { theme } from '../theme'

interface PillarCardProps {
  title: string
  pillarId: string
  color: string
  delay: number
  description: string
  bulletPoints: string[]
}

const PillarCard: React.FC<PillarCardProps> = ({ title, color, delay, description, bulletPoints }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const cardScale = spring({ frame: frame - delay, fps, config: { damping: 15 } })
  const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: 'clamp' })
  const cardY = interpolate(frame, [delay, delay + 15], [40, 0], { extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `translateY(${cardY}px) scale(${Math.max(0, cardScale)})`,
        backgroundColor: theme.colors.panel,
        border: `1.5px solid ${theme.colors.line}`,
        borderTop: `3px solid ${color}`,
        borderRadius: 14,
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: `0 12px 35px rgba(0, 0, 0, 0.4), 0 0 20px ${color}12`,
        textAlign: 'left',
        width: 380,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PulsePill label={title} color={color} />
        <span style={{ fontFamily: theme.fonts.mono, fontSize: '0.8rem', color: theme.colors.textMuted }}>
          [0{bulletPoints.length} FEATURES]
        </span>
      </div>

      <p style={{ margin: 0, fontSize: '1.05rem', color: theme.colors.text, lineHeight: 1.5, fontWeight: 500 }}>
        {description}
      </p>

      <div
        style={{
          borderTop: `1px solid ${theme.colors.line}`,
          paddingTop: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {bulletPoints.map((point, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: theme.fonts.mono,
              fontSize: '0.86rem',
              color: theme.colors.textMuted,
            }}
          >
            <span style={{ color, fontSize: '1.1rem' }}>▹</span>
            <span>{point}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const Scene2Pillars: React.FC = () => {
  const frame = useCurrentFrame()

  const headOpacity = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: 'clamp' })
  const headY = interpolate(frame, [5, 25], [20, 0], { extrapolateRight: 'clamp' })

  const pillars = [
    {
      title: 'D365 F&O',
      pillarId: 'd365-fo',
      color: theme.colors.azure,
      delay: 20,
      description: 'Finance, Supply Chain & ERP accelerated by Copilot.',
      bulletPoints: ['Variance Narratives in General Ledger', 'Autonomous Reconciliation Agents', 'Supply Chain Anomaly Detection'],
    },
    {
      title: 'Dataverse & Power Platform',
      pillarId: 'dataverse-power-platform',
      color: theme.colors.laneNew,
      delay: 90,
      description: 'Build smarter apps on the enterprise data foundation.',
      bulletPoints: ['Generative Answers GA', 'Virtual Table Connectors', 'Low-Code Agentic Workflows'],
    },
    {
      title: 'Copilot & AI Agents',
      pillarId: 'copilot-ai-agents',
      color: theme.colors.laneArch,
      delay: 160,
      description: 'Autonomous agents for Microsoft business apps.',
      bulletPoints: ['Copilot Studio Agent Builder', 'Multi-Agent Orchestration', 'Cross-App Handoff Framework'],
    },
    {
      title: 'Industry Solutions',
      pillarId: 'industry-solutions',
      color: theme.colors.laneComing,
      delay: 230,
      description: 'Purpose-built AI templates across various industries.',
      bulletPoints: ['Pre-Built Vertical Agent Templates', 'Accelerator Roadmap Tracking', 'Domain Specific Grounding'],
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
      <Audio src={staticFile('media/voiceover/scene2.mp3')} startFrom={0} volume={1} />
      <MeshBackground intensity="subtle" />

      {/* Header */}
      <div
        style={{
          opacity: headOpacity,
          transform: `translateY(${headY}px)`,
          textAlign: 'center',
          marginBottom: 36,
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <PulsePill label="Architecture Domains" color={theme.colors.laneArch} />
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
          Four Core Strategic Pillars
        </h2>
        <p style={{ margin: 0, fontSize: '1.25rem', color: theme.colors.textMuted }}>
          Targeted architectural depth for Microsoft Dynamics 365 and Power Platform leaders.
        </p>
      </div>

      {/* 4 Pillar Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 22,
          maxWidth: 1680,
          zIndex: 1,
          padding: '0 40px',
        }}
      >
        {pillars.map((p) => (
          <PillarCard
            key={p.pillarId}
            title={p.title}
            pillarId={p.pillarId}
            color={p.color}
            delay={p.delay}
            description={p.description}
            bulletPoints={p.bulletPoints}
          />
        ))}
      </div>
    </div>
  )
}
