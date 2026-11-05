import type { BlogPost } from '@/lib/seed-blog'
import { BlogCard } from '@/components/blog-card'

export { BlogCard } from '@/components/blog-card'

// ── BlogGrid ────────────────────────────────────────────────
export function BlogGrid({
  posts,
  limit = 12,
  showSampleNote = false,
}: {
  posts: BlogPost[]
  limit?: number
  showSampleNote?: boolean
}) {
  if (!posts || posts.length === 0) {
    return (
      <div
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          border: '1px dashed var(--line)',
          borderRadius: 'var(--radius)',
          background: 'var(--panel)',
          color: 'var(--text-muted)',
          margin: '24px 0',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.92rem', fontFamily: '"Inter", sans-serif' }}>
          No blog posts found. Check back soon for the latest articles.
        </p>
      </div>
    )
  }

  // Separate featured and regular posts; featured posts rendered first
  const featured = posts.filter(p => Boolean(p.featured))
  const regular = posts.filter(p => !Boolean(p.featured))
  const sorted = [...featured, ...regular].slice(0, limit)

  return (
    <>
      <div className="blog-grid">
        {sorted.map(post => (
          <BlogCard
            key={post.id || post.slug}
            post={post}
            featured={Boolean(post.featured)}
          />
        ))}
      </div>

      {showSampleNote && (
        <p className="sample-note">
          ↑ sample posts shown for layout — live articles populate automatically from the Hermes editorial pipeline.
        </p>
      )}

      <style>{`
        .blog-card.featured {
          grid-column: 1 / -1;
        }
        @media (max-width: 900px) {
          .blog-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
          }
        }
        @media (max-width: 640px) {
          .blog-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </>
  )
}

export default BlogGrid
