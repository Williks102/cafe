import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Types Prisma pour éviter les conflits
type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    customer: true;
    orderItems: {
      include: {
        product: true;
      };
    };
  };
}>;

interface ProductSales {
  [key: string]: {
    name: string;
    quantity: number;
    revenue: number;
  };
}

interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface OrdersByStatus {
  PENDING: number;
  CONFIRMED: number;
  PREPARING: number;
  READY: number;
  DELIVERED: number;
  CANCELLED: number;
}

interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  readyOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  pendingRevenue: number;
  totalCustomers: number;
  recentOrders: number;
  averageOrderValue: number;
  topProducts: TopProduct[];
  ordersByStatus: OrdersByStatus;
}

export async function GET() {
  try {
    // Récupérer toutes les commandes avec les relations
    const orders: OrderWithRelations[] = await prisma.order.findMany({
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    // Calculer les statistiques
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order: OrderWithRelations) => order.status === 'PENDING').length;
    const confirmedOrders = orders.filter((order: OrderWithRelations) => order.status === 'CONFIRMED').length;
    const preparingOrders = orders.filter((order: OrderWithRelations) => order.status === 'PREPARING').length;
    const readyOrders = orders.filter((order: OrderWithRelations) => order.status === 'READY').length;
    const deliveredOrders = orders.filter((order: OrderWithRelations) => order.status === 'DELIVERED').length;
    const cancelledOrders = orders.filter((order: OrderWithRelations) => order.status === 'CANCELLED').length;

    // Revenus (commandes livrées uniquement)
    const totalRevenue = orders
      .filter((order: OrderWithRelations) => order.status === 'DELIVERED')
      .reduce((sum: number, order: OrderWithRelations) => sum + order.totalPrice, 0);

    // Revenus en attente (commandes confirmées et en préparation)
    const pendingRevenue = orders
      .filter((order: OrderWithRelations) => ['CONFIRMED', 'PREPARING', 'READY'].includes(order.status))
      .reduce((sum: number, order: OrderWithRelations) => sum + order.totalPrice, 0);

    // Nombre de clients uniques
    const uniqueCustomerIds = new Set(orders.map((order: OrderWithRelations) => order.customerId));
    const totalCustomers = uniqueCustomerIds.size;

    // Produits les plus vendus
    const productSales: ProductSales = {};
    
    orders.forEach((order: OrderWithRelations) => {
      if (order.status === 'DELIVERED') {
        order.orderItems.forEach(item => {
          const productId = item.product.id.toString();
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.product.name,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.price * item.quantity;
        });
      }
    });

    const topProducts: TopProduct[] = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Commandes récentes (24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentOrders = orders.filter((order: OrderWithRelations) => 
      new Date(order.createdAt) > yesterday
    ).length;

    // Moyenne par commande
    const averageOrderValue = deliveredOrders > 0 
      ? totalRevenue / deliveredOrders 
      : 0;

    const stats: AdminStats = {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      preparingOrders,
      readyOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      pendingRevenue,
      totalCustomers,
      recentOrders,
      averageOrderValue,
      topProducts,
      ordersByStatus: {
        PENDING: pendingOrders,
        CONFIRMED: confirmedOrders,
        PREPARING: preparingOrders,
        READY: readyOrders,
        DELIVERED: deliveredOrders,
        CANCELLED: cancelledOrders
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors du calcul des statistiques' },
      { status: 500 }
    );
  }
}