'use client'

import { useState, useRef } from 'react'

interface SignupFormProps {
  onSubmit?: (email: string) => Promise<{ ok: boolean; message?: string }>
  placeholder?: string
}

export default function SignupForm({
  onSubmit,
  placeholder = 'you@company.com',
}: SignupFormProps) {
  const [msg,     setMsg]     = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const email = inputRef.current?.value ?? ''
    if (!email) return
    setLoading(true)
    setMsg('')
    try {
      if (onSubmit) {
        const res = await onSubmit(email)
        setMsg(res.ok
          ? `subscribed — ${email}`
          : (res.message ?? 'something went wrong, try again'))
      } else {
        // Default: POST to /api/subscribe (implemented in Phase 4)
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
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
                ref={inputRef}
                type="email"
                id="signup-email"
                placeholder={placeholder}
                required
                aria-label="Email address"
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
            <div className="signup-msg" id="signup-msg" role="status" aria-live="polite">
              {msg}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
