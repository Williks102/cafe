"use client";
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Coffee, ShoppingBag, Clock, User } from 'lucide-react'
import Header from '@/components/Header'
import { useOrderNotifications } from '@/hooks/useOrderNotifications';

// Interfaces TypeScript qui correspondent exactement au schema Prisma
interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    description: string;
    image: string;
    price: number;
    category: string | null;  // ← string | null du schema
    available: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface Order {
  id: number;
  customerId: number | null;  // ← Ajout du champ manquant
  userId: string | null;      // ← Ajout du champ manquant
  status: string;
  totalPrice: number;
  notes: string | null;       // ← string | null du schema
  createdAt: Date;
  updatedAt: Date;           // ← Ajout du champ manquant
  orderItems: OrderItem[];
}

interface TotalSpentResult {
  _sum: {
    totalPrice: number | null;
  };
}

export default async function DashboardPage() {
  useOrderNotifications()
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Récupérer les commandes de l'utilisateur - Prisma infère automatiquement les types
  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5 // Les 5 dernières commandes
  })

  // Statistiques utilisateur avec types
  const totalOrders: number = await prisma.order.count({
    where: { userId: session.user.id }
  })

  const totalSpent: TotalSpentResult = await prisma.order.aggregate({
    where: { 
      userId: session.user.id,
      status: { not: 'CANCELLED' }
    },
    _sum: {
      totalPrice: true
    }
  })

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' CFA'
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'PREPARING': return 'bg-orange-100 text-orange-800'
      case 'READY': return 'bg-green-100 text-green-800'
      case 'DELIVERED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'En attente'
      case 'CONFIRMED': return 'Confirmée'
      case 'PREPARING': return 'En préparation'
      case 'READY': return 'Prête'
      case 'DELIVERED': return 'Livrée'
      case 'CANCELLED': return 'Annulée'
      default: return status
    }
  }

  return (
    <>
      <Header showCart={false} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Bonjour, {session.user?.name?.split(' ')[0]} ! 👋
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Voici un aperçu de votre activité chez Moses Café
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total commandes</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Montant dépensé</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                    {formatPrice(totalSpent._sum.totalPrice || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Membre depuis</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {new Date(session.user.createdAt || '').toLocaleDateString('fr-FR', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 sm:p-6 text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-2">Nouvelle commande</h3>
              <p className="mb-3 sm:mb-4 opacity-90 text-sm sm:text-base">Découvrez nos délicieux cafés et pâtisseries</p>
              <a
                href="/menu"
                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-white text-amber-600 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Voir le menu
              </a>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 sm:p-6 text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-2">Historique complet</h3>
              <p className="mb-3 sm:mb-4 opacity-90 text-sm sm:text-base">Consultez toutes vos commandes passées</p>
              <a
                href="/orders"
                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Voir tout
              </a>
            </div>
          </div>

          {/* Commandes récentes */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Commandes récentes</h2>
            </div>
            
            {orders.length === 0 ? (
              <div className="p-4 sm:p-6 text-center">
                <Coffee className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">Aucune commande pour le moment</p>
                <a
                  href="/menu"
                  className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors text-sm sm:text-base"
                >
                  Passer ma première commande
                </a>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                          <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm sm:text-base">Commande #{order.id}</p>
                          <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 shrink-0" />
                            <span className="truncate">
                              {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className={`inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <p className="text-lg sm:text-lg font-bold text-gray-900 mt-1">
                          {formatPrice(order.totalPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-xs sm:text-sm">
                          <span className="text-gray-600 truncate pr-2">
                            {item.quantity}x {item.product.name}
                          </span>
                          <span className="text-gray-900 font-medium shrink-0">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-600">
                          <span className="font-medium">Note: </span>
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}