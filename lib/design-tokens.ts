// Design tokens as typed JS constants — single source of truth
// Mirrored from app/globals.css :root variables

export const colors = {
  bg:          '#060A12',
  bg2:         '#0B1220',
  panel:       '#0E1726',
  line:        '#1E293D',
  text:        '#E7ECF5',
  textMuted:   '#8C9AB3',
  azure:       '#2F86FF',
  azureDeep:   '#0B63CE',
  azureDim:    'rgba(47, 134, 255, 0.14)',
  laneNew:     '#34D8B0',
  laneComing:  '#F2B544',
  laneArch:    '#9B8CFF',
} as const

export const fonts = {
  display: '"Sora", sans-serif',
  body:    '"Inter", sans-serif',
  mono:    '"IBM Plex Mono", monospace',
} as const

export const radius = {
  card: '12px',
} as const

export type Lane   = 'new' | 'coming' | 'architecture'
export type Pillar = 'd365-fo' | 'dataverse-power-platform' | 'copilot-ai-agents' | 'industry-solutions'

export const laneColors: Record<Lane, string> = {
  new:          colors.laneNew,
  coming:       colors.laneComing,
  architecture: colors.laneArch,
}

export const laneLabels: Record<Lane, string> = {
  new:          "What's new",
  coming:       "What's coming",
  architecture: 'Architecture shifts',
}

export const pillarLabels: Record<Pillar, string> = {
  'd365-fo':                    'D365 F&O',
  'dataverse-power-platform':   'Dataverse & Power Platform',
  'copilot-ai-agents':          'Copilot & AI Agents',
  'industry-solutions':         'Industry Solutions',
}
