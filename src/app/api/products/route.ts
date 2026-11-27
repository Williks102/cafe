import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guards';
import { productCreateSchema, firstIssue } from '@/lib/schemas';

// GET /api/products - Récupérer tous les produits
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    if (isAdmin) {
      const guard = await requireAdmin();
      if (guard.error) return guard.error;
    }
    
    const products = await prisma.product.findMany({
      where: isAdmin ? {} : {
        available: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}

// POST /api/products - Créer un nouveau produit (admin)
export async function POST(request: Request) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const parsed = productCreateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
    }
    const { name, description, image, price, category, available } = parsed.data;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        image,
        price,
        category: category || null,
        available,
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du produit' },
      { status: 500 }
    );
  }
}