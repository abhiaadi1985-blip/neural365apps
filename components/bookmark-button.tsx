'use client'

import { useState, useTransition } from 'react'
import { toggleBookmark } from '@/lib/comments/actions'

export default function BookmarkButton({
  contentType,
  contentId,
  title,
  pillar,
  initialBookmarked = false,
}: {
  contentType: 'pulse' | 'blog'
  contentId: string
  title: string
  pillar: string
  initialBookmarked?: boolean
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    startTransition(async () => {
      const res = await toggleBookmark(contentType, contentId, title, pillar)
      if (res.error) {
        alert(res.error)
      } else {
        setBookmarked(res.isBookmarked)
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={bookmarked ? 'Remove from saved' : 'Save to my account'}
      style={{
        background: bookmarked ? 'var(--azure-dim)' : 'transparent',
        border: `1px solid ${bookmarked ? 'var(--azure)' : 'var(--line)'}`,
        color: bookmarked ? 'var(--azure)' : 'var(--text-muted)',
        borderRadius: 6,
        padding: '6px 12px',
        minHeight: 34,
        fontSize: '0.78rem',
        cursor: isPending ? 'wait' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: '"IBM Plex Mono", monospace',
        transition: 'all 0.15s ease',
        touchAction: 'manipulation',
      }}
    >
      <span>{bookmarked ? '★' : '☆'}</span>
      <span>{bookmarked ? 'Saved' : 'Save'}</span>
    </button>
  )
}
