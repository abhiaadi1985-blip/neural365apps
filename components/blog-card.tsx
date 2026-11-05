import Link from 'next/link'
import type { BlogPost } from '@/lib/seed-blog'
import { pillarLabels } from '@/lib/design-tokens'

// ── BlogCard ────────────────────────────────────────────────
export function BlogCard({
  post,
  featured = false,
}: {
  post: BlogPost
  featured?: boolean
}) {
  const isFeatured = featured || Boolean(post.featured)
  const heroUrl = post.hero_image_url || post.heroImageUrl || null
  const pillarLabel = (post.pillar && pillarLabels[post.pillar]) || post.pillar || 'General'
  const tags = Array.isArray(post.tags) ? post.tags : (post.tags ? [post.tags] : [])
  const tagString = tags.join(' · ')

  const readMin = post.estimated_read_min ?? post.estimatedReadMin
  const readTime = readMin ? `${readMin} min read` : ((post as any).read_time || '5 min read')
  const author = post.author_name || post.authorName || (post as any).author || 'neural365'

  return (
    <>
      <Link
        href={`/blog/${post.slug}`}
        className={`blog-card ${isFeatured ? 'featured' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          textDecoration: 'none',
          color: 'inherit',
          transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
          height: '100%',
        }}
      >
        {/* ── Hero image area (aspect 16:9) with pillar badge ── */}
        <div
          className="blog-card-media"
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            maxHeight: isFeatured ? 440 : undefined,
            overflow: 'hidden',
            borderBottom: '1px solid var(--line)',
            background: 'var(--bg-2)',
          }}
        >
          {heroUrl ? (
            <img
              src={heroUrl}
              alt={post.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, var(--bg-2) 0%, var(--panel) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: '1px solid rgba(47, 134, 255, 0.25)',
                  background: 'rgba(47, 134, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--azure)',
                  fontSize: '1.2rem',
                  fontFamily: '"IBM Plex Mono", monospace',
                }}
              >
                ✦
              </div>
            </div>
          )}

          {/* Pillar badge overlay */}
          <span
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 2,
              background: 'rgba(6, 10, 18, 0.78)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(47, 134, 255, 0.35)',
              color: 'var(--azure)',
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: '0.7rem',
              fontFamily: '"IBM Plex Mono", monospace',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            {pillarLabel}
          </span>
        </div>

        {/* ── Card body ── */}
        <div
          className="blog-card-body"
          style={{
            padding: isFeatured ? '24px 28px' : '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          }}
        >
          {/* TAG1 · TAG2 */}
          {tagString && (
            <div
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 8,
              }}
            >
              {tagString}
            </div>
          )}

          {/* Title (h4, bold) */}
          <h4
            style={{
              fontFamily: '"Sora", sans-serif',
              fontSize: isFeatured ? 'clamp(1.2rem, 2vw, 1.55rem)' : '1.02rem',
              fontWeight: 700,
              color: 'var(--text)',
              margin: '0 0 10px',
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
            }}
          >
            {post.title}
          </h4>

          {/* Summary (p, muted, 2-line) */}
          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: isFeatured ? '0.94rem' : '0.86rem',
              color: 'var(--text-muted)',
              margin: '0 0 16px',
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: isFeatured ? 3 : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexGrow: 1,
            }}
          >
            {post.summary}
          </p>

          {/* Read time + author */}
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid rgba(30, 41, 61, 0.6)',
              paddingTop: 12,
            }}
          >
            <span>{readTime}</span>
            <span>·</span>
            <span>{author}</span>
          </div>
        </div>
      </Link>

      <style>{`
        .blog-card {
          border-color: var(--line);
        }
        .blog-card:hover {
          border-color: rgba(231, 236, 245, 0.28) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        }
      `}</style>
    </>
  )
}

export default BlogCard
