"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Coffee, 
  Star, 
  MapPin, 
  Leaf, 
  Award, 
  Package, 
  Clock,
  Heart,
  ShoppingCart,
  Plus,
  Minus,
  Zap,
  Globe,
  Recycle
} from "lucide-react";

export default function CapsulesRobustaLanding() {
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  const pricePerBox = 4000; // 3500 CFA par boîte de 10 capsules

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
  };

  const handleOrder = () => {
    const total = pricePerBox * quantity;
    
    alert(`✅ Commande enregistrée !\n\n${quantity}x Boîte${quantity > 1 ? 's' : ''} Capsules Robusta (${quantity * 10} capsules)\nTotal: ${formatPrice(total)}\n\nNous vous contacterons au ${form.phone} pour confirmer votre commande.\n\n🔍 Suivez votre commande sur mosescafe.ci/suivi`);
    
    setShowModal(false);
    setForm({ name: "", email: "", phone: "", address: "" });
    setQuantity(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-amber-900 via-orange-800 to-red-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Texte */}
            <div className="space-y-6 sm:space-y-8 animate-fade-in text-center lg:text-left">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-amber-300 justify-center lg:justify-start">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">Côte d&apos;Ivoire</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  Capsules
                  <span className="block text-amber-300">Robusta</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  L&apos;intensité et le caractère du Robusta ivoirien dans la simplicité d&apos;une capsule. 
                  Compatible Nespresso®* pour un espresso d&apos;exception.
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start">
                <div className="bg-amber-600/80 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2 rounded-full flex items-center gap-2">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Intensité 10/10</span>
                </div>
                <div className="bg-green-600/80 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2 rounded-full flex items-center gap-2">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Compatible Nespresso®</span>
                </div>
                <div className="bg-orange-600/80 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2 rounded-full flex items-center gap-2">
                  <Recycle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Emballage Recyclable</span>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-3 sm:space-y-4">
                <Button 
                  onClick={() => setShowModal(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 h-auto rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Commander Maintenant
                </Button>
                <p className="text-amber-200 text-xs sm:text-sm text-center lg:text-left">
                  🚚 Livraison Côte d&apos;Ivoire & International • ⚡ Stock limité
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="relative order-first lg:order-last">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-red-400/20 rounded-2xl sm:rounded-3xl rotate-3 sm:rotate-6"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                <Image
                  src="https://res.cloudinary.com/db4hmbdv3/image/upload/v1752787219/moses-cafe/products/moses-cafe-1752787214165-ddyuw43vwz9.webp"
                  alt="Capsules Robusta MosesCafe"
                  width={500}
                  height={400}
                  className="w-full h-48 sm:h-60 lg:h-80 object-cover rounded-xl sm:rounded-2xl shadow-xl"
                />
                <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-red-500 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-full font-bold shadow-lg">
                  <span className="text-sm sm:text-lg">⭐ 4.9/5</span>
                </div>
                <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 bg-amber-500 text-black px-3 py-2 sm:px-6 sm:py-3 rounded-full font-bold shadow-lg">
                  <span className="text-sm sm:text-lg">10 capsules</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Caractéristiques Produit */}
      <section className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Caractéristiques Produit</h2>
            <p className="text-lg sm:text-xl text-gray-600">Découvrez l&apos;excellence du Robusta en capsule</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { label: "Intensité", value: "10/10", icon: "🔥", color: "bg-red-500", desc: "Puissance maximale" },
              { label: "Corps", value: "Riche & Épais", icon: "💪", color: "bg-amber-500", desc: "Texture veloutée" },
              { label: "Goût", value: "Boisé & Cacao", icon: "🌰", color: "bg-amber-600", desc: "Notes complexes" },
              { label: "Torréfaction", value: "Foncée", icon: "☕", color: "bg-orange-600", desc: "Artisanale" }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="text-2xl sm:text-4xl">{item.icon}</div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">{item.label}</h3>
                  <div className={`${item.color} text-white px-2 py-1 sm:px-3 sm:py-2 rounded-full font-bold text-xs sm:text-sm`}>
                    {item.value}
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compatibilité & Simplicité */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-r from-amber-100 to-orange-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">Compatible Nespresso®*</h2>
                <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-gray-700 leading-relaxed">
                  <p>
                    ☕ <strong>Simplicité d&apos;utilisation</strong> : 
                    Insérez la capsule dans votre machine Nespresso® et savourez un espresso d&apos;exception en quelques secondes.
                  </p>
                  <p>
                    🎯 <strong>Dosage parfait</strong> : 
                    Chaque capsule contient la quantité idéale de café moulu pour un espresso équilibré et puissant.
                  </p>
                  <p>
                    ✨ <strong>Créma épaisse garantie</strong> : 
                    Notre torréfaction foncée assure une belle créma dorée qui révèle tous les arômes.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">📦</div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                    Boîte de 10 capsules
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600 mb-2">
                    {formatPrice(pricePerBox)}
                  </p>
                  <p className="text-gray-600 text-sm sm:text-base">Soit {formatPrice(pricePerBox / 10)} par capsule</p>
                </div>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <Image
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600"
                alt="Machine à café avec capsules"
                width={600}
                height={400}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-xl sm:rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl sm:rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
                <p className="text-lg sm:text-xl font-bold">Compatibilité universelle</p>
                <p className="text-amber-200 text-sm sm:text-base">Toutes machines Nespresso®*</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Origine & Engagement */}
      <section className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Origine & Engagement</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Origine */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Origine Côte d&apos;Ivoire</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Cultivé dans les terres chaudes et fertiles ivoiriennes, 
                  notre Robusta développe un caractère unique et une puissance aromatique exceptionnelle.
                </p>
              </div>
            </div>

            {/* Qualité */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">100% Naturel</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Sans additifs ni conservateurs, nos capsules préservent la pureté 
                  et l&apos;authenticité du goût original du Robusta ivoirien.
                </p>
              </div>
            </div>

            {/* Commerce */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg md:col-span-2 lg:col-span-1">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Commerce Responsable</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Nous soutenons les producteurs ivoiriens dans le respect 
                  des pratiques durables et équitables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignage */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-r from-amber-100 to-orange-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-2xl">
            <div className="flex justify-center mb-4 sm:mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 sm:w-8 sm:h-8 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="text-lg sm:text-xl lg:text-2xl text-gray-800 mb-4 sm:mb-6 leading-relaxed">
              &quot;Un vrai espresso africain avec du caractère ! J&apos;adore le goût profond et la créma. 
              Très pratique avec ma machine Nespresso. À recommander !&quot;
            </blockquote>
            <cite className="text-base sm:text-lg font-semibold text-amber-600">— Nadia M., Cliente satisfaite</cite>
          </div>
        </div>
      </section>

      {/* Livraison Internationale */}
      <section className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-white text-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <Globe className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-blue-200" />
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Livraison Internationale</h2>
                <p className="text-base sm:text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto">
                  Nous livrons nos capsules Robusta partout dans le monde. 
                  Découvrez le goût authentique de la Côte d&apos;Ivoire où que vous soyez.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl mb-2">🇨🇮</div>
                  <h3 className="font-bold mb-1 text-sm sm:text-base">Côte d&apos;Ivoire</h3>
                  <p className="text-blue-200 text-xs sm:text-sm">Livraison 24-48h</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl mb-2">🌍</div>
                  <h3 className="font-bold mb-1 text-sm sm:text-base">Afrique de l&apos;Ouest</h3>
                  <p className="text-blue-200 text-xs sm:text-sm">3-7 jours ouvrés</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 sm:col-span-3 lg:col-span-1">
                  <div className="text-2xl sm:text-3xl mb-2">✈️</div>
                  <h3 className="font-bold mb-1 text-sm sm:text-base">International</h3>
                  <p className="text-blue-200 text-xs sm:text-sm">7-14 jours ouvrés</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-r from-amber-900 to-red-900 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Savourez l&apos;Excellence en Capsule</h2>
          <p className="text-base sm:text-lg lg:text-xl text-amber-200">
            Commandez vos capsules Robusta MosesCafe et découvrez l&apos;intensité du café ivoirien.
          </p>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg sm:text-xl px-8 py-4 sm:px-12 sm:py-6 h-auto rounded-xl sm:rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
          >
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            Commander Mes Capsules
          </Button>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-amber-200">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Emballage recyclable</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Intensité maximale</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Livraison mondiale</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Commande */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              Commander Capsules Robusta
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 sm:space-y-8">
            {/* Image produit */}
            <div className="text-center">
              <Image
                src="https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400"
                alt="Capsules Robusta MosesCafe"
                width={200}
                height={150}
                className="mx-auto rounded-lg shadow-md"
              />
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Boîte de 10 capsules - Compatible Nespresso®*</p>
            </div>

            {/* Prix unitaire */}
            <div className="bg-amber-50 p-4 sm:p-6 rounded-xl text-center">
              <p className="text-base sm:text-lg text-gray-700 mb-2">Prix par boîte :</p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">{formatPrice(pricePerBox)}</p>
              <p className="text-gray-600 text-sm sm:text-base">Soit {formatPrice(pricePerBox / 10)} par capsule</p>
            </div>

            {/* Quantité */}
            <div className="space-y-3 sm:space-y-4">
              <Label className="text-base sm:text-lg font-semibold">Nombre de boîtes :</Label>
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 sm:w-12 sm:h-12 p-0"
                >
                  <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <div className="text-center">
                  <span className="text-xl sm:text-2xl font-bold w-12 sm:w-16 text-center block">{quantity}</span>
                  <span className="text-xs sm:text-sm text-gray-600">
                    ({quantity * 10} capsules)
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 sm:w-12 sm:h-12 p-0"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6 rounded-xl text-center border border-amber-200">
              <p className="text-base sm:text-lg text-gray-700 mb-2">Total de votre commande :</p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-600">
                {formatPrice(pricePerBox * quantity)}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {quantity * 10} capsules au total
              </p>
            </div>

            {/* Formulaire */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Vos informations :</h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm">Nom complet *</Label>
                  <Input
                    id="name"
                    placeholder="Votre nom complet"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="bg-white text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm">Téléphone *</Label>
                  <Input
                    id="phone"
                    placeholder="+225 XX XX XX XX XX"
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="bg-white text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm">Email (optionnel)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    className="bg-white text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-sm">Adresse de livraison *</Label>
                  <Input
                    id="address"
                    placeholder="Votre adresse complète"
                    value={form.address}
                    onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                    className="bg-white text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Bouton de commande */}
            <Button
              onClick={handleOrder}
              disabled={!form.name || !form.phone || !form.address}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 sm:py-4 text-base sm:text-lg font-semibold h-auto"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Confirmer ma Commande - {formatPrice(pricePerBox * quantity)}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-xs sm:text-sm text-gray-500">
                🚚 Livraison Côte d&apos;Ivoire & International
              </p>
              <p className="text-xs text-gray-400">
                *Nespresso® est une marque déposée de Société des Produits Nestlé S.A.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}