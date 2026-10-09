import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://neural365apps.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  // Static pages
  const staticRoutes = [
    '',
    '/pulse',
    '/d365-fo',
    '/dataverse-power-platform',
    '/copilot-ai-agents',
    '/industry-solutions',
    '/sign-in',
    '/sign-up',
  ]

  return staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '/pulse' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1.0 : route === '/pulse' ? 0.9 : 0.7,
  }))
}
