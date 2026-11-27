import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  prisma: {
    order: { findFirst: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    product: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    customer: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/auth', () => ({ auth: mocks.auth }))
vi.mock('@/lib/prisma', () => ({ prisma: mocks.prisma }))
vi.mock('@/lib/email-service', () => ({
  MosesCafeEmailService: {
    prepareEmailData: vi.fn(() => ({})),
    sendCustomerConfirmation: vi.fn(async () => ({ success: true })),
    sendAdminNotification: vi.fn(async () => ({ success: true })),
    sendStatusUpdate: vi.fn(async () => ({ success: true })),
  },
}))

const json = (url: string, body: unknown, method = 'POST', ip = '1.1.1.1') =>
  new Request(`http://t${url}`, {
    method,
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  })

const admin = { user: { id: 'a', role: 'ADMIN' } }
const user = { user: { id: 'u1', role: 'USER' } }

beforeEach(() => {
  vi.clearAllMocks()
  mocks.auth.mockResolvedValue(null)
})

describe('POST /api/orders/track', () => {
  it('400 sans numéro de commande', async () => {
    const { POST } = await import('@/app/api/orders/track/route')
    const res = await POST(json('/api/orders/track', { phone: '0712345678' }, 'POST', '2.0.0.1'))
    expect(res.status).toBe(400)
    expect(mocks.prisma.order.findFirst).not.toHaveBeenCalled()
  })

  it('cherche par id ET téléphone exact, sans fuite email/notes', async () => {
    mocks.prisma.order.findFirst.mockResolvedValue({ id: 7, status: 'PENDING' })
    const { POST } = await import('@/app/api/orders/track/route')
    const res = await POST(json('/api/orders/track', { order: 'mc-k7f3q9', phone: '+225 07 12 34 56 78' }, 'POST', '2.0.0.2'))
    expect(res.status).toBe(200)
    const arg = mocks.prisma.order.findFirst.mock.calls[0][0]
    expect(arg.where).toEqual({ orderNumber: 'MC-K7F3Q9', customer: { phone: '0712345678' } })
    expect(arg.select.customer.select).toEqual({ name: true, phone: true })
    expect(arg.select.notes).toBeUndefined()
  })

  it('accepte encore un ancien numéro (id) avec le téléphone', async () => {
    mocks.prisma.order.findFirst.mockResolvedValue({ id: 7 })
    const { POST } = await import('@/app/api/orders/track/route')
    const res = await POST(json('/api/orders/track', { order: '#7', phone: '0712345678' }, 'POST', '2.0.0.5'))
    expect(res.status).toBe(200)
    expect(mocks.prisma.order.findFirst.mock.calls[0][0].where).toEqual({ id: 7, customer: { phone: '0712345678' } })
  })

  it('renvoie une liste vide si téléphone ne correspond pas', async () => {
    mocks.prisma.order.findFirst.mockResolvedValue(null)
    const { POST } = await import('@/app/api/orders/track/route')
    const res = await POST(json('/api/orders/track', { order: 'MC-K7F3Q9', phone: '0700000000' }, 'POST', '2.0.0.3'))
    expect(await res.json()).toEqual({ orders: [], count: 0 })
  })

  it('429 après 10 tentatives depuis la même IP', async () => {
    mocks.prisma.order.findFirst.mockResolvedValue(null)
    const { POST } = await import('@/app/api/orders/track/route')
    let last = 0
    for (let i = 0; i < 11; i++) {
      last = (await POST(json('/api/orders/track', { order: 'MC-K7F3Q9', phone: '0700000000' }, 'POST', '2.0.0.4'))).status
    }
    expect(last).toBe(429)
  })
})

describe('/api/products — contrôle d\'accès', () => {
  const ctx = { params: Promise.resolve({ id: '1' }) }

  it('POST: 401 anonyme, 403 simple utilisateur', async () => {
    const { POST } = await import('@/app/api/products/route')
    const body = { name: 'n', description: 'd', image: 'i', price: 100 }
    expect((await POST(json('/api/products', body))).status).toBe(401)
    mocks.auth.mockResolvedValue(user)
    expect((await POST(json('/api/products', body))).status).toBe(403)
    expect(mocks.prisma.product.create).not.toHaveBeenCalled()
  })

  it('PUT/DELETE: refusés à un utilisateur non admin', async () => {
    mocks.auth.mockResolvedValue(user)
    const { PUT, DELETE } = await import('@/app/api/products/[id]/route')
    expect((await PUT(json('/api/products/1', { name: 'x' }, 'PUT'), ctx)).status).toBe(403)
    expect((await DELETE(json('/api/products/1', {}, 'DELETE'), ctx)).status).toBe(403)
    expect(mocks.prisma.product.update).not.toHaveBeenCalled()
  })

  it('GET ?admin=true refusé à un non-admin, GET public OK', async () => {
    const { GET } = await import('@/app/api/products/route')
    mocks.prisma.product.findMany.mockResolvedValue([])
    expect((await GET(new Request('http://t/api/products?admin=true'))).status).toBe(401)
    expect((await GET(new Request('http://t/api/products'))).status).toBe(200)
  })

  it('PUT admin: ne transmet que les champs autorisés', async () => {
    mocks.auth.mockResolvedValue(admin)
    mocks.prisma.product.findUnique.mockResolvedValue({ id: 1 })
    mocks.prisma.product.update.mockResolvedValue({ id: 1 })
    const { PUT } = await import('@/app/api/products/[id]/route')
    await PUT(json('/api/products/1', { name: 'N', id: 5, createdAt: 'x' }, 'PUT'), ctx)
    const data = mocks.prisma.product.update.mock.calls[0][0].data
    expect(data.name).toBe('N')
    expect(data).not.toHaveProperty('id')
    expect(data).not.toHaveProperty('createdAt')
  })
})

describe('GET /api/orders/[id]', () => {
  const ctx = { params: Promise.resolve({ id: '3' }) }
  const get = () => new Request('http://t/api/orders/3')

  it('401 anonyme', async () => {
    const { GET } = await import('@/app/api/orders/[id]/route')
    expect((await GET(get(), ctx)).status).toBe(401)
  })
  it('404 pour la commande d\'un autre, 200 pour le propriétaire et l\'admin', async () => {
    mocks.prisma.order.findUnique.mockResolvedValue({ id: 3, userId: 'u1' })
    const { GET } = await import('@/app/api/orders/[id]/route')
    mocks.auth.mockResolvedValue({ user: { id: 'u2', role: 'USER' } })
    expect((await GET(get(), ctx)).status).toBe(404)
    mocks.auth.mockResolvedValue(user)
    expect((await GET(get(), ctx)).status).toBe(200)
    mocks.auth.mockResolvedValue(admin)
    expect((await GET(get(), ctx)).status).toBe(200)
  })
})

describe('GET /api/admin/stats', () => {
  it('refusé hors admin', async () => {
    const { GET } = await import('@/app/api/admin/stats/route')
    expect((await GET()).status).toBe(401)
    mocks.auth.mockResolvedValue(user)
    expect((await GET()).status).toBe(403)
    expect(mocks.prisma.order.findMany).not.toHaveBeenCalled()
  })
})

describe('POST /api/orders — prix', () => {
  it('ignore le prix du client pour un produit landing et utilise le catalogue', async () => {
    mocks.prisma.customer.findFirst.mockResolvedValue(null)
    mocks.prisma.customer.create.mockResolvedValue({ id: 1, email: null, phone: '0712345678' })
    mocks.prisma.product.findFirst.mockResolvedValue({ id: 50 })
    let created: any
    mocks.prisma.$transaction.mockImplementation(async (fn: any) =>
      fn({ order: { findUnique: async () => null, create: async (a: any) => ((created = a.data), { id: 1, ...a.data, orderItems: [] }) } })
    )
    const { POST } = await import('@/app/api/orders/route')
    const res = await POST(
      json('/api/orders', {
        customerName: 'Test',
        customerPhone: '07 12 34 56 78',
        items: [{ productName: 'Espresso en Grains Robusta - 1kg', price: 1, quantity: 2 }],
      }, 'POST', '3.0.0.1')
    )
    expect(res.status).toBe(201)
    expect(created.totalPrice).toBe(36000)
    expect(created.orderNumber).toMatch(/^MC-[A-Z2-9]{6}$/)
    expect(created.orderItems.create[0].price).toBe(18000)
  })

  it('refuse un produit libre inconnu et une quantité invalide', async () => {
    const { POST } = await import('@/app/api/orders/route')
    const ok = { customerName: 'T', customerPhone: '0712345678' }
    expect((await POST(json('/api/orders', { ...ok, items: [{ productName: 'Gratuit', price: 1, quantity: 1 }] }, 'POST', '3.0.0.2'))).status).toBe(400)
    expect((await POST(json('/api/orders', { ...ok, items: [{ productId: 1, quantity: 1.5 }] }, 'POST', '3.0.0.3'))).status).toBe(400)
    expect(mocks.prisma.product.create).not.toHaveBeenCalled()
  })
})
