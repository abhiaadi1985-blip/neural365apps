import type { Pillar } from '@/lib/design-tokens'

export interface PodcastChapter {
  t: number
  title: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  summary: string
  body_md: string
  pillar: Pillar
  tags: string[]
  author_name: string
  hero_image_url?: string | null
  estimated_read_min?: number | null
  featured: boolean
  status: 'draft' | 'media_pending' | 'live' | 'revision_requested' | 'rejected'
  review_feedback?: string | null
  reviewed_at?: string | null
  podcast_audio_url?: string | null
  short_video_url?: string | null
  short_storage_url?: string | null
  video_brief?: Record<string, unknown> | null
  podcast_candidate?: boolean
  podcast_approved?: boolean
  podcast_kind?: 'article' | 'long'
  podcast_duration_sec?: number | null
  podcast_chapters?: PodcastChapter[] | null
  podcast_generated_at?: string | null
  render_attempts?: number
  render_last_error?: string | null
  render_last_attempt_at?: string | null
  publish_last_error?: string | null
  source_url?: string | null
  source_name?: string | null
  dedupe_hash?: string | null
  published_at?: string | null
  created_at?: string
  updated_at?: string

  // CamelCase aliases for JS ergonomics
  bodyMd?: string
  authorName?: string
  heroImageUrl?: string | null
  estimatedReadMin?: number | null
  podcastAudioUrl?: string | null
  shortVideoUrl?: string | null
  shortStorageUrl?: string | null
  videoBrief?: Record<string, unknown> | null
  podcastCandidate?: boolean
  podcastApproved?: boolean
  podcastKind?: 'article' | 'long'
  podcastDurationSec?: number | null
  podcastChapters?: PodcastChapter[] | null
  podcastGeneratedAt?: string | null
  renderAttempts?: number
  renderLastError?: string | null
  renderLastAttemptAt?: string | null
  publishLastError?: string | null
  sourceUrl?: string | null
  sourceName?: string | null
  dedupeHash?: string | null
  publishedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

/**
 * Shared seed blog posts.
 * Used as fallback by /blog (listing), /blog/[slug] (detail), and homepage showcases
 * when the database is empty.
 * Retired legacy seed posts (copilot-studio-autonomous-agents-architecture,
 * d365-finance-autonomous-reconciliation-architecture, dataverse-fabric-direct-lake-unified-analytics)
 * have been removed in favor of live DB rows managed by the editorial pipeline.
 */
export const SEED_BLOG: BlogPost[] = []
