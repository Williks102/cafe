"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Package, Edit } from "lucide-react";

import AddProductForm from "@/components/admin/AddProductForm";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import EditProductForm from "@/components/admin/EditProductForm";
import { Product } from "@/types";



export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pour l'admin, on veut TOUS les produits (disponibles et indisponibles)
      const response = await fetch('/api/products?admin=true');
      console.log('Response status:', response.status); // Debug
      
      if (response.ok) {
        const data = await response.json();
        console.log('Products API response:', data); // Debug
        
        // Gérer différents formats de réponse API
        let productsArray = [];
        if (Array.isArray(data)) {
          productsArray = data;
        } else if (data.products && Array.isArray(data.products)) {
          productsArray = data.products;
        } else if (data.data && Array.isArray(data.data)) {
          productsArray = data.data;
        }
        
        console.log('Products array:', productsArray); // Debug
        setProducts(productsArray);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch products:', response.status, errorText);
        setError(`Erreur ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setError(`Erreur réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
  };

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const matchesCategory = productCategoryFilter === 'ALL' || product.category === productCategoryFilter;
    const matchesSearch = productSearchTerm === '' || 
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(productSearchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Obtenir les catégories uniques
  const productCategories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];

  return (
    <>
      {/* Filtres et recherche pour produits */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="productSearch">Rechercher un produit</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                id="productSearch"
                placeholder="Nom, description, catégorie..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <Label htmlFor="productCategory">Catégorie</Label>
            <select
              id="productCategory"
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="ALL">Toutes les catégories</option>
              {productCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <AddProductForm onProductAdded={fetchProducts} />
        </div>
      </div>

      {/* Liste des produits */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            Produits ({filteredProducts.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des produits...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-red-300" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchProducts} variant="outline">
              Réessayer
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">
              {products.length === 0 
                ? "Aucun produit dans la base de données" 
                : "Aucun produit trouvé avec ces filtres"
              }
            </p>
            {products.length === 0 && (
              <p className="text-sm text-gray-400 mt-2">
                Utilisez le bouton "Ajouter un Produit" pour créer votre premier produit
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">Image</text></svg>';
                    }}
                  />
                  {!product.available && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">Indisponible</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.available ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                      {product.category || 'Sans catégorie'}
                    </span>
                    <span className="font-bold text-amber-600">{formatPrice(product.price)}</span>
                  </div>

                  {/* Stock si disponible */}
                 
                  
                  <div className="flex gap-2">
                    <EditProductForm 
                      product={product}
                      onProductUpdated={fetchProducts}
                    />
                    <DeleteProductButton 
                      product={product} 
                      onProductDeleted={fetchProducts}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}