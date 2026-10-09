'use client'

import { useState, useTransition, useRef } from 'react'
import type { PulseItem } from '@/lib/seed-pulse'
import ReactMarkdown from 'react-markdown'
import { PulseCard } from '@/components/pulse-grid'
import { saveDraftContent, approveDraft, seedDatabase } from './actions'
import { buildStoragePath, uploadToStorage } from '@/lib/supabase/storage'

export default function ClientReviewQueue({ initialDrafts }: { initialDrafts: PulseItem[] }) {
  // We use state here so edits persist while clicking around the mock UI
  const [drafts, setDrafts] = useState(initialDrafts)
  const [isPending, startTransition] = useTransition()
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  
  const [activeId, setActiveId] = useState(drafts[0]?.id)
  const [isEditing, setIsEditing] = useState(false)
  
  const activeItem = drafts.find(d => d.id === activeId) || drafts[0]

  // Local state for the textareas during edit mode
  const [editedContent, setEditedContent] = useState(activeItem?.content_md || '')
  const [editedDemo, setEditedDemo] = useState(activeItem?.demo_scenario_md || '')

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const demoTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Upload image and insert markdown into specified field
  const handleImageUpload = async (
    file: File,
    target: 'content' | 'demo'
  ) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP, SVG, GIF)')
      return
    }

    setIsUploadingImage(true)
    const slug = activeItem?.title ? activeItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) : (activeId || 'draft')
    const path = buildStoragePath('blog-assets', activeItem?.pillar || 'general', slug, file.name)

    const result = await uploadToStorage('blog-assets', path, file)
    setIsUploadingImage(false)

    if (result.error) {
      alert('Image upload failed: ' + result.error)
      return
    }

    const markdownImage = `\n\n![${file.name.replace(/\.[^/.]+$/, '')}](${result.url})\n\n`
    if (target === 'content') {
      setEditedContent(prev => prev + markdownImage)
    } else {
      setEditedDemo(prev => prev + markdownImage)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>, target: 'content' | 'demo') => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0], target)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, target: 'content' | 'demo') => {
    if (e.clipboardData.files && e.clipboardData.files[0]) {
      const file = e.clipboardData.files[0]
      if (file.type.startsWith('image/')) {
        e.preventDefault()
        handleImageUpload(file, target)
      }
    }
  }

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>2. BLOG POST PREVIEW</h3>
                {isEditing && (
                  <label style={{
                    fontSize: '0.75rem',
                    fontFamily: '"IBM Plex Mono", monospace',
                    color: 'var(--azure)',
                    cursor: isUploadingImage ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    border: '1px solid var(--line)',
                    borderRadius: 6,
                    background: 'var(--panel)',
                  }}>
                    <span>🖼️ {isUploadingImage ? 'Uploading...' : 'Attach Image / Diagram'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={isUploadingImage}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(e.target.files[0], 'content')
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              {isEditing ? (
                <div>
                  <textarea 
                    ref={contentTextareaRef}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    onDrop={(e) => handleDrop(e, 'content')}
                    onPaste={(e) => handlePaste(e, 'content')}
                    placeholder="Write blog markdown here... (Drop or paste images directly into this box to auto-upload to blog-assets)"
                    style={{ width: '100%', minHeight: 320, padding: 20, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--azure)', color: 'var(--text)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.9rem', lineHeight: 1.6, resize: 'vertical' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: '"IBM Plex Mono", monospace', marginTop: 6 }}>
                    💡 Tip: Drag &amp; drop or paste screenshots directly into the editor — they are auto-uploaded to <code>blog-assets</code> and linked.
                  </div>
                </div>
              ) : (
                <div className="pulse-detail-content" style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px' }}>
                  <div className="blog-content" style={{ fontSize: '1.05rem', lineHeight: 1.75, color: 'var(--text)' }}>
                    <ReactMarkdown>{editedContent}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>3. DEMO SCENARIO PREVIEW</h3>
                {isEditing && (
                  <label style={{
                    fontSize: '0.75rem',
                    fontFamily: '"IBM Plex Mono", monospace',
                    color: 'var(--azure)',
                    cursor: isUploadingImage ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    border: '1px solid var(--line)',
                    borderRadius: 6,
                    background: 'var(--panel)',
                  }}>
                    <span>🖼️ {isUploadingImage ? 'Uploading...' : 'Attach Demo Screenshot'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={isUploadingImage}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(e.target.files[0], 'demo')
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              {isEditing ? (
                <div>
                  <textarea 
                    ref={demoTextareaRef}
                    value={editedDemo}
                    onChange={(e) => setEditedDemo(e.target.value)}
                    onDrop={(e) => handleDrop(e, 'demo')}
                    onPaste={(e) => handlePaste(e, 'demo')}
                    placeholder="Write demo scenario markdown here... (Drop or paste screenshots directly)"
                    style={{ width: '100%', minHeight: 250, padding: 20, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--azure)', color: 'var(--text)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.9rem', lineHeight: 1.6, resize: 'vertical' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: '"IBM Plex Mono", monospace', marginTop: 6 }}>
                    💡 Tip: Drag &amp; drop or paste demo step screenshots directly.
                  </div>
                </div>
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
