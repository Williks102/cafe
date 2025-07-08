import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/[id] - Récupérer un produit par ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID de produit invalide' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération du produit' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Mettre à jour un produit
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    const body = await request.json();

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID de produit invalide' },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour le produit
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...body,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour du produit' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Supprimer un produit (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID de produit invalide' },
        { status: 400 }
      );
    }

    // Soft delete - marquer comme non disponible
    const deletedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        available: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression du produit' },
      { status: 500 }
    );
  }
}