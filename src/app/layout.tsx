import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'
import { getSettings } from '@/lib/data'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
})

const mono = Inter({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const title = `${settings.siteName} — ${settings.tagline}`
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s — ${settings.siteName}`,
    },
    description: settings.tagline,
    keywords: ['туры', 'путешествия', 'отдых', settings.siteName],
    openGraph: {
      type: 'website',
      siteName: settings.siteName,
      url: siteUrl,
      title,
      description: settings.tagline,
      images: settings.heroImage ? [{ url: settings.heroImage }] : undefined,
      locale: 'ru_RU',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: settings.tagline,
    },
    robots: { index: true, follow: true },
    alternates: { canonical: '/' },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings()
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${mono.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <SiteHeader settings={settings} />
        <main className="flex-1 flex flex-col">{children}</main>
        <SiteFooter settings={settings} />
        <Toaster />
      </body>
    </html>
  )
}
