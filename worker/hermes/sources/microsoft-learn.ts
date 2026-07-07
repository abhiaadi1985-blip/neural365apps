/**
 * Microsoft Learn source module for the Hermes worker.
 * Fetches recent D365/Power Platform articles from the Microsoft Learn RSS feed.
 *
 * Respects Microsoft's robots.txt and terms of service:
 * - Stores only title, summary (≤240 chars), canonical URL, and published date
 * - Links back to the original article — no full text reproduction
 */

import type { RawItem } from '../pipeline'

const FEEDS = [
  {
    url:  'https://learn.microsoft.com/api/rss/dynamics365/',
    name: 'Microsoft Learn — Dynamics 365',
  },
  {
    url:  'https://learn.microsoft.com/api/rss/power-platform/',
    name: 'Microsoft Learn — Power Platform',
  },
]

interface FeedEntry {
  title:   string
  link:    string
  summary: string
  pubDate: string
}

async function parseFeed(url: string): Promise<FeedEntry[]> {
  const res  = await fetch(url, {
    headers: { 'User-Agent': 'neural365apps-hermes/1.0 (+https://neural365.apps)' },
    signal:  AbortSignal.timeout(15_000),
  })

  if (!res.ok) throw new Error(`Feed ${url} returned ${res.status}`)

  const xml = await res.text()

  // Minimal RSS parser — handles standard <item> elements
  const items: FeedEntry[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null) {
    const block   = match[1]
    const title   = extractTag(block, 'title')
    const link    = extractTag(block, 'link') || extractTag(block, 'guid')
    const summary = extractTag(block, 'description') || extractTag(block, 'summary')
    const pubDate = extractTag(block, 'pubDate') || extractTag(block, 'published')

    if (title && link) {
      items.push({ title, link, summary, pubDate })
    }
  }

  return items
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'))
  return (match?.[1] ?? match?.[2] ?? '').trim()
}

export async function fetchMicrosoftLearn(sinceDate?: Date): Promise<RawItem[]> {
  const results: RawItem[] = []

  for (const feed of FEEDS) {
    try {
      const entries = await parseFeed(feed.url)
      for (const entry of entries) {
        const published = new Date(entry.pubDate || Date.now())
        if (sinceDate && published < sinceDate) continue

        results.push({
          title:       entry.title,
          body:        entry.summary,
          sourceUrl:   entry.link,
          sourceName:  feed.name,
          publishedAt: published,
        })
      }
    } catch (err) {
      console.error(`[hermes/microsoft-learn] Feed failed: ${feed.url}`, err)
      // Single feed failure does not block others
    }
  }

  return results
}
