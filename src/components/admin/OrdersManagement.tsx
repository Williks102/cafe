"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ShoppingBag, 
  Users, 
  Eye,
  RefreshCw,
  Search,
  Phone,
  Mail,
  Calendar,
  Package,
  User
} from "lucide-react";

interface Order {
  id: number;
  customerId?: number;
  userId?: string;
  status: string;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: number;
    name: string;
    email?: string;
    phone: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  orderItems: Array<{
    id: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
      category?: string;
      image: string;
    };
  }>;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-orange-100 text-orange-800',
  READY: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800'
};

const statusLabels = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  PREPARING: 'En préparation',
  READY: 'Prête',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée'
};

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdating(orderId);
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchOrders();
        
        if (selectedOrder && selectedOrder.id === orderId) {
          const updatedOrder = await response.json();
          setSelectedOrder(updatedOrder);
        }
      } else {
        alert('Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setUpdating(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction utilitaire pour obtenir les infos client/utilisateur
  const getClientInfo = (order: Order) => {
    if (order.customer) {
      return {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        type: 'guest'
      };
    } else if (order.user) {
      return {
        name: order.user.name,
        email: order.user.email,
        phone: 'Non renseigné',
        type: 'user'
      };
    }
    return {
      name: 'Client inconnu',
      email: '',
      phone: 'Non renseigné',
      type: 'unknown'
    };
  };

  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const clientInfo = getClientInfo(order);
    const matchesSearch = searchTerm === '' || 
      clientInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientInfo.phone.includes(searchTerm) ||
      order.id.toString().includes(searchTerm);
    
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      {/* Filtres et recherche pour commandes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Rechercher</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                id="search"
                placeholder="Nom client, téléphone, ou numéro de commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <Label htmlFor="status">Filtrer par statut</Label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="CONFIRMED">Confirmée</option>
              <option value="PREPARING">En préparation</option>
              <option value="READY">Prête</option>
              <option value="DELIVERED">Livrée</option>
              <option value="CANCELLED">Annulée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            Commandes ({filteredOrders.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Chargement des commandes...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Aucune commande trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Commande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Articles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const clientInfo = getClientInfo(order);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">#{order.id}</div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{clientInfo.name}</span>
                            {clientInfo.type === 'user' && (
                              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                <User className="w-3 h-3 mr-1" />
                                Membre
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {clientInfo.phone}
                          </div>
                          {clientInfo.email && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {clientInfo.email}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {order.orderItems.length} article{order.orderItems.length > 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.orderItems.slice(0, 2).map(item => item.product.name).join(', ')}
                          {order.orderItems.length > 2 && '...'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {formatPrice(order.totalPrice)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status as keyof typeof statusColors]}`}>
                          {statusLabels[order.status as keyof typeof statusLabels]}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              disabled={updating === order.id}
                              className="text-xs border rounded px-2 py-1"
                            >
                              <option value="PENDING">En attente</option>
                              <option value="CONFIRMED">Confirmée</option>
                              <option value="PREPARING">En préparation</option>
                              <option value="READY">Prête</option>
                              <option value="DELIVERED">Livrée</option>
                              <option value="CANCELLED">Annulée</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal détails commande */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl bg-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Détails de la commande #{selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Informations client */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Informations client
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nom</Label>
                    <p className="font-medium">{getClientInfo(selectedOrder).name}</p>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <p className="font-medium">
                      {getClientInfo(selectedOrder).type === 'user' ? 'Membre connecté' : 'Client invité'}
                    </p>
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <p className="font-medium">{getClientInfo(selectedOrder).phone}</p>
                  </div>
                  {getClientInfo(selectedOrder).email && (
                    <div>
                      <Label>Email</Label>
                      <p className="font-medium">{getClientInfo(selectedOrder).email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Articles commandés */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Articles commandés
                </h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        {item.product.category && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                            {item.product.category}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Qté: {item.quantity}</p>
                        <p className="text-sm text-gray-600">{formatPrice(item.price)} / unité</p>
                        <p className="font-bold text-amber-600">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Résumé */}
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total de la commande:</span>
                  <span className="text-amber-600">{formatPrice(selectedOrder.totalPrice)}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <Label>Notes de la commande</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Statut et dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Statut actuel</Label>
                  <p className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-1 ${statusColors[selectedOrder.status as keyof typeof statusColors]}`}>
                    {statusLabels[selectedOrder.status as keyof typeof statusLabels]}
                  </p>
                </div>
                <div>
                  <Label>Date de commande</Label>
                  <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              {/* Actions rapides */}
              {selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'CANCELLED' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'CONFIRMED')}
                    disabled={selectedOrder.status === 'CONFIRMED' || updating === selectedOrder.id}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Confirmer
                  </Button>
                  <Button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'PREPARING')}
                    disabled={selectedOrder.status === 'PREPARING' || updating === selectedOrder.id}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    En préparation
                  </Button>
                  <Button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'READY')}
                    disabled={selectedOrder.status === 'READY' || updating === selectedOrder.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Prête
                  </Button>
                  <Button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'DELIVERED')}
                    disabled={updating === selectedOrder.id}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Livrée
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}