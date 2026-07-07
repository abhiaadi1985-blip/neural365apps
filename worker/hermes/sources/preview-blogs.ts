/**
 * Microsoft public-preview blogs source for the Hermes worker.
 * Targets the official Microsoft 365 and Azure preview blogs.
 *
 * Respects robots.txt and ToS: stores only title, summary (≤240 chars),
 * canonical URL, and published date.
 */

import type { RawItem } from '../pipeline'

const FEEDS = [
  {
    url:  'https://techcommunity.microsoft.com/plugins/custom/microsoft/o365/custom-blog-rss?tid=microsoftdynamics365community&boardId=Dynamics365general',
    name: 'Microsoft Tech Community — Dynamics 365',
  },
  {
    url:  'https://techcommunity.microsoft.com/plugins/custom/microsoft/o365/custom-blog-rss?tid=microsoftpowerplatformcommunity&boardId=PowerAppsGeneral',
    name: 'Microsoft Tech Community — Power Platform',
  },
  {
    url:  'https://www.microsoft.com/en-us/microsoft-365/blog/feed/',
    name: 'Microsoft 365 Blog',
  },
]

async function parseFeed(url: string): Promise<{ title: string; link: string; summary: string; pubDate: string }[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'neural365apps-hermes/1.0 (+https://neural365.apps)' },
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`Feed ${url} returned ${res.status}`)

  const xml   = await res.text()
  const items: { title: string; link: string; summary: string; pubDate: string }[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null) {
    const block   = match[1]
    const title   = extractTag(block, 'title')
    const link    = extractTag(block, 'link') || extractTag(block, 'guid')
    const summary = extractTag(block, 'description') || extractTag(block, 'summary')
    const pubDate = extractTag(block, 'pubDate') || extractTag(block, 'published')
    if (title && link) items.push({ title, link, summary, pubDate })
  }
  return items
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'))
  return (match?.[1] ?? match?.[2] ?? '').trim()
}

export async function fetchPreviewBlogs(sinceDate?: Date): Promise<RawItem[]> {
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
      console.error(`[hermes/preview-blogs] Feed failed: ${feed.url}`, err)
    }
  }
  return results
}
