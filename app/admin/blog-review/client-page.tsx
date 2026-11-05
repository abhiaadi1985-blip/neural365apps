'use client'

import { useState, useTransition, useRef } from 'react'
import type { BlogPost } from '@/lib/seed-blog'
import ReactMarkdown from 'react-markdown'
import { saveBlogDraft, approveBlogDraft, seedBlogDatabase } from './actions'
import { buildStoragePath, uploadToStorage } from '@/lib/supabase/storage'

export default function ClientBlogReviewQueue({ initialDrafts }: { initialDrafts: BlogPost[] }) {
  const [drafts, setDrafts] = useState<BlogPost[]>(initialDrafts)
  const [isPending, startTransition] = useTransition()
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const [activeId, setActiveId] = useState(drafts[0]?.id)
  const [isEditing, setIsEditing] = useState(false)

  const activeItem = drafts.find((d) => d.id === activeId) || drafts[0]

  // Local state for editing fields
  const [editedBody, setEditedBody] = useState(activeItem?.body_md || '')
  const [editedSubtitle, setEditedSubtitle] = useState(activeItem?.subtitle || '')

  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Upload image and insert markdown into body
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP, SVG, GIF)')
      return
    }

    setIsUploadingImage(true)
    const slug = activeItem?.slug || (activeItem?.title ? activeItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) : (activeId || 'draft'))
    const path = buildStoragePath('blog-assets', activeItem?.pillar || 'general', slug, file.name)

    const result = await uploadToStorage('blog-assets', path, file)
    setIsUploadingImage(false)

    if (result.error) {
      alert('Image upload failed: ' + result.error)
      return
    }

    const markdownImage = `\n\n![${file.name.replace(/\.[^/.]+$/, '')}](${result.url})\n\n`
    setEditedBody((prev) => prev + markdownImage)
  }

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0])
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData.files && e.clipboardData.files[0]) {
      const file = e.clipboardData.files[0]
      if (file.type.startsWith('image/')) {
        e.preventDefault()
        handleImageUpload(file)
      }
    }
  }

  // Reset inputs when switching items
  const handleSelect = (item: BlogPost) => {
    setActiveId(item.id)
    setIsEditing(false)
    setEditedBody(item.body_md || '')
    setEditedSubtitle(item.subtitle || '')
  }

  const handleCancel = () => {
    setEditedBody(activeItem?.body_md || '')
    setEditedSubtitle(activeItem?.subtitle || '')
    setIsEditing(false)
  }

  const handleSave = () => {
    if (!activeId) return
    startTransition(async () => {
      try {
        await saveBlogDraft(activeId, editedBody, editedSubtitle)
        setDrafts((prev) =>
          prev.map((d) =>
            d.id === activeId
              ? { ...d, body_md: editedBody, subtitle: editedSubtitle }
              : d
          )
        )
        setIsEditing(false)
      } catch (err) {
        alert('Failed to save: ' + (err as Error).message)
      }
    })
  }

  const handleApprove = () => {
    if (!activeId) return
    startTransition(async () => {
      try {
        await approveBlogDraft(activeId)
        // Remove from local drafts queue
        const nextDrafts = drafts.filter((d) => d.id !== activeId)
        setDrafts(nextDrafts)
        setActiveId(nextDrafts[0]?.id)
        if (nextDrafts[0]) {
          setEditedBody(nextDrafts[0].body_md || '')
          setEditedSubtitle(nextDrafts[0].subtitle || '')
        }
      } catch (err) {
        alert('Failed to approve: ' + (err as Error).message)
      }
    })
  }

  const handleSeed = () => {
    startTransition(async () => {
      try {
        await seedBlogDatabase()
        window.location.reload()
      } catch (err) {
        alert('Failed to seed: ' + (err as Error).message)
      }
    })
  }

  if (drafts.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
        <header
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Blog Review Queue</h1>
        </header>
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            gap: 16,
          }}
        >
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
      <header
        style={{
          padding: '24px 32px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Blog Review Queue</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          {isEditing ? (
            <>
              <button
                className="btn"
                onClick={handleCancel}
                style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none' }}
                disabled={isPending}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button
                className="btn"
                onClick={() => setIsEditing(true)}
                style={{ background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--text)' }}
                disabled={isPending}
              >
                Edit Text
              </button>
              <button
                className="btn"
                style={{ background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--text)' }}
                disabled={isPending}
              >
                Reject
              </button>
              <button className="btn btn-primary" onClick={handleApprove} disabled={isPending}>
                {isPending ? 'Processing...' : 'Approve & Send to NotebookLM'}
              </button>
            </>
          )}
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Queue List (Left Sidebar) */}
        <div
          style={{
            width: 320,
            borderRight: '1px solid var(--line)',
            overflowY: 'auto',
            background: 'var(--bg-2)',
          }}
        >
          {drafts.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--line)',
                background: activeId === item.id ? 'var(--panel)' : 'transparent',
                borderLeft: activeId === item.id ? '3px solid var(--azure)' : '3px solid transparent',
                cursor: 'pointer',
              }}
            >
              <div style={{ marginBottom: 6 }}>
                <span
                  style={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: '0.65rem',
                    color: 'var(--azure)',
                    background: 'var(--azure-dim)',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  {item.pillar?.toUpperCase()}
                </span>
              </div>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  color: 'var(--text)',
                  lineHeight: 1.4,
                  marginBottom: 6,
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  wordBreak: 'break-all',
                }}
              >
                /{item.slug}
              </div>
            </div>
          ))}
        </div>

        {/* Preview Pane (Right Pane) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px', background: 'var(--bg)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* Section 1: Post Metadata */}
            <div
              style={{
                marginBottom: 40,
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                padding: '28px 32px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <h3
                  style={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.08em',
                  }}
                >
                  1. POST METADATA
                </h3>
                <span
                  style={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: '0.7rem',
                    color: 'var(--azure)',
                    background: 'var(--azure-dim)',
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontWeight: 600,
                  }}
                >
                  {activeItem?.pillar?.toUpperCase()}
                </span>
              </div>

              <h2
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: 'var(--text)',
                  lineHeight: 1.35,
                  marginBottom: 12,
                }}
              >
                {activeItem?.title}
              </h2>

              {isEditing ? (
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontFamily: '"IBM Plex Mono", monospace',
                      color: 'var(--text-muted)',
                      marginBottom: 6,
                    }}
                  >
                    SUBTITLE
                  </label>
                  <input
                    type="text"
                    value={editedSubtitle}
                    onChange={(e) => setEditedSubtitle(e.target.value)}
                    placeholder="Enter blog post subtitle..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 6,
                      background: 'var(--bg)',
                      border: '1px solid var(--azure)',
                      color: 'var(--text)',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>
              ) : (
                activeItem?.subtitle && (
                  <p
                    style={{
                      fontSize: '1rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      marginBottom: 16,
                    }}
                  >
                    {activeItem.subtitle}
                  </p>
                )
              )}

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 8,
                  paddingTop: 14,
                  borderTop: '1px solid var(--line)',
                }}
              >
                <span
                  style={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    marginRight: 4,
                  }}
                >
                  TAGS:
                </span>
                {activeItem?.tags && activeItem.tags.length > 0 ? (
                  activeItem.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'var(--bg-2)',
                        border: '1px solid var(--line)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None</span>
                )}
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  slug: <code>{activeItem?.slug}</code>
                </span>
              </div>
            </div>

            {/* Section 2: Body Markdown Preview / Edit */}
            <div style={{ marginBottom: 48 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <h3
                  style={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.08em',
                  }}
                >
                  2. BODY MARKDOWN
                </h3>
                {isEditing && (
                  <label
                    style={{
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
                    }}
                  >
                    <span>🖼️ {isUploadingImage ? 'Uploading...' : 'Attach Image / Diagram'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={isUploadingImage}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(e.target.files[0])
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {isEditing ? (
                <div>
                  <textarea
                    ref={bodyTextareaRef}
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    onDrop={handleDrop}
                    onPaste={handlePaste}
                    placeholder="Write blog markdown here... (Drop or paste images directly into this box to auto-upload to blog-assets)"
                    style={{
                      width: '100%',
                      minHeight: 480,
                      padding: 20,
                      borderRadius: 8,
                      background: 'var(--bg)',
                      border: '1px solid var(--azure)',
                      color: 'var(--text)',
                      fontFamily: '"IBM Plex Mono", monospace',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      resize: 'vertical',
                    }}
                  />
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      fontFamily: '"IBM Plex Mono", monospace',
                      marginTop: 6,
                    }}
                  >
                    💡 Tip: Drag &amp; drop or paste screenshots directly into the editor — they are auto-uploaded to{' '}
                    <code>blog-assets</code> and linked.
                  </div>
                </div>
              ) : (
                <div
                  className="pulse-detail-content"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius)',
                    padding: '32px 36px',
                  }}
                >
                  <div className="blog-content" style={{ fontSize: '1.05rem', lineHeight: 1.75, color: 'var(--text)' }}>
                    <ReactMarkdown>{editedBody}</ReactMarkdown>
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
