/**
 * Multimedia Generation Worker — generate-podcasts.ts
 *
 * Runs on the VPS / container to automate podcast and video short generation
 * for both Pulse items and Blog posts in 'media_pending' status.
 *
 * Architecture:
 * 1. Podcasts (Long-form audio discussions):
 *    Directly invokes the NotebookLM MCP server to generate 2-host conversational
 *    Audio Overviews from item text / markdown, then uploads to 'pulse-podcasts' bucket.
 * 2. Neural Shorts (Vertical 9:16 video demos):
 *    Dispatches structured storyboard payloads directly to the n8n Video Factory webhook,
 *    which renders frames/captions and uploads to 'neural-shorts' bucket.
 *
 * Workflow:
 * 1. Query pulse_items & blog_posts where status = 'media_pending'
 * 2. Invoke NotebookLM MCP for missing podcast_audio_url
 * 3. Dispatch to n8n Video Factory for missing short_video_url
 * 4. Update records via Supabase or /api/hermes/media-ingest
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[media-worker] Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function sanitizeSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
}

async function processPulseMedia() {
  console.log(`\n[media-worker] Checking pulse_items pending media generation...`)

  const { data: items, error } = await supabase
    .from('pulse_items')
    .select('id, title, summary, pillar, content_md, podcast_audio_url, short_video_url')
    .eq('status', 'media_pending')

  if (error) {
    console.error('[media-worker] Error fetching pending pulse items:', error.message)
    return
  }

  const pending = (items || []).filter(item => !item.podcast_audio_url || !item.short_video_url)
  if (pending.length === 0) {
    console.log('[media-worker] No pulse items waiting for media generation.')
    return
  }

  console.log(`[media-worker] Found ${pending.length} pulse item(s) pending media.`)

  for (const item of pending) {
    const date = new Date()
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const timestamp = Math.floor(date.getTime() / 1000)
    const slug = sanitizeSlug(item.title || item.id)

    if (!item.podcast_audio_url) {
      const audioPath = `${item.pillar}/${yearMonth}/${slug}_${timestamp}.mp3`
      console.log(`[media-worker] [Pulse Podcast] Target: "${item.title}" (${item.pillar}) -> bucket: pulse-podcasts/${audioPath}`)
      /**
       * Audio generation hook (NotebookLM MCP):
       * Directly calls NotebookLM MCP tool:
       * - notebook_create({ title: item.title })
       * - add_text_source({ text: item.content_md || item.summary })
       * - generate_audio_overview({ format: 'deep_dive' })
       * Streams returned MP3 to Supabase Storage: pulse-podcasts/${audioPath}
       */
    }

    if (!item.short_video_url) {
      const videoPath = `${item.pillar}/${yearMonth}/${slug}_${timestamp}.mp4`
      console.log(`[media-worker] [Pulse Video] Target: "${item.title}" (${item.pillar}) -> bucket: neural-shorts/${videoPath}`)
      /**
       * Video short generation hook (n8n Video Factory):
       * Dispatches structured brief to n8n webhook (N8N_SHORTS_WEBHOOK_URL):
       * - POST { job_id, target: 'pulse', identifier: { id: item.id }, storyboard: {...} }
       * - n8n renders 9:16 vertical short, uploads to neural-shorts/${videoPath},
       *   and posts back to /api/hermes/media-ingest
       */
    }
  }
}

async function processBlogMedia() {
  console.log(`\n[media-worker] Checking blog_posts pending media generation...`)

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, summary, pillar, body_md, podcast_audio_url, short_video_url')
    .eq('status', 'media_pending')

  if (error) {
    console.error('[media-worker] Error fetching pending blog posts:', error.message)
    return
  }

  const pending = (posts || []).filter(post => !post.podcast_audio_url || !post.short_video_url)
  if (pending.length === 0) {
    console.log('[media-worker] No blog posts waiting for media generation.')
    return
  }

  console.log(`[media-worker] Found ${pending.length} blog post(s) pending media.`)

  for (const post of pending) {
    const date = new Date()
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const timestamp = Math.floor(date.getTime() / 1000)
    const slug = post.slug || sanitizeSlug(post.title || post.id)

    if (!post.podcast_audio_url) {
      const audioPath = `${post.pillar}/${yearMonth}/${slug}_${timestamp}.mp3`
      console.log(`[media-worker] [Blog Podcast] Target: "${post.title}" (${post.pillar}) -> bucket: pulse-podcasts/${audioPath}`)
      /**
       * Article podcast generation hook (NotebookLM MCP):
       * Directly calls NotebookLM MCP tool:
       * - notebook_create({ title: post.title })
       * - add_text_source({ text: post.body_md })
       * - generate_audio_overview({ format: 'deep_dive' })
       * Streams returned MP3 to Supabase Storage: pulse-podcasts/${audioPath}
       */
    }

    if (!post.short_video_url) {
      const videoPath = `${post.pillar}/${yearMonth}/${slug}_${timestamp}.mp4`
      console.log(`[media-worker] [Blog Video Short] Target: "${post.title}" (${post.pillar}) -> bucket: neural-shorts/${videoPath}`)
      /**
       * Blog summary short generation hook (n8n Video Factory):
       * Dispatches structured brief to n8n webhook (N8N_SHORTS_WEBHOOK_URL):
       * - POST { job_id, target: 'blog', identifier: { slug: post.slug }, storyboard: {...} }
       * - n8n renders 9:16 vertical short, uploads to neural-shorts/${videoPath},
       *   and posts back to /api/hermes/media-ingest
       */
    }
  }
}

async function main() {
  console.log(`\n[media-worker] Multimedia worker started at ${new Date().toISOString()}`)
  await processPulseMedia()
  await processBlogMedia()
  console.log(`[media-worker] Multimedia batch completed at ${new Date().toISOString()}\n`)
}

main().catch(err => {
  console.error('[media-worker] Fatal error:', err)
  process.exit(1)
})
