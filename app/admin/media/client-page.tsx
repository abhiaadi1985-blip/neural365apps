'use client'

import { useState, useTransition } from 'react'
import type { PulseItem } from '@/lib/seed-pulse'
import ReactMarkdown from 'react-markdown'
import { PulseCard } from '@/components/pulse-grid'
import { approveMedia, rejectMedia } from './actions'

export default function ClientMediaQueue({ initialItems }: { initialItems: PulseItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [isPending, startTransition] = useTransition()
  const [activeId, setActiveId] = useState(items[0]?.id)

  const activeItem = items.find(d => d.id === activeId) || items[0]

  const handleApprove = () => {
    if (!activeId) return
    startTransition(async () => {
      try {
        await approveMedia(activeId)
        const nextItems = items.filter(d => d.id !== activeId)
        setItems(nextItems)
        setActiveId(nextItems[0]?.id)
      } catch (err) {
        alert('Failed to approve: ' + (err as Error).message)
      }
    })
  }

  const handleReject = () => {
    if (!activeId) return
    startTransition(async () => {
      try {
        await rejectMedia(activeId)
        const nextItems = items.filter(d => d.id !== activeId)
        setItems(nextItems)
        setActiveId(nextItems[0]?.id)
      } catch (err) {
        alert('Failed to reject: ' + (err as Error).message)
      }
    })
  }

  if (items.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
        <header style={{ padding: '24px 32px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Media Review Queue</h1>
        </header>

        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '40px 24px' }}>
          <div style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: '48px 40px',
            maxWidth: 480,
            width: '100%',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎧</div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text)', marginBottom: 8, fontWeight: 600 }}>Queue is empty</h3>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
              No NotebookLM media artifacts currently pending review. Items approved in the Text Review queue will appear here once audio &amp; video assets are generated.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <header style={{ padding: '24px 32px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Media Review Queue</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn"
            onClick={handleReject}
            disabled={isPending}
            style={{ background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--text)' }}
          >
            Reject to Draft
          </button>
          <button
            className="btn btn-primary"
            onClick={handleApprove}
            disabled={isPending}
          >
            {isPending ? 'Publishing...' : 'Approve & Publish to Site'}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Queue List */}
        <div style={{ width: 320, borderRight: '1px solid var(--line)', overflowY: 'auto', background: 'var(--bg-2)' }}>
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveId(item.id)}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--line)',
                background: activeId === item.id ? 'var(--panel)' : 'transparent',
                borderLeft: activeId === item.id ? '3px solid var(--azure)' : '3px solid transparent',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: 'var(--azure)', marginBottom: 6 }}>
                {item.pillar.toUpperCase()}
              </div>
              <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.4, marginBottom: 8 }}>
                {item.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ready for Media QA
              </div>
            </div>
          ))}
        </div>

        {/* Preview Pane */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px', background: 'var(--bg)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 40 }}>
              <h3 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                1. PULSE CARD
              </h3>
              <div style={{ width: 320 }}>
                <PulseCard item={activeItem} />
              </div>
            </div>

            {activeItem.content_md && (
              <div style={{ marginBottom: 40 }}>
                <h3 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  2. APPROVED TEXT CONTENT
                </h3>
                <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '28px' }}>
                  <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text)' }}>
                    <ReactMarkdown>{activeItem.content_md}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
