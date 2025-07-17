// middleware.ts
import { auth } from '@/auth'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  console.log('🔍 Middleware - Path:', nextUrl.pathname)
  console.log('🔍 Middleware - Logged in:', isLoggedIn)
  console.log('🔍 Middleware - Role:', userRole)

  // Routes publiques (accessibles sans connexion)
  const isPublicRoute = [
    '/',
    '/menu',
    '/about', 
    '/contact',
    '/auth/signin',
    '/auth/signup',
  ].includes(nextUrl.pathname) || 
  nextUrl.pathname.startsWith('/api/auth') ||
  nextUrl.pathname.startsWith('/_next') ||
  nextUrl.pathname.startsWith('/favicon')

  // Routes protégées utilisateur (nécessitent connexion)
  const isUserProtectedRoute = [
    '/dashboard',
    '/profile',
    '/orders'
  ].some(route => nextUrl.pathname.startsWith(route))

  // Routes admin (nécessitent connexion + rôle ADMIN)
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')

  // APIs protégées
  const isProtectedAPI = [
    '/api/orders',
    '/api/products',
    '/api/users'
  ].some(route => nextUrl.pathname.startsWith(route))

  // === VÉRIFICATIONS DE SÉCURITÉ ===

  // 1. Route admin sans connexion → redirection connexion
  if (isAdminRoute && !isLoggedIn) {
    console.log('❌ Admin route sans connexion - Redirection signin')
    const signInUrl = new URL('/auth/signin', nextUrl.origin)
    signInUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return Response.redirect(signInUrl)
  }

  // 2. Route admin avec connexion mais pas ADMIN → Accès refusé
  if (isAdminRoute && isLoggedIn && userRole !== 'ADMIN') {
    console.log('❌ Tentative accès admin sans rôle ADMIN')
    return Response.redirect(new URL('/dashboard', nextUrl.origin))
  }

  // 3. Route utilisateur sans connexion → redirection connexion
  if (isUserProtectedRoute && !isLoggedIn) {
    console.log('❌ Route protégée sans connexion - Redirection signin')
    const signInUrl = new URL('/auth/signin', nextUrl.origin)
    signInUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return Response.redirect(signInUrl)
  }

  // 4. API protégée sans session appropriée
  if (isProtectedAPI && !isLoggedIn) {
    console.log('❌ API protégée sans connexion')
    return new Response(
      JSON.stringify({ error: 'Authentification requise' }), 
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  // 5. Déjà connecté qui va sur pages auth → redirection dashboard
  if (isLoggedIn && ['/auth/signin', '/auth/signup'].includes(nextUrl.pathname)) {
    console.log('✅ Utilisateur connecté - Redirection dashboard')
    if (userRole === 'ADMIN') {
      return Response.redirect(new URL('/admin', nextUrl.origin))
    }
    return Response.redirect(new URL('/dashboard', nextUrl.origin))
  }

  // 6. Route publique → autoriser
  if (isPublicRoute) {
    console.log('✅ Route publique - Autoriser')
    return null
  }

  console.log('✅ Middleware - Autoriser par défaut')
  return null
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}