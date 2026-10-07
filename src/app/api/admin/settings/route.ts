import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  let row = await db.siteSettings.findUnique({ where: { id: 'singleton' } })
  if (!row) {
    row = await db.siteSettings.create({
      data: {
        id: 'singleton',
        siteName: 'Вояж',
        tagline: 'Авторские путешествия',
        phone: '',
        email: '',
        whatsapp: '',
        telegram: '',
        address: '',
        aboutText: '',
      },
    })
  }
  return NextResponse.json(row)
}

interface SettingsInput {
  siteName?: string
  tagline?: string
  phone?: string
  email?: string
  whatsapp?: string
  telegram?: string
  address?: string
  instagram?: string | null
  facebook?: string | null
  youtube?: string | null
  aboutText?: string
  heroImage?: string | null
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as SettingsInput
    const data: Record<string, unknown> = {}
    if (body.siteName !== undefined) data.siteName = body.siteName.trim()
    if (body.tagline !== undefined) data.tagline = body.tagline.trim()
    if (body.phone !== undefined) data.phone = body.phone.trim()
    if (body.email !== undefined) data.email = body.email.trim()
    if (body.whatsapp !== undefined) data.whatsapp = body.whatsapp.trim()
    if (body.telegram !== undefined) data.telegram = body.telegram.trim()
    if (body.address !== undefined) data.address = body.address.trim()
    if (body.instagram !== undefined) data.instagram = body.instagram?.trim() || null
    if (body.facebook !== undefined) data.facebook = body.facebook?.trim() || null
    if (body.youtube !== undefined) data.youtube = body.youtube?.trim() || null
    if (body.aboutText !== undefined) data.aboutText = body.aboutText
    if (body.heroImage !== undefined) data.heroImage = body.heroImage?.trim() || null

    const updated = await db.siteSettings.upsert({
      where: { id: 'singleton' },
      update: data,
      create: {
        id: 'singleton',
        siteName: body.siteName?.trim() || 'Вояж',
        tagline: body.tagline?.trim() || '',
        phone: body.phone?.trim() || '',
        email: body.email?.trim() || '',
        whatsapp: body.whatsapp?.trim() || '',
        telegram: body.telegram?.trim() || '',
        address: body.address?.trim() || '',
        instagram: body.instagram?.trim() || null,
        facebook: body.facebook?.trim() || null,
        youtube: body.youtube?.trim() || null,
        aboutText: body.aboutText || '',
        heroImage: body.heroImage?.trim() || null,
      },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('[admin/settings PUT]', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
