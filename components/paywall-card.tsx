/**
 * PaywallCard — temporarily replaced with an "Upcoming" state card.
 * Stripe/premium features are disabled for the current launch phase.
 */
export default function PaywallCard() {
  return (
    <div style={{
      border:       '1px solid rgba(242,181,68,0.35)',
      borderRadius: 'var(--radius)',
      background:   'rgba(242,181,68,0.05)',
      padding:      32,
      textAlign:    'center',
      maxWidth:     480,
      margin:       '40px auto',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>🚧</div>
      <h3 style={{ marginBottom: 8, color: 'var(--lane-coming)' }}>Coming Soon</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: 0 }}>
        Hands-on guides and premium content are currently in development.
        This section will be available in an upcoming release of the neural365 Community hub.
      </p>
    </div>
  )
}
