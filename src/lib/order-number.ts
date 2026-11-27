import { randomInt } from 'node:crypto'

// 31 caractères : pas de I, L, O, 0, 1 (confusions à la lecture / au téléphone).
export const ORDER_NUMBER_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const LENGTH = 6
const PREFIX = 'MC-'

/** Numéro public aléatoire (CSPRNG), ex. "MC-K7F3Q9" : ~887 millions de combinaisons. */
export function generateOrderNumber(): string {
  let out = ''
  for (let i = 0; i < LENGTH; i++) {
    out += ORDER_NUMBER_ALPHABET[randomInt(ORDER_NUMBER_ALPHABET.length)]
  }
  return PREFIX + out
}

export type OrderRef = { orderNumber: string } | { legacyId: number } | null

/**
 * Interprète ce que saisit le client : "MC-K7F3Q9", "mc k7f3q9", "k7f3q9" -> numéro public ;
 * "42" ou "#42" -> ancien numéro (id séquentiel), toujours accepté pour les commandes déjà envoyées.
 */
export function parseOrderRef(input: string | number): OrderRef {
  const raw = String(input).trim().toUpperCase().replace(/^#/, '')

  if (/^[0-9]{1,9}$/.test(raw)) {
    const id = Number(raw)
    return id > 0 && id <= 2_147_483_647 ? { legacyId: id } : null
  }

  const body = raw.replace(/^MC[-\s]?/, '').replace(/[\s-]/g, '')
  if (body.length === LENGTH && [...body].every((c) => ORDER_NUMBER_ALPHABET.includes(c))) {
    return { orderNumber: PREFIX + body }
  }
  return null
}

/** Affichage : numéro public, ou "#id" si une vieille donnée n'en a pas. */
export function displayOrderRef(order: { id: number; orderNumber?: string | null }): string {
  return order.orderNumber || `#${order.id}`
}
