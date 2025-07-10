import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Nettoyage de la base de données...');
  
  // Supprimer les données existantes dans l'ordre des dépendances
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();

  console.log('📦 Création des produits...');
  
  // ANCIENS PRODUITS (café préparé)
  const espresso = await prisma.product.create({
    data: {
      name: "Espresso Intense",
      description: "Un espresso court et puissant aux arômes intenses. Torréfaction artisanale avec des grains d'Éthiopie sélectionnés.",
      image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600",
      price: 2100, // 2100 CFA
      category: "Espresso",
      available: true
    }
  });

  const latte = await prisma.product.create({
    data: {
      name: "Latte Doux",
      description: "Un latte crémeux à la vanille, parfait pour la détente. Mousse de lait onctueuse et café arabica premium.",
      image: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=600",
      price: 2500, // 2500 CFA
      category: "Latte",
      available: true
    }
  });

  const coldBrew = await prisma.product.create({
    data: {
      name: "Cold Brew",
      description: "Café infusé à froid pendant 12h, rafraîchissant et doux. Méthode artisanale pour un goût unique.",
      image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600",
      price: 2800, // 2800 CFA
      category: "Cold Brew",
      available: true
    }
  });

  const cappuccino = await prisma.product.create({
    data: {
      name: "Cappuccino Classic",
      description: "Le grand classique italien avec sa mousse onctueuse. Équilibre parfait entre café, lait et mousse.",
      image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600",
      price: 2300, // 2300 CFA
      category: "Cappuccino",
      available: true
    }
  });

  const americano = await prisma.product.create({
    data: {
      name: "Americano",
      description: "Café noir allongé, intense et authentique. Pour les amateurs de café pur et sans compromis.",
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600",
      price: 1800, // 1800 CFA
      category: "Americano",
      available: true
    }
  });

  const mocha = await prisma.product.create({
    data: {
      name: "Mocha Délice",
      description: "Parfait mélange de café et chocolat, une pure gourmandise. Chantilly maison et copeaux de chocolat.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
      price: 3000, // 3000 CFA
      category: "Mocha",
      available: true
    }
  });

  // NOUVEAUX PRODUITS MOSESCAFE (produits premium)
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

  console.log('👥 Création des clients...');

  // Créer des clients de test
  const customer1 = await prisma.customer.create({
    data: {
      name: "Kouamé Jean-Baptiste",
      email: "kouame.jean@gmail.com",
      phone: "+22507123456"
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "Aya Marie-Claire",
      email: "aya.marie@yahoo.fr",
      phone: "+22505987654"
    }
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: "Koffi Pierre",
      phone: "+22501234567"
    }
  });

  console.log('📋 Création des commandes de test...');

  // Commande 1 - Produits anciens
  const order1 = await prisma.order.create({
    data: {
      customerId: customer1.id,
      status: 'CONFIRMED',
      totalPrice: 4600, // 2x Espresso + 1x Latte
      notes: "Sans sucre pour l'espresso, merci !",
      orderItems: {
        create: [
          {
            productId: espresso.id,
            quantity: 2,
            price: espresso.price
          },
          {
            productId: latte.id,
            quantity: 1,
            price: latte.price
          }
        ]
      }
    }
  });

  // Commande 2 - Produits nouveaux MosesCafe
  const order2 = await prisma.order.create({
    data: {
      customerId: customer2.id,
      status: 'PREPARING',
      totalPrice: 12000, // 1x Espresso Moulu + 1x Capsules
      notes: "Commande produits MosesCafe premium",
      orderItems: {
        create: [
          {
            productId: espressoMoulu.id,
            quantity: 1,
            price: espressoMoulu.price
          },
          {
            productId: capsulesRobusta.id,
            quantity: 1,
            price: capsulesRobusta.price
          }
        ]
      }
    }
  });

  // Commande 3 - Produit Grains
  const order3 = await prisma.order.create({
    data: {
      customerId: customer3.id,
      status: 'PENDING',
      totalPrice: 9500, // 1x Grains Robusta
      notes: "Livraison urgente pour machine espresso",
      orderItems: {
        create: [
          {
            productId: espressoGrains.id,
            quantity: 1,
            price: espressoGrains.price
          }
        ]
      }
    }
  });

  console.log('✅ Base de données initialisée avec succès!');
  console.log(`📦 9 produits créés (6 anciens + 3 nouveaux MosesCafe)`);
  console.log(`👥 3 clients créés`);
  console.log(`📋 3 commandes de test créées`);
  console.log('\n🎯 Nouveaux produits MosesCafe:');
  console.log('├── Espresso Moulu Robusta (500g) - 8 000 CFA');
  console.log('├── Capsules Robusta (10 pcs) - 3 500 CFA');
  console.log('└── Espresso en Grains Robusta (500g) - 9 500 CFA');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erreur lors de l\'initialisation:', e);
    await prisma.$disconnect();
    process.exit(1);
  });