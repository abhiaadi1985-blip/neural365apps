import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { SEED_BLOG, type BlogPost } from '@/lib/seed-blog'
import { BlogGrid } from '@/components/blog-grid'

export const metadata: Metadata = {
  title: 'The Blog — neural365 COMMUNITY',
  description: 'In-depth articles on Microsoft Dynamics 365, Power Platform, Copilot, and AI Agents — analysis, walkthroughs, and strategic insights.',
}

const PILLARS = [
  { value: 'all',                       label: 'All' },
  { value: 'd365-fo',                   label: 'D365 ERP' },
  { value: 'dataverse-power-platform',  label: 'Dataverse' },
  { value: 'copilot-ai-agents',         label: 'Copilot' },
  { value: 'industry-solutions',        label: 'Industry' },
]

export const dynamic = 'force-dynamic'

// Public blog listing page (Server Component)
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ pillar?: string; tag?: string }>
}) {
  const params = await searchParams
  const activePillar = params.pillar ?? 'all'
  const activeTag = params.tag

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'live')
    .order('featured', { ascending: false })
    .order('published_at', { ascending: false })

  if (activePillar !== 'all') {
    query = query.eq('pillar', activePillar)
  }
  if (activeTag) {
    query = query.contains('tags', [activeTag])
  }

  const { data } = await query

  let posts: BlogPost[] = (data && data.length > 0) ? (data as BlogPost[]) : []

  // Fallback to seed data so the site never goes blank before DB is populated
  if (posts.length === 0) {
    posts = SEED_BLOG.filter(item => {
      const matchStatus = item.status === 'live'
      const matchPillar = activePillar === 'all' || item.pillar === activePillar
      const matchTag = !activeTag || item.tags?.includes(activeTag)
      return matchStatus && matchPillar && matchTag
    })
  }

  return (
    <>
      {/* ── Page header ── */}
      <section style={{ padding: '64px 0 48px', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="eyebrow"><span className="dot" />The Blog</div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, maxWidth: 720, marginTop: 12 }}>
            Deep dives into the Microsoft AI + ERP ecosystem.
          </h1>
          <p className="cadence" style={{ marginTop: 12 }}>
            In-depth analysis and walkthroughs published weekly by the neural365 editorial pipeline.
          </p>
        </div>
      </section>

      {/* ── Filter bar ── */}
      <section style={{ padding: '16px 0', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
        <div className="wrap filter-bar">
          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
            FILTER:
          </span>
          {PILLARS.map(p => {
            const isActive = activePillar === p.value
            const href = p.value === 'all'
              ? (activeTag ? `/blog?tag=${encodeURIComponent(activeTag)}` : '/blog')
              : (activeTag ? `/blog?pillar=${p.value}&tag=${encodeURIComponent(activeTag)}` : `/blog?pillar=${p.value}`)

            return (
              <Link
                key={p.value}
                href={href}
                style={{
                  padding: '6px 14px',
                  borderRadius: 7,
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  border: '1px solid',
                  borderColor: isActive ? 'var(--azure)' : 'var(--line)',
                  color:       isActive ? 'var(--azure)' : 'var(--text-muted)',
                  background:  isActive ? 'var(--azure-dim)' : 'transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {p.label}
              </Link>
            )
          })}

          {activeTag && (
            <>
              <span style={{ color: 'var(--line)', flexShrink: 0 }}>|</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 7,
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  border: '1px solid var(--azure)',
                  color: 'var(--azure)',
                  background: 'var(--azure-dim)',
                  fontFamily: '"IBM Plex Mono", monospace',
                }}
              >
                tag: {activeTag}
                <Link
                  href={activePillar === 'all' ? '/blog' : `/blog?pillar=${activePillar}`}
                  style={{
                    color: 'var(--azure)',
                    marginLeft: 4,
                    cursor: 'pointer',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                  title="Clear tag filter"
                >
                  ✕
                </Link>
              </span>
            </>
          )}
        </div>
      </section>

      {/* ── Grid ── */}
      <section style={{ padding: '48px 0 84px' }}>
        <div className="wrap">
          <BlogGrid posts={posts} limit={50} />
        </div>
      </section>
    </>
  )
}
