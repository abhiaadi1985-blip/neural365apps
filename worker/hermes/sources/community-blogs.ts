/**
 * Community blogs RSS source module.
 * Generic RSS fetcher used for all community-blogs.config.ts entries.
 */

import type { RawItem } from '../pipeline'
import type { BlogSource } from './community-blogs.config'

export async function fetchRssFeed(blog: BlogSource, sinceDate?: Date): Promise<RawItem[]> {
  const res = await fetch(blog.url, {
    headers: { 'User-Agent': 'neural365apps-hermes/1.0 (+https://neural365.apps)' },
    signal:  AbortSignal.timeout(15_000),
  })

  if (!res.ok) throw new Error(`Feed ${blog.url} returned ${res.status}`)

  const xml   = await res.text()
  const items: RawItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null) {
    const block   = match[1]
    const title   = extractTag(block, 'title')
    const link    = extractTag(block, 'link') || extractTag(block, 'guid')
    const summary = extractTag(block, 'description') || extractTag(block, 'summary')
    const pubDate = extractTag(block, 'pubDate') || extractTag(block, 'published')

    if (!title || !link) continue
    const published = new Date(pubDate || Date.now())
    if (sinceDate && published < sinceDate) continue

    items.push({
      title,
      body:        summary,
      sourceUrl:   link,
      sourceName:  blog.name,
      publishedAt: published,
    })
  }

  return items
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'))
  return (match?.[1] ?? match?.[2] ?? '').trim()
}
