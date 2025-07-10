import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addNewProducts() {
  console.log('🔄 Ajout des nouveaux produits MosesCafe...');

  try {
    // Ajouter l'Espresso Moulu Robusta
    const espressoMoulu = await prisma.product.create({
      data: {
        name: "Espresso Moulu Robusta",
        description: "L'authenticité du terroir ivoirien dans chaque tasse. Un Robusta puissant, torréfié artisanalement pour les vrais amateurs. Notes boisées, épicées et cacao amer avec une intensité 10/10.",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600",
        price: 8000, // Prix de base pour 500g
        category: "Espresso Moulu",
        available: true
      }
    });

    // Ajouter les Capsules Robusta
    const capsulesRobusta = await prisma.product.create({
      data: {
        name: "Capsules Robusta - Compatible Nespresso®",
        description: "L'intensité et le caractère du Robusta ivoirien dans la simplicité d'une capsule. Compatible Nespresso® pour un espresso d'exception. Boîte de 10 capsules, torréfaction foncée, intensité 10/10.",
        image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600",
        price: 3500, // Prix pour une boîte de 10 capsules
        category: "Capsules",
        available: true
      }
    });

    // Ajouter l'Espresso en Grains Robusta
    const espressoGrains = await prisma.product.create({
      data: {
        name: "Espresso en Grains Robusta",
        description: "Caractère africain, torréfaction artisanale. Plongez dans l'authenticité d'un espresso intense avec notre Robusta 100% pur origine Côte d'Ivoire. Idéal pour machine espresso broyeur.",
        image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600",
        price: 9500, // Prix de base pour 500g
        category: "Grains Robusta",
        available: true
      }
    });

    console.log('✅ Produits ajoutés avec succès !');
    console.log(`📦 Espresso Moulu Robusta - ID: ${espressoMoulu.id}`);
    console.log(`📦 Capsules Robusta - ID: ${capsulesRobusta.id}`);
    console.log(`📦 Espresso en Grains Robusta - ID: ${espressoGrains.id}`);
    
    console.log('\n🎯 Résumé des produits MosesCafe :');
    console.log('├── Espresso Moulu Robusta (500g) - 8 000 CFA');
    console.log('├── Capsules Robusta (10 pcs) - 3 500 CFA');
    console.log('└── Espresso en Grains Robusta (500g) - 9 500 CFA');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des produits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

