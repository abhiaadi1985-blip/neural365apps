import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient, createAnonClient } from '@/lib/supabase/server'
import PaywallCard from '@/components/paywall-card'
import HeroMesh from '@/components/hero-mesh'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase  = await createAnonClient()
  const { data }  = await supabase
    .from('guides')
    .select('title, pillar')
    .eq('slug', slug)
    .eq('is_premium', false)
    .single()

  return {
    title: data ? `${data.title} — neural365apps` : 'Guide — neural365apps',
    description: `Hands-on guide for ${data?.pillar ?? 'D365 & Power Platform'} on neural365apps.`,
  }
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug }  = await params

  // ── Fetch guide metadata (public) ──────────────────────────────────────
  const anonClient = await createAnonClient()
  const { data: guide, error } = await anonClient
    .from('guides')
    .select('id, title, pillar, is_premium, short_video_url, podcast_audio_url, published_at, body_mdx')
    .eq('slug', slug)
    .single()

  if (error || !guide) notFound()

  // ── Check subscription for premium guides ───────────────────────────────
  let hasAccess = !guide.is_premium

  if (guide.is_premium) {
    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()

    if (user) {
      const { data: sub } = await serverClient
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('current_period_end', new Date().toISOString())
        .single()

      hasAccess = !!sub
    }
  }

  // ── Render guide body (split on media markers) ─────────────────────────
  // Markers: <!-- NEURAL_SHORT: /path --> and <!-- MICRO_PODCAST: /path -->
  const bodyWithMedia = guide.is_premium && !hasAccess
    ? null
    : guide.body_mdx

  const publishedDate = guide.published_at
    ? new Date(guide.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <>
      {/* Guide hero */}
      <section className="hero" style={{ paddingTop: 72, paddingBottom: 60 }}>
        <HeroMesh intensity="reduced" />
        <div className="wrap hero-inner">
          {guide.is_premium && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--azure-dim)', border: '1px solid var(--azure)',
              borderRadius: 6, padding: '4px 10px', fontSize: '0.76rem',
              fontFamily: '"IBM Plex Mono", monospace', color: 'var(--azure)',
              marginBottom: 16,
            }}>
              🔒 Premium guide
            </div>
          )}
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, maxWidth: 720 }}>
            {guide.title}
          </h1>
          {publishedDate && (
            <p className="mono" style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Published {publishedDate}
            </p>
          )}
        </div>
      </section>

      {/* Guide content */}
      <section style={{ padding: '48px 0 84px' }}>
        <div className="wrap" style={{ maxWidth: 740 }}>
          {!hasAccess ? (
            <PaywallCard tier="Premium" ctaHref="/sign-up" />
          ) : bodyWithMedia ? (
            <GuideBody
              mdx={bodyWithMedia}
              shortVideoUrl={guide.short_video_url}
              podcastAudioUrl={guide.podcast_audio_url}
            />
          ) : null}
        </div>
      </section>
    </>
  )
}

// ── GuideBody — renders MDX-like content with inline media ─────────────────
// Full MDX compilation is deferred to Phase 5 polish; we render raw text for now
// with media markers replaced by actual player elements.
function GuideBody({
  mdx,
  shortVideoUrl,
  podcastAudioUrl,
}: {
  mdx:             string
  shortVideoUrl?:  string | null
  podcastAudioUrl?: string | null
}) {
  // Replace media marker comments with placeholder blocks
  const withMedia = mdx
    .replace(/<!-- NEURAL_SHORT: ([^>]+) -->/g, () => (
      `<neural-short src="${shortVideoUrl ?? ''}" />`
    ))
    .replace(/<!-- MICRO_PODCAST: ([^>]+) -->/g, () => (
      `<micro-podcast src="${podcastAudioUrl ?? ''}" />`
    ))

  return (
    <article style={{
      color: 'var(--text)',
      lineHeight: 1.7,
      fontSize: '1rem',
    }}>
      {/* Inline media: Neural Short */}
      {shortVideoUrl && (
        <div style={{
          border: '1px solid var(--line)', borderRadius: 'var(--radius)',
          background: 'var(--panel)', padding: 20, marginBottom: 32,
        }}>
          <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.76rem', color: 'var(--azure)', marginBottom: 12 }}>
            ▶ NEURAL SHORT
          </div>
          <video
            src={shortVideoUrl}
            controls
            style={{ width: '100%', borderRadius: 8, background: 'var(--bg-2)' }}
          />
        </div>
      )}

      {/* Inline media: Micro-podcast */}
      {podcastAudioUrl && (
        <div style={{
          border: '1px solid var(--line)', borderRadius: 'var(--radius)',
          background: 'var(--panel)', padding: 20, marginBottom: 32,
        }}>
          <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.76rem', color: 'var(--lane-coming)', marginBottom: 12 }}>
            🎧 MICRO-PODCAST
          </div>
          <audio src={podcastAudioUrl} controls style={{ width: '100%' }} />
        </div>
      )}

      {/* Rendered body — naive markdown-like rendering for MVP */}
      <div style={{ whiteSpace: 'pre-wrap' }} suppressHydrationWarning>
        {/* Strip HTML comment markers for display */}
        {withMedia
          .replace(/<neural-short[^/]*\/>/g, '[▶ Neural Short embedded above]')
          .replace(/<micro-podcast[^/]*\/>/g, '[🎧 Micro-podcast embedded above]')
        }
      </div>
    </article>
  )
}
