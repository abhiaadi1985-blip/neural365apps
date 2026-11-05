'use client'

import { useState } from 'react'
import Link from 'next/link'
import HeroMesh from '@/components/hero-mesh'
import ModalPlayer from '@/components/modal-player'
import { landing } from '@/app/copy'

export default function HeroSection() {
  const [introOpen, setIntroOpen] = useState(false)

  return (
    <>
      <section className="hero">
        <HeroMesh intensity="full" />
        <div className="wrap hero-inner">
          <div className="eyebrow">
            <span className="dot" />
            {landing.hero.eyebrow}
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 2.85rem)',
              fontWeight: 800,
              lineHeight: 1.16,
              maxWidth: 760,
              letterSpacing: '-0.02em',
            }}
          >
            {landing.hero.h1}
          </h1>

          <p
            className="lead"
            style={{
              marginTop: 20,
              maxWidth: 760,
              color: 'var(--text-muted)',
              fontSize: '1.06rem',
              lineHeight: 1.55,
            }}
          >
            {landing.hero.lead}
          </p>

          <div
            className="hero-cta"
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              marginTop: 28,
              alignItems: 'center',
            }}
          >
            <Link
              href="/pulse"
              className="btn btn-primary"
              style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', touchAction: 'manipulation' }}
            >
              {landing.hero.ctaPrimary}
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setIntroOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                minHeight: 44,
                touchAction: 'manipulation',
              }}
              aria-label="Watch 2min Intro about the community"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ flexShrink: 0, opacity: 0.9 }}
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>{landing.hero.ctaSecondary}</span>
            </button>
          </div>
        </div>
      </section>

      <ModalPlayer
        isOpen={introOpen}
        kind="video"
        label="neural365 COMMUNITY · 2-Min Platform Intro"
        onClose={() => setIntroOpen(false)}
      />
    </>
  )
}
