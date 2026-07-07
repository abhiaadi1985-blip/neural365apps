'use client'

import { useState } from 'react'
import Link from 'next/link'

const pillars = [
  { label: 'D365 F&O',                  href: '/d365-fo' },
  { label: 'Dataverse & Power Platform', href: '/dataverse-power-platform' },
  { label: 'Copilot & AI Agents',        href: '/copilot-ai-agents' },
  { label: 'Industry Solutions',         href: '/industry-solutions' },
]

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)

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
        padding: '16px 24px', gap: 24,
      }}>
        {/* Wordmark */}
        <Link href="/" style={{
          fontWeight: 700, fontSize: '1.1rem',
          display: 'flex', alignItems: 'baseline', gap: 2, flexShrink: 0,
          fontFamily: 'var(--font-sora, "Sora", sans-serif)',
        }}>
          neural365
          <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.8rem' }}>.apps</span>
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
          <Link href="/sign-in" onClick={() => setMobileOpen(false)}
            style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign In
          </Link>
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
