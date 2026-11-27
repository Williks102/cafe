import { describe, it, expect, vi } from 'vitest'
import { normalizePhone } from '@/lib/phone'
import { rateLimit } from '@/lib/rate-limit'
import { generateOrderNumber, parseOrderRef, displayOrderRef, ORDER_NUMBER_ALPHABET } from '@/lib/order-number'
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

describe('numéro de commande', () => {
  it('format MC-XXXXXX, alphabet sans caractères ambigus', () => {
    for (let i = 0; i < 500; i++) {
      const n = generateOrderNumber()
      expect(n).toMatch(/^MC-[A-Z2-9]{6}$/)
      expect(n).not.toMatch(/[ILO01]/)
    }
    expect(ORDER_NUMBER_ALPHABET).toHaveLength(31)
  })
  it('n\'est pas séquentiel ni prévisible', () => {
    const batch = Array.from({ length: 200 }, generateOrderNumber)
    // (collision possible mais ~0,002 % : la base garantit l'unicité, la création retente)
    expect(new Set(batch).size).toBeGreaterThanOrEqual(199)
    expect([...batch].sort()).not.toEqual(batch) // pas croissant
    expect(new Set(batch.map((n) => n[3])).size).toBeGreaterThan(10) // 1er caractère varié
  })
  it('parseOrderRef: numéro public tolérant (casse, tirets, espaces)', () => {
    for (const v of ['MC-K7F3Q9', 'mc-k7f3q9', 'mc k7f3q9', 'K7F3Q9', 'MCK7F3Q9'])
      expect(parseOrderRef(v)).toEqual({ orderNumber: 'MC-K7F3Q9' })
  })
  it('parseOrderRef: anciens numéros numériques acceptés', () => {
    expect(parseOrderRef('42')).toEqual({ legacyId: 42 })
    expect(parseOrderRef('#42')).toEqual({ legacyId: 42 })
    expect(parseOrderRef(7)).toEqual({ legacyId: 7 })
  })
  it('parseOrderRef: rejette le reste', () => {
    for (const v of ['', 'MC-K7F3', 'MC-K7F3Q9X', 'MC-IIIIII', '0', '99999999999', 'abc'])
      expect(parseOrderRef(v)).toBeNull()
  })
  it('displayOrderRef: repli sur #id', () => {
    expect(displayOrderRef({ id: 3, orderNumber: 'MC-AAAAAA' })).toBe('MC-AAAAAA')
    expect(displayOrderRef({ id: 3 })).toBe('#3')
  })
})

describe('trackSchema', () => {
  it('exige numéro de commande ET téléphone', () => {
    expect(trackSchema.safeParse({ phone: '0712345678' }).success).toBe(false)
    expect(trackSchema.safeParse({ order: 'MC-K7F3Q9' }).success).toBe(false)
  })
  it('accepte numéro public ou ancien numéro, et un téléphone formaté', () => {
    const a = trackSchema.safeParse({ order: 'mc-k7f3q9', phone: '+225 07 12 34 56 78' })
    expect(a.success && a.data).toEqual({ order: { orderNumber: 'MC-K7F3Q9' }, phone: '0712345678' })
    const b = trackSchema.safeParse({ order: '#42', phone: '0712345678' })
    expect(b.success && b.data).toEqual({ order: { legacyId: 42 }, phone: '0712345678' })
  })
  it('lit encore l\'ancien nom de champ "orderId"', () => {
    const r = trackSchema.safeParse({ orderId: 42, phone: '0712345678' })
    expect(r.success && r.data.order).toEqual({ legacyId: 42 })
  })
  it('refuse un numéro invalide', () => {
    expect(trackSchema.safeParse({ order: 'n\'importe quoi', phone: '0712345678' }).success).toBe(false)
  })
  it('refuse un téléphone partiel', () => {
    expect(trackSchema.safeParse({ order: 1, phone: '12345678' }).success).toBe(false)
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
