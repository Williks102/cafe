"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Clock, DollarSign, Users } from "lucide-react";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats>({ 
    totalOrders: 0, 
    pendingOrders: 0, 
    totalRevenue: 0, 
    totalCustomers: 0 
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        const orders = data.orders || [];
        
        const calculatedStats = {
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: any) => o.status === 'PENDING').length,
          totalRevenue: orders
            .filter((o: any) => o.status === 'DELIVERED')
            .reduce((sum: number, o: any) => sum + o.totalPrice, 0),
          totalCustomers: new Set(orders.map((o: any) => o.customerId)).size
        };
        
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Total Commandes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-yellow-600" />
          <div>
            <p className="text-sm text-gray-600">En Attente</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Revenus</p>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-purple-600" />
          <div>
            <p className="text-sm text-gray-600">Clients</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
          </div>
        </div>
      </div>
    </div>
  );
}