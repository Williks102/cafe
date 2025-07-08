import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateOrderRequest, OrderStatus } from '@/types';

// Types pour les requêtes API
interface OrdersQuery {
  status?: OrderStatus;
  limit: number;
  offset: number;
}

interface ProductFromDB {
  id: number;
  name: string;
  price: number;
  available: boolean;
}

interface OrderWithRelations {
  id: number;
  customerId: number;
  status: OrderStatus;
  totalPrice: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: number;
    name: string;
    email?: string;
    phone: string;
  };
  orderItems: Array<{
    id: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
      category?: string;
      image: string;
    };
  }>;
}

// GET /api/orders - Récupérer toutes les commandes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validation du statut si fourni
    let status: OrderStatus | undefined;
    if (statusParam && Object.values(OrderStatus).includes(statusParam as OrderStatus)) {
      status = statusParam as OrderStatus;
    }

    const where = status ? { status } : {};

    const orders: OrderWithRelations[] = await prisma.order.findMany({
      where,
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
      },
      take: limit,
      skip: offset
    });

    const totalCount = await prisma.order.count({ where });

    return NextResponse.json({
      orders,
      totalCount,
      hasMore: offset + limit < totalCount
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des commandes' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Créer une nouvelle commande
export async function POST(request: Request) {
  try {
    const body: CreateOrderRequest = await request.json();
    const { customerName, customerEmail, customerPhone, items, notes } = body;

    // Validation des données
    if (!customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Informations client et articles requis' },
        { status: 400 }
      );
    }

    // Validation du format du téléphone ivoirien (plus flexible)
    const cleanPhone = customerPhone.replace(/[\s\-\.]/g, ''); // Supprimer espaces, tirets, points
    const phoneRegex = /^(\+225|225)?[0-9]{8,10}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Format de téléphone invalide. Utilisez le format: +225 XX XX XX XX XX ou 07 XX XX XX XX' },
        { status: 400 }
      );
    }

    // Vérifier que tous les produits existent et sont disponibles
    const productIds = items.map(item => item.productId);
    const products: ProductFromDB[] = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        available: true
      }
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Un ou plusieurs produits ne sont pas disponibles' },
        { status: 400 }
      );
    }

    // Calculer le prix total
    let totalPrice = 0;
    const orderItemsData = items.map(item => {
      const product = products.find((p: ProductFromDB) => p.id === item.productId);
      if (!product) {
        throw new Error(`Produit ${item.productId} non trouvé`);
      }
      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      };
    });

    // Créer ou récupérer le client
    let customer = await prisma.customer.findUnique({
      where: { phone: customerPhone }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          email: customerEmail || null,
          phone: customerPhone
        }
      });
    } else {
      // Mettre à jour les informations du client si nécessaire
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: customerName,
          email: customerEmail || customer.email
        }
      });
    }

    // Créer la commande avec les articles
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        totalPrice,
        notes,
        status: OrderStatus.PENDING,
        orderItems: {
          create: orderItemsData
        }
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création de la commande' },
      { status: 500 }
    );
  }
}