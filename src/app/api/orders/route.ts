import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/orders - Récupérer toutes les commandes
export async function GET() {
  try {
    const session = await auth();
    
    // Pas connecté - pas d'accès
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    // Si admin, retourner TOUTES les commandes
    if (session.user.role === 'ADMIN') {
      const orders = await prisma.order.findMany({
        include: {
          customer: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
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
    }

    // Si utilisateur normal, retourner seulement ses commandes
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id
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
    const session = await auth();
    const body = await request.json();
    
    // Deux types de commandes possibles :
    // 1. Commande utilisateur connecté (items seulement)
    // 2. Commande invité (customerName, customerEmail, customerPhone, items)
    
    const { customerName, customerEmail, customerPhone, customerAddress, items, notes, source = 'web_app' } = body;

    // Validation des items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Au moins un article doit être commandé' },
        { status: 400 }
      );
    }

    let customer = null;
    let userId = null;

    // === UTILISATEUR CONNECTÉ ===
    if (session?.user) {
      userId = session.user.id;
      
      // Pour les utilisateurs connectés, on peut créer un customer optionnel
      // basé sur les infos du user si customerName est fourni
      if (customerName && customerPhone) {
        // Commande utilisateur avec infos de livraison spécifiques
        const existingCustomer = await prisma.customer.findFirst({
          where: { phone: customerPhone }
        });

        if (existingCustomer) {
          customer = await prisma.customer.update({
            where: { id: existingCustomer.id },
            data: {
              name: customerName,
              email: customerEmail || existingCustomer.email,
            }
          });
        } else {
          customer = await prisma.customer.create({
            data: {
              name: customerName,
              email: customerEmail || session.user.email,
              phone: customerPhone
            }
          });
        }
      }
    } 
    // === COMMANDE INVITÉ ===
    else {
      // Validation des données obligatoires pour les invités
      if (!customerName || !customerPhone) {
        return NextResponse.json(
          { error: 'Le nom et le téléphone du client sont requis pour les commandes invités' },
          { status: 400 }
        );
      }

      // Créer ou trouver le client
      const existingCustomer = await prisma.customer.findFirst({
        where: { phone: customerPhone }
      });

      if (existingCustomer) {
        customer = await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: {
            name: customerName,
            email: customerEmail || existingCustomer.email,
          }
        });
      } else {
        customer = await prisma.customer.create({
          data: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone
          }
        });
      }
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

        if (!product.available) {
          return NextResponse.json(
            { error: `Le produit "${product.name}" n'est plus disponible` },
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
        // Produit personnalisé des landing pages (rétrocompatibilité)
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

    // Préparer les notes
    let orderNotes = notes || '';
    if (session?.user) {
      orderNotes = `Commande utilisateur connecté (${session.user.email}). ${orderNotes}`;
    } else {
      orderNotes = `Commande invité via ${source}. ${orderNotes}`;
    }
    
    if (customerAddress) {
      orderNotes += ` Adresse: ${customerAddress}`;
    }

    // Créer la commande
    const orderData: any = {
      status: 'PENDING',
      totalPrice,
      notes: orderNotes,
      orderItems: {
        create: validatedItems
      }
    };

    // Ajouter userId OU customerId selon le cas
    if (userId) {
      orderData.userId = userId;
      // Pour les utilisateurs connectés, on peut créer un customer optionnel
      if (customer) {
        orderData.customerId = customer.id;
      }
    } else if (customer) {
      // Pour les invités, customerId est obligatoire
      orderData.customerId = customer.id;
    } else {
      throw new Error('Aucun utilisateur ou client identifié');
    }

    const order = await prisma.order.create({
      data: orderData,
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    // Log pour debug
    console.log(`Nouvelle commande créée:`, {
      orderId: order.id,
      userId: userId || 'invité',
      customerId: customer?.id || null,
      total: totalPrice,
      itemsCount: validatedItems.length
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