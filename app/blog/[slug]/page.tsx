import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import HeroMesh from '@/components/hero-mesh'
import { BlogCard } from '@/components/blog-card'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { SEED_BLOG, type BlogPost } from '@/lib/seed-blog'
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

function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null
  const trimmed = url.trim()
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/)
  if (shortsMatch && shortsMatch[1]) return `https://www.youtube.com/embed/${shortsMatch[1]}`
  const watchMatch = trimmed.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/)
  if (watchMatch && watchMatch[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`
  const shortlinkMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (shortlinkMatch && shortlinkMatch[1]) return `https://www.youtube.com/embed/${shortlinkMatch[1]}`
  return null
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return ''
  if (!/^\d{4}/.test(dateStr)) return dateStr
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let { data: post } = await supabase
    .from('blog_posts')
    .select('title, summary')
    .eq('slug', slug)
    .eq('status', 'live')
    .single()

  if (!post) {
    post = SEED_BLOG.find(p => p.slug === slug) || null
  }

  if (!post) return { title: 'Not Found — neural365 COMMUNITY' }

  return {
    title: `${post.title} — neural365 COMMUNITY`,
    description: post.summary?.slice(0, 160),
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'live')
    .single()

  let post: BlogPost | null = data ? (data as BlogPost) : null

  if (!post) {
    post = SEED_BLOG.find(p => p.slug === slug) || null
  }

  if (!post) notFound()

  const pillar = pillarMeta[post.pillar] ?? {
    label: post.pillar || 'General',
    href: '/blog',
  }

  const bodyMd = post.body_md || post.bodyMd || post.summary || ''
  const author = post.author_name || post.authorName || 'neural365'
  const readMin = post.estimated_read_min ?? post.estimatedReadMin
  const readTime = readMin ? `${readMin} min read` : '5 min read'
  const published = post.published_at || post.publishedAt
  const publishDate = published ? formatDisplayDate(published) : null
  const podcastUrl = post.podcast_audio_url || post.podcastAudioUrl
  const videoUrl = post.short_video_url || post.shortVideoUrl
  const sourceUrl = post.source_url || post.sourceUrl
  const sourceName = post.source_name || post.sourceName
  const tags: string[] = Array.isArray(post.tags) ? post.tags : []

  // Extract headings from markdown for the table of contents
  const headings = (bodyMd.match(/^##\s+(.+)$/gm) || [])
    .map(h => h.replace(/^##\s+/, '').trim())
    .slice(0, 8)

  // Fetch related posts from same pillar
  let related: BlogPost[] = []
  const { data: relatedData } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'live')
    .eq('pillar', post.pillar)
    .neq('slug', post.slug)
    .order('published_at', { ascending: false })
    .limit(3)

  if (relatedData && relatedData.length > 0) {
    related = relatedData as BlogPost[]
  } else {
    related = SEED_BLOG
      .filter(p => p.pillar === post!.pillar && p.slug !== post!.slug)
      .slice(0, 3)
  }

  const comments = await getComments('blog', post.slug || slug)

  return (
    <>
      {/* ── Hero section ── */}
      <section className="hero" style={{ paddingTop: 72, paddingBottom: 56 }}>
        <HeroMesh intensity="reduced" />
        <div className="wrap hero-inner">
          {/* Breadcrumb: Blog > Pillar > Detail */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            fontFamily: '"IBM Plex Mono", monospace',
          }}>
            <Link href="/blog" style={{ color: 'var(--text-muted)' }}>Blog</Link>
            <span>›</span>
            <Link href={pillar.href} style={{ color: 'var(--text-muted)' }}>{pillar.label}</Link>
            <span>›</span>
            <span style={{ color: 'var(--text)' }}>Detail</span>
          </div>

          {/* Pillar badge + tag badges + Bookmark button */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
            <Link
              href={pillar.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'var(--azure-dim)',
                border: '1px solid rgba(47,134,255,0.3)',
                color: 'var(--azure)',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontFamily: '"IBM Plex Mono", monospace',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {pillar.label} ↗
            </Link>
            {tags.map((tag: string) => (
              <span
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'rgba(231, 236, 245, 0.05)',
                  border: '1px solid var(--line)',
                  color: 'var(--text-muted)',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  fontFamily: '"IBM Plex Mono", monospace',
                }}
              >
                {tag}
              </span>
            ))}
            <div style={{ marginLeft: 'auto' }}>
              <BookmarkButton
                contentType="blog"
                contentId={post.slug || slug}
                title={post.title}
                pillar={post.pillar}
              />
            </div>
          </div>

          {/* h1 Title */}
          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.8rem)',
            fontWeight: 800,
            maxWidth: 840,
            lineHeight: 1.25,
            color: 'var(--text)',
          }}>
            {post.title}
          </h1>

          {/* Subtitle */}
          {post.subtitle && (
            <p style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--text-muted)',
              marginTop: 14,
              maxWidth: 780,
              lineHeight: 1.5,
            }}>
              {post.subtitle}
            </p>
          )}

          {/* Meta line: read time · author · published date · source name */}
          <div style={{
            marginTop: 18,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            fontFamily: '"IBM Plex Mono", monospace',
          }}>
            <span>⏱️ {readTime}</span>
            <span style={{ color: 'var(--line)' }}>·</span>
            <span>✍️ {author}</span>
            {publishDate && (
              <>
                <span style={{ color: 'var(--line)' }}>·</span>
                <span>📅 {publishDate}</span>
              </>
            )}
            {sourceName && (
              <>
                <span style={{ color: 'var(--line)' }}>·</span>
                <span>Source: {sourceName}</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Body section (2-column grid like pulse detail) ── */}
      <section style={{ padding: '48px 0 80px' }}>
        <div className="wrap detail-layout-grid">
          {/* ── Left column (main content) ── */}
          <div className="pulse-detail-content">
            {/* Podcast Player */}
            {podcastUrl && (
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
                  <span style={{ fontWeight: 600 }}>
                    {post.podcast_kind === 'long' ? 'PODCAST (DEEP DIVE ROUNDTABLE)' : 'PODCAST (TOPIC DEBRIEF)'}
                  </span>
                </div>
                <audio controls style={{ width: '100%' }} key={podcastUrl}>
                  <source src={podcastUrl} type="audio/mpeg" />
                  Your browser does not support audio playback.
                </audio>
              </div>
            )}

            {/* Video Player */}
            {videoUrl && (() => {
              const ytEmbed = getYouTubeEmbedUrl(videoUrl)
              return (
                <div style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)',
                  padding: '20px 24px',
                  marginBottom: 32,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', fontFamily: '"IBM Plex Mono", monospace', color: 'var(--lane-new)', marginBottom: 12 }}>
                    <span>🎬</span>
                    <span style={{ fontWeight: 600 }}>NEURAL SHORT (VISUAL EXPLAINER &amp; BREAKDOWN)</span>
                  </div>
                  {ytEmbed ? (
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: 400,
                      aspectRatio: '9 / 16',
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: '#000',
                      margin: '0 auto',
                    }}>
                      <iframe
                        src={ytEmbed}
                        title={post.title}
                        style={{ border: 0, width: '100%', height: '100%' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video controls style={{ width: '100%', maxHeight: 420, borderRadius: 8, background: '#000' }} key={videoUrl}>
                      <source src={videoUrl} type="video/mp4" />
                      Your browser does not support video playback.
                    </video>
                  )}
                </div>
              )
            })()}

            {/* Full body_md rendered with ReactMarkdown */}
            <div
              className="blog-content"
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.75,
                color: 'var(--text)',
                marginBottom: 36,
              }}
            >
              <ReactMarkdown>{bodyMd}</ReactMarkdown>
            </div>

            {/* Source link CTA */}
            {sourceUrl && sourceUrl !== '#' && (
              <div style={{ marginBottom: 32 }}>
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
                >
                  Read original source ↗
                </a>
              </div>
            )}

            {/* Community Discussion */}
            <CommentSection
              contentType="blog"
              contentId={post.slug || slug}
              initialComments={comments}
              revalidateUrl={`/blog/${slug}`}
            />

            {/* Back to Blog link */}
            <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
              <Link
                href="/blog"
                style={{
                  fontSize: '0.86rem',
                  color: 'var(--text-muted)',
                  fontFamily: '"IBM Plex Mono", monospace',
                  textDecoration: 'none',
                }}
              >
                ← Back to Blog
              </Link>
            </div>
          </div>

          {/* ── Right column (sidebar) ── */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Table of contents */}
            <div style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              padding: '22px 24px',
            }}>
              <div style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--azure)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span>📑</span>
                <span>In this article</span>
              </div>
              {headings.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {headings.map((h, i) => (
                    <li key={i} style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.45, display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--azure)', flexShrink: 0, fontFamily: '"IBM Plex Mono", monospace' }}>{i + 1}.</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  In-depth architectural analysis, implementation patterns, and enterprise considerations.
                </p>
              )}
            </div>

            {/* Related blog posts */}
            {related.length > 0 && (
              <div>
                <div style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 14,
                }}>
                  MORE FROM {pillar.label.toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {related.map(r => (
                    <BlogCard key={r.id || r.slug} post={r} />
                  ))}
                </div>
                <div style={{ marginTop: 16 }}>
                  <Link
                    href={`/blog?pillar=${post.pillar}`}
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--azure)',
                      fontFamily: '"IBM Plex Mono", monospace',
                      textDecoration: 'none',
                    }}
                  >
                    View all {pillar.label} articles →
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .blog-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
        }
      `}</style>
    </>
  )
}
