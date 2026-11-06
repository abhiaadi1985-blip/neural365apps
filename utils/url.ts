import { NextRequest } from 'next/server'

/**
 * Constructs an absolute URL for redirects that is safe for browsers.
 * 
 * In production behind reverse proxies (Nginx, Docker, etc.), req.url can
 * mistakenly inherit the container's internal bind address (e.g., 0.0.0.0:3000)
 * if proxy headers are missing or rewritten.
 * 
 * This helper resolves the true public origin using:
 * 1. X-Forwarded-Host + X-Forwarded-Proto
 * 2. Request Origin header (sent on POST form submissions)
 * 3. Request Referer header origin
 * 4. NEXT_PUBLIC_SITE_URL environment variable
 * 5. Fallback to localhost if 0.0.0.0 remains
 */
export function getSafeRedirectUrl(path: string, req: NextRequest): URL {
  const forwardedHost = req.headers.get('x-forwarded-host')
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https'
  const originHeader = req.headers.get('origin')
  const refererHeader = req.headers.get('referer')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  let baseOrigin: string | null = null

  if (forwardedHost && !forwardedHost.includes('0.0.0.0')) {
    baseOrigin = `${forwardedProto}://${forwardedHost}`
  } else if (originHeader && !originHeader.includes('0.0.0.0')) {
    baseOrigin = originHeader
  } else if (refererHeader && !refererHeader.includes('0.0.0.0')) {
    try {
      baseOrigin = new URL(refererHeader).origin
    } catch {
      // invalid referer URL, fallback
    }
  } else if (siteUrl && !siteUrl.includes('0.0.0.0')) {
    baseOrigin = siteUrl
  }

  let url: URL
  if (baseOrigin) {
    url = new URL(path, baseOrigin)
  } else {
    url = new URL(path, req.url)
  }

  // Safety fallback: ensure 0.0.0.0 is never returned to a browser
  if (url.hostname === '0.0.0.0') {
    if (siteUrl && !siteUrl.includes('0.0.0.0')) {
      url = new URL(path, siteUrl)
    } else {
      url.hostname = 'localhost'
      if (url.protocol === 'https:' && req.headers.get('x-forwarded-proto') !== 'https') {
        url.protocol = 'http:'
      }
    }
  }

  return url
}
