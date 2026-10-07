import { NextResponse } from 'next/server'
import { createInquiry } from '@/lib/data'

export const runtime = 'nodejs'

/** Public endpoint: create an inquiry (contact request). */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'bad_request' }, { status: 400 })
    }

    // Honeypot: 'company' must be empty. Bots tend to fill all fields.
    if (typeof body.company === 'string' && body.company.trim() !== '') {
      // Pretend success so the bot moves on, but drop the data.
      return NextResponse.json({ ok: true, spam: true })
    }

    const name = String(body.name ?? '').trim()
    const contact = String(body.contact ?? '').trim()
    const message = String(body.message ?? '').trim()
    const tourId = body.tourId ? String(body.tourId) : null

    if (!name || !contact) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
    }
    if (name.length > 200 || contact.length > 200 || message.length > 5000) {
      return NextResponse.json({ error: 'too_long' }, { status: 400 })
    }

    await createInquiry({ name, contact, message, tourId })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[api/inquiries] error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
