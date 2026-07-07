/**
 * Hermes cron entrypoint — run.ts
 * Schedule: every 3 days — cron: 0 6 * /3 * *  (remove space before /3)
 *
 * Run manually: npx ts-node worker/hermes/run.ts
 * Run as cron:  Add to pm2 ecosystem or systemd timer (see docs/deploy.md)
 */

import { fetchMicrosoftLearn }   from './sources/microsoft-learn'
import { fetchReleaseWave }      from './sources/release-wave'
import { fetchPreviewBlogs }     from './sources/preview-blogs'
import { transform, writeToApi } from './pipeline'
import type { RawItem, Pillar }  from './pipeline'
import { communityBlogs }        from './sources/community-blogs.config'

// ── Run watermark ─────────────────────────────────────────────────────────
// For simplicity, default to fetching items from the last 4 days.
// Extend to persist a per-source watermark in a JSON file or Supabase table.
const LOOKBACK_DAYS = 4
const sinceDate = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)

interface SourceResult {
  source:   string
  fetched:  number
  inserted: number
  error?:   string
}

async function runSource(
  name:        string,
  fetchFn:     () => Promise<RawItem[]>,
  pillarHint?: Pillar,
): Promise<SourceResult> {
  console.log(`[hermes] Fetching: ${name}`)
  try {
    const raw     = await fetchFn()
    const items   = raw.map(r => transform(r, pillarHint))
    const result  = await writeToApi(items)
    console.log(`[hermes] ${name}: fetched=${raw.length} inserted=${result.inserted}`)
    return { source: name, fetched: raw.length, inserted: result.inserted }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[hermes] ${name} FAILED:`, message)
    return { source: name, fetched: 0, inserted: 0, error: message }
  }
}

async function main() {
  console.log(`\n[hermes] Run started at ${new Date().toISOString()}`)
  console.log(`[hermes] Fetching items since ${sinceDate.toISOString()}\n`)

  const results: SourceResult[] = []

  // ── Microsoft Learn ─────────────────────────────────────────────────────
  results.push(await runSource(
    'Microsoft Learn',
    () => fetchMicrosoftLearn(sinceDate),
  ))

  // ── Release Wave / Roadmap ──────────────────────────────────────────────
  results.push(await runSource(
    'Microsoft Release Wave',
    () => fetchReleaseWave(sinceDate),
  ))

  // ── Public Preview Blogs ────────────────────────────────────────────────
  results.push(await runSource(
    'Microsoft Preview Blogs',
    () => fetchPreviewBlogs(sinceDate),
  ))

  // ── Community blogs ─────────────────────────────────────────────────────
  // Each blog runs independently via the generic RSS fetcher
  for (const blog of communityBlogs) {
    results.push(await runSource(
      blog.name,
      async () => {
        // Dynamic import to keep source files tree-shakeable
        const { fetchRssFeed } = await import('./sources/community-blogs')
        return fetchRssFeed(blog, sinceDate)
      },
      blog.pillarHint,
    ))
  }

  // ── Run summary ──────────────────────────────────────────────────────────
  console.log('\n─── Hermes Run Summary ───────────────────────────────────')
  let totalFetched  = 0
  let totalInserted = 0
  let failures      = 0

  for (const r of results) {
    const status = r.error ? '✗ FAIL' : '✓ OK  '
    console.log(`  ${status}  ${r.source}: fetched=${r.fetched} inserted=${r.inserted}${r.error ? ` error="${r.error}"` : ''}`)
    totalFetched  += r.fetched
    totalInserted += r.inserted
    if (r.error) failures++
  }

  console.log(`\n  Total: fetched=${totalFetched} inserted=${totalInserted} failures=${failures}`)
  console.log(`[hermes] Run completed at ${new Date().toISOString()}\n`)

  process.exit(failures > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('[hermes] Fatal error:', err)
  process.exit(1)
})
