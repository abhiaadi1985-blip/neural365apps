'use client'

import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: 480,
      }}>
        <div style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '3.5rem',
          fontWeight: 800,
          color: 'var(--azure)',
          marginBottom: 16,
          lineHeight: 1,
          opacity: 0.6,
        }}>
          500
        </div>
        <h2 style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: 12,
        }}>
          Something went wrong
        </h2>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.92rem',
          lineHeight: 1.6,
          marginBottom: 28,
        }}>
          An unexpected error occurred. Please try again — if the problem persists,
          contact us.
        </p>
        {error.digest && (
          <p style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginBottom: 20,
            opacity: 0.6,
          }}>
            Error ID: {error.digest}
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            className="btn btn-primary"
          >
            Try Again
          </button>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            border: '1px solid var(--line)',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            background: 'transparent',
            transition: 'border-color 0.15s',
          }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
