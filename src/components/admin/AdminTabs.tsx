"use client";

import { ShoppingBag, Package } from "lucide-react";

interface AdminTabsProps {
  activeTab: 'orders' | 'products';
  setActiveTab: (tab: 'orders' | 'products') => void;
}

export default function AdminTabs({ activeTab, setActiveTab }: AdminTabsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border mb-6">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-4 font-medium text-sm transition-colors ${
            activeTab === 'orders'
              ? 'border-b-2 border-amber-500 text-amber-600 bg-amber-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Gestion des Commandes
          </div>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-4 font-medium text-sm transition-colors ${
            activeTab === 'products'
              ? 'border-b-2 border-amber-500 text-amber-600 bg-amber-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Gestion des Produits
          </div>
        </button>
      </div>
    </div>
  );
}