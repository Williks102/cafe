// app/api/orders/track/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/phone';
import { rateLimit, clientIp } from '@/lib/rate-limit';

// Suivi invité par téléphone. Le téléphone est le "secret" : on exige donc
// un numéro complet (correspondance exacte), on limite le débit et on ne
// renvoie que le strict nécessaire (pas d'email, d'adresse ni de notes).
export async function POST(request: Request) {
  try {
    if (!rateLimit(`track:${clientIp(request)}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Trop de tentatives, réessayez dans quelques minutes' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const phone = typeof body?.phone === 'string' ? body.phone : '';
    const cleanPhone = normalizePhone(phone);

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Numéro de téléphone invalide (10 chiffres)' },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { customer: { phone: cleanPhone } },
      select: {
        id: true,
        status: true,
        totalPrice: true,
        createdAt: true,
        customer: { select: { name: true, phone: true } },
        orderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: { select: { name: true, category: true, image: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({ orders, count: orders.length });
  } catch (error) {
    console.error('Erreur lors du suivi de commande:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
