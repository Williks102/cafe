import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@/types';

// GET /api/orders/[id] - Récupérer une commande par ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'ID de commande invalide' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId
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

    if (!order) {
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
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    const body = await request.json();
    const { status, notes } = body;

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'ID de commande invalide' },
        { status: 400 }
      );
    }

    // Valider le statut si fourni
    if (status && !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Statut de commande invalide' },
        { status: 400 }
      );
    }

    // Vérifier que la commande existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
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
        ...(notes !== undefined && { notes }),
        updatedAt: new Date()
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

    return NextResponse.json(updatedOrder);
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
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'ID de commande invalide' },
        { status: 400 }
      );
    }

    // Vérifier que la commande existe et peut être annulée
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    if (existingOrder.status === 'DELIVERED' || existingOrder.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cette commande ne peut pas être annulée' },
        { status: 400 }
      );
    }

    // Marquer la commande comme annulée
    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
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

    return NextResponse.json(cancelledOrder);
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'annulation de la commande' },
      { status: 500 }
    );
  }
}