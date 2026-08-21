'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: 'Please enter both email and password.',
  not_admin: 'Access denied — this account does not have admin privileges.',
  unauthenticated: 'Please sign in to access the admin panel.',
  auth_failed: 'Authentication failed. Please try again.',
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginSkeleton />}>
      <AdminLoginContent />
    </Suspense>
  )
}

function AdminLoginSkeleton() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(145deg, #040810 0%, #0a1628 50%, #060e1a 100%)',
    }}>
      <div style={{
        width: 420,
        height: 460,
        borderRadius: 16,
        background: 'rgba(10,18,36,0.9)',
        border: '1px solid rgba(47,134,255,0.15)',
      }} />
    </div>
  )
}

function AdminLoginContent() {
  const searchParams = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const err = searchParams.get('error')
    if (err) {
      setError(ERROR_MESSAGES[err] || decodeURIComponent(err))
    }
  }, [searchParams])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(145deg, #040810 0%, #0a1628 50%, #060e1a 100%)',
      padding: '48px 24px',
    }}>
      <div style={{
        border: '1px solid rgba(47,134,255,0.15)',
        borderRadius: 16,
        background: 'rgba(10,18,36,0.9)',
        backdropFilter: 'blur(20px)',
        padding: '48px 40px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 0 80px rgba(47,134,255,0.06), 0 4px 32px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
          }}>
            <span style={{
              fontFamily: 'var(--font-display, "Sora", sans-serif)',
              fontWeight: 800,
              fontSize: '1.3rem',
              color: '#e8ecf2',
            }}>
              neural<span style={{
                background: 'linear-gradient(135deg, #2f86ff 0%, #6eb3ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>365</span>
            </span>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: '#f59e0b',
              border: '1px solid rgba(245,158,11,0.35)',
              background: 'rgba(245,158,11,0.08)',
              borderRadius: 20,
              padding: '2px 8px',
              fontFamily: '"IBM Plex Mono", monospace',
            }}>ADMIN</span>
          </div>

          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#e8ecf2',
            marginBottom: 6,
          }}>Admin Console</h1>
          <p style={{
            color: '#7a8599',
            fontSize: '0.85rem',
            fontFamily: '"IBM Plex Mono", monospace',
          }}>
            Editorial pipeline &amp; dashboard access
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 20,
            color: '#f87171',
            fontSize: '0.82rem',
            fontFamily: '"IBM Plex Mono", monospace',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form action="/api/auth/admin-sign-in" method="POST" suppressHydrationWarning style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          <div>
            <label htmlFor="admin-email" style={{
              display: 'block',
              fontSize: '0.72rem',
              color: '#7a8599',
              marginBottom: 6,
              fontFamily: '"IBM Plex Mono", monospace',
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
            }}>EMAIL</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              required
              placeholder="admin@neural365.com"
              autoComplete="email"
              suppressHydrationWarning
              style={{
                width: '100%',
                background: 'rgba(6,10,18,0.6)',
                border: '1px solid rgba(47,134,255,0.2)',
                borderRadius: 8,
                padding: '12px 14px',
                color: '#e8ecf2',
                fontFamily: '"Inter", sans-serif',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(47,134,255,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(47,134,255,0.2)'}
            />
          </div>
          <div>
            <label htmlFor="admin-password" style={{
              display: 'block',
              fontSize: '0.72rem',
              color: '#7a8599',
              marginBottom: 6,
              fontFamily: '"IBM Plex Mono", monospace',
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
            }}>PASSWORD</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              autoComplete="current-password"
              suppressHydrationWarning
              style={{
                width: '100%',
                background: 'rgba(6,10,18,0.6)',
                border: '1px solid rgba(47,134,255,0.2)',
                borderRadius: 8,
                padding: '12px 14px',
                color: '#e8ecf2',
                fontFamily: '"Inter", sans-serif',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(47,134,255,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(47,134,255,0.2)'}
            />
          </div>
          <button
            type="submit"
            suppressHydrationWarning
            style={{
              width: '100%',
              padding: '12px 0',
              marginTop: 4,
              background: 'linear-gradient(135deg, #2f86ff 0%, #1a6ddf 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: '"Inter", sans-serif',
              transition: 'opacity 0.2s, transform 0.1s',
              boxShadow: '0 2px 12px rgba(47,134,255,0.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Sign In to Admin
          </button>
        </form>

        {/* Footer */}
        <p style={{
          marginTop: 28,
          fontSize: '0.72rem',
          color: '#4a5568',
          textAlign: 'center',
          fontFamily: '"IBM Plex Mono", monospace',
        }}>
          Only authorized admin accounts can access this console.
        </p>
      </div>
    </div>
  )
}
