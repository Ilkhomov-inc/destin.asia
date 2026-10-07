import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { slugify } from '@/lib/slug'

export const runtime = 'nodejs'

interface ImageInput {
  url: string
  order?: number
}

interface LocationRef {
  id: string
  order?: number
}

interface TourInput {
  slug: string
  title: string
  type: 'BASIC' | 'INDIVIDUAL'
  description: string
  durationDays: number
  price: string
  startDate?: string | null
  included: string[]
  notIncluded: string[]
  programDays: { day: number; title: string; description: string }[]
  status: 'PUBLISHED' | 'DRAFT'
  images: ImageInput[]
  locationIds: string[]
}

export async function GET() {
  const rows = await db.tour.findMany({
    include: {
      images: { orderBy: { order: 'asc' } },
      locations: { include: { location: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TourInput
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: 'title_and_slug_required' }, { status: 400 })
    }
    const slug = slugify(body.slug)
    const exists = await db.tour.findUnique({ where: { slug } })
    if (exists) return NextResponse.json({ error: 'slug_taken' }, { status: 409 })

    const created = await db.tour.create({
      data: {
        slug,
        title: body.title.trim(),
        type: body.type === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'BASIC',
        description: body.description?.trim() || '',
        durationDays: Number(body.durationDays) || 1,
        price: body.price?.trim() || '',
        startDate: body.startDate?.trim() || null,
        included: JSON.stringify(body.included ?? []),
        notIncluded: JSON.stringify(body.notIncluded ?? []),
        programDays: JSON.stringify(body.programDays ?? []),
        status: body.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
        images: {
          create: (body.images ?? []).map((img, i) => ({
            url: img.url,
            order: typeof img.order === 'number' ? img.order : i,
          })),
        },
        locations: {
          create: (body.locationIds ?? []).map((id, i) => ({
            locationId: id,
            order: i,
          })),
        },
      },
      include: { images: true, locations: { include: { location: true } } },
    })
    return NextResponse.json(created)
  } catch (e) {
    console.error('[admin/tours POST]', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
