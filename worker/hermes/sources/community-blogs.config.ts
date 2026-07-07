/**
 * Community blogs configuration file.
 * Add or remove trusted D365/Power Platform expert blog URLs here.
 * No code changes required — the Hermes pipeline reads this list at runtime.
 *
 * FORMAT: Each entry needs:
 *   - url:  RSS feed URL (preferred) or HTML page to scrape
 *   - name: Display name shown in the source_name field
 *   - type: 'rss' | 'html'
 *   - pillarHint: Optional default pillar if classification is ambiguous
 */
export interface BlogSource {
  url:         string
  name:        string
  type:        'rss' | 'html'
  pillarHint?: 'd365-fo' | 'dataverse-power-platform' | 'copilot-ai-agents' | 'industry-solutions'
}

export const communityBlogs: BlogSource[] = [
  {
    url:         'https://www.d365cornerstone.com/feed',
    name:        'D365 Cornerstone',
    type:        'rss',
    pillarHint:  'd365-fo',
  },
  {
    url:         'https://powerapps.microsoft.com/en-us/blog/feed/',
    name:        'Power Apps Blog',
    type:        'rss',
    pillarHint:  'dataverse-power-platform',
  },
  {
    url:         'https://powerautomate.microsoft.com/en-us/blog/feed/',
    name:        'Power Automate Blog',
    type:        'rss',
    pillarHint:  'dataverse-power-platform',
  },
  // Add more trusted community blogs below ↓
]
