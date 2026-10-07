import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * Lightweight, dependency-free admin session based on an HMAC-signed cookie.
 *
 * - One admin, password configured via ADMIN_PASSWORD env var.
 * - Token = baseurlpayload.base64url(hmac). Payload: { exp }.
 * - Verified both in middleware (edge) and in server actions / route handlers.
 *
 * For production with Supabase Auth, swap `verifyCredentials` + `createSession`
 * for Supabase email/password auth (see SUPABASE_SETUP.md).
 */

const COOKIE_NAME = 'voyage_admin'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 16) {
    throw new Error(
      'SESSION_SECRET is missing or too short. Set a random string (>=32 chars) in .env'
    )
  }
  return secret
}

function getPassword(): string {
  const pwd = process.env.ADMIN_PASSWORD
  if (!pwd) throw new Error('ADMIN_PASSWORD is missing in .env')
  return pwd
}

// --- crypto helpers (Web Crypto, works in edge + node) ---

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return Buffer.from(new Uint8Array(sig)).toString('base64url')
}

function b64url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url')
}

/** Returns true if the given password matches the admin password. */
export function verifyCredentials(password: string): boolean {
  const expected = getPassword()
  // constant-time-ish compare
  if (password.length !== expected.length) return false
  let mismatch = 0
  for (let i = 0; i < expected.length; i++) {
    mismatch |= password.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return mismatch === 0
}

/** Creates a signed session token and stores it in a cookie. */
export async function createSession(): Promise<void> {
  const exp = Date.now() + SESSION_TTL_MS
  const payload = b64url({ exp })
  const sig = await hmac(payload)
  const token = `${payload}.${sig}`
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })
}

/** Clears the admin session cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.set(COOKIE_NAME, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 })
}

/** Verifies a raw token string. Returns true if valid & not expired. */
export async function verifyToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const expectedSig = await hmac(payload)
  if (sig !== expectedSig) return false
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (typeof decoded?.exp !== 'number') return false
    return decoded.exp > Date.now()
  } catch {
    return false
  }
}

/** Server-component / route-handler check. */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return verifyToken(store.get(COOKIE_NAME)?.value)
}

/** Edge-runtime check used by middleware. */
export async function isRequestAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  return verifyToken(token)
}

export const SESSION_COOKIE = COOKIE_NAME
