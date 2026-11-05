import React from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { MeshBackground } from './components/MeshBackground'
import { PulsePill } from './components/PulsePill'
import { theme } from './theme'

export interface ShortProps {
  title: string
  pillar: string
  lane: 'new' | 'coming' | 'architecture'
  pillarColor: string
  steps: string[]
  codeSnippet?: string
}

export const ShortsTemplate: React.FC<ShortProps> = ({
  title = 'Configure Copilot Studio Agent in Dataverse',
  pillar = 'Dataverse & Power Platform',
  lane = 'new',
  pillarColor = '#34D8B0',
  steps = [
    'Create an autonomous agent in Copilot Studio',
    'Bind generative answers directly to Dataverse tables',
    'Enable audit gating and cross-app handoffs',
    'Deploy into Power Apps solutions with ALM pipelines',
  ],
  codeSnippet = `// Dataverse virtual table binding\nconst agent = await copilot.createAgent({\n  grounding: 'Dataverse.Entity.Reconciliation',\n  mode: 'autonomous_audit'\n});`,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const cardScale = spring({ frame: frame - 10, fps, config: { damping: 14 } })
  const progress = interpolate(frame, [0, 1800], [0, 100], { extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.bg,
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px 48px',
      }}
    >
      <MeshBackground intensity="full" />

      {/* Top Header */}
      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <PulsePill label="NEURAL SHORTS · 60S" color={theme.colors.azure} />
          <PulsePill label={lane.toUpperCase()} lane={lane} />
        </div>

        <div style={{ fontFamily: theme.fonts.mono, fontSize: '0.95rem', color: pillarColor }}>
          // {pillar.toUpperCase()}
        </div>

        <h1
          style={{
            fontFamily: theme.fonts.display,
            fontSize: '2.8rem',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: 0,
            color: '#FFFFFF',
          }}
        >
          {title}
        </h1>
      </div>

      {/* Middle Interactive Walkthrough Steps */}
      <div
        style={{
          zIndex: 1,
          transform: `scale(${Math.max(0, cardScale)})`,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {steps.map((s, idx) => {
          const stepActive = frame > (idx + 1) * 200
          return (
            <div
              key={idx}
              style={{
                backgroundColor: theme.colors.panel,
                border: `1.5px solid ${stepActive ? pillarColor : theme.colors.line}`,
                borderRadius: 14,
                padding: '24px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: stepActive ? `0 0 25px ${pillarColor}20` : 'none',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: stepActive ? pillarColor : theme.colors.bg2,
                  color: stepActive ? '#060A12' : theme.colors.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: theme.fonts.mono,
                  fontWeight: 700,
                  fontSize: '1rem',
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </div>
              <div style={{ fontSize: '1.15rem', color: stepActive ? '#FFF' : theme.colors.textMuted }}>{s}</div>
            </div>
          )
        })}

        {/* Code Snippet Box */}
        {codeSnippet && (
          <div
            style={{
              backgroundColor: '#03060B',
              border: `1px solid ${theme.colors.line}`,
              borderRadius: 12,
              padding: '20px 24px',
              fontFamily: theme.fonts.mono,
              fontSize: '0.92rem',
              color: '#34D8B0',
              lineHeight: 1.6,
              whiteSpace: 'pre',
            }}
          >
            {codeSnippet}
          </div>
        )}
      </div>

      {/* Bottom Footer & Progress Bar */}
      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: theme.fonts.mono, fontSize: '0.85rem', color: theme.colors.textMuted }}>
            neural365 COMMUNITY · Hands-on Configs
          </div>
          <div style={{ fontFamily: theme.fonts.mono, fontSize: '0.85rem', color: theme.colors.azure }}>
            neural365.com
          </div>
        </div>

        {/* 60s Progress Bar */}
        <div
          style={{
            width: '100%',
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.colors.line,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: theme.colors.azure,
              boxShadow: `0 0 10px ${theme.colors.azure}`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
