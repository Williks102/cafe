import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { MosesCafeEmailService } from '@/lib/email-service';
import { OrderWithFullRelations } from '@/types/email-types';

interface ValidatedOrderItem {
  productId: number;
  quantity: number;
  price: number;
}

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
    
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      customerAddress, 
      items, 
      notes, 
      source = 'web_app',
      // Nouveau: préférences de notification
      notificationPreference = 'email' // 'email', 'sms', 'both', 'none'
    } = body;

    // Validation des items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Au moins un article doit être commandé' },
        { status: 400 }
      );
    }

    // Validation email si fourni
    if (customerEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        return NextResponse.json(
          { error: 'Format d\'email invalide' },
          { status: 400 }
        );
      }
    }

    // Validation téléphone si fourni
    if (customerPhone) {
      // Format côte d'ivoire : +225 XX XX XX XX XX ou 07/05/01 XX XX XX XX
      const phoneRegex = /^(\+225\s?)?[0-9\s]{10,}$/;
      const cleanPhone = customerPhone.replace(/\s/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        return NextResponse.json(
          { error: 'Format de téléphone invalide' },
          { status: 400 }
        );
      }
    }

    let customer = null;
    let userId = null;

    // === UTILISATEUR CONNECTÉ ===
    if (session?.user) {
      userId = session.user.id;
      
      // Pour les utilisateurs connectés, on peut créer un customer optionnel
      // basé sur les infos du user si customerName est fourni
      if (customerName && customerPhone) {
        // Normaliser le téléphone
        const normalizedPhone = customerPhone.replace(/\s/g, '').replace(/^\+225/, '');
        
        const existingCustomer = await prisma.customer.findFirst({
          where: { phone: normalizedPhone }
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
              phone: normalizedPhone
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

      // Normaliser le téléphone
      const normalizedPhone = customerPhone.replace(/\s/g, '').replace(/^\+225/, '');

      // Créer ou trouver le client
      const existingCustomer = await prisma.customer.findFirst({
        where: { phone: normalizedPhone }
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
            phone: normalizedPhone
          }
        });
      }
    }

    // Calculer le prix total et valider les produits
    let totalPrice = 0;
    const validatedItems: Array<{productId: number; quantity: number; price: number}> = [];
    const unavailableProducts = [];

    for (const item of items) {
      if (!item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: 'La quantité doit être au moins 1' },
          { status: 400 }
        );
      }

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
          unavailableProducts.push(product.name);
          continue;
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
        if (item.price < 0) {
          return NextResponse.json(
            { error: 'Le prix ne peut pas être négatif' },
            { status: 400 }
          );
        }

        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;

        // Créer un produit temporaire pour les landing pages
        const tempProduct = await prisma.product.create({
          data: {
            name: item.productName,
            description: item.description || `Produit commandé via ${source}`,
            image: item.image || '/images/default-product.jpg',
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

    // Vérifier qu'il y a au moins un produit valide
    if (validatedItems.length === 0) {
      return NextResponse.json(
        { 
          error: 'Aucun produit disponible dans votre commande',
          unavailableProducts 
        },
        { status: 400 }
      );
    }

    // Avertir si certains produits n'étaient pas disponibles
    if (unavailableProducts.length > 0) {
      console.warn(`Produits non disponibles retirés de la commande: ${unavailableProducts.join(', ')}`);
    }

    // Préparer les notes avec plus de contexte
    let orderNotes = notes || '';
    const notesArray = [];
    
    if (session?.user) {
      notesArray.push(`Client connecté: ${session.user.email}`);
    } else {
      notesArray.push(`Commande invité`);
    }
    
    notesArray.push(`Source: ${source}`);
    
    if (customerAddress) {
      notesArray.push(`Adresse: ${customerAddress}`);
    }
    
    if (notificationPreference !== 'email') {
      notesArray.push(`Préférence notification: ${notificationPreference}`);
    }
    
    if (orderNotes) {
      notesArray.push(`Notes client: ${orderNotes}`);
    }
    
    orderNotes = notesArray.join(' | ');

    // Créer la commande dans une transaction
    const order = await prisma.$transaction(async (tx) => {
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
        if (customer) {
          orderData.customerId = customer.id;
        }
      } else if (customer) {
        orderData.customerId = customer.id;
      } else {
        throw new Error('Aucun utilisateur ou client identifié');
      }

      return await tx.order.create({
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
    });

    // Log structuré pour monitoring
    console.log('📦 Nouvelle commande créée:', {
      orderId: order.id,
      userId: userId || 'invité',
      customerId: customer?.id || null,
      total: totalPrice,
      itemsCount: validatedItems.length,
      source,
      notificationPreference,
      hasEmail: !!(customer?.email || session?.user?.email),
      hasPhone: !!customer?.phone
    });

    // Envoyer les notifications selon les préférences
    if (order) {
      const fullOrder = order as OrderWithFullRelations;
      const emailData = MosesCafeEmailService.prepareEmailData(fullOrder);
      
      // Déterminer quelles notifications envoyer
      const shouldSendEmail = notificationPreference === 'email' || notificationPreference === 'both';
      const shouldSendSMS = notificationPreference === 'sms' || notificationPreference === 'both';
      
      // Notifications asynchrones
      const notificationPromises = [];
      
      // Email client
      if (shouldSendEmail && (customer?.email || session?.user?.email)) {
        notificationPromises.push(
          MosesCafeEmailService.sendCustomerConfirmation(emailData)
            .then(result => ({ type: 'customer_email', ...result }))
        );
      }
      
      // Email admin (toujours envoyé)
      notificationPromises.push(
        MosesCafeEmailService.sendAdminNotification(emailData)
          .then(result => ({ type: 'admin_email', ...result }))
      );
      
      // SMS (si implémenté)
      if (shouldSendSMS && customer?.phone) {
        // TODO: Implémenter l'envoi SMS
        console.log(`📱 SMS à implémenter pour: ${customer.phone}`);
      }
      
      // Exécuter toutes les notifications
      Promise.allSettled(notificationPromises)
        .then((results) => {
          const summary = results.map(result => {
            if (result.status === 'fulfilled') {
              const { type, success, reason } = result.value;
              return `${type}: ${success ? '✅' : `❌ ${reason || 'erreur'}`}`;
            } else {
              return `❌ Erreur: ${result.reason}`;
            }
          });
          
          console.log(`📧 Notifications commande #${order.id}:`, summary.join(', '));
        });
    }

    // Préparer la réponse avec informations utiles
    const response = {
      ...order,
      // Ajouter des métadonnées utiles
      _metadata: {
        notificationsSent: {
          email: notificationPreference === 'email' || notificationPreference === 'both',
          sms: notificationPreference === 'sms' || notificationPreference === 'both'
        },
        unavailableProducts: unavailableProducts.length > 0 ? unavailableProducts : undefined,
        estimatedTime: '10-15 minutes'
      }
    };

    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la commande:', error);
    
    // Gestion d'erreurs plus spécifique
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Une commande similaire existe déjà' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création de la commande' },
      { status: 500 }
    );
  }
}