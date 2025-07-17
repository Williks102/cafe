"use client";

import { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

// Import des composants admin
import AdminStats from "@/components/admin/AdminStats";
import AdminTabs from "@/components/admin/AdminTabs";
import OrdersManagement from "@/components/admin/OrdersManagement";
import ProductsManagement from "@/components/admin/ProductsManagement";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  // Protection d'accès admin
  useEffect(() => {
    if (status === 'loading') return; // Encore en cours de chargement

    if (!session) {
      // Pas connecté → Redirection vers signin
      router.push('/auth/signin');
      return;
    }

    if (session.user.role !== 'ADMIN') {
      // Connecté mais pas admin → Redirection vers accueil
      router.push('/');
      return;
    }
  }, [session, status, router]);

  const handleRefresh = () => {
    // Trigger refresh for child components
    window.location.reload();
  };

  // Écran de chargement pendant la vérification
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-lg text-gray-600">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  // Écran d'accès refusé (au cas où)
  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Accès refusé</h2>
          <p className="text-gray-600 mb-6">Vous devez être administrateur pour accéder à cette page.</p>
          <Button 
            onClick={() => router.push('/')}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  // Interface admin (seulement si authentifié et admin)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec dropdown d'authentification */}
      <Header showCart={false} />

      {/* Section admin (remplace l'ancien header) */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Console Admin</h1>
              <p className="text-gray-600">Moses Café - Gestion complète</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  👋 {session.user.name}
                </span>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  🔐 Administrateur
                </span>
              </div>
            </div>
            <Button onClick={handleRefresh} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu admin */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistiques globales */}
        <AdminStats />

        {/* Navigation par onglets */}
        <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'orders' && <OrdersManagement />}
        {activeTab === 'products' && <ProductsManagement />}
      </div>
    </div>
  );
}