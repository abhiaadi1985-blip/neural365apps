'use client'

import { useEffect, useRef } from 'react'

interface ModalPlayerProps {
  src:    string | null
  kind:   'video' | 'audio'
  label:  string
  onClose: () => void
}

export default function ModalPlayer({ src, kind, label, onClose }: ModalPlayerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeRef   = useRef<HTMLButtonElement>(null)
  const isOpen = !!src

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
      <div className="modal-box">
        <div className="modal-player">
          {src && kind === 'video' ? (
            <video
              src={src}
              controls
              autoPlay
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : src && kind === 'audio' ? (
            <div style={{ padding: '32px', textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎧</div>
              <audio src={src} controls style={{ width: '100%' }} autoPlay />
            </div>
          ) : (
            /* Placeholder — no real media src yet */
            <button className="play-btn" aria-label="Play (placeholder)">▶</button>
          )}
        </div>
        <div className="modal-footer">
          <span className="label">{label}</span>
          <button ref={closeRef} className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
