import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { slugify } from '@/lib/slug'

export const runtime = 'nodejs'

interface ImageInput {
  id?: string
  url: string
  order?: number
}

interface UpdateInput {
  slug?: string
  title?: string
  type?: 'BASIC' | 'INDIVIDUAL'
  description?: string
  durationDays?: number
  price?: string
  startDate?: string | null
  included?: string[]
  notIncluded?: string[]
  programDays?: { day: number; title: string; description: string }[]
  status?: 'PUBLISHED' | 'DRAFT'
  images?: ImageInput[]
  locationIds?: string[]
}

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const tour = await db.tour.findUnique({
    where: { id },
    include: { images: { orderBy: { order: 'asc' } }, locations: { include: { location: true } } },
  })
  if (!tour) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json(tour)
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    const body = (await req.json()) as UpdateInput
    const existing = await db.tour.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    if (body.slug && slugify(body.slug) !== existing.slug) {
      const newSlug = slugify(body.slug)
      const clash = await db.tour.findUnique({ where: { slug: newSlug } })
      if (clash) return NextResponse.json({ error: 'slug_taken' }, { status: 409 })
      existing.slug = newSlug
    }

    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = body.title.trim()
    if (body.slug !== undefined) data.slug = existing.slug
    if (body.type !== undefined) data.type = body.type === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'BASIC'
    if (body.description !== undefined) data.description = body.description
    if (body.durationDays !== undefined) data.durationDays = Number(body.durationDays) || 1
    if (body.price !== undefined) data.price = body.price.trim()
    if (body.startDate !== undefined) data.startDate = body.startDate?.trim() || null
    if (body.included !== undefined) data.included = JSON.stringify(body.included ?? [])
    if (body.notIncluded !== undefined) data.notIncluded = JSON.stringify(body.notIncluded ?? [])
    if (body.programDays !== undefined) data.programDays = JSON.stringify(body.programDays ?? [])
    if (body.status !== undefined) data.status = body.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED'

    if (Array.isArray(body.images)) {
      await db.tourImage.deleteMany({ where: { tourId: id } })
      if (body.images.length) {
        await db.tourImage.createMany({
          data: body.images.map((img, i) => ({
            tourId: id,
            url: img.url,
            order: typeof img.order === 'number' ? img.order : i,
          })),
        })
      }
    }

    if (Array.isArray(body.locationIds)) {
      await db.tourLocation.deleteMany({ where: { tourId: id } })
      if (body.locationIds.length) {
        await db.tourLocation.createMany({
          data: body.locationIds.map((lid, i) => ({ tourId: id, locationId: lid, order: i })),
        })
      }
    }

    const updated = await db.tour.update({
      where: { id },
      data,
      include: { images: { orderBy: { order: 'asc' } }, locations: { include: { location: true } } },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('[admin/tours PUT]', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    await db.tour.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/tours DELETE]', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
