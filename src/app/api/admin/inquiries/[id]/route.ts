import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    const body = await req.json().catch(() => ({}))
    const status = body.status === 'PROCESSED' ? 'PROCESSED' : 'NEW'
    const updated = await db.inquiry.update({ where: { id }, data: { status } })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('[admin/inquiries PATCH]', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    await db.inquiry.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/inquiries DELETE]', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
