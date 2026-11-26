// app/api/orders/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { MosesCafeEmailService } from '@/lib/email-service';
import { OrderWithFullRelations } from '@/types/email-types';

// GET /api/orders/[id] - Récupérer une commande spécifique
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'ID de commande invalide' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Réponse identique à "introuvable" si ce n'est pas la commande de l'appelant (anti-énumération)
    if (session.user.role !== 'ADMIN' && order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération de la commande' },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] - Mettre à jour le statut d'une commande
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    // Vérifier les permissions (seuls les admins peuvent modifier les commandes)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'ID de commande invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, notes } = body;

    // Validation du statut
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Statut de commande invalide' },
        { status: 400 }
      );
    }

    // Vérifier que la commande existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
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

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Mettre à jour la commande
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
        updatedAt: new Date()
      },
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
    }) as OrderWithFullRelations;

    // Si le statut a changé, envoyer un email de notification
    if (status && status !== existingOrder.status) {
      const emailData = MosesCafeEmailService.prepareEmailData(updatedOrder);
      
      // Envoyer l'email de mise à jour de statut
      MosesCafeEmailService.sendStatusUpdate(emailData)
        .then((result) => {
          console.log(`📧 Email de statut ${status} pour commande #${orderId}:`, 
            result.success ? '✅ Envoyé' : `❌ Échec (${result.reason || 'erreur'})`
          );
        })
        .catch((error) => {
          console.error(`Erreur envoi email statut #${orderId}:`, error);
        });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      statusChanged: status !== existingOrder.status
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour de la commande' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Annuler une commande
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'ID de commande invalide' },
        { status: 400 }
      );
    }

    // Vérifier que la commande existe et appartient à l'utilisateur
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
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

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier les permissions
    const isAdmin = session?.user?.role === 'ADMIN';
    const isOwner = session?.user?.id === existingOrder.userId;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Non autorisé à annuler cette commande' },
        { status: 403 }
      );
    }

    // Empêcher l'annulation si la commande est déjà livrée
    if (existingOrder.status === 'DELIVERED') {
      return NextResponse.json(
        { error: 'Impossible d\'annuler une commande déjà livrée' },
        { status: 400 }
      );
    }

    // Marquer comme annulée au lieu de supprimer
    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      },
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
    }) as OrderWithFullRelations;

    // Envoyer l'email d'annulation
    const emailData = MosesCafeEmailService.prepareEmailData(cancelledOrder);
    
    Promise.all([
      // Email au client
      MosesCafeEmailService.sendStatusUpdate(emailData),
      // Email aux admins
      MosesCafeEmailService.sendAdminNotification({
        ...emailData,
        notes: `ANNULATION - ${emailData.notes || 'Pas de notes'}`
      })
    ]).then(([customerResult, adminResult]) => {
      console.log(`📧 Emails d'annulation pour commande #${orderId}:`, {
        client: customerResult.success ? '✅' : `❌ ${customerResult.reason || 'erreur'}`,
        admin: adminResult.success ? '✅' : '❌'
      });
    }).catch((error) => {
      console.error(`Erreur envoi emails annulation #${orderId}:`, error);
    });

    return NextResponse.json({ 
      message: 'Commande annulée avec succès',
      order: cancelledOrder
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'annulation de la commande' },
      { status: 500 }
    );
  }
}