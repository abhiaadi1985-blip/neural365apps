import type { Metadata, Viewport } from 'next'
import { Inter, Sora, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import Nav from '@/components/nav'
import Footer from '@/components/footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://community.neural365ltd.com'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#060A12',
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  title: 'neural365 COMMUNITY — Explore Microsoft AI Agents & ERP Together',
  description:
    'Your agentic community hub for upcoming Dynamics 365, Dataverse, and Power Platform AI features. Interactive guides, video shorts, and micro-podcasts.',
  keywords: [
    'Dynamics 365', 'Power Platform', 'Copilot', 'AI Agents', 'D365 F&O',
    'Dataverse', 'Microsoft', 'ERP', 'community hub', 'neural365',
  ],
  openGraph: {
    title: 'neural365 COMMUNITY — Master Microsoft AI Agents & ERP, hands-on',
    description:
      'Interactive guides, Neural Shorts, and Podcasts for the D365 & Power Platform ecosystem.',
    type: 'website',
    siteName: 'neural365 COMMUNITY',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'neural365 COMMUNITY — Master Microsoft AI Agents & ERP, hands-on',
    description:
      'Independent research hub for Dynamics 365, Dataverse, and Copilot AI Agents.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://neural365ltd.com/#organization',
        name: 'neural365 Ltd',
        url: 'https://neural365ltd.com',
        logo: `${siteUrl}/neural365-logo-mark.png`,
        sameAs: [
          'https://linkedin.com/company/neural365',
          'https://github.com/abhi-neural365',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'neural365 COMMUNITY',
        publisher: {
          '@id': 'https://neural365ltd.com/#organization',
        },
        description: 'Independent research community hub for Microsoft Dynamics 365, Dataverse, and Copilot AI Agents.',
      },
    ],
  }

  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="neural365 COMMUNITY RSS Feed"
          href="/feed.xml"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
