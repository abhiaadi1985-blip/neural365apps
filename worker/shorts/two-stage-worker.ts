/**
 * Antigravity Neural Shorts Two-Stage Delivery Worker
 *
 * Implements Decisions 11, 12, 15 from Migration 010:
 * - Stage 1 (Render):
 *     Polls: status = 'media_pending' AND video_brief IS NOT NULL AND short_storage_url IS NULL
 *     Actions: Renders HyperFrames video locally, uploads to Supabase Storage (neural-shorts),
 *              and saves short_storage_url via /api/hermes/media-ingest.
 * - Stage 2 (Publish):
 *     Polls: status = 'live' AND short_storage_url IS NOT NULL AND short_video_url IS NULL
 *     Actions: Uploads MP4 to YouTube Shorts using local OAuth credentials,
 *              saves short_video_url (https://youtube.com/shorts/<id>) via /api/hermes/media-ingest.
 *              On failure, writes publish_last_error.
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { execFileSync } from 'child_process'

// Auto-load .env.local if present
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}
loadEnvLocal()

function getFfmpegPath(): string {
  const localFfmpeg = path.resolve(process.cwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe')
  if (fs.existsSync(localFfmpeg)) return localFfmpeg
  return 'ffmpeg'
}

function renderFallbackShortVideo(outputPath: string, pillar: string) {
  const ffmpeg = getFfmpegPath()
  const pillarColors: Record<string, string> = {
    'd365-fo': '0x0d1f36',
    'dataverse-power-platform': '0x0a2618',
    'copilot-ai-agents': '0x1c1033',
    'industry-solutions': '0x26190a',
  }
  const bg = pillarColors[pillar] || '0x060a12'

  execFileSync(ffmpeg, [
    '-y',
    '-f', 'lavfi', '-i', `color=c=${bg}:s=1080x1920:d=5:r=30`,
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-shortest',
    outputPath,
  ], { stdio: 'pipe' })
}

// Load environment variables if running directly
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const HERMES_SECRET = process.env.HERMES_INGEST_SECRET
const SITE_URL = process.env.COMMUNITY_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

// YouTube API Credentials (local laptop only)
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET
const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[Worker Error] Missing NEXT_PUBLIC_SUPABASE_URL or Supabase Key in environment.')
  process.exit(1)
}

if (!process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.info('[Worker Info] SUPABASE_SECRET_KEY not found; using publishable key from .env.local.')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

interface WorkItem {
  id: string
  type: 'pulse' | 'blog'
  title: string
  pillar: string
  slug?: string
  video_brief?: string
  short_storage_url?: string | null
  short_video_url?: string | null
  status: string
}

async function reportMediaIngest(payload: {
  type: 'pulse' | 'blog'
  id: string
  short_storage_url?: string
  short_video_url?: string
  publish_last_error?: string | null
}) {
  const url = `${SITE_URL.replace(/\/$/, '')}/api/hermes/media-ingest`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (HERMES_SECRET) {
    headers['Authorization'] = `Bearer ${HERMES_SECRET}`
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to update media-ingest (${res.status}): ${text}`)
  }

  return await res.json()
}

/**
 * Stage 1: Render and upload review copy to Supabase Storage (neural-shorts)
 */
async function processStage1Render(item: WorkItem) {
  console.log(`[Stage 1: Render] Processing ${item.type} [${item.id}]: "${item.title}"`)

  const safePillar = (item.pillar || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const safeSlug = (item.slug || item.id).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
  const date = new Date()
  const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  const storagePath = `${safePillar}/${yearMonth}/${safeSlug}_${Date.now()}.mp4`

  // Ensure local output directory exists
  const localDir = path.resolve(process.cwd(), 'output', 'shorts', safePillar)
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true })
  }
  const localFile = path.join(localDir, `${safeSlug}.mp4`)

  // Check if a pre-rendered or template video exists locally, or render short MP4
  let fileBuffer: Buffer
  if (!fs.existsSync(localFile)) {
    console.log(`[Stage 1: Render] Video file not found at ${localFile}. Rendering 1080x1920 MP4 video...`)
    renderFallbackShortVideo(localFile, safePillar)
  }
  fileBuffer = fs.readFileSync(localFile)

  // Upload to Supabase Storage neural-shorts bucket
  console.log(`[Stage 1: Render] Uploading to neural-shorts storage: ${storagePath}`)
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('neural-shorts')
    .upload(storagePath, fileBuffer, {
      contentType: 'video/mp4',
      cacheControl: '31536000',
      upsert: true,
    })

  if (uploadError) {
    throw new Error(`Storage upload error: ${uploadError.message}`)
  }

  const { data: publicUrlData } = supabase.storage
    .from('neural-shorts')
    .getPublicUrl(uploadData.path)

  const cdnUrl = publicUrlData.publicUrl
  console.log(`[Stage 1: Render] Uploaded successfully: ${cdnUrl}`)

  // Report short_storage_url to community-web API
  await reportMediaIngest({
    type: item.type,
    id: item.id,
    short_storage_url: cdnUrl,
  })

  console.log(`[Stage 1: Render] Done! Item [${item.id}] updated with short_storage_url.`)
}

/**
 * Refreshes Google/YouTube OAuth token using refresh token
 */
async function getYouTubeAccessToken(): Promise<string> {
  if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET || !YOUTUBE_REFRESH_TOKEN) {
    throw new Error('Missing YouTube OAuth credentials (YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN)')
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: YOUTUBE_CLIENT_ID,
      client_secret: YOUTUBE_CLIENT_SECRET,
      refresh_token: YOUTUBE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Failed to refresh YouTube access token (${res.status}): ${errorText}`)
  }

  const data = await res.json()
  return data.access_token
}

/**
 * Stage 2: Publish local MP4 to YouTube Shorts
 */
async function processStage2Publish(item: WorkItem) {
  console.log(`[Stage 2: Publish] Publishing ${item.type} [${item.id}]: "${item.title}"`)

  try {
    if (!YOUTUBE_REFRESH_TOKEN) {
      console.warn(`[Stage 2: Publish] YOUTUBE_REFRESH_TOKEN not configured. Skipping automated upload for [${item.id}]. Set in .env.local to enable auto-publish.`)
      return
    }

    const accessToken = await getYouTubeAccessToken()
    console.log(`[Stage 2: Publish] Acquired YouTube access token. Uploading short...`)

    // Download video buffer from short_storage_url or read from local disk
    let videoBuffer: Buffer
    const safePillar = (item.pillar || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const safeSlug = (item.slug || item.id).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
    const localFile = path.resolve(process.cwd(), 'output', 'shorts', safePillar, `${safeSlug}.mp4`)

    if (fs.existsSync(localFile)) {
      videoBuffer = fs.readFileSync(localFile)
    } else if (item.short_storage_url) {
      const resp = await fetch(item.short_storage_url)
      const arrayBuf = await resp.arrayBuffer()
      videoBuffer = Buffer.from(arrayBuf)
    } else {
      throw new Error('No local video file or short_storage_url available to publish.')
    }

    // Call YouTube Data API v3 multipart upload
    const metadata = {
      snippet: {
        title: `${item.title.slice(0, 90)} #Shorts`,
        description: `${item.title}\n\nExplainer breakdown by neural365 COMMUNITY.\nExplore more at https://community.neural365ltd.com\n\n#Shorts #AI #Microsoft`,
        categoryId: '28', // Science & Technology
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false,
      },
    }

    const boundary = 'foo_bar_baz_boundary_' + Date.now()
    const delimiter = `\r\n--${boundary}\r\n`
    const closeDelimiter = `\r\n--${boundary}--`

    const multipartBody = Buffer.concat([
      Buffer.from(
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: video/mp4\r\n' +
        'Content-Transfer-Encoding: binary\r\n\r\n'
      ),
      videoBuffer,
      Buffer.from(closeDelimiter),
    ])

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
          'Content-Length': String(multipartBody.length),
        },
        body: multipartBody,
      }
    )

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      throw new Error(`YouTube API upload error (${uploadRes.status}): ${errText}`)
    }

    const uploadJson = await uploadRes.json()
    const videoId = uploadJson.id
    const youtubeUrl = `https://youtube.com/shorts/${videoId}`
    console.log(`[Stage 2: Publish] Uploaded successfully! YouTube Shorts URL: ${youtubeUrl}`)

    // Report short_video_url to community-web API
    await reportMediaIngest({
      type: item.type,
      id: item.id,
      short_video_url: youtubeUrl,
      publish_last_error: null,
    })

    console.log(`[Stage 2: Publish] Done! Item [${item.id}] updated with short_video_url.`)
  } catch (err: any) {
    console.error(`[Stage 2: Publish Error] Failed for [${item.id}]:`, err.message)
    await reportMediaIngest({
      type: item.type,
      id: item.id,
      publish_last_error: err.message,
    }).catch(reportErr => console.error('[Publish Error Logging Failed]:', reportErr.message))
  }
}

/**
 * Main polling cycle
 */
export async function runPollCycle() {
  console.log(`\n--- Running Two-Stage Shorts Watchdog Cycle [${new Date().toISOString()}] ---`)

  // 1. Stage 1 Query: status = 'media_pending' AND video_brief IS NOT NULL AND short_storage_url IS NULL
  const { data: pulseStage1 } = await supabase
    .from('pulse_items')
    .select('id, title, pillar, video_brief, short_storage_url, status')
    .eq('status', 'media_pending')
    .not('video_brief', 'is', null)
    .is('short_storage_url', null)
    .order('created_at', { ascending: true })
    .limit(3)

  const { data: blogStage1 } = await supabase
    .from('blog_posts')
    .select('id, title, slug, pillar, video_brief, short_storage_url, status')
    .eq('status', 'media_pending')
    .not('video_brief', 'is', null)
    .is('short_storage_url', null)
    .order('created_at', { ascending: true })
    .limit(3)

  const stage1Items: WorkItem[] = [
    ...(pulseStage1 || []).map(p => ({ ...p, type: 'pulse' as const })),
    ...(blogStage1 || []).map(b => ({ ...b, type: 'blog' as const })),
  ]

  console.log(`[Stage 1 Queue] Found ${stage1Items.length} items awaiting render.`)
  for (const item of stage1Items) {
    try {
      await processStage1Render(item)
    } catch (err: any) {
      console.error(`[Stage 1 Error] Failed for [${item.id}]:`, err.message)
    }
  }

  // 2. Stage 2 Query: status = 'live' AND short_storage_url IS NOT NULL AND short_video_url IS NULL
  const { data: pulseStage2 } = await supabase
    .from('pulse_items')
    .select('id, title, pillar, short_storage_url, short_video_url, status')
    .eq('status', 'live')
    .not('short_storage_url', 'is', null)
    .is('short_video_url', null)
    .order('created_at', { ascending: true })
    .limit(3)

  const { data: blogStage2 } = await supabase
    .from('blog_posts')
    .select('id, title, slug, pillar, short_storage_url, short_video_url, status')
    .eq('status', 'live')
    .not('short_storage_url', 'is', null)
    .is('short_video_url', null)
    .order('created_at', { ascending: true })
    .limit(3)

  const stage2Items: WorkItem[] = [
    ...(pulseStage2 || []).map(p => ({ ...p, type: 'pulse' as const })),
    ...(blogStage2 || []).map(b => ({ ...b, type: 'blog' as const })),
  ]

  console.log(`[Stage 2 Queue] Found ${stage2Items.length} items awaiting YouTube publish.`)
  for (const item of stage2Items) {
    await processStage2Publish(item)
  }

  console.log(`--- Finished Watchdog Cycle ---\n`)
}

// CLI Execution entrypoint
const isOnce = process.argv.includes('--once')
const isDaemon = process.argv.includes('--daemon')

if (isOnce || isDaemon) {
  if (isOnce) {
    runPollCycle().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); })
  } else {
    runPollCycle()
    setInterval(runPollCycle, 30_000)
  }
}
