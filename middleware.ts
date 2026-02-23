import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_PATHS = new Set([
  '/',
  '/menu',
  '/about',
  '/contact',
  '/auth/signin',
  '/auth/signup',
])

const USER_PROTECTED_PREFIXES = ['/dashboard', '/profile', '/orders']
const PROTECTED_API_PREFIXES = ['/api/orders', '/api/products', '/api/users']

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req
  const pathname = nextUrl.pathname

  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  const isLoggedIn = !!token
  const userRole = token?.role as string | undefined

  const isPublicRoute =
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')

  const isUserProtectedRoute = USER_PROTECTED_PREFIXES.some((route) =>
    pathname.startsWith(route),
  )

  const isAdminRoute = pathname.startsWith('/admin')

  const isProtectedAPI = PROTECTED_API_PREFIXES.some((route) =>
    pathname.startsWith(route),
  )

  if (isAdminRoute && !isLoggedIn) {
    const signInUrl = new URL('/auth/signin', nextUrl.origin)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  if (isAdminRoute && isLoggedIn && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin))
  }

  if (isUserProtectedRoute && !isLoggedIn) {
    const signInUrl = new URL('/auth/signin', nextUrl.origin)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  if (isProtectedAPI && !isLoggedIn) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
  }

  if (isLoggedIn && (pathname === '/auth/signin' || pathname === '/auth/signup')) {
    if (userRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', nextUrl.origin))
    }
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin))
  }

  if (isPublicRoute) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
