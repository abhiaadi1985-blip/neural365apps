'use client'

import { useState, useRef } from 'react'

const TOPICS = [
  { slug: 'd365-fo', label: 'D365 ERP' },
  { slug: 'dataverse-power-platform', label: 'Dataverse & Power Platform' },
  { slug: 'copilot-ai-agents', label: 'Copilot & AI Agents' },
  { slug: 'industry-solutions', label: 'Industry Solutions' },
]

interface SignupFormProps {
  onSubmit?: (email: string, topics: string[]) => Promise<{ ok: boolean; message?: string }>
  placeholder?: string
}

export default function SignupForm({
  onSubmit,
  placeholder = 'you@company.com',
}: SignupFormProps) {
  const [msg,     setMsg]     = useState('')
  const [loading, setLoading] = useState(false)
  const [topics, setTopics]   = useState<string[]>(TOPICS.map(t => t.slug))
  const inputRef = useRef<HTMLInputElement>(null)

  function toggleTopic(slug: string) {
    setTopics(prev =>
      prev.includes(slug)
        ? prev.filter(t => t !== slug)
        : [...prev, slug]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const email = inputRef.current?.value ?? ''
    if (!email) return
    if (topics.length === 0) {
      setMsg('Please select at least one topic.')
      return
    }
    setLoading(true)
    setMsg('')
    try {
      if (onSubmit) {
        const res = await onSubmit(email, topics)
        setMsg(res.ok
          ? `subscribed — ${email}`
          : (res.message ?? 'something went wrong, try again'))
      } else {
        // Default: POST to /api/subscribe
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, topics }),
        })
        setMsg(res.ok ? `subscribed — ${email}` : 'something went wrong, try again')
      }
      if (inputRef.current) inputRef.current.value = ''
    } catch {
      setMsg('network error — try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section" id="subscribe">
      <div className="wrap">
        <div className="pulse-signup">
          <div>
            <h3>Get the Pulse in your inbox.</h3>
            <p>One short email when something genuinely changes — no daily noise.</p>
          </div>
          <div>
            <form className="signup" onSubmit={handleSubmit} noValidate>
              <input
                suppressHydrationWarning
                ref={inputRef}
                type="email"
                id="signup-email"
                placeholder={placeholder}
                required
                aria-label="Email address"
                disabled={loading}
              />
              <button
                suppressHydrationWarning
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>

            {/* Topic checkboxes */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px 16px',
              marginTop: 12,
            }}>
              {TOPICS.map(t => (
                <label
                  key={t.slug}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    cursor: 'pointer',
                    fontSize: '0.76rem',
                    color: topics.includes(t.slug) ? 'var(--text)' : 'var(--text-muted)',
                    fontFamily: '"IBM Plex Mono", monospace',
                    transition: 'color 0.15s',
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={topics.includes(t.slug)}
                    onChange={() => toggleTopic(t.slug)}
                    disabled={loading}
                    style={{
                      accentColor: 'var(--azure)',
                      width: 14,
                      height: 14,
                      cursor: 'pointer',
                    }}
                  />
                  {t.label}
                </label>
              ))}
            </div>

            <div className="signup-msg" id="signup-msg" role="status" aria-live="polite">
              {msg}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

