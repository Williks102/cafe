// app/suivi/page.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Clock, Package, CheckCircle, Phone, Mail, Coffee } from 'lucide-react';
import Header from '@/components/Header';

interface Order {
  id: number;
  status: string;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  customer: {
    name: string;
    email?: string;
    phone: string;
  };
  orderItems: Array<{
    id: number;
    quantity: number;
    price: number;
    product: {
      name: string;
      category?: string;
      image: string;
    };
  }>;
}

export default function OrderTrackingPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PREPARING': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'READY': return 'bg-green-100 text-green-800 border-green-200';
      case 'DELIVERED': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-5 h-5" />;
      case 'CONFIRMED': return <CheckCircle className="w-5 h-5" />;
      case 'PREPARING': return <Coffee className="w-5 h-5" />;
      case 'READY': return <Package className="w-5 h-5" />;
      case 'DELIVERED': return <CheckCircle className="w-5 h-5" />;
      case 'CANCELLED': return <Package className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const handleSearch = async () => {
    if (!phone.trim()) {
      alert('Veuillez entrer votre numéro de téléphone');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setSearched(true);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la recherche de vos commandes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header showCart={false} />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Suivre ma Commande
            </h1>
            <p className="text-xl text-gray-600">
              Entrez votre numéro de téléphone pour voir l'état de vos commandes
            </p>
          </div>

          {/* Formulaire de recherche */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="space-y-6">
              <div>
                <Label htmlFor="phone" className="text-lg font-semibold">
                  Numéro de téléphone
                </Label>
                <div className="flex gap-4 mt-2">
                  <Input
                    id="phone"
                    placeholder="+225 XX XX XX XX XX ou 07 XX XX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 bg-white text-lg py-3"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Rechercher
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Utilisez le même numéro que lors de votre commande
                </p>
              </div>
            </div>
          </div>

          {/* Résultats */}
          {searched && (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Aucune commande trouvée
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Nous n'avons trouvé aucune commande avec ce numéro de téléphone.
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Vérifiez que vous avez saisi le bon numéro</p>
                    <p>Ou contactez-nous au +225 XX XX XX XX XX</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {orders.length} commande{orders.length > 1 ? 's' : ''} trouvée{orders.length > 1 ? 's' : ''}
                    </h2>
                  </div>

                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                      {/* Header de la commande */}
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-2xl font-bold mb-2">
                              Commande #{order.id}
                            </h3>
                            <p className="text-amber-100">
                              Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getStatusColor(order.status)} bg-white`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-2 font-semibold">
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contenu de la commande */}
                      <div className="p-6">
                        {/* Informations client */}
                        <div className="mb-6 pb-6 border-b border-gray-200">
                          <h4 className="font-semibold text-gray-800 mb-3">Informations de livraison</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{order.customer.phone}</span>
                            </div>
                            {order.customer.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span>{order.customer.email}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Articles */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-800 mb-3">Articles commandés</h4>
                          <div className="space-y-3">
                            {order.orderItems.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <img 
                                  src={item.product.image} 
                                  alt={item.product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-800">{item.product.name}</h5>
                                  {item.product.category && (
                                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                      {item.product.category}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">Qté: {item.quantity}</p>
                                  <p className="text-amber-600 font-bold">
                                    {formatPrice(item.price * item.quantity)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total */}
                        <div className="bg-amber-50 p-4 rounded-lg mb-6">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-800">Total de la commande</span>
                            <span className="text-2xl font-bold text-amber-600">
                              {formatPrice(order.totalPrice)}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {order.notes && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h5 className="font-semibold text-gray-800 mb-2">Notes</h5>
                            <p className="text-gray-600 text-sm">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Contact */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Besoin d'aide ?
              </h3>
              <p className="text-gray-600 mb-4">
                Notre équipe est disponible pour vous accompagner
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="tel:+225XXXXXXXX"
                  className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Nous appeler
                </a>
                <a
                  href="mailto:contact@mosescafe.com"
                  className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Nous écrire
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}