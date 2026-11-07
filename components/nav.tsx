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
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    try {
      const supabase = createClient()

      const checkRole = async (userId: string) => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()
          setIsAdmin(profile?.role === 'admin')
        } catch {
          setIsAdmin(false)
        }
      }

      supabase.auth.getUser().then(({ data: { user } }) => {
        setIsSignedIn(!!user)
        if (user) {
          checkRole(user.id)
        } else {
          setIsAdmin(false)
        }
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsSignedIn(!!session?.user)
        if (session?.user) {
          checkRole(session.user.id)
        } else {
          setIsAdmin(false)
        }
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
          <Link href="/blog" style={{ transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            Blog
          </Link>
        </nav>

        {/* CTA + Desktop Auth + mobile toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Desktop Auth State */}
          <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isSignedIn ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="btn btn-sm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.78rem',
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      fontWeight: 600,
                      fontFamily: '"IBM Plex Mono", monospace',
                      padding: '5px 10px',
                      borderRadius: 6,
                      textDecoration: 'none',
                    }}
                  >
                    <span>⚡</span>
                    <span>Admin</span>
                  </Link>
                )}
                <Link
                  href="/account"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
                >
                  <span>👤</span>
                  <span>Account</span>
                </Link>
              </>
            ) : (
              <Link
                href="/sign-in"
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: 6,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                Sign In
              </Link>
            )}
          </div>

          <Link href="/pulse" className="btn btn-primary btn-sm nav-cta-btn">
            Explore latest AI features
          </Link>

          <button
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(o => !o)}
            className="mobile-menu-btn"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="mobile-drawer"
          style={{
            borderTop: '1px solid var(--line)',
            background: 'rgba(6, 10, 18, 0.98)',
            backdropFilter: 'blur(16px)',
            padding: '20px 20px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            maxHeight: 'calc(100dvh - 65px)',
            overflowY: 'auto',
          }}
        >
          {/* Prominent CTA in mobile drawer */}
          <Link
            href="/pulse"
            onClick={() => setMobileOpen(false)}
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px 18px',
              fontSize: '0.92rem',
              textAlign: 'center',
            }}
          >
            Explore latest AI features →
          </Link>

          {/* Quick feeds */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 4 }}>
            <Link
              href="/pulse"
              onClick={() => setMobileOpen(false)}
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: '10px 8px',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--text)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              ⚡ Pulse
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: '10px 8px',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--text)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              📖 Blog
            </Link>
          </div>

          {/* Pillars List */}
          <div style={{ marginTop: 8 }}>
            <span style={{
              display: 'block',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              fontFamily: '"IBM Plex Mono", monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 10,
            }}>
              Ecosystem Pillars
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {pillars.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    color: 'var(--text)',
                    fontSize: '0.92rem',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-2)',
                    border: '1px solid var(--line)',
                    textDecoration: 'none',
                  }}
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth link */}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
            {isSignedIn ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="btn"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      fontWeight: 600,
                    }}
                  >
                    ⚡ Admin Console
                  </Link>
                )}
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  👤 Manage Account
                </Link>
              </div>
            ) : (
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Sign In to neural365
              </Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        .desktop-auth {
          display: flex;
          align-items: center;
        }
        .mobile-menu-btn {
          display: none;
          background: var(--panel);
          border: 1px solid var(--line);
          color: var(--text);
          border-radius: 8px;
          min-width: 44px;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.15rem;
          touch-action: manipulation;
        }

        @media (max-width: 860px) {
          nav.pillars { display: none !important; }
          .desktop-auth { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }

        @media (max-width: 640px) {
          .nav-cta-btn { display: none !important; }
        }
      `}</style>
    </header>
  )
}
