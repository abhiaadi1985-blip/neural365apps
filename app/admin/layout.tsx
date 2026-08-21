'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [draftCount, setDraftCount] = useState<number>(0)
  const [mediaCount, setMediaCount] = useState<number>(0)

  const fetchCounts = useCallback(async () => {
    try {
      const supabase = createClient()
      const [draftRes, mediaRes] = await Promise.all([
        supabase.from('pulse_items').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('pulse_items').select('id', { count: 'exact', head: true }).eq('status', 'media_pending'),
      ])
      if (typeof draftRes.count === 'number') {
        setDraftCount(draftRes.count)
      }
      if (typeof mediaRes.count === 'number') {
        setMediaCount(mediaRes.count)
      }
    } catch {
      // Ignore count fetch errors
    }
  }, [])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts, pathname])

  // Login page gets a clean, full-screen view without sidebar
  if (pathname === '/admin/login' || pathname?.startsWith('/admin/login')) {
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: 260, borderRight: '1px solid var(--line)', background: 'var(--bg-2)', padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 48 }}>
          <Link href="/admin" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)', textDecoration: 'none' }}>
            neural365<span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>.admin</span>
          </Link>
        </div>
        
        {/* Dashboard */}
        <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 16 }}>
          OVERVIEW
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, color: 'var(--text)', textDecoration: 'none', background: pathname === '/admin' ? 'var(--panel)' : 'transparent', border: pathname === '/admin' ? '1px solid var(--line)' : '1px solid transparent' }}>
            <span style={{ fontSize: '0.9rem' }}>📊</span>
            <span>Dashboard</span>
          </Link>
        </nav>

        <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 16 }}>
          EDITORIAL PIPELINE
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/admin/review" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, color: 'var(--text)', textDecoration: 'none', background: pathname.startsWith('/admin/review') ? 'var(--panel)' : 'transparent', border: pathname.startsWith('/admin/review') ? '1px solid var(--line)' : '1px solid transparent' }}>
            <span>Text Review</span>
            <span style={{
              background: draftCount > 0 ? 'var(--azure-dim)' : 'var(--line)',
              color: draftCount > 0 ? 'var(--azure)' : 'var(--text-muted)',
              padding: '2px 6px',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontFamily: '"IBM Plex Mono", monospace'
            }}>{draftCount}</span>
          </Link>
          <Link href="/admin/media" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, color: 'var(--text-muted)', textDecoration: 'none', background: pathname.startsWith('/admin/media') ? 'var(--panel)' : 'transparent', border: pathname.startsWith('/admin/media') ? '1px solid var(--line)' : '1px solid transparent' }}>
            <span>Media Review</span>
            <span style={{
              background: mediaCount > 0 ? 'var(--azure-dim)' : 'var(--line)',
              color: mediaCount > 0 ? 'var(--azure)' : 'var(--text-muted)',
              padding: '2px 6px',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontFamily: '"IBM Plex Mono", monospace'
            }}>{mediaCount}</span>
          </Link>
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Sign Out */}
        <form action="/api/auth/sign-out" method="POST" style={{ marginTop: 'auto' }}>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'transparent',
              border: '1px solid var(--line)',
              borderRadius: 8,
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontFamily: '"IBM Plex Mono", monospace',
              transition: 'border-color 0.2s, color 0.2s',
            }}
          >
            Sign Out
          </button>
        </form>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
