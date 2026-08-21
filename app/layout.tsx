import type { Metadata } from 'next'
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

export const metadata: Metadata = {
  title: 'neural365 COMMUNITY — Master Microsoft AI Agents & ERP, hands-on',
  description:
    'Your ultimate independent community hub for upcoming Dynamics 365, Dataverse, and Power Platform AI features. Interactive guides, video shorts, and micro-podcasts.',
  keywords: [
    'Dynamics 365', 'Power Platform', 'Copilot', 'AI Agents', 'D365 F&O',
    'Dataverse', 'Microsoft', 'ERP', 'community hub',
  ],
  openGraph: {
    title: 'neural365 COMMUNITY — Master Microsoft AI Agents & ERP, hands-on',
    description:
      'Interactive guides, Neural Shorts, and Micro-podcasts for the D365 & Power Platform ecosystem.',
    type: 'website',
    siteName: 'neural365 COMMUNITY',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
