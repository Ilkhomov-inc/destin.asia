import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isRequestAuthenticated } from '@/lib/auth'

// Routes that require an authenticated admin session.
const PROTECTED_PREFIXES = [
  '/admin/',
  '/api/admin/',
]

// Public admin routes that must NOT be protected (the login UI itself and
// the login API).
const PUBLIC_ADMIN_PATHS = new Set([
  '/admin/login',
  '/admin/login/',
  '/api/auth/login',
  '/api/auth/logout',
])

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  if (PUBLIC_ADMIN_PATHS.has(pathname)) return NextResponse.next()

  const ok = await isRequestAuthenticated(req)
  if (!ok) {
    // For API routes, return JSON. For pages, redirect to login.
    if (pathname.startsWith('/api/admin/')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  // Only run middleware on admin paths to keep public pages fast.
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/auth/:path*'],
}
