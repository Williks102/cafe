// app/api/orders/track/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis' },
        { status: 400 }
      );
    }

    // Nettoyer le numéro de téléphone (supprimer espaces, tirets, etc.)
    const cleanPhone = phone.replace(/[\s\-\.]/g, '');

    // Rechercher les commandes par numéro de téléphone
    const orders = await prisma.order.findMany({
      where: {
        customer: {
          phone: {
            contains: cleanPhone.slice(-8) // Recherche sur les 8 derniers chiffres
          }
        }
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ 
      orders,
      count: orders.length 
    });

  } catch (error) {
    console.error('Erreur lors du suivi de commande:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}