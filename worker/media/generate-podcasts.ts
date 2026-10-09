/**
 * Media Generation Worker — generate-podcasts.ts
 *
 * Runs on the VPS to automate podcast generation for items in 'media_pending' status.
 * Can be triggered via cron or systemd worker.
 *
 * Workflow:
 * 1. Query pulse_items where status = 'media_pending' AND podcast_audio_url IS NULL
 * 2. Generate conversational audio from content_md / summary
 * 3. Upload .mp3 to Supabase Storage ('pulse-podcasts' bucket)
 * 4. Update pulse_items.podcast_audio_url
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

async function processPendingMedia() {
  console.log(`\n[media-worker] Checking for items pending media generation at ${new Date().toISOString()}...`)

  const { data: items, error } = await supabase
    .from('pulse_items')
    .select('id, title, summary, pillar, content_md, podcast_audio_url, short_video_url')
    .eq('status', 'media_pending')
    .is('podcast_audio_url', null)

  if (error) {
    console.error('[media-worker] Error fetching pending items:', error.message)
    return
  }

  if (!items || items.length === 0) {
    console.log('[media-worker] No items waiting for podcast generation.')
    return
  }

  console.log(`[media-worker] Found ${items.length} item(s) to process.`)

  for (const item of items) {
    console.log(`\n[media-worker] Generating podcast for: "${item.title}" (${item.pillar})`)
    const date = new Date()
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const timestamp = Math.floor(date.getTime() / 1000)
    const slug = sanitizeSlug(item.title || item.id)
    const storagePath = `${item.pillar}/${yearMonth}/${slug}_${timestamp}.mp3`

    /**
     * NOTE: Replace this placeholder audio generation block with your NotebookLM
     * export script, ElevenLabs API call, or Edge-TTS CLI command:
     * e.g., edge-tts --text "${item.summary}" --write-media temp.mp3
     */
    console.log(`[media-worker] Formatted storage path: ${storagePath}`)
    console.log(`[media-worker] Ready to upload to 'pulse-podcasts' bucket and link to pulse item ID: ${item.id}`)
  }

  console.log('\n[media-worker] Batch completed.')
}

processPendingMedia().catch(err => {
  console.error('[media-worker] Fatal error:', err)
  process.exit(1)
})
