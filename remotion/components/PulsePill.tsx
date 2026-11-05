import React from 'react'
import { theme } from '../theme'

interface PulsePillProps {
  label: string
  lane?: 'new' | 'coming' | 'architecture'
  color?: string
}

export const PulsePill: React.FC<PulsePillProps> = ({ label, lane, color }) => {
  let badgeColor = color || theme.colors.azure
  if (lane === 'new') badgeColor = theme.colors.laneNew
  if (lane === 'coming') badgeColor = theme.colors.laneComing
  if (lane === 'architecture') badgeColor = theme.colors.laneArch

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 14px',
        borderRadius: 999,
        backgroundColor: `${badgeColor}18`,
        border: `1px solid ${badgeColor}45`,
        fontFamily: theme.fonts.mono,
        fontSize: '0.85rem',
        fontWeight: 500,
        color: badgeColor,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: badgeColor,
          boxShadow: `0 0 10px ${badgeColor}`,
        }}
      />
      {label}
    </div>
  )
}
