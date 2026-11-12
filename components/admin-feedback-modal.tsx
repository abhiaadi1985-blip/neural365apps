'use client'

import { useState, useEffect } from 'react'

interface AdminFeedbackModalProps {
  isOpen: boolean
  itemTitle: string
  isPending: boolean
  onClose: () => void
  onSubmit: (status: 'revision_requested' | 'rejected', feedback: string) => void
}

export function AdminFeedbackModal({
  isOpen,
  itemTitle,
  isPending,
  onClose,
  onSubmit,
}: AdminFeedbackModalProps) {
  const [feedback, setFeedback] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      setFeedback('')
      setErrorMsg('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleRequestRevision = () => {
    if (!feedback.trim()) {
      setErrorMsg('Please enter feedback so Hermes knows what to revise.')
      return
    }
    setErrorMsg('')
    onSubmit('revision_requested', feedback)
  }

  const handleReject = () => {
    setErrorMsg('')
    onSubmit('rejected', feedback)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 540,
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          padding: 28,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            Reject or Request Revision
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.25rem',
              cursor: 'pointer',
              lineHeight: 1,
            }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
          Item: <strong style={{ color: 'var(--text)' }}>{itemTitle}</strong>
        </p>

        <label
          style={{
            display: 'block',
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginBottom: 8,
            letterSpacing: '0.04em',
          }}
        >
          FEEDBACK FOR HERMES / REJECTION REASON
        </label>
        <textarea
          value={feedback}
          onChange={(e) => {
            setFeedback(e.target.value)
            if (errorMsg) setErrorMsg('')
          }}
          placeholder="e.g. Too generic — add specific Dataverse API details, or shorten the summary and include a concrete D365 F&O scenario."
          rows={5}
          disabled={isPending}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 8,
            background: 'var(--bg)',
            border: `1px solid ${errorMsg ? '#f87171' : 'var(--line)'}`,
            color: 'var(--text)',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            resize: 'vertical',
            marginBottom: 8,
          }}
        />

        {errorMsg && (
          <div style={{ fontSize: '0.8rem', color: '#f87171', marginBottom: 12 }}>
            {errorMsg}
          </div>
        )}

        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 20 }}>
          • <strong>Request Revision</strong> moves this item to the Feedback Queue so Hermes can rewrite it via <code>/api/hermes/feedback</code>.<br />
          • <strong>Reject &amp; Discard</strong> archives it (keeping its dedupe hash so Hermes won&apos;t re-ingest it).
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn"
            onClick={onClose}
            disabled={isPending}
            style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text-muted)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleReject}
            disabled={isPending}
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
            }}
          >
            {isPending ? 'Saving...' : 'Reject & Discard'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleRequestRevision}
            disabled={isPending}
            style={{
              background: 'rgba(245, 158, 11, 0.16)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fcd34d',
              fontWeight: 600,
            }}
          >
            {isPending ? 'Sending...' : 'Request Revision (Hermes)'}
          </button>
        </div>
      </div>
    </div>
  )
}
