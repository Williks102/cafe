import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products - Récupérer tous les produits
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    
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
    const body = await request.json();
    const { name, description, image, price, category, available = true, stock = 0 } = body;

    // Validation des données
    if (!name || !description || !image || !price) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Le prix doit être un nombre positif' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        image,
        price,
        category: category || null,
        available: Boolean(available),
        stock: Number(stock) || 0
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