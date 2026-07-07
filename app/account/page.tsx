import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'My Account — neural365apps',
  description: 'Manage your neural365apps account and subscription.',
}

// This is a Server Component — auth state comes from Supabase server client.
// Full auth integration requires real Supabase credentials in .env.local.
export default async function AccountPage() {
  // Placeholder until real auth session is wired up with env vars
  const user = null
  const subscription = null

  if (!user) {
    return (
      <section style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{
          border: '1px solid var(--line)', borderRadius: 'var(--radius)',
          background: 'var(--panel)', padding: '40px 36px',
          width: '100%', maxWidth: 480, textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12 }}>Not signed in</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Sign in to access your account and manage your subscription.
          </p>
          <Link href="/sign-in" className="btn btn-primary">Sign In</Link>
        </div>
      </section>
    )
  }

  return (
    <section style={{ padding: '64px 0 84px' }}>
      <div className="wrap" style={{ maxWidth: 680 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 32 }}>My Account</h1>

        {/* Profile */}
        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--panel)', padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: '0.78rem', marginBottom: 16, color: 'var(--text-muted)', fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Profile
          </h2>
          <p style={{ fontSize: '0.9rem' }}>Email: <strong>{(user as { email?: string })?.email}</strong></p>
        </div>

        {/* Subscription */}
        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--panel)', padding: 28 }}>
          <h2 style={{ fontSize: '0.78rem', marginBottom: 16, color: 'var(--text-muted)', fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Subscription
          </h2>
          {subscription ? (
            <div>
              <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>
                Status: <span style={{ color: 'var(--lane-new)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.82rem' }}>
                  ACTIVE
                </span>
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Renews: {new Date((subscription as { current_period_end: string }).current_period_end).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                You are on the free plan. Upgrade to unlock all premium guides.
              </p>
              <Link href="/api/checkout" className="btn btn-primary btn-sm">
                Upgrade to Premium
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
