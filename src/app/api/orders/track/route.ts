// app/api/orders/track/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { trackSchema, firstIssue } from '@/lib/schemas';

// Suivi invité : il faut le NUMÉRO DE COMMANDE (MC-XXXXXX, ou ancien numéro) ET le téléphone utilisé à la commande.
// Un seul des deux ne suffit pas. Réponse identique que la commande n'existe pas
// ou que le téléphone ne correspond pas (pas d'oracle d'énumération).
export async function POST(request: Request) {
  try {
    if (!rateLimit(`track:${clientIp(request)}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Trop de tentatives, réessayez dans quelques minutes' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = trackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
    }
    const { order: ref, phone } = parsed.data;

    const order = await prisma.order.findFirst({
      where: {
        ...('orderNumber' in ref ? { orderNumber: ref.orderNumber } : { id: ref.legacyId }),
        customer: { phone },
      },
      select: {
        id: true,
        orderNumber: true,
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
      }
    });

    const orders = order ? [order] : [];
    return NextResponse.json({ orders, count: orders.length });
  } catch (error) {
    console.error('Erreur lors du suivi de commande:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
