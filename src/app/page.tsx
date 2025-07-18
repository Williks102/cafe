"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, ShoppingCart, X, Coffee, Loader2 } from "lucide-react";
import { Product, CreateOrderRequest } from "@/types";
import AuthOrderModal from "@/components/AuthOrderModal";
import Header from "@/components/Header";
import { useOrderNotifications } from "@/hooks/useOrderNotifications";

interface CartItem extends Product {
  quantity: number;
}

export default function CoffeeShopApp() {
  useOrderNotifications()
  // États pour les produits et filtres
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour l'interface
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  
  // Charger les produits depuis l'API
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtrer les produits par catégorie
  useEffect(() => {
    if (selectedCategory === 'ALL') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory));
    }
  }, [products, selectedCategory]);

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

  // Obtenir les catégories disponibles
  const getAvailableCategories = (): string[] => {
    const categories = products
      .map(p => p.category)
      .filter((category): category is string => Boolean(category))
      .filter((category, index, array) => array.indexOf(category) === index);
    return categories;
  };

  // Fonctions du panier
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
      {/* Header */}
      <Header 
        cartItemsCount={getTotalItems()}
        onCartClick={() => setShowCart(true)}
        showCart={true}
      />

      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <h1 className="text-6xl font-bold mb-6 text-gray-800">
          CAFÉ D'EXCEPTION
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Découvrez notre sélection de cafés premium torréfiés artisanalement. 
          Chaque tasse raconte une histoire, chaque gorgée est un voyage.
        </p>
      </section>

      {/* Produits */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Notre Sélection
        </h2>

        {/* Filtres par catégorie */}
        {products.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-red-50 border border-gray-200'
              }`}
            >
              Tous ({products.filter(p => p.available).length})
            </button>
            {getAvailableCategories().map((category) => {
              const count = products.filter(p => p.category === category && p.available).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-red-50 border border-gray-200'
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>
        )}
        
        {filteredProducts.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Coffee className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {selectedCategory === 'ALL' 
                ? 'Aucun produit disponible pour le moment'
                : `Aucun produit disponible dans la catégorie "${selectedCategory}"`
              }
            </p>
            {selectedCategory !== 'ALL' && (
              <Button
                onClick={() => setSelectedCategory('ALL')}
                variant="outline"
                className="mt-4"
              >
                Voir tous les produits
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.filter(product => product.available).map((product) => (
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
                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                      {formatPrice(product.price)}
                    </span>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
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
                <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
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
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3" 
                onClick={handleAddToCart}
              >
                Ajouter au panier
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Panier avec Auth */}
      <AuthOrderModal
        cart={cart}
        showCart={showCart}
        setShowCart={setShowCart}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        getTotalPrice={getTotalPrice}
        getTotalItems={getTotalItems}
        formatPrice={formatPrice}
        setCart={setCart}
      />
    </div>
  );
}