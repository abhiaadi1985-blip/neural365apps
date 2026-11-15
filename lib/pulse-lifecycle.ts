export const PULSE_WINDOW_DAYS = 90

/**
 * Returns the ISO 8601 timestamp string for the pulse freshness cutoff
 * (default: 90 days ago, aligned to Microsoft release waves).
 */
export function getPulseCutoffDate(days: number = PULSE_WINDOW_DAYS): string {
  return new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()
}
