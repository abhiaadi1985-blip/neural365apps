import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Create Account — neural365apps',
  description: 'Create your neural365apps account to unlock premium D365 & Power Platform guides.',
}

export default function SignUpPage() {
  return (
    <section style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{
        border: '1px solid var(--line)', borderRadius: 'var(--radius)',
        background: 'var(--panel)', padding: '40px 36px',
        width: '100%', maxWidth: 420,
      }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 8 }}>Create your account</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 28 }}>
          Join the neural365apps community. Free to start.
        </p>

        <form action="/api/auth/sign-up" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
            <input id="password" name="password" type="password" required placeholder="min. 8 characters"
              minLength={8}
              style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: '11px 14px', color: 'var(--text)', fontFamily: '"Inter", sans-serif', fontSize: '0.9rem' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            Create Account
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: '0.84rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link href="/sign-in" style={{ color: 'var(--azure)' }}>Sign in →</Link>
        </p>
      </div>
    </section>
  )
}
