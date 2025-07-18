// app/api/orders/me/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Interfaces corrigées avec les bons types Prisma
interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    category?: string | null;
    image: string;
    createdAt: Date;
    updatedAt: Date;
    available: boolean;
  };
}

interface Order {
  id: number;
  status: string;
  totalPrice: number;
  createdAt: Date;  // ← Date au lieu de string
  updatedAt: Date;  // ← Date au lieu de string
  orderItems: OrderItem[];
}

interface OrderStats {
  totalOrders: number;
  deliveredOrders: number;
  totalSpent: number;
  pendingOrders: number;
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Récupérer les commandes (Prisma retourne des Date)
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id
      },
      include: {
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

    // Statistiques
    const stats: OrderStats = {
      totalOrders: orders.length,
      deliveredOrders: orders.filter(o => o.status === 'DELIVERED').length,
      totalSpent: orders.reduce((total, order) => 
        order.status !== 'CANCELLED' ? total + order.totalPrice : total, 0
      ),
      pendingOrders: orders.filter(o => 
        ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status)
      ).length
    };

    return NextResponse.json({ 
      orders,
      stats,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des commandes utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}