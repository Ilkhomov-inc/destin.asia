import type { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/tours`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/contacts`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
  ]

  const { locations, tours } = await getAllSlugs()

  const locationEntries: MetadataRoute.Sitemap = locations.map((l) => ({
    url: `${base}/locations/${l.slug}`,
    lastModified: l.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const tourEntries: MetadataRoute.Sitemap = tours.map((t) => ({
    url: `${base}/tours/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticEntries, ...locationEntries, ...tourEntries]
}
