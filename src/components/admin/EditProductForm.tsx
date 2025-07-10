"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Edit, 
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Coffee,
  Upload,
  Image as ImageIcon,
  Link,
  FileImage
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  available: boolean;
  stock?: number;
}

interface EditProductFormProps {
  product: Product;
  onProductUpdated: () => void;
}

export default function EditProductForm({ product, onProductUpdated }: EditProductFormProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);
  const [imageMode, setImageMode] = useState<'current' | 'url' | 'upload' | 'suggested'>('current');
  
  const [form, setForm] = useState({
    name: product.name,
    description: product.description,
    image: product.image,
    price: product.price,
    category: product.category,
    available: product.available,
    stock: product.stock || 0
  });

  // Catégories prédéfinies
  const categories = [
    "Espresso",
    "Latte", 
    "Cold Brew",
    "Cappuccino",
    "Americano",
    "Mocha",
    "Espresso Moulu",
    "Capsules",
    "Grains Robusta"
  ];

  // Images suggérées
  const suggestedImages = [
    {
      url: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600",
      description: "Espresso classique"
    },
    {
      url: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=600", 
      description: "Latte avec mousse"
    },
    {
      url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600",
      description: "Cold brew glacé"
    },
    {
      url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600",
      description: "Cappuccino mousse"
    },
    {
      url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600",
      description: "Café noir/grains"
    },
    {
      url: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600",
      description: "Capsules de café"
    },
    {
      url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600",
      description: "Grains de café"
    },
    {
      url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
      description: "Mocha chocolat"
    }
  ];

  // Reset form when product changes
  useEffect(() => {
    setForm({
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price,
      category: product.category,
      available: product.available,
      stock: product.stock || 0
    });
    setImageMode('current');
  }, [product]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!form.name.trim()) {
      newErrors.name = "Le nom du produit est requis";
    } else if (form.name.length < 3) {
      newErrors.name = "Le nom doit contenir au moins 3 caractères";
    }

    if (!form.description.trim()) {
      newErrors.description = "La description est requise";
    } else if (form.description.length < 10) {
      newErrors.description = "La description doit contenir au moins 10 caractères";
    }

    if (!form.image.trim()) {
      newErrors.image = "Une image est requise";
    }

    if (!form.price || form.price <= 0) {
      newErrors.price = "Le prix doit être supérieur à 0";
    } else if (form.price > 1000000) {
      newErrors.price = "Le prix semble trop élevé";
    }

    if (!form.category.trim()) {
      newErrors.category = "La catégorie est requise";
    }

    if (form.stock < 0) {
      newErrors.stock = "Le stock ne peut pas être négatif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors({ image: 'Format non supporté. Utilisez JPG, PNG ou WebP.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setErrors({ image: 'Le fichier est trop volumineux (max 5MB).' });
      return;
    }

    setUploadLoading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const data = await response.json();
      setForm(prev => ({ ...prev, image: data.url }));
      
    } catch (error) {
      setErrors({ 
        image: error instanceof Error ? error.message : 'Erreur lors de l\'upload' 
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du produit');
      }

      // Succès
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowModal(false);
        onProductUpdated();
      }, 2000);

    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Erreur inconnue' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setForm(prev => ({ ...prev, image: imageUrl }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowModal(true)}
        className="flex-1"
      >
        <Edit className="w-4 h-4 mr-1" />
        Modifier
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-5xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Edit className="w-6 h-6 text-blue-600" />
              Modifier le Produit
            </DialogTitle>
          </DialogHeader>

          {success ? (
            <div className="py-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-700 mb-2">Produit mis à jour !</h3>
              <p className="text-gray-600">Les modifications ont été sauvegardées.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Erreur générale */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700">{errors.general}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colonne gauche - Informations de base */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Informations de Base
                  </h3>

                  {/* Nom du produit */}
                  <div>
                    <Label htmlFor="name">Nom du produit *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Espresso Moulu Robusta"
                      className={`bg-white ${errors.name ? 'border-red-400' : ''}`}
                      maxLength={255}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Catégorie */}
                  <div>
                    <Label htmlFor="category">Catégorie *</Label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                      className={`w-full h-10 px-3 rounded-md border border-input bg-white ${errors.category ? 'border-red-400' : ''}`}
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                    )}
                  </div>

                  {/* Prix et Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Prix (CFA) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={form.price || ''}
                        onChange={(e) => setForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                        placeholder="Ex: 8000"
                        className={`bg-white ${errors.price ? 'border-red-400' : ''}`}
                        min="0"
                        max="1000000"
                      />
                      {form.price > 0 && (
                        <p className="text-gray-600 text-sm mt-1">
                          {formatPrice(form.price)}
                        </p>
                      )}
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="stock">Stock disponible</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={form.stock || ''}
                        onChange={(e) => setForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                        placeholder="Ex: 50"
                        className={`bg-white ${errors.stock ? 'border-red-400' : ''}`}
                        min="0"
                        max="10000"
                      />
                      {errors.stock && (
                        <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez votre produit en détail..."
                      className={`w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-white resize-vertical ${errors.description ? 'border-red-400' : ''}`}
                      maxLength={1000}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.description ? (
                        <p className="text-red-500 text-sm">{errors.description}</p>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          {form.description.length}/1000 caractères
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Disponibilité */}
                  <div className="flex items-center gap-3">
                    <input
                      id="available"
                      type="checkbox"
                      checked={form.available}
                      onChange={(e) => setForm(prev => ({ ...prev, available: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="available" className="text-sm">
                      Produit disponible à la vente
                    </Label>
                  </div>
                </div>

                {/* Colonne droite - Image */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Image du Produit
                  </h3>

                  {/* Sélection du mode d'image */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-3 block">
                      Choisir une méthode :
                    </Label>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <Button
                        type="button"
                        size="sm"
                        variant={imageMode === 'current' ? 'default' : 'outline'}
                        onClick={() => setImageMode('current')}
                        className="gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Actuelle
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={imageMode === 'suggested' ? 'default' : 'outline'}
                        onClick={() => setImageMode('suggested')}
                        className="gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Suggérées
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={imageMode === 'upload' ? 'default' : 'outline'}
                        onClick={() => setImageMode('upload')}
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={imageMode === 'url' ? 'default' : 'outline'}
                        onClick={() => setImageMode('url')}
                        className="gap-2"
                      >
                        <Link className="w-4 h-4" />
                        URL
                      </Button>
                    </div>
                  </div>

                  {/* Mode Image actuelle */}
                  {imageMode === 'current' && (
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">
                        Image actuelle :
                      </Label>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">Image</text></svg>';
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Cliquez sur un autre mode pour changer l'image
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mode Upload */}
                  {imageMode === 'upload' && (
                    <div>
                      <Label htmlFor="imageUpload">Télécharger une nouvelle image *</Label>
                      <div className="mt-2">
                        <input
                          id="imageUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploadLoading}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          onClick={() => document.getElementById('imageUpload')?.click()}
                          variant="outline"
                          disabled={uploadLoading}
                          className="w-full h-32 border-dashed border-2 hover:border-blue-400 flex flex-col gap-2"
                        >
                          {uploadLoading ? (
                            <>
                              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              <span>Upload en cours...</span>
                            </>
                          ) : (
                            <>
                              <FileImage className="w-8 h-8 text-gray-400" />
                              <span>Cliquer pour sélectionner</span>
                              <span className="text-xs text-gray-500">JPG, PNG, WebP (max 5MB)</span>
                            </>
                          )}
                        </Button>
                      </div>
                      {errors.image && (
                        <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                      )}
                    </div>
                  )}

                  {/* Mode URL */}
                  {imageMode === 'url' && (
                    <div>
                      <Label htmlFor="image">URL de l'image *</Label>
                      <Input
                        id="image"
                        value={form.image}
                        onChange={(e) => setForm(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                        className={`bg-white ${errors.image ? 'border-red-400' : ''}`}
                      />
                      {errors.image && (
                        <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                      )}
                    </div>
                  )}

                  {/* Mode Images suggérées */}
                  {imageMode === 'suggested' && (
                    <div>
                      <Label className="text-sm text-gray-600 mb-3 block">
                        Sélectionner une nouvelle image :
                      </Label>
                      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                        {suggestedImages.map((img, index) => (
                          <div
                            key={index}
                            onClick={() => handleImageSelect(img.url)}
                            className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                              form.image === img.url 
                                ? 'border-blue-500 ring-2 ring-blue-200' 
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <img
                              src={img.url}
                              alt={img.description}
                              className="w-full h-20 object-cover"
                            />
                            <p className="text-xs text-gray-600 p-2 text-center">
                              {img.description}
                            </p>
                          </div>
                        ))}
                      </div>
                      {errors.image && (
                        <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                      )}
                    </div>
                  )}

                  {/* Aperçu de la nouvelle image (sauf mode current) */}
                  {imageMode !== 'current' && form.image && form.image !== product.image && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <Label className="text-sm text-gray-600 mb-2 block">Aperçu de la nouvelle image :</Label>
                      <img
                        src={form.image}
                        alt="Aperçu"
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">Erreur</text></svg>';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading || uploadLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Sauvegarder
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}