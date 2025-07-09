"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, ShoppingCart, X, Coffee, Loader2 } from "lucide-react";
import { Product, CreateOrderRequest } from "@/types";

interface CartItem extends Product {
  quantity: number;
}

export default function CoffeeShopApp() {
  // États pour les produits
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour l'interface
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [orderLoading, setOrderLoading] = useState(false);

  // Charger les produits depuis l'API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des produits');
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions du panier (inchangées)
  const addToCart = (product: Product, qty: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: qty }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, quantity);
      setSelectedProduct(null);
      setQuantity(1);
    }
  };

  // Validation du téléphone côté frontend
  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/[\s\-\.]/g, '');
    const phoneRegex = /^(\+225|225)?[0-9]{8,10}$/;
    return phoneRegex.test(cleanPhone);
  };

  // Validation de l'email côté frontend
  const validateEmail = (email: string) => {
    if (!email) return true; // Email optionnel
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Envoyer la commande à l'API
  const handleOrder = async () => {
    if (cart.length === 0) {
      alert("🛒 Votre panier est vide !");
      return;
    }

    // Validation des champs obligatoires
    if (!form.name.trim()) {
      alert("❌ Veuillez saisir votre nom complet !");
      return;
    }

    if (form.name.trim().length < 2) {
      alert("❌ Le nom doit contenir au moins 2 caractères !");
      return;
    }

    if (!form.phone.trim()) {
      alert("❌ Veuillez saisir votre numéro de téléphone !");
      return;
    }

    // Validation du format du téléphone
    if (!validatePhone(form.phone)) {
      alert("❌ Format de téléphone invalide !\n\nFormats acceptés :\n• +225 07 12 34 56 78\n• 07 12 34 56 78\n• +225 05 98 76 54\n• 01 23 45 67 89");
      return;
    }

    // Validation de l'email (si fourni)
    if (form.email && !validateEmail(form.email)) {
      alert("❌ Format d'email invalide !\n\nExemple : votre@email.com");
      return;
    }

    try {
      setOrderLoading(true);

      const orderData: CreateOrderRequest = {
        customerName: form.name.trim(),
        customerEmail: form.email.trim() || undefined,
        customerPhone: form.phone.trim(),
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        notes: `Commande passée via le site web`
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la commande');
      }

      const order = await response.json();

      alert(`✅ Commande confirmée avec succès !\n\nNuméro de commande : #${order.id}\nTotal : ${formatPrice(order.totalPrice)}\n\nNous vous contacterons bientôt !`);

      // Réinitialiser
      setCart([]);
      setShowCart(false);
      setForm({ name: "", email: "", phone: "" });

    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      alert(`❌ Erreur lors de la commande : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setOrderLoading(false);
    }
  };

  // Affichage de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-lg text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">❌ Erreur</h2>
            <p>{error}</p>
            <Button onClick={fetchProducts} className="mt-4 bg-amber-600 hover:bg-amber-700">
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header avec panier */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Coffee className="w-8 h-8 text-amber-600" />
            <h1 className="text-2xl font-bold text-gray-800">Café Délice</h1>
          </div>
          <Button
            onClick={() => setShowCart(true)}
            variant="outline"
            className="relative"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Panier
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <h1 className="text-6xl font-bold mb-6 text-gray-800">
          CAFÉ DEXCEPTION
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Decouvrez notre sélection de cafés premium torréfiés artisanalement. 
          Chaque tasse raconte une histoire, chaque gorgée est un voyage.
        </p>
      </section>

      {/* Produits */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Notre Sélection
        </h2>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Coffee className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Aucun produit disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.filter(product => product.available).map((product) => (
              <div
                key={product.id}
                className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer border border-amber-100"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative overflow-hidden">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    width={600}
                    height={256}
                    className="w-full h-64 object-cover hover:scale-110 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{product.name}</h3>
                  {product.category && (
                    <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full mb-2">
                      {product.category}
                    </span>
                  )}
                  <p className="text-gray-600 mb-4 leading-relaxed">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-amber-600">
                      {formatPrice(product.price)}
                    </span>
                    <Button 
                      size="sm" 
                      className="bg-amber-600 hover:bg-amber-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                      }}
                    >
                      Commander
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Produit */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Commander : {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6">
              <Image 
                src={selectedProduct.image} 
                alt={selectedProduct.name}
                width={400}
                height={192}
                className="w-full h-48 object-cover rounded-lg"
              />
              
              <div className="text-center">
                <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatPrice(selectedProduct.price)}
                </p>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <Label className="font-medium">Quantité :</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg text-center">
                <p className="text-lg font-semibold text-gray-800">
                  Total: {formatPrice(selectedProduct.price * quantity)}
                </p>
              </div>

              <Button 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3" 
                onClick={handleAddToCart}
              >
                Ajouter au panier
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Panier */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-2xl bg-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center justify-between">
              Mon Panier ({getTotalItems()} article{getTotalItems() > 1 ? 's' : ''})
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCart(false)}
                className="p-1"
              >
                <X className="w-5 h-5" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500 text-lg">Votre panier est vide</p>
              </div>
            ) : (
              <>
                {/* Articles du panier */}
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <Image 
                        src={item.image} 
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                        <p className="text-amber-600 font-bold">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                      <span>Total:</span>
                      <span className="text-amber-600">{formatPrice(getTotalPrice())}</span>
                    </div>
                  </div>
                </div>

                {/* Formulaire de commande */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Informations de livraison</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        placeholder="Votre nom complet"
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        className={`bg-white ${form.name && form.name.length < 2 ? 'border-red-400' : ''}`}
                        maxLength={255}
                      />
                      {form.name && form.name.length < 2 && (
                        <p className="text-red-500 text-sm mt-1">Le nom doit contenir au moins 2 caractères</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input
                        id="phone"
                        placeholder="+225 XX XX XX XX XX ou 07 XX XX XX XX"
                        value={form.phone}
                        onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                        className={`bg-white ${form.phone && !validatePhone(form.phone) ? 'border-red-400' : ''}`}
                        maxLength={20}
                      />
                      {form.phone && !validatePhone(form.phone) && (
                        <p className="text-red-500 text-sm mt-1">
                          Format invalide. Ex: +225 07 12 34 56 78 ou 07 12 34 56 78
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email (optionnel)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={form.email}
                        onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                        className={`bg-white ${form.email && !validateEmail(form.email) ? 'border-red-400' : ''}`}
                        maxLength={255}
                      />
                      {form.email && !validateEmail(form.email) && (
                        <p className="text-red-500 text-sm mt-1">
                          Format email invalide. Ex: nom@domaine.com
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 text-lg font-semibold disabled:opacity-50" 
                  onClick={handleOrder}
                  disabled={
                    !form.name.trim() || 
                    form.name.length < 2 || 
                    !form.phone.trim() || 
                    !validatePhone(form.phone) ||
                    (form.email && !validateEmail(form.email)) ||
                    orderLoading
                  }
                >
                  {orderLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Commande en cours...
                    </>
                  ) : (
                    `Confirmer la commande - ${formatPrice(getTotalPrice())}`
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}