import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const getToken = vi.hoisted(() => vi.fn())
vi.mock('next-auth/jwt', () => ({ getToken }))

import middleware from '../middleware'

beforeEach(() => {
  getToken.mockReset()
  delete process.env.AUTH_SECRET
  process.env.NEXTAUTH_SECRET = 'legacy-secret'
})

describe('middleware — lecture de la session', () => {
  it('en HTTPS: cookie sécurisé + secret NEXTAUTH_SECRET en secours', async () => {
    getToken.mockResolvedValue({ role: 'ADMIN' })
    const res = await middleware(new NextRequest('https://shop.example/admin'))
    expect(getToken.mock.calls[0][0]).toMatchObject({ secureCookie: true, secret: 'legacy-secret' })
    expect(res.status).toBe(200) // admin connecté : pas de redirection
  })

  it('en HTTP local: cookie non sécurisé', async () => {
    getToken.mockResolvedValue(null)
    await middleware(new NextRequest('http://localhost:3000/admin'))
    expect(getToken.mock.calls[0][0].secureCookie).toBe(false)
  })

  it('anonyme sur /admin -> redirigé vers la connexion', async () => {
    getToken.mockResolvedValue(null)
    const res = await middleware(new NextRequest('https://shop.example/admin'))
    expect(res.headers.get('location')).toContain('/auth/signin')
  })

  it('utilisateur simple sur /admin -> /dashboard', async () => {
    getToken.mockResolvedValue({ role: 'USER' })
    const res = await middleware(new NextRequest('https://shop.example/admin'))
    expect(res.headers.get('location')).toContain('/dashboard')
  })
})
