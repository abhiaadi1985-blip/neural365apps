import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import HeroMesh from '@/components/hero-mesh'
import { PulseCard } from '@/components/pulse-grid'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { laneLabels } from '@/lib/design-tokens'
import type { Lane } from '@/lib/design-tokens'
import { SEED_PULSE } from '@/lib/seed-pulse'
import CommentSection from '@/components/comment-section'
import BookmarkButton from '@/components/bookmark-button'
import { getComments } from '@/lib/comments/actions'

const pillarMeta: Record<string, { label: string; href: string }> = {
  'd365-fo':                  { label: 'D365 ERP',                  href: '/d365-fo' },
  'dataverse-power-platform': { label: 'Dataverse & Power Platform', href: '/dataverse-power-platform' },
  'copilot-ai-agents':        { label: 'Copilot & AI Agents',        href: '/copilot-ai-agents' },
  'industry-solutions':       { label: 'Industry Solutions',         href: '/industry-solutions' },
}

const laneColors: Record<string, string> = {
  new:          'var(--lane-new)',
  coming:       'var(--lane-coming)',
  architecture: 'var(--lane-arch)',
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  let { data: item } = await supabase.from('pulse_items').select('title, summary').eq('id', id).single()
  
  if (!item) {
    // Fallback to seed data so landing page links don't 404
    item = SEED_PULSE.find(i => i.id === id) || null
  }

  if (!item) return { title: 'Not Found — neural365 COMMUNITY' }
  return {
    title: `${item.title} — neural365 COMMUNITY`,
    description: item.summary.slice(0, 160),
  }
}

export default async function PulseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  let { data: item } = await supabase.from('pulse_items').select('*').eq('id', id).single()
  
  if (!item) {
    // Fallback to seed data so landing page links don't 404
    item = SEED_PULSE.find(i => i.id === id) || null
  }

  if (!item) notFound()

  const pillar   = pillarMeta[item.pillar]
  const laneColor = laneColors[item.lane as string] ?? 'var(--azure)'
  
  // Fetch related items from the same pillar
  let related: any[] = []
  const { data: relatedData } = await supabase
    .from('pulse_items')
    .select('*')
    .eq('pillar', item.pillar)
    .neq('id', item.id)
    .limit(3)
    
  if (relatedData && relatedData.length > 0) {
    related = relatedData
  } else {
    // Fallback related items
    related = SEED_PULSE.filter(i => i.pillar === item!.pillar && i.id !== item!.id).slice(0, 3)
  }

  const comments = await getComments('pulse', item.id)

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero" style={{ paddingTop: 72, paddingBottom: 56 }}>
        <HeroMesh intensity="reduced" />
        <div className="wrap hero-inner">
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: '"IBM Plex Mono", monospace' }}>
            <Link href="/pulse" style={{ color: 'var(--text-muted)' }}>Pulse</Link>
            <span>›</span>
            <Link href={pillar.href} style={{ color: 'var(--text-muted)' }}>{pillar.label}</Link>
            <span>›</span>
            <span style={{ color: 'var(--text)' }}>Detail</span>
          </div>

          {/* Lane + Pillar badges + Bookmark Button */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: `color-mix(in srgb, ${laneColor} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${laneColor} 35%, transparent)`,
              color: laneColor, borderRadius: 6,
              padding: '4px 10px', fontSize: '0.74rem',
              fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600, letterSpacing: '0.04em',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: laneColor, display: 'inline-block' }} />
              {laneLabels[item.lane as Lane]}
            </span>
            <Link href={pillar.href} style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'var(--azure-dim)', border: '1px solid rgba(47,134,255,0.3)',
              color: 'var(--azure)', borderRadius: 6,
              padding: '4px 10px', fontSize: '0.74rem',
              fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600,
              textDecoration: 'none',
            }}>
              {pillar.label} ↗
            </Link>
            <div style={{ marginLeft: 'auto' }}>
              <BookmarkButton
                contentType="pulse"
                contentId={item.id}
                title={item.title}
                pillar={item.pillar}
              />
            </div>
          </div>

          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.8rem)', fontWeight: 800, maxWidth: 780, lineHeight: 1.2 }}>
            {item.title}
          </h1>

          <div style={{ marginTop: 14, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: '"IBM Plex Mono", monospace' }}>
              {item.publishedAt === 'roadmap' ? '📅 On the roadmap' : `🕐 ${item.publishedAt}`}
            </span>
            <span style={{ color: 'var(--line)' }}>·</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: '"IBM Plex Mono", monospace' }}>
              Source: {item.sourceName}
            </span>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section style={{ padding: '48px 0 80px' }}>
        <div className="wrap detail-layout-grid">

          {/* Main content */}
          <div className="pulse-detail-content">
            {/* Embedded Media Players */}
            {item.podcast_audio_url && (
              <div style={{
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                padding: '20px 24px',
                marginBottom: 32,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', fontFamily: '"IBM Plex Mono", monospace', color: 'var(--azure)' }}>
                  <span>🎙️</span>
                  <span style={{ fontWeight: 600 }}>MICRO-PODCAST (2-MIN AI DEBRIEF)</span>
                </div>
                <audio controls style={{ width: '100%' }} key={item.podcast_audio_url}>
                  <source src={item.podcast_audio_url} type="audio/mpeg" />
                  Your browser does not support audio playback.
                </audio>
              </div>
            )}

            {item.short_video_url && (
              <div style={{
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                padding: '20px 24px',
                marginBottom: 32,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', fontFamily: '"IBM Plex Mono", monospace', color: 'var(--lane-new)', marginBottom: 12 }}>
                  <span>🎬</span>
                  <span style={{ fontWeight: 600 }}>NEURAL SHORT DEMO (HANDS-ON WALKTHROUGH)</span>
                </div>
                <video controls style={{ width: '100%', maxHeight: 420, borderRadius: 8, background: '#000' }} key={item.short_video_url}>
                  <source src={item.short_video_url} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
              </div>
            )}

            {item.content_md ? (
              <div className="blog-content" style={{ fontSize: '1.05rem', lineHeight: 1.75, color: 'var(--text)', marginBottom: 32 }}>
                <ReactMarkdown>{item.content_md}</ReactMarkdown>
              </div>
            ) : (
              <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '28px 32px', marginBottom: 32 }}>
                <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 12 }}>SUMMARY</div>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.75, color: 'var(--text)', margin: 0 }}>{item.summary}</p>
              </div>
            )}

            {item.demo_scenario_md && (
              <div style={{
                background: 'var(--bg-2)', 
                border: '1px solid var(--line)', 
                borderLeft: `4px solid ${laneColor}`,
                borderRadius: 'var(--radius)', 
                padding: '24px 32px', 
                marginBottom: 32,
                color: 'var(--text-muted)'
              }}>
                <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: laneColor, letterSpacing: '0.08em', marginBottom: 12 }}>
                  HANDS-ON EXAMPLE
                </div>
                <div className="demo-content" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  <ReactMarkdown>{item.demo_scenario_md}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* What this means section */}
            <div style={{
              background: `color-mix(in srgb, ${laneColor} 5%, var(--panel))`,
              border: `1px solid color-mix(in srgb, ${laneColor} 20%, var(--line))`,
              borderRadius: 'var(--radius)', padding: '24px 28px', marginBottom: 32,
            }}>
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: laneColor, letterSpacing: '0.08em', marginBottom: 10 }}>
                STRATEGIC IMPACT
              </div>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-muted)', margin: 0 }}>
                {item.lane === 'new' && 'This capability is generally available now. You can begin evaluating it in your environment today.'}
                {item.lane === 'coming' && 'This is on the Microsoft roadmap. Start planning your adoption strategy — check the source for estimated release timelines.'}
                {item.lane === 'architecture' && 'This is an infrastructure or platform change that may affect your existing configurations. Review the source documentation before your next environment update.'}
              </p>
            </div>

            {/* Source CTA */}
            {item.sourceUrl && item.sourceUrl !== '#' && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
              >
                Read official documentation ↗
              </a>
            )}

            {/* Community Discussion */}
            <CommentSection
              contentType="pulse"
              contentId={item.id}
              initialComments={comments}
              revalidateUrl={`/pulse/${item.id}`}
            />

            <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
              <Link href="/pulse" style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontFamily: '"IBM Plex Mono", monospace' }}>
                ← Back to Pulse feed
              </Link>
            </div>
          </div>

          {/* Sidebar — related items */}
          {related.length > 0 && (
            <aside>
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 14 }}>
                MORE FROM {pillar.label.toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {related.map(r => (
                  <PulseCard key={r.id} item={r} />
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <Link href={pillar.href} style={{ fontSize: '0.82rem', color: 'var(--azure)', fontFamily: '"IBM Plex Mono", monospace' }}>
                  View all {pillar.label} updates →
                </Link>
              </div>
            </aside>
          )}
        </div>
      </section>
    </>
  )
}
