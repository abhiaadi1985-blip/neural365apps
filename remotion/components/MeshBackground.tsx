import React from 'react'
import { interpolate, useCurrentFrame } from 'remotion'
import { theme } from '../theme'

export const MeshBackground: React.FC<{ intensity?: 'full' | 'subtle' }> = ({ intensity = 'full' }) => {
  const frame = useCurrentFrame()

  // Smooth sinusoidal drift for lighting orbs
  const driftX1 = Math.sin(frame * 0.02) * 50
  const driftY1 = Math.cos(frame * 0.025) * 40

  const driftX2 = Math.cos(frame * 0.018) * 60
  const driftY2 = Math.sin(frame * 0.022) * 45

  const opacity = intensity === 'full' ? 0.85 : 0.45

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: theme.colors.bg,
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* Dark fine grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.6,
        }}
      />

      {/* Azure Orb 1 */}
      <div
        style={{
          position: 'absolute',
          top: -100 + driftY1,
          left: '15%',
          transform: `translateX(${driftX1}px)`,
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(47, 134, 255, 0.28) 0%, rgba(47, 134, 255, 0.04) 50%, transparent 75%)',
          filter: 'blur(70px)',
          opacity,
          pointerEvents: 'none',
        }}
      />

      {/* Cyan/Mint Orb 2 */}
      <div
        style={{
          position: 'absolute',
          top: 300 + driftY2,
          right: '10%',
          transform: `translateX(${driftX2}px)`,
          width: 650,
          height: 650,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52, 216, 176, 0.22) 0%, rgba(155, 140, 255, 0.06) 55%, transparent 75%)',
          filter: 'blur(80px)',
          opacity: opacity * 0.8,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle bottom vignette gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(6, 10, 18, 0.8) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
