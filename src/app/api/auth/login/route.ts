import { NextResponse } from 'next/server'
import { createSession, verifyCredentials } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { password } = await req.json().catch(() => ({}))
    if (typeof password !== 'string' || !verifyCredentials(password)) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
    }
    await createSession()
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[api/auth/login] error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
