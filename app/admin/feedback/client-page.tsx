'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import type { FeedbackQueueItem } from './page'
import { restoreToDraft } from './actions'

export default function ClientFeedbackQueue({ initialItems }: { initialItems: FeedbackQueueItem[] }) {
  const [items, setItems] = useState<FeedbackQueueItem[]>(initialItems)
  const [activeTab, setActiveTab] = useState<'revision_requested' | 'rejected'>('revision_requested')
  const [isPending, startTransition] = useTransition()

  const revisionItems = items.filter((i) => i.status === 'revision_requested')
  const rejectedItems = items.filter((i) => i.status === 'rejected')
  const visibleItems = activeTab === 'revision_requested' ? revisionItems : rejectedItems

  const handleRestore = (item: FeedbackQueueItem) => {
    startTransition(async () => {
      try {
        await restoreToDraft(item.type, item.id)
        setItems((prev) => prev.filter((x) => !(x.id === item.id && x.type === item.type)))
        window.dispatchEvent(new Event('admin-counts-updated'))
      } catch (err) {
        alert('Failed to restore item: ' + (err as Error).message)
      }
    })
  }

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <header
        style={{
          padding: '24px 32px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 4 }}>Feedback &amp; Rejected Queue</h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
            Items flagged for revision are exposed to Hermes at <code>GET /api/hermes/feedback</code> and return to Draft once updated.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn"
            onClick={() => setActiveTab('revision_requested')}
            style={{
              background: activeTab === 'revision_requested' ? 'rgba(245, 158, 11, 0.16)' : 'var(--panel)',
              border: `1px solid ${activeTab === 'revision_requested' ? 'rgba(245, 158, 11, 0.4)' : 'var(--line)'}`,
              color: activeTab === 'revision_requested' ? '#fcd34d' : 'var(--text-muted)',
            }}
          >
            Pending Revision ({revisionItems.length})
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setActiveTab('rejected')}
            style={{
              background: activeTab === 'rejected' ? 'rgba(239, 68, 68, 0.14)' : 'var(--panel)',
              border: `1px solid ${activeTab === 'rejected' ? 'rgba(239, 68, 68, 0.35)' : 'var(--line)'}`,
              color: activeTab === 'rejected' ? '#fca5a5' : 'var(--text-muted)',
            }}
          >
            Rejected Archive ({rejectedItems.length})
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {visibleItems.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                padding: '48px 32px',
              }}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>
                {activeTab === 'revision_requested' ? '📝' : '🗑️'}
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text)', marginBottom: 8, fontWeight: 600 }}>
                {activeTab === 'revision_requested' ? 'No items awaiting revision' : 'No rejected items'}
              </h3>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.5, maxWidth: 460, margin: '0 auto 20px' }}>
                {activeTab === 'revision_requested'
                  ? 'Use "Reject / Feedback" in Text Review or Blog Review to send feedback to Hermes.'
                  : 'Rejected items are archived here with their dedupe hash preserved so Hermes does not re-ingest them.'}
              </p>
              <Link href="/admin/review" className="btn btn-secondary btn-sm">
                ← Back to Text Review
              </Link>
            </div>
          ) : (
            visibleItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span
                        style={{
                          fontFamily: '"IBM Plex Mono", monospace',
                          fontSize: '0.68rem',
                          padding: '2px 7px',
                          borderRadius: 4,
                          background: item.type === 'pulse' ? 'var(--azure-dim)' : 'rgba(168, 85, 247, 0.15)',
                          color: item.type === 'pulse' ? 'var(--azure)' : '#c084fc',
                        }}
                      >
                        {item.type.toUpperCase()}
                      </span>
                      <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {item.pillar.toUpperCase()}
                      </span>
                      {item.reviewed_at && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          • {new Date(item.reviewed_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                      {item.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => handleRestore(item)}
                    disabled={isPending}
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      color: 'var(--text)',
                      flexShrink: 0,
                    }}
                  >
                    Restore to Draft
                  </button>
                </div>

                {item.summary && (
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    {item.summary}
                  </p>
                )}

                <div
                  style={{
                    background: 'var(--bg)',
                    border: `1px solid ${item.status === 'revision_requested' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.25)'}`,
                    borderLeft: `3px solid ${item.status === 'revision_requested' ? '#f59e0b' : '#ef4444'}`,
                    borderRadius: 6,
                    padding: '12px 14px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: '"IBM Plex Mono", monospace',
                      fontSize: '0.68rem',
                      color: item.status === 'revision_requested' ? '#fcd34d' : '#fca5a5',
                      marginBottom: 4,
                    }}
                  >
                    {item.status === 'revision_requested' ? 'REVISION FEEDBACK FOR HERMES' : 'REJECTION REASON'}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.5 }}>
                    {item.review_feedback || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No reason provided.</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
