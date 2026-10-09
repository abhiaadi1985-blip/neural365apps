import { createClient } from '@/utils/supabase/client'

export type MediaBucket = 'blog-assets' | 'pulse-podcasts' | 'neural-shorts' | 'site-videos'

/**
 * Sanitizes a string to be URL and filesystem friendly.
 */
function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generates the standardized path:
 * - blog-assets: {pillar}/{YYYY-MM}/{slug}/{filename}_{timestamp}.{ext}
 * - pulse-podcasts: {pillar}/{YYYY-MM}/{slug}_{timestamp}.{ext}
 * - neural-shorts: {pillar}/{YYYY-MM}/{slug}_{timestamp}.{ext}
 * - site-videos: {pillar}/{slug}_{timestamp}.{ext}
 */
export function buildStoragePath(
  bucket: MediaBucket,
  pillar: string,
  slugOrId: string,
  originalFileName: string
): string {
  const date = new Date()
  const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  const timestamp = Math.floor(date.getTime() / 1000)
  
  const cleanName = sanitizeFileName(originalFileName)
  const lastDot = cleanName.lastIndexOf('.')
  const base = lastDot !== -1 ? cleanName.substring(0, lastDot) : cleanName
  const ext = lastDot !== -1 ? cleanName.substring(lastDot) : ''

  const safePillar = sanitizeFileName(pillar || 'general')
  const safeSlug = sanitizeFileName(slugOrId || 'item')

  if (bucket === 'blog-assets') {
    return `${safePillar}/${yearMonth}/${safeSlug}/${base}_${timestamp}${ext}`
  }
  if (bucket === 'pulse-podcasts' || bucket === 'neural-shorts') {
    return `${safePillar}/${yearMonth}/${safeSlug}_${timestamp}${ext}`
  }
  // site-videos
  return `${safePillar}/${safeSlug}_${timestamp}${ext}`
}

/**
 * Uploads a file to Supabase Storage and returns its public CDN URL.
 */
export async function uploadToStorage(
  bucket: MediaBucket,
  path: string,
  file: File | Blob,
  contentType?: string
): Promise<{ url: string; path: string; error?: string }> {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: contentType || (file instanceof File ? file.type : undefined),
      cacheControl: '31536000', // 1 year cache
      upsert: true,
    })

  if (error) {
    return { url: '', path: '', error: error.message }
  }

  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return { url: publicData.publicUrl, path: data.path }
}
