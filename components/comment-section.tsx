'use client'

import { useState, useTransition } from 'react'
import { addComment } from '@/lib/comments/actions'
import type { CommentItem } from '@/lib/comments/actions'

export default function CommentSection({
  contentType,
  contentId,
  initialComments = [],
  revalidateUrl,
}: {
  contentType: 'pulse' | 'blog'
  contentId: string
  initialComments?: CommentItem[]
  revalidateUrl?: string
}) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!name.trim()) {
      setErrorMsg('Please provide your name.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid email address.')
      return
    }
    if (!body.trim()) {
      setErrorMsg('Please enter a comment.')
      return
    }

    startTransition(async () => {
      const res = await addComment(contentType, contentId, name, email, body, revalidateUrl)
      if (res.success && res.comment) {
        setComments(prev => [...prev, res.comment!])
        setBody('')
        setSuccessMsg('Your comment has been posted! Thank you for contributing to the community.')
      } else {
        setErrorMsg(res.error || 'Failed to post comment. Please try again.')
      }
    })
  }

  return (
    <section style={{ marginTop: 48, paddingTop: 36, borderTop: '1px solid var(--line)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>Community Discussion</span>
          <span style={{
            fontSize: '0.72rem',
            fontFamily: '"IBM Plex Mono", monospace',
            background: 'var(--azure-dim)',
            color: 'var(--azure)',
            padding: '2px 8px',
            borderRadius: 12,
          }}>
            {comments.length}
          </span>
        </h3>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: '"IBM Plex Mono", monospace' }}>
          Open to all practitioners
        </span>
      </div>

      {/* Existing Comments */}
      {comments.length === 0 ? (
        <div style={{
          padding: 24,
          background: 'var(--panel)',
          border: '1px dashed var(--line)',
          borderRadius: 'var(--radius)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.88rem',
          marginBottom: 32,
        }}>
          No comments yet. Be the first to share your implementation perspective or question!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
          {comments.map((c) => (
            <div
              key={c.id}
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                padding: '20px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--azure-dim)',
                    color: 'var(--azure)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}>
                    {c.author_name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text)' }}>
                    {c.author_name}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: '"IBM Plex Mono", monospace' }}>
                  {new Date(c.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Comment Form */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        padding: 28,
      }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>
          Join the conversation
        </h4>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '10px 14px',
            borderRadius: 6,
            fontSize: '0.85rem',
            marginBottom: 16,
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(52, 216, 176, 0.1)',
            border: '1px solid rgba(52, 216, 176, 0.3)',
            color: 'var(--lane-new)',
            padding: '10px 14px',
            borderRadius: 6,
            fontSize: '0.85rem',
            marginBottom: 16,
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, fontFamily: '"IBM Plex Mono", monospace' }}>
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Alex Henderson"
                required
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  padding: '9px 12px',
                  color: 'var(--text)',
                  fontSize: '0.88rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, fontFamily: '"IBM Plex Mono", monospace' }}>
                Email Address (kept private) *
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex@company.com"
                required
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  padding: '9px 12px',
                  color: 'var(--text)',
                  fontSize: '0.88rem',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, fontFamily: '"IBM Plex Mono", monospace' }}>
              Your Comment or Question *
            </label>
            <textarea
              rows={4}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Share your practical experience, ask a question, or discuss architectural trade-offs..."
              required
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: 6,
                padding: '10px 14px',
                color: 'var(--text)',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                resize: 'vertical',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary"
            style={{ fontSize: '0.88rem', padding: '9px 20px' }}
          >
            {isPending ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </div>
    </section>
  )
}
