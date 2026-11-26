import { NextResponse } from 'next/server'
import { auth } from '@/auth'

/**
 * Vérifie que l'appelant est un ADMIN.
 * Retourne { session } si OK, ou { error } (réponse 401/403 à renvoyer telle quelle).
 */
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Authentification requise' }, { status: 401 }) }
  }
  if (session.user.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 }) }
  }
  return { session }
}
