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
  region?: string
  category?: string
  shortDescription?: string
  description?: string
  bestSeason?: string
  whatToSee?: string[]
  status?: 'PUBLISHED' | 'DRAFT'
  images?: ImageInput[]
}

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    const body = (await req.json()) as UpdateInput
    const existing = await db.location.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    // Slug uniqueness check if changing
    if (body.slug && body.slug !== existing.slug) {
      const newSlug = slugify(body.slug)
      if (newSlug !== existing.slug) {
        const clash = await db.location.findUnique({ where: { slug: newSlug } })
        if (clash) return NextResponse.json({ error: 'slug_taken' }, { status: 409 })
        existing.slug = newSlug
      }
    }

    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = body.title.trim()
    if (body.slug !== undefined) data.slug = existing.slug // already validated above; use existing.slug which we may have set
    if (body.region !== undefined) data.region = body.region.trim() || '—'
    if (body.category !== undefined) data.category = body.category.trim() || '—'
    if (body.shortDescription !== undefined) data.shortDescription = body.shortDescription.trim()
    if (body.description !== undefined) data.description = body.description
    if (body.bestSeason !== undefined) data.bestSeason = body.bestSeason.trim()
    if (body.whatToSee !== undefined) data.whatToSee = JSON.stringify(body.whatToSee ?? [])
    if (body.status !== undefined) data.status = body.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED'

    if (body.slug !== undefined) {
      // reassign computed slug
      data.slug = existing.slug
    }

    if (Array.isArray(body.images)) {
      // Replace all images: delete old, create new (keeps URLs from uploads table-free).
      await db.locationImage.deleteMany({ where: { locationId: id } })
      if (body.images.length) {
        await db.locationImage.createMany({
          data: body.images.map((img, i) => ({
            locationId: id,
            url: img.url,
            order: typeof img.order === 'number' ? img.order : i,
          })),
        })
      }
    }

    const updated = await db.location.update({
      where: { id },
      data,
      include: { images: { orderBy: { order: 'asc' } } },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('[admin/locations PUT]', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    await db.location.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/locations DELETE]', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
