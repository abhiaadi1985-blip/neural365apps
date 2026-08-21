import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sign In — neural365 COMMUNITY',
  description: 'Sign in to your neural365 COMMUNITY account to access premium guides.',
}

export default function SignInPage() {
  return (
    <section style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{
        border: '1px solid var(--line)', borderRadius: 'var(--radius)',
        background: 'var(--panel)', padding: '40px 36px',
        width: '100%', maxWidth: 420,
      }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 8 }}>Welcome back</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 28 }}>
          Sign in to access your guides and subscription.
        </p>

        <form action="/api/auth/sign-in" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6, fontFamily: '"IBM Plex Mono", monospace' }}>
              EMAIL
            </label>
            <input id="email" name="email" type="email" required placeholder="you@company.com"
              style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: '11px 14px', color: 'var(--text)', fontFamily: '"Inter", sans-serif', fontSize: '0.9rem' }} />
          </div>
          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6, fontFamily: '"IBM Plex Mono", monospace' }}>
              PASSWORD
            </label>
            <input id="password" name="password" type="password" required placeholder="••••••••"
              style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: '11px 14px', color: 'var(--text)', fontFamily: '"Inter", sans-serif', fontSize: '0.9rem' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            Sign In
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: '0.84rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          No account?{' '}
          <Link href="/sign-up" style={{ color: 'var(--azure)' }}>Create one →</Link>
        </p>
      </div>
    </section>
  )
}
