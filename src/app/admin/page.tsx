"use client";

import { useState } from "react";
import { Coffee, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import des composants admin
import AdminStats from "@/components/admin/AdminStats";
import AdminTabs from "@/components/admin/AdminTabs";
import OrdersManagement from "@/components/admin/OrdersManagement";
import ProductsManagement from "@/components/admin/ProductsManagement";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  const handleRefresh = () => {
    // Trigger refresh for child components
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Coffee className="w-8 h-8 text-amber-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Console Admin</h1>
                <p className="text-gray-600">Café Délice - Gestion complète</p>
              </div>
            </div>
            <Button onClick={handleRefresh} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
          </div>
        </div>
      </header>

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