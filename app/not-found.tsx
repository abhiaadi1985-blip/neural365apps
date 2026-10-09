import Link from 'next/link'
import HeroMesh from '@/components/hero-mesh'

export default function NotFound() {
  return (
    <>
      <section className="hero" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <HeroMesh intensity="reduced" />
        <div className="wrap hero-inner" style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--azure) 0%, rgba(47,134,255,0.4) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 16,
            lineHeight: 1,
          }}>
            404
          </div>
          <h1 style={{
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            fontWeight: 700,
            marginBottom: 12,
          }}>
            Page not found
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '1rem',
            maxWidth: 440,
            margin: '0 auto 32px',
            lineHeight: 1.6,
          }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-primary">
              Back to Home
            </Link>
            <Link href="/pulse" style={{
              display: 'inline-flex',
              alignItems: 'center',
              border: '1px solid var(--line)',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              background: 'transparent',
              transition: 'border-color 0.15s',
            }}>
              Browse the Pulse →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
