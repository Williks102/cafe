import { describe, it, expect, vi } from 'vitest'
import { normalizePhone } from '@/lib/phone'
import { rateLimit } from '@/lib/rate-limit'
import { trackSchema, orderCreateSchema, registerSchema, productUpdateSchema } from '@/lib/schemas'

describe('normalizePhone', () => {
  it.each([
    ['07 12 34 56 78', '0712345678'],
    ['+225 07 12 34 56 78', '0712345678'],
    ['00225 0712345678', '0712345678'],
    ['07-12.34.56.78', '0712345678'],
  ])('%s -> %s', (input, out) => expect(normalizePhone(input)).toBe(out))
})

describe('rateLimit', () => {
  it('bloque au-delà de la limite puis repart après la fenêtre', () => {
    vi.useFakeTimers()
    const key = 'k' + Math.random()
    expect([1, 2, 3].map(() => rateLimit(key, 3, 1000))).toEqual([true, true, true])
    expect(rateLimit(key, 3, 1000)).toBe(false)
    vi.advanceTimersByTime(1001)
    expect(rateLimit(key, 3, 1000)).toBe(true)
    vi.useRealTimers()
  })
})

describe('trackSchema', () => {
  it('exige numéro de commande ET téléphone', () => {
    expect(trackSchema.safeParse({ phone: '0712345678' }).success).toBe(false)
    expect(trackSchema.safeParse({ orderId: 5 }).success).toBe(false)
  })
  it('accepte "#42" et un téléphone formaté', () => {
    const r = trackSchema.safeParse({ orderId: '#42', phone: '+225 07 12 34 56 78' })
    expect(r.success && r.data).toEqual({ orderId: 42, phone: '0712345678' })
  })
  it('refuse un téléphone partiel', () => {
    expect(trackSchema.safeParse({ orderId: 1, phone: '12345678' }).success).toBe(false)
  })
})

describe('orderCreateSchema', () => {
  const base = { items: [{ productId: 1, quantity: 2 }] }
  it('applique les valeurs par défaut', () => {
    const r = orderCreateSchema.parse(base)
    expect(r.source).toBe('web_app')
    expect(r.notificationPreference).toBe('email')
  })
  it('ignore le prix envoyé par le client', () => {
    const r = orderCreateSchema.parse({ items: [{ productName: 'x', quantity: 1, price: 1 }] })
    expect('price' in r.items[0]).toBe(false)
  })
  it('refuse quantité décimale, nulle ou énorme', () => {
    for (const quantity of [1.5, 0, 101, '2']) {
      expect(orderCreateSchema.safeParse({ items: [{ productId: 1, quantity }] }).success).toBe(false)
    }
  })
  it('traite un email vide comme absent', () => {
    expect(orderCreateSchema.parse({ ...base, customerEmail: '' }).customerEmail).toBeUndefined()
  })
})

describe('registerSchema', () => {
  it('normalise l\'email et limite le mot de passe à 72 caractères', () => {
    expect(registerSchema.parse({ name: 'A', email: ' A@X.com ', password: '12345678' }).email).toBe('a@x.com')
    expect(registerSchema.safeParse({ name: 'A', email: 'a@x.com', password: 'x'.repeat(73) }).success).toBe(false)
    expect(registerSchema.safeParse({ name: 'A', email: 'a@x.com', password: 'court' }).success).toBe(false)
  })
})

describe('productUpdateSchema', () => {
  it('retire les champs non autorisés (mass assignment)', () => {
    const r = productUpdateSchema.parse({ name: 'N', id: 99, createdAt: 'x', role: 'ADMIN' })
    expect(r).toEqual({ name: 'N' })
  })
})
