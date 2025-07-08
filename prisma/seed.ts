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
  
  // Créer les produits un par un pour récupérer les IDs
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

  // Commande 1 - Kouamé Jean-Baptiste
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

  // Commande 2 - Aya Marie-Claire
  const order2 = await prisma.order.create({
    data: {
      customerId: customer2.id,
      status: 'PREPARING',
      totalPrice: 5800, // 1x Cold Brew + 1x Mocha
      notes: "À emporter s'il vous plaît",
      orderItems: {
        create: [
          {
            productId: coldBrew.id,
            quantity: 1,
            price: coldBrew.price
          },
          {
            productId: mocha.id,
            quantity: 1,
            price: mocha.price
          }
        ]
      }
    }
  });

  // Commande 3 - Koffi Pierre
  const order3 = await prisma.order.create({
    data: {
      customerId: customer3.id,
      status: 'PENDING',
      totalPrice: 4100, // 1x Cappuccino + 1x Americano
      orderItems: {
        create: [
          {
            productId: cappuccino.id,
            quantity: 1,
            price: cappuccino.price
          },
          {
            productId: americano.id,
            quantity: 1,
            price: americano.price
          }
        ]
      }
    }
  });

  console.log('✅ Base de données initialisée avec succès!');
  console.log(`📦 6 produits créés`);
  console.log(`👥 3 clients créés`);
  console.log(`📋 3 commandes de test créées`);
  console.log('\n🎯 Données créées:');
  console.log('├── Produits: Espresso, Latte, Cold Brew, Cappuccino, Americano, Mocha');
  console.log('├── Clients: Kouamé Jean-Baptiste, Aya Marie-Claire, Koffi Pierre');
  console.log('└── Commandes: CONFIRMED, PREPARING, PENDING');
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