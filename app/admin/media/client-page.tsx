'use client'

import { useState, useTransition } from 'react'
import type { PulseItem } from '@/lib/seed-pulse'
import ReactMarkdown from 'react-markdown'
import { PulseCard } from '@/components/pulse-grid'
import { approveMedia, rejectMedia, updateMediaUrls } from './actions'
import { buildStoragePath, uploadToStorage } from '@/lib/supabase/storage'

export default function ClientMediaQueue({ initialItems }: { initialItems: PulseItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [isPending, startTransition] = useTransition()
  const [activeId, setActiveId] = useState(items[0]?.id)
  const [uploadingType, setUploadingType] = useState<'audio' | 'video' | null>(null)

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

  const handleAudioUpload = async (file: File) => {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|m4a|wav)$/i)) {
      alert('Please select an audio file (MP3, M4A, WAV)')
      return
    }

    setUploadingType('audio')
    const slug = activeItem?.title ? activeItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) : (activeId || 'item')
    const path = buildStoragePath('pulse-podcasts', activeItem?.pillar || 'general', slug, file.name)

    const result = await uploadToStorage('pulse-podcasts', path, file)
    setUploadingType(null)

    if (result.error) {
      alert('Audio upload failed: ' + result.error)
      return
    }

    // Save to database
    startTransition(async () => {
      try {
        await updateMediaUrls(activeId, result.url, undefined)
        setItems(prev => prev.map(item => item.id === activeId ? { ...item, podcast_audio_url: result.url } : item))
      } catch (err) {
        alert('Failed to save audio URL: ' + (err as Error).message)
      }
    })
  }

  const handleVideoUpload = async (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov)$/i)) {
      alert('Please select a video file (MP4, WebM)')
      return
    }

    setUploadingType('video')
    const slug = activeItem?.title ? activeItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) : (activeId || 'item')
    const path = buildStoragePath('neural-shorts', activeItem?.pillar || 'general', slug, file.name)

    const result = await uploadToStorage('neural-shorts', path, file)
    setUploadingType(null)

    if (result.error) {
      alert('Video upload failed: ' + result.error)
      return
    }

    // Save to database
    startTransition(async () => {
      try {
        await updateMediaUrls(activeId, undefined, result.url)
        setItems(prev => prev.map(item => item.id === activeId ? { ...item, short_video_url: result.url } : item))
      } catch (err) {
        alert('Failed to save video URL: ' + (err as Error).message)
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
              No media artifacts currently pending review. Items approved in the Text Review queue will appear here once audio &amp; video assets are generated.
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
            disabled={isPending || uploadingType !== null}
            style={{ background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--text)' }}
          >
            Reject to Draft
          </button>
          <button
            className="btn btn-primary"
            onClick={handleApprove}
            disabled={isPending || uploadingType !== null}
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
              <div style={{ display: 'flex', gap: 8, fontSize: '0.75rem', fontFamily: '"IBM Plex Mono", monospace', color: 'var(--text-muted)' }}>
                <span>{item.podcast_audio_url ? '🎙️ Audio' : '⏳ No audio'}</span>
                <span>•</span>
                <span>{item.short_video_url ? '🎬 Video' : '⏳ No video'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Preview Pane */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px', background: 'var(--bg)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            
            {/* 1. Podcast Audio Preview & Upload */}
            <div style={{ marginBottom: 40, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.8rem', color: 'var(--azure)', fontWeight: 600 }}>
                  🎙️ MICRO-PODCAST AUDIO ({activeItem.podcast_audio_url ? 'ATTACHED' : 'PENDING'})
                </h3>
                <label style={{
                  fontSize: '0.75rem',
                  fontFamily: '"IBM Plex Mono", monospace',
                  color: 'var(--azure)',
                  cursor: uploadingType === 'audio' ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  border: '1px solid var(--azure-dim)',
                  borderRadius: 6,
                  background: 'var(--azure-dim)',
                }}>
                  <span>{uploadingType === 'audio' ? 'Uploading...' : 'Upload / Replace .mp3'}</span>
                  <input
                    type="file"
                    accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a"
                    style={{ display: 'none' }}
                    disabled={uploadingType === 'audio'}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleAudioUpload(e.target.files[0])
                      }
                    }}
                  />
                </label>
              </div>

              {activeItem.podcast_audio_url ? (
                <div>
                  <audio controls style={{ width: '100%', marginBottom: 12 }} key={activeItem.podcast_audio_url}>
                    <source src={activeItem.podcast_audio_url} type="audio/mpeg" />
                    Your browser does not support audio playback.
                  </audio>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: '"IBM Plex Mono", monospace', wordBreak: 'break-all' }}>
                    CDN: {activeItem.podcast_audio_url}
                  </p>
                </div>
              ) : (
                <div style={{
                  border: '1px dashed var(--line)',
                  borderRadius: 8,
                  padding: '24px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}>
                  No podcast audio file attached yet. Upload a generated NotebookLM .mp3 above or via the background worker.
                </div>
              )}
            </div>

            {/* 2. Neural Short Video Preview & Upload */}
            <div style={{ marginBottom: 40, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.8rem', color: 'var(--lane-new)', fontWeight: 600 }}>
                  🎬 NEURAL SHORT VIDEO ({activeItem.short_video_url ? 'ATTACHED' : 'PENDING'})
                </h3>
                <label style={{
                  fontSize: '0.75rem',
                  fontFamily: '"IBM Plex Mono", monospace',
                  color: 'var(--lane-new)',
                  cursor: uploadingType === 'video' ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  border: '1px solid rgba(52, 216, 176, 0.2)',
                  borderRadius: 6,
                  background: 'rgba(52, 216, 176, 0.08)',
                }}>
                  <span>{uploadingType === 'video' ? 'Uploading...' : 'Upload / Replace .mp4'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    style={{ display: 'none' }}
                    disabled={uploadingType === 'video'}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleVideoUpload(e.target.files[0])
                      }
                    }}
                  />
                </label>
              </div>

              {activeItem.short_video_url ? (
                <div>
                  <video controls style={{ width: '100%', maxHeight: 400, borderRadius: 8, marginBottom: 12, background: '#000' }} key={activeItem.short_video_url}>
                    <source src={activeItem.short_video_url} type="video/mp4" />
                    Your browser does not support video playback.
                  </video>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: '"IBM Plex Mono", monospace', wordBreak: 'break-all' }}>
                    CDN: {activeItem.short_video_url}
                  </p>
                </div>
              ) : (
                <div style={{
                  border: '1px dashed var(--line)',
                  borderRadius: 8,
                  padding: '24px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}>
                  No short video attached yet. Upload a demo video .mp4 above.
                </div>
              )}
            </div>

            {/* 3. Card Preview */}
            <div style={{ marginBottom: 40 }}>
              <h3 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                3. PULSE CARD PREVIEW
              </h3>
              <div style={{ width: 320 }}>
                <PulseCard item={activeItem} />
              </div>
            </div>

            {/* 4. Text Preview */}
            {activeItem.content_md && (
              <div style={{ marginBottom: 40 }}>
                <h3 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  4. APPROVED BLOG TEXT
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
