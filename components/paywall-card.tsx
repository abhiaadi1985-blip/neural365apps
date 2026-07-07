import Link from 'next/link'

interface PaywallCardProps {
  tier?:    string
  ctaHref?: string
}

export default function PaywallCard({
  tier    = 'Premium',
  ctaHref = '/sign-up',
}: PaywallCardProps) {
  return (
    <div style={{
      border:       '1px solid var(--azure)',
      borderRadius: 'var(--radius)',
      background:   'var(--panel)',
      padding:      32,
      textAlign:    'center',
      boxShadow:    '0 0 40px rgba(47,134,255,0.12)',
      maxWidth:     480,
      margin:       '40px auto',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔒</div>
      <h3 style={{ marginBottom: 8 }}>{tier} content</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: 24 }}>
        This guide is available to {tier.toLowerCase()} members. Unlock interactive walkthroughs,
        inline Neural Shorts, and Micro-podcasts.
      </p>
      <Link href={ctaHref} className="btn btn-primary">
        Unlock {tier} Access
      </Link>
    </div>
  )
}
