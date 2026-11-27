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
// Les routes publiques (catalogue, commande invité, suivi par téléphone) ne sont PAS ici.
// Chaque route sensible vérifie aussi elle-même la session/le rôle (défense en profondeur).
const PROTECTED_API_PREFIXES = ['/api/orders/me', '/api/users']
const ADMIN_API_PREFIXES = ['/api/admin', '/api/upload']

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req
  const pathname = nextUrl.pathname

  // En HTTPS, Auth.js nomme le cookie "__Secure-authjs.session-token" (et s'en sert comme "salt").
  // Sans secureCookie, getToken cherche le cookie non sécurisé et ne voit jamais la session.
  const secureCookie =
    nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https'
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie,
  })
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

  const isAdminAPI = ADMIN_API_PREFIXES.some((route) => pathname.startsWith(route))

  if (isAdminAPI) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
    }
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }
  }

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
