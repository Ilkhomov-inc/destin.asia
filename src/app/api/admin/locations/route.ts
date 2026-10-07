import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { slugify } from '@/lib/slug'

export const runtime = 'nodejs'

interface ImageInput {
  url: string
  order?: number
}

interface LocationInput {
  slug: string
  title: string
  region: string
  category: string
  shortDescription: string
  description: string
  bestSeason: string
  whatToSee: string[]
  status: 'PUBLISHED' | 'DRAFT'
  images: ImageInput[]
}

export async function GET() {
  const rows = await db.location.findMany({
    include: { images: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LocationInput
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: 'title_and_slug_required' }, { status: 400 })
    }
    const slug = slugify(body.slug)
    const exists = await db.location.findUnique({ where: { slug } })
    if (exists) {
      return NextResponse.json({ error: 'slug_taken' }, { status: 409 })
    }
    const created = await db.location.create({
      data: {
        slug,
        title: body.title.trim(),
        region: body.region?.trim() || '—',
        category: body.category?.trim() || '—',
        shortDescription: body.shortDescription?.trim() || '',
        description: body.description?.trim() || '',
        bestSeason: body.bestSeason?.trim() || '',
        whatToSee: JSON.stringify(body.whatToSee ?? []),
        status: body.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
        images: {
          create: (body.images ?? []).map((img, i) => ({
            url: img.url,
            order: typeof img.order === 'number' ? img.order : i,
          })),
        },
      },
      include: { images: true },
    })
    return NextResponse.json(created)
  } catch (e) {
    console.error('[admin/locations POST]', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}


