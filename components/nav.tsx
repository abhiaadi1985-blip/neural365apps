'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'

const pillars = [
  { label: 'D365 ERP',                   href: '/d365-fo' },
  { label: 'Dataverse & Power Platform', href: '/dataverse-power-platform' },
  { label: 'Copilot & AI Agents',        href: '/copilot-ai-agents' },
  { label: 'Industry Solutions',         href: '/industry-solutions' },
]

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        setIsSignedIn(!!user)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsSignedIn(!!session?.user)
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch {
      // Supabase env might not be initialized
    }
  }, [])

  return (
    <header className="site" style={{
      position: 'sticky', top: 0, zIndex: 60,
      background: 'rgba(6,10,18,0.82)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--line)',
    }}>
      <div className="wrap" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 24px', gap: 24,
      }}>
        {/* Wordmark */}
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          textDecoration: 'none',
          fontFamily: 'var(--font-sora, "Sora", sans-serif)',
        }}>
          {/* Logo mark — next/image for optimized delivery */}
          <Image
            src="/neural365-logo-mark.png"
            alt="neural365 logo"
            width={52}
            height={52}
            priority
            style={{ height: 52, width: 'auto', display: 'block', filter: 'brightness(1.1) saturate(1.05)' }}
          />
          {/* Brand text: neural + azure 365 */}
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'baseline', gap: 0 }}>
            <span style={{ color: 'var(--text)' }}>neural</span>
            <span style={{
              color: 'var(--azure)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, var(--azure) 0%, #6eb3ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>365</span>
          </span>
          {/* Community pill badge */}
          <span style={{
            fontSize: '0.62rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--azure)',
            border: '1px solid rgba(47,134,255,0.4)',
            background: 'rgba(47,134,255,0.08)',
            borderRadius: 20,
            padding: '2px 7px',
            lineHeight: 1.4,
            alignSelf: 'center',
            fontFamily: '"IBM Plex Mono", monospace',
          }}>community</span>
        </Link>

        {/* Desktop nav */}
        <nav className="pillars" style={{
          display: 'flex', gap: 22, fontSize: '0.86rem',
          color: 'var(--text-muted)', flexWrap: 'wrap',
        }}>
          {pillars.map((p) => (
            <Link key={p.href} href={p.href} style={{ transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {p.label}
            </Link>
          ))}
          <Link href="/pulse" style={{ transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            Pulse
          </Link>
        </nav>

        {/* CTA + mobile toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/pulse" className="btn btn-primary btn-sm">
            Explore latest AI features
          </Link>
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(o => !o)}
            style={{
              display: 'none',
              background: 'transparent',
              border: '1px solid var(--line)',
              color: 'var(--text)',
              borderRadius: 7,
              padding: '7px 10px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          borderTop: '1px solid var(--line)',
          background: 'var(--bg)',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          {pillars.map((p) => (
            <Link key={p.href} href={p.href}
              onClick={() => setMobileOpen(false)}
              style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}
            >
              {p.label}
            </Link>
          ))}
          <Link href="/pulse" onClick={() => setMobileOpen(false)}
            style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Pulse
          </Link>
          {isSignedIn ? (
            <Link href="/account" onClick={() => setMobileOpen(false)}
              style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Account
            </Link>
          ) : (
            <Link href="/sign-in" onClick={() => setMobileOpen(false)}
              style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Sign In
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          nav.pillars { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  )
}
