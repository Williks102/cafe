// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Coffee, ShoppingBag, Clock, User } from 'lucide-react';
import Header from '@/components/Header';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';

// Interfaces TypeScript 
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
    category: string | null;
    available: boolean;
    createdAt: string; // ← Changé en string pour l'API
    updatedAt: string; // ← Changé en string pour l'API
  };
}

interface Order {
  id: number;
  customerId: number | null;
  userId: string | null;
  status: string;
  totalPrice: number;
  notes: string | null;
  createdAt: string; // ← Changé en string pour l'API
  updatedAt: string; // ← Changé en string pour l'API
  orderItems: OrderItem[];
}

interface DashboardData {
  orders: Order[];
  totalOrders: number;
  totalSpent: number;
}

export default function DashboardPage() {
  useOrderNotifications();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders/me');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données');
      }

      const data = await response.json();
      setDashboardData({
        orders: data.orders.slice(0, 5), // Les 5 dernières commandes
        totalOrders: data.stats.totalOrders,
        totalSpent: data.stats.totalSpent
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PREPARING': return 'bg-orange-100 text-orange-800';
      case 'READY': return 'bg-green-100 text-green-800';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'CONFIRMED': return 'Confirmée';
      case 'PREPARING': return 'En préparation';
      case 'READY': return 'Prête';
      case 'DELIVERED': return 'Livrée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  };

  // Écran de chargement
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      </div>
    );
  }

  // Écran d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session || !dashboardData) {
    return null; // Évite le flash de contenu non autorisé
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* En-tête de bienvenue */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Bonjour {session.user?.name?.split(' ')[0]} ! 👋
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Bienvenue sur votre tableau de bord Moses Café
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total des commandes */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total commandes</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {dashboardData.totalOrders}
                </p>
              </div>
            </div>
          </div>

          {/* Montant total dépensé */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Montant dépensé</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  {formatPrice(dashboardData.totalSpent)}
                </p>
              </div>
            </div>
          </div>

          {/* Membre depuis */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Membre depuis</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {session.user.createdAt 
                    ? new Date(session.user.createdAt).toLocaleDateString('fr-FR', { 
                        month: 'short', 
                        year: 'numeric' 
                      })
                    : 'Non disponible'
                  }
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
              href="/"
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
          
          {dashboardData.orders.length === 0 ? (
            <div className="p-4 sm:p-6 text-center">
              <Coffee className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">Aucune commande pour le moment</p>
              <a
                href="/"
                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors text-sm sm:text-base"
              >
                Passer ma première commande
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {dashboardData.orders.map((order) => (
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
                  
                  {/* Articles de la commande */}
                  <div className="ml-8 sm:ml-14 space-y-1">
                    {order.orderItems.map((item) => (
                      <p key={item.id} className="text-xs sm:text-sm text-gray-600">
                        {item.quantity}x {item.product.name}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}