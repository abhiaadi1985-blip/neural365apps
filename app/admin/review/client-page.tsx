'use client'

import { useState, useTransition } from 'react'
import type { PulseItem } from '@/lib/seed-pulse'
import ReactMarkdown from 'react-markdown'
import { PulseCard } from '@/components/pulse-grid'
import { saveDraftContent, approveDraft, seedDatabase } from './actions'

export default function ClientReviewQueue({ initialDrafts }: { initialDrafts: PulseItem[] }) {
  // We use state here so edits persist while clicking around the mock UI
  const [drafts, setDrafts] = useState(initialDrafts)
  const [isPending, startTransition] = useTransition()
  
  const [activeId, setActiveId] = useState(drafts[0]?.id)
  const [isEditing, setIsEditing] = useState(false)
  
  const activeItem = drafts.find(d => d.id === activeId) || drafts[0]

  // Local state for the textareas during edit mode
  const [editedContent, setEditedContent] = useState(activeItem?.content_md || '')
  const [editedDemo, setEditedDemo] = useState(activeItem?.demo_scenario_md || '')

  // Reset textareas when switching items
  const handleSelect = (item: typeof activeItem) => {
    setActiveId(item.id)
    setIsEditing(false)
    setEditedContent(item.content_md || '')
    setEditedDemo(item.demo_scenario_md || '')
  }

  const handleCancel = () => {
    // Revert textareas back to the saved state
    setEditedContent(activeItem?.content_md || '')
    setEditedDemo(activeItem?.demo_scenario_md || '')
    setIsEditing(false)
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveDraftContent(activeId, editedContent, editedDemo)
        setDrafts(prev => prev.map(d => 
          d.id === activeId 
            ? { ...d, content_md: editedContent, demo_scenario_md: editedDemo }
            : d
        ))
        setIsEditing(false)
      } catch (err) {
        alert('Failed to save: ' + (err as Error).message)
      }
    })
  }

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await approveDraft(activeId)
        // Remove from local drafts queue
        const nextDrafts = drafts.filter(d => d.id !== activeId)
        setDrafts(nextDrafts)
        setActiveId(nextDrafts[0]?.id)
      } catch (err) {
        alert('Failed to approve: ' + (err as Error).message)
      }
    })
  }

  const handleSeed = () => {
    startTransition(async () => {
      try {
        await seedDatabase()
        window.location.reload()
      } catch (err) {
        alert('Failed to seed: ' + (err as Error).message)
      }
    })
  }

  if (drafts.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
        <header style={{ padding: '24px 32px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Text Review Queue</h1>
        </header>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 16 }}>
          <p>Queue is empty. Your Supabase table might not have any drafts.</p>
          <button className="btn btn-primary" onClick={handleSeed} disabled={isPending}>
            {isPending ? 'Seeding...' : 'Seed Mock Data to Supabase'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <header style={{ padding: '24px 32px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Text Review Queue</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          {isEditing ? (
            <>
              <button className="btn" onClick={handleCancel} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none' }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => setIsEditing(true)} style={{ background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--text)' }} disabled={isPending}>Edit Text</button>
              <button className="btn" style={{ background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--text)' }} disabled={isPending}>Reject</button>
              <button className="btn btn-primary" onClick={handleApprove} disabled={isPending}>
                {isPending ? 'Processing...' : 'Approve & Send to NotebookLM'}
              </button>
            </>
          )}
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Queue List */}
        <div style={{ width: 320, borderRight: '1px solid var(--line)', overflowY: 'auto', background: 'var(--bg-2)' }}>
          {drafts.map((item, idx) => (
            <div key={item.id} onClick={() => handleSelect(item)} style={{ 
              padding: '16px 20px', 
              borderBottom: '1px solid var(--line)',
              background: activeId === item.id ? 'var(--panel)' : 'transparent',
              borderLeft: activeId === item.id ? '3px solid var(--azure)' : '3px solid transparent',
              cursor: 'pointer'
            }}>
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: 'var(--azure)', marginBottom: 6 }}>
                {item.pillar.toUpperCase()}
              </div>
              <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.4, marginBottom: 8 }}>
                {item.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Generated 10 mins ago
              </div>
            </div>
          ))}
        </div>

        {/* Preview Pane */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px', background: 'var(--bg)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            
            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>1. PULSE CARD PREVIEW</h3>
              <div style={{ width: 320 }}>
                <PulseCard item={activeItem} />
              </div>
            </div>

            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>2. BLOG POST PREVIEW</h3>
              {isEditing ? (
                <textarea 
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  style={{ width: '100%', minHeight: 300, padding: 24, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--azure)', color: 'var(--text)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.9rem', lineHeight: 1.6, resize: 'vertical' }}
                />
              ) : (
                <div className="pulse-detail-content" style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px' }}>
                  <div className="blog-content" style={{ fontSize: '1.05rem', lineHeight: 1.75, color: 'var(--text)' }}>
                    <ReactMarkdown>{editedContent}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>3. DEMO SCENARIO PREVIEW</h3>
              {isEditing ? (
                <textarea 
                  value={editedDemo}
                  onChange={(e) => setEditedDemo(e.target.value)}
                  style={{ width: '100%', minHeight: 250, padding: 24, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--azure)', color: 'var(--text)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.9rem', lineHeight: 1.6, resize: 'vertical' }}
                />
              ) : (
                <div className="pulse-detail-content" style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderLeft: '4px solid var(--azure)', borderRadius: 'var(--radius)', padding: '32px' }}>
                  <div className="demo-content" style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                    <ReactMarkdown>{editedDemo}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
