'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

const pillars = [
  { label: 'D365 ERP',                   href: '/d365-fo' },
  { label: 'Dataverse & Power Platform', href: '/dataverse-power-platform' },
  { label: 'Copilot & AI Agents',        href: '/copilot-ai-agents' },
  { label: 'Industry Solutions',         href: '/industry-solutions' },
]

export default function Footer() {
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
    <footer className="site-footer">
      <div className="wrap">
        <div className="legal">
          © 2026 neural365 COMMUNITY. Independent community hub — not an official Microsoft product.
          Pulse feed content is aggregated and summarised from public sources for educational purposes;
          always confirm against official Microsoft documentation before making implementation decisions.
        </div>
        <nav className="pillars-footer" aria-label="Footer navigation">
          {pillars.map((p) => (
            <Link key={p.href} href={p.href}>
              {p.label}
            </Link>
          ))}
          <Link href="/pulse">Pulse</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/guides">Guides</Link>
          <a href="/feed.xml" target="_blank" rel="noopener noreferrer">RSS</a>
          {isSignedIn ? (
            <Link href="/account">Account</Link>
          ) : (
            <Link href="/sign-in">Sign In</Link>
          )}
        </nav>
      </div>
    </footer>
  )
}

