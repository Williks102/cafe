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
  X
} from "lucide-react";

export default function RobustaLandingPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("500g");
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const formats = {
    "200g": { price: 2502, label: "200g - Format découverte" },
    "500g": { price: 3529, label: "500g - Format familial" },
    "1kg": { price: 6182, label: "1kg - Format économique" }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
  };

  const handleOrder = async () => {
    const selectedPrice = formats[selectedFormat as keyof typeof formats].price;
    const total = selectedPrice * quantity;
    
    if (!form.name.trim() || !form.phone.trim()) {
      alert("❌ Veuillez remplir tous les champs obligatoires !");
      return;
    }

    try {
      const orderData = {
        customerName: form.name.trim(),
        customerEmail: form.email.trim() || undefined,
        customerPhone: form.phone.trim(),
        source: 'espresso_moulu_landing',
        notes: `Commande Espresso Moulu Robusta - ${quantity}x ${selectedFormat}`,
        items: [
          {
            productName: `Espresso Moulu Robusta - ${selectedFormat}`,
            description: `100% Robusta moulu - Torréfaction artisanale - ${quantity}x ${selectedFormat}`,
            price: selectedPrice,
            quantity: quantity,
            category: 'Espresso Moulu',
            image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600'
          }
        ]
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

      alert(`✅ Commande confirmée avec succès !\n\nNuméro de commande : #${order.id}\n${quantity}x Espresso Robusta ${selectedFormat}\nTotal: ${formatPrice(total)}\n\nNous vous contacterons au ${form.phone} pour confirmer votre commande.\n\n🔍 Suivez votre commande sur mosescafe.ci/suivi`);
      
      setShowModal(false);
      setForm({ name: "", email: "", phone: "" });
      setQuantity(1);

    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      alert(`❌ Erreur lors de la commande : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
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
                  Espresso Moulu
                  <span className="block text-amber-300">Robusta</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  L&apos;authenticité du terroir ivoirien dans chaque tasse. 
                  Un Robusta puissant, torréfié artisanalement pour les vrais amateurs.
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start">
                <div className="bg-amber-600/80 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2 rounded-full flex items-center gap-2">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">100% Robusta</span>
                </div>
                <div className="bg-green-600/80 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2 rounded-full flex items-center gap-2">
                  <Leaf className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Commerce Équitable</span>
                </div>
                <div className="bg-orange-600/80 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2 rounded-full flex items-center gap-2">
                  <Coffee className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Torréfaction Artisanale</span>
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
                  🚚 Livraison rapide à Abidjan • 📞 Support client dédié
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="relative order-first lg:order-last">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-red-400/20 rounded-2xl sm:rounded-3xl rotate-3 sm:rotate-6"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                <Image
                  src="https://res.cloudinary.com/db4hmbdv3/image/upload/v1753454839/moses-cafe/products/moses-cafe-1753454839030-qzb00tcajyo.webp"
                  alt="Espresso Moulu Robusta MosesCafe"
                  width={500}
                  height={400}
                  className="w-full h-48 sm:h-60 lg:h-80 object-cover rounded-xl sm:rounded-2xl shadow-xl"
                />
                <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-red-500 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-full font-bold shadow-lg">
                  <span className="text-sm sm:text-lg">⭐ 4.9/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profil Aromatique */}
      <section className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Profil Aromatique</h2>
            <p className="text-lg sm:text-xl text-gray-600">Découvrez la richesse gustative de notre Robusta</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { label: "Intensité", value: "10/10", icon: "🔥", color: "bg-red-500" },
              { label: "Corps", value: "Épais", icon: "💪", color: "bg-amber-500" },
              { label: "Saveurs", value: "Boisé & Cacao", icon: "🌰", color: "bg-amber-600" },
              { label: "Acidité", value: "Faible", icon: "⚖️", color: "bg-green-500" }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="text-2xl sm:text-4xl">{item.icon}</div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">{item.label}</h3>
                  <div className={`${item.color} text-white px-3 py-2 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm`}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Origine & Terroir */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-amber-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">Origine & Terroir</h2>
                <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-gray-700 leading-relaxed">
                  <p>
                    🌍 <strong>Issu des régions fertiles de Côte d&apos;Ivoire</strong>, 
                    ce Robusta moulu incarne la puissance et l&apos;authenticité des cafés d&apos;Afrique de l&apos;Ouest.
                  </p>
                  <p>
                    🌱 Cultivé à basse altitude dans un climat chaud et humide, 
                    il développe un <strong>caractère unique, profond et énergique</strong>.
                  </p>
                  <p>
                    🔥 <strong>Torréfié artisanalement</strong> dans nos ateliers, 
                    chaque lot est travaillé avec précision pour extraire la crème du goût ivoirien.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md">
                  <div className="flex items-center gap-2 text-green-600 font-semibold text-sm sm:text-base">
                    <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
                    Culture Raisonnée
                  </div>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md">
                  <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm sm:text-base">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                    Commerce Équitable
                  </div>
                </div>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <Image
                src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600"
                alt="Plantation de café en Côte d'Ivoire"
                width={600}
                height={400}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-xl sm:rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl sm:rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
                <p className="text-lg sm:text-xl font-bold">Plantations ivoiriennes</p>
                <p className="text-amber-200 text-sm sm:text-base">Soutien aux producteurs locaux</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formats & Utilisation */}
      <section className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Formats & Utilisation</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Formats */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                Formats Disponibles
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(formats).map(([format, details]) => (
                  <div key={format} className="bg-white p-4 sm:p-6 rounded-xl shadow-md border-2 border-gray-100 hover:border-amber-300 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{details.label}</h4>
                        <p className="text-gray-600 text-xs sm:text-sm">Emballage zippé avec valve fraîcheur</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xl sm:text-2xl font-bold text-amber-600">{formatPrice(details.price)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Utilisation */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                Utilisation Recommandée
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { icon: "☕", title: "Machines Espresso", desc: "Idéal pour machines manuelles ou italiennes" },
                  { icon: "🫖", title: "Cafetières à Filtre", desc: "Excellent pour méthodes douces" },
                  { icon: "🥃", title: "French Press", desc: "Parfait pour l'extraction lente" }
                ].map((method, index) => (
                  <div key={index} className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6 rounded-xl border border-amber-200">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="text-2xl sm:text-3xl">{method.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">{method.title}</h4>
                        <p className="text-gray-600 text-xs sm:text-sm">{method.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
              &quot;Un Robusta pur et puissant, parfait pour bien démarrer la journée. 
              Très bonne crema et goût intense. Je recommande !&quot;
            </blockquote>
            <cite className="text-base sm:text-lg font-semibold text-amber-600">— Hervé K., Client fidèle</cite>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-r from-amber-900 to-red-900 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Prêt à Découvrir l&apos;Exception ?</h2>
          <p className="text-base sm:text-lg lg:text-xl text-amber-200">
            Commandez dès maintenant votre Espresso Moulu Robusta et savourez l&apos;authenticité ivoirienne.
          </p>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg sm:text-xl px-8 py-4 sm:px-12 sm:py-6 h-auto rounded-xl sm:rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
          >
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            Commander Votre Robusta
          </Button>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-amber-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Livraison 24-48h</span>
            </div>
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Fraîcheur garantie</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Commande */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="!bg-white max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              Commander Espresso Robusta
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 sm:space-y-8">
            {/* Image produit */}
            <div className="text-center">
              <Image
                src="https://res.cloudinary.com/db4hmbdv3/image/upload/v1753454839/moses-cafe/products/moses-cafe-1753454839030-qzb00tcajyo.webp"
                alt="Espresso Moulu Robusta"
                width={200}
                height={150}
                className="mx-auto rounded-lg shadow-md"
              />
            </div>

            {/* Sélection format */}
            <div className="space-y-3 sm:space-y-4">
              <Label className="text-base sm:text-lg font-semibold">Choisissez votre format :</Label>
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {Object.entries(formats).map(([format, details]) => (
                  <label key={format} className="cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value={format}
                      checked={selectedFormat === format}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                      selectedFormat === format 
                        ? 'border-amber-500 bg-amber-50' 
                        : 'border-gray-200 hover:border-amber-300'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <span className="font-medium text-sm sm:text-base">{details.label}</span>
                        <span className="text-lg sm:text-xl font-bold text-amber-600">
                          {formatPrice(details.price)}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Quantité */}
            <div className="space-y-3 sm:space-y-4">
              <Label className="text-base sm:text-lg font-semibold">Quantité :</Label>
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 sm:w-12 sm:h-12 p-0"
                >
                  <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <span className="text-xl sm:text-2xl font-bold w-12 sm:w-16 text-center">{quantity}</span>
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
            <div className="bg-amber-50 p-4 sm:p-6 rounded-xl text-center">
              <p className="text-base sm:text-lg text-gray-700 mb-2">Total de votre commande :</p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-600">
                {formatPrice(formats[selectedFormat as keyof typeof formats].price * quantity)}
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
              </div>
            </div>

            {/* Bouton de commande */}
            <Button
              onClick={handleOrder}
              disabled={!form.name || !form.phone}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 sm:py-4 text-base sm:text-lg font-semibold h-auto"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Confirmer ma Commande - {formatPrice(formats[selectedFormat as keyof typeof formats].price * quantity)}
            </Button>

            <p className="text-xs sm:text-sm text-gray-500 text-center">
              🚚 Livraison sous 24-48h à Abidjan • 📞 Nous vous contacterons pour confirmer
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}