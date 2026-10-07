import { db } from '@/lib/db'
import {
  parseArray,
  parseProgramDays,
  type PublicLocation,
  type PublicTour,
  type PublicSettings,
} from '@/lib/types'

/**
 * Data-access layer. Centralises DB queries so components / pages don't
 * deal with Prisma directly and the JSON-array parsing happens once.
 */

export async function getSettings(): Promise<PublicSettings> {
  let row = await db.siteSettings.findUnique({ where: { id: 'singleton' } })
  if (!row) {
    // Fallback: create defaults if somehow missing.
    row = await db.siteSettings.create({
      data: {
        id: 'singleton',
        siteName: 'Вояж',
        tagline: 'Авторские путешествия по миру',
        phone: '',
        email: '',
        whatsapp: '',
        telegram: '',
        address: '',
        aboutText: '',
      },
    })
  }
  return {
    siteName: row.siteName,
    tagline: row.tagline,
    phone: row.phone,
    email: row.email,
    whatsapp: row.whatsapp,
    telegram: row.telegram,
    address: row.address,
    instagram: row.instagram,
    facebook: row.facebook,
    youtube: row.youtube,
    aboutText: row.aboutText,
    heroImage: row.heroImage,
  }
}

function coverImage(images: { id: string; url: string; order: number }[]): string | null {
  if (!images.length) return null
  return [...images].sort((a, b) => a.order - b.order)[0].url
}

function mapLocation(
  l: Awaited<ReturnType<typeof db.location.findFirst>> & object
): PublicLocation {
  const images = (l.images ?? []).map((i: any) => ({
    id: i.id,
    url: i.url,
    order: i.order,
  }))
  return {
    id: l.id,
    slug: l.slug,
    title: l.title,
    region: l.region,
    category: l.category,
    shortDescription: l.shortDescription,
    description: l.description,
    bestSeason: l.bestSeason,
    whatToSee: parseArray((l as any).whatToSee),
    status: (l as any).status as PublicLocation['status'],
    images,
    coverImage: coverImage(images),
  }
}

const LOCATION_INCLUDE = {
  images: { orderBy: { order: 'asc' } },
}

export async function getPublishedLocations(): Promise<PublicLocation[]> {
  const rows = await db.location.findMany({
    where: { status: 'PUBLISHED' },
    include: LOCATION_INCLUDE,
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((r) => mapLocation(r as any))
}

export async function getAllLocationsAdmin() {
  return db.location.findMany({
    include: LOCATION_INCLUDE,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getLocationBySlug(slug: string): Promise<PublicLocation | null> {
  const row = await db.location.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: LOCATION_INCLUDE,
  })
  if (!row) return null
  return mapLocation(row as any)
}

export async function getLocationById(id: string) {
  return db.location.findUnique({
    where: { id },
    include: LOCATION_INCLUDE,
  })
}

export async function getDistinctLocationFacets() {
  const rows = await db.location.findMany({
    where: { status: 'PUBLISHED' },
    select: { region: true, category: true },
  })
  const regions = Array.from(new Set(rows.map((r) => r.region))).sort()
  const categories = Array.from(new Set(rows.map((r) => r.category))).sort()
  return { regions, categories }
}

// --- Tours ---

const TOUR_INCLUDE = {
  images: { orderBy: { order: 'asc' } },
  locations: {
    include: { location: { select: { id: true, slug: true, title: true, region: true } } },
    orderBy: { order: 'asc' },
  },
}

function mapTour(
  t: Awaited<ReturnType<typeof db.tour.findFirst>> & object
): PublicTour {
  const images = (t.images ?? []).map((i: any) => ({
    id: i.id,
    url: i.url,
    order: i.order,
  }))
  const locations = (t.locations ?? [])
    .map((tl: any) => tl.location)
    .filter(Boolean)
  return {
    id: t.id,
    slug: t.slug,
    title: t.title,
    type: (t as any).type as PublicTour['type'],
    description: t.description,
    durationDays: t.durationDays,
    price: t.price,
    startDate: (t as any).startDate,
    included: parseArray((t as any).included),
    notIncluded: parseArray((t as any).notIncluded),
    programDays: parseProgramDays((t as any).programDays),
    status: (t as any).status as PublicTour['status'],
    images,
    coverImage: coverImage(images),
    locations,
  }
}

export async function getPublishedTours(type?: 'BASIC' | 'INDIVIDUAL'): Promise<PublicTour[]> {
  const rows = await db.tour.findMany({
    where: { status: 'PUBLISHED', ...(type ? { type } : {}) },
    include: TOUR_INCLUDE,
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((r) => mapTour(r as any))
}

export async function getAllToursAdmin() {
  return db.tour.findMany({
    include: TOUR_INCLUDE,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getTourBySlug(slug: string): Promise<PublicTour | null> {
  const row = await db.tour.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: TOUR_INCLUDE,
  })
  if (!row) return null
  return mapTour(row as any)
}

export async function getToursForLocation(locationId: string): Promise<PublicTour[]> {
  const rows = await db.tour.findMany({
    where: { status: 'PUBLISHED', locations: { some: { locationId } } },
    include: TOUR_INCLUDE,
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((r) => mapTour(r as any))
}

// --- Inquiries ---

export async function createInquiry(input: {
  name: string
  contact: string
  message: string
  tourId?: string | null
}) {
  return db.inquiry.create({
    data: {
      name: input.name,
      contact: input.contact,
      message: input.message,
      tourId: input.tourId ?? null,
    },
  })
}

export async function getAllInquiriesAdmin() {
  return db.inquiry.findMany({
    include: {
      tour: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// --- sitemap helpers ---

export async function getAllSlugs() {
  const [locations, tours] = await Promise.all([
    db.location.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } }),
    db.tour.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } }),
  ])
  return { locations, tours }
}
