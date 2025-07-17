// app/dashboard/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Coffee, ShoppingBag, Clock, User } from 'lucide-react'
import Header from '@/components/Header'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Récupérer les commandes de l'utilisateur
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

  // Statistiques utilisateur
  const totalOrders = await prisma.order.count({
    where: { userId: session.user.id }
  })

  const totalSpent = await prisma.order.aggregate({
    where: { 
      userId: session.user.id,
      status: { not: 'CANCELLED' }
    },
    _sum: {
      totalPrice: true
    }
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' CFA'
  }

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour, {session.user?.name?.split(' ')[0]} ! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Voici un aperçu de votre activité chez Moses Café
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total commandes</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Coffee className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Montant dépensé</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(totalSpent._sum.totalPrice || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Membre depuis</p>
                  <p className="text-2xl font-bold text-gray-900">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Nouvelle commande</h3>
              <p className="mb-4 opacity-90">Découvrez nos délicieux cafés et pâtisseries</p>
              <a
                href="/menu"
                className="inline-flex items-center px-4 py-2 bg-white text-amber-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Voir le menu
              </a>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Historique complet</h3>
              <p className="mb-4 opacity-90">Consultez toutes vos commandes passées</p>
              <a
                href="/orders"
                className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Voir tout
              </a>
            </div>
          </div>

          {/* Commandes récentes */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Commandes récentes</h2>
            </div>
            
            {orders.length === 0 ? (
              <div className="p-6 text-center">
                <Coffee className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Aucune commande pour le moment</p>
                <a
                  href="/menu"
                  className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                >
                  Passer ma première commande
                </a>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <div key={order.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Commande #{order.id}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {formatPrice(order.totalPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x {item.product.name}
                          </span>
                          <span className="text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
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