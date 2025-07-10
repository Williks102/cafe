import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders - Récupérer toutes les commandes
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
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

    return NextResponse.json({ orders });
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
    const body = await request.json();
    const { customerName, customerEmail, customerPhone, customerAddress, items, notes, source = 'landing_page' } = body;

    // Validation des données
    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: 'Le nom et le téléphone du client sont requis' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Au moins un article doit être commandé' },
        { status: 400 }
      );
    }

    // Créer ou trouver le client
    let customer;
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        phone: customerPhone
      }
    });

    if (existingCustomer) {
      // Mettre à jour les infos du client si nécessaire
      customer = await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: {
          name: customerName,
          email: customerEmail || existingCustomer.email,
        }
      });
    } else {
      // Créer un nouveau client
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        }
      });
    }

    // Calculer le prix total et valider les produits
    let totalPrice = 0;
    const validatedItems = [];

    for (const item of items) {
      if (item.productId) {
        // Produit existant - vérifier s'il existe
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          return NextResponse.json(
            { error: `Produit avec l'ID ${item.productId} non trouvé` },
            { status: 400 }
          );
        }

        const itemTotal = product.price * item.quantity;
        totalPrice += itemTotal;
        
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        });
      } else if (item.productName && item.price) {
        // Produit personnalisé des landing pages
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;

        // Créer un produit temporaire pour les landing pages
        const tempProduct = await prisma.product.create({
          data: {
            name: item.productName,
            description: item.description || `Produit commandé via ${source}`,
            image: item.image || 'https://via.placeholder.com/400x400?text=Produit',
            price: item.price,
            category: item.category || 'Landing Page',
            available: false, // Produit temporaire, pas visible dans le catalogue
            stock: 0
          }
        });

        validatedItems.push({
          productId: tempProduct.id,
          quantity: item.quantity,
          price: item.price
        });
      } else {
        return NextResponse.json(
          { error: 'Informations produit invalides' },
          { status: 400 }
        );
      }
    }

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        status: 'PENDING',
        totalPrice,
        notes: notes || `Commande passée via ${source}. Adresse: ${customerAddress || 'Non spécifiée'}`,
        orderItems: {
          create: validatedItems
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