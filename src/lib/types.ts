/**
 * Shared types and small helpers for parsing JSON-encoded array columns
 * (SQLite stores arrays as JSON strings).
 */

export type TourType = 'BASIC' | 'INDIVIDUAL'
export type PublishStatus = 'PUBLISHED' | 'DRAFT'
export type InquiryStatus = 'NEW' | 'PROCESSED'

export interface ProgramDay {
  day: number
  title: string
  description: string
}

export interface PublicLocation {
  id: string
  slug: string
  title: string
  region: string
  category: string
  shortDescription: string
  description: string
  bestSeason: string
  whatToSee: string[]
  status: PublishStatus
  images: { id: string; url: string; order: number }[]
  coverImage: string | null
}

export interface PublicTour {
  id: string
  slug: string
  title: string
  type: TourType
  description: string
  durationDays: number
  price: string
  startDate: string | null
  included: string[]
  notIncluded: string[]
  programDays: ProgramDay[]
  status: PublishStatus
  images: { id: string; url: string; order: number }[]
  coverImage: string | null
  locations: { id: string; slug: string; title: string; region: string }[]
}

export interface PublicSettings {
  siteName: string
  tagline: string
  phone: string
  email: string
  whatsapp: string
  telegram: string
  address: string
  instagram: string | null
  facebook: string | null
  youtube: string | null
  aboutText: string
  heroImage: string | null
}

/** Safely parse a JSON-encoded string array stored in DB. */
export function parseArray(value: string | null | undefined): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

/** Safely parse program days JSON. */
export function parseProgramDays(value: string | null | undefined): ProgramDay[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as ProgramDay[]) : []
  } catch {
    return []
  }
}

export function parseString(value: unknown): string {
  return value == null ? '' : String(value)
}
