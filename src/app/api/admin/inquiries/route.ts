import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const rows = await db.inquiry.findMany({
    include: { tour: { select: { id: true, title: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(rows)
}
