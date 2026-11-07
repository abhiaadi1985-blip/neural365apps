import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { getUserBookmarks } from '@/lib/comments/actions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Account — neural365 COMMUNITY',
  description: 'Manage your neural365 COMMUNITY account, bookmarks, and subscription.',
}

export default async function AccountPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()
  const subscription = null

  if (!user) {
    return (
      <section style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{
          border: '1px solid var(--line)', borderRadius: 'var(--radius)',
          background: 'var(--panel)', padding: '40px 36px',
          width: '100%', maxWidth: 480, textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12 }}>Not signed in</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Sign in to access your account, reading list, and community preferences.
          </p>
          <Link href="/sign-in" className="btn btn-primary">Sign In</Link>
        </div>
      </section>
    )
  }

  // Fetch user role from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const bookmarks = await getUserBookmarks()

  return (
    <section style={{ padding: '64px 0 84px' }}>
      <div className="wrap" style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 32 }}>My Account</h1>

        {/* Profile Card */}
        <div style={{
          border: isAdmin ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          background: isAdmin
            ? 'linear-gradient(145deg, rgba(245, 158, 11, 0.05) 0%, var(--panel) 100%)'
            : 'var(--panel)',
          padding: 28,
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <h2 style={{ fontSize: '0.78rem', marginBottom: 8, color: 'var(--text-muted)', fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Practitioner Profile
            </h2>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{user.email}</p>
            <div>
              {isAdmin ? (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#f59e0b',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  padding: '3px 8px',
                  borderRadius: 12,
                  fontFamily: '"IBM Plex Mono", monospace',
                  letterSpacing: '0.05em',
                }}>
                  <span>⚡</span> ADMINISTRATOR
                </span>
              ) : (
                <span style={{
                  fontSize: '0.8rem',
                  color: 'var(--azure)',
                  fontFamily: '"IBM Plex Mono", monospace',
                }}>
                  Community Member
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {isAdmin && (
              <Link
                href="/admin"
                className="btn btn-primary btn-sm"
                style={{
                  background: '#f59e0b',
                  borderColor: '#f59e0b',
                  color: '#040810',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>⚡</span> Admin Console &rarr;
              </Link>
            )}
            <form action="/api/auth/sign-out" method="POST">
              <button type="submit" className="btn btn-secondary btn-sm">Sign Out</button>
            </form>
          </div>
        </div>

        {/* Admin Quick Access Panel */}
        {isAdmin && (
          <div style={{
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius)',
            background: 'var(--panel)',
            padding: 24,
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={{
                  fontSize: '0.68rem',
                  color: '#f59e0b',
                  fontFamily: '"IBM Plex Mono", monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  display: 'block',
                  marginBottom: 4,
                }}>
                  Editorial &amp; Review Pipelines
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                  Admin Tools
                </h3>
              </div>
              <Link
                href="/admin"
                style={{
                  fontSize: '0.82rem',
                  color: '#f59e0b',
                  textDecoration: 'none',
                  fontFamily: '"IBM Plex Mono", monospace',
                }}
              >
                Full Dashboard &rarr;
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 10,
            }}>
              <Link
                href="/admin/review"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '12px 14px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text)' }}>Pulse Text Review</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>Weekly draft signals &rarr;</span>
              </Link>
              <Link
                href="/admin/media"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '12px 14px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text)' }}>Pulse Media Review</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>Podcasts &amp; shorts &rarr;</span>
              </Link>
              <Link
                href="/admin/blog-review"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '12px 14px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text)' }}>Blog Review</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>Deep dive drafts &rarr;</span>
              </Link>
              <Link
                href="/admin/blog-media"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '12px 14px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text)' }}>Blog Media</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>Asset pipelines &rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {/* Saved Bookmarks / Reading List */}
        <div style={{
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          background: 'var(--panel)',
          padding: 28,
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Saved Reading List
            </h2>
            <span style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.75rem',
              color: 'var(--azure)',
              background: 'var(--azure-dim)',
              padding: '2px 8px',
              borderRadius: 12,
            }}>
              {bookmarks.length} saved
            </span>
          </div>

          {bookmarks.length === 0 ? (
            <div style={{
              padding: '28px 20px',
              textAlign: 'center',
              border: '1px dashed var(--line)',
              borderRadius: 8,
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📑</div>
              <p style={{ marginBottom: 8, color: 'var(--text)' }}>Your reading list is empty.</p>
              <p style={{ fontSize: '0.82rem', maxWidth: 420, margin: '0 auto 16px' }}>
                Click the <strong>☆ Save</strong> button on any Pulse item or Blog deep dive to pin it here for quick reference.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Link href="/pulse" className="btn btn-secondary btn-sm">Browse Pulse</Link>
                <Link href="/blog" className="btn btn-secondary btn-sm">Browse Blog</Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bookmarks.map((bm: { id: string; content_type: string; content_id: string; title: string; pillar: string; created_at: string }) => {
                const href = bm.content_type === 'blog' ? `/blog/${bm.content_id}` : `/pulse/${bm.content_id}`
                return (
                  <Link
                    key={bm.id}
                    href={href}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: 6,
                      textDecoration: 'none',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <div>
                      <div style={{
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: '0.68rem',
                        color: 'var(--azure)',
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}>
                        {bm.pillar.toUpperCase()} · {bm.content_type.toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text)' }}>
                        {bm.title}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--azure)', marginLeft: 16 }}>
                      →
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Subscription Plan */}
        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--panel)', padding: 28 }}>
          <h2 style={{ fontSize: '0.78rem', marginBottom: 16, color: 'var(--text-muted)', fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Subscription &amp; Membership
          </h2>
          {subscription ? (
            <div>
              <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>
                Status: <span style={{ color: 'var(--lane-new)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.82rem' }}>
                  ACTIVE
                </span>
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Renews: {new Date((subscription as { current_period_end: string }).current_period_end).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 0 }}>
                You are on the free community tier with unlimited access to Pulse updates and Blog deep dives.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
