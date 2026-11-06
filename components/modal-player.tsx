'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface ModalPlayerProps {
  src?:   string | null
  kind?:  'video' | 'audio'
  label:  string
  isOpen?: boolean
  isVertical?: boolean
  onClose: () => void
}

export default function ModalPlayer({
  src,
  kind = 'video',
  label,
  isOpen: propIsOpen,
  isVertical = false,
  onClose,
}: ModalPlayerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeRef   = useRef<HTMLButtonElement>(null)
  const isOpen = propIsOpen !== undefined ? propIsOpen : !!src

  // Trap focus + Escape to close
  useEffect(() => {
    if (!isOpen) return
    closeRef.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="modal-overlay open"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="modal-box"
        style={
          isVertical
            ? { maxWidth: 420, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }
            : undefined
        }
      >
        <div
          className="modal-player"
          style={
            isVertical
              ? { aspectRatio: '9 / 16', maxHeight: '72vh', background: '#000' }
              : undefined
          }
        >
          {src && kind === 'video' ? (
            <video
              src={src}
              controls
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: isVertical ? 'contain' : 'cover',
                background: '#000',
              }}
            />
          ) : src && kind === 'audio' ? (
            <div style={{ padding: '32px', textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎧</div>
              <audio src={src} controls style={{ width: '100%' }} autoPlay />
            </div>
          ) : (
            /* Placeholder — no real media src yet: show logo linking to home */
            <Link
              href="/"
              aria-label="Go to neural365 Community home"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                width: '100%',
                height: '100%',
                textDecoration: 'none',
                padding: '32px 0',
              }}
            >
              {/* Pulsing logo container */}
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 96,
                height: 96,
                borderRadius: '50%',
                background: 'rgba(47,134,255,0.12)',
                border: '1.5px solid rgba(47,134,255,0.35)',
                boxShadow: '0 0 28px rgba(47,134,255,0.2)',
                animation: 'pulse-glow 2.4s ease-in-out infinite',
              }}>
                <Image
                  src="/neural365-logo-mark.png"
                  alt="neural365 Community"
                  width={60}
                  height={60}
                  style={{ filter: 'brightness(1.1)' }}
                />
              </span>
              <span style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
              }}>
                Go to neural365 Community →
              </span>
              <style>{`
                @keyframes pulse-glow {
                  0%, 100% { box-shadow: 0 0 28px rgba(47,134,255,0.2); }
                  50%       { box-shadow: 0 0 48px rgba(47,134,255,0.42); }
                }
              `}</style>
            </Link>
          )}
        </div>
        <div className="modal-footer" style={{ gap: 12 }}>
          <span
            className="label"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
            }}
          >
            {label}
          </span>
          <button
            ref={closeRef}
            className="close-btn"
            onClick={onClose}
            style={{ flexShrink: 0, minHeight: 36, padding: '6px 14px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
