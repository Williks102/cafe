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
    "250g": { price: 4500, label: "250g - Format découverte" },
    "500g": { price: 8000, label: "500g - Format familial" },
    "1kg": { price: 15000, label: "1kg - Format économique" }
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

      alert(`✅ Commande confirmée avec succès !\n\nNuméro de commande : #${order.id}\n${quantity}x Espresso Robusta ${selectedFormat}\nTotal: ${formatPrice(total)}\n\nNous vous contacterons au ${form.phone} pour confirmer votre commande.`);
      
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
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Texte */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-300">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">Côte d&apos;Ivoire</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Espresso Moulu
                  <span className="block text-amber-300">Robusta</span>
                </h1>
                <p className="text-xl text-gray-200 leading-relaxed">
                  L&apos;authenticité du terroir ivoirien dans chaque tasse. 
                  Un Robusta puissant, torréfié artisanalement pour les vrais amateurs.
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-3">
                <div className="bg-amber-600/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">100% Robusta</span>
                </div>
                <div className="bg-green-600/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  <span className="text-sm font-medium">Commerce Équitable</span>
                </div>
                <div className="bg-orange-600/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                  <Coffee className="w-4 h-4" />
                  <span className="text-sm font-medium">Torréfaction Artisanale</span>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-4">
                <Button 
                  onClick={() => setShowModal(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg px-8 py-4 h-auto rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Commander Maintenant
                </Button>
                <p className="text-amber-200 text-sm">
                  🚚 Livraison rapide à Abidjan • 📞 Support client dédié
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-red-400/20 rounded-3xl rotate-6"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600"
                  alt="Espresso Moulu Robusta MosesCafe"
                  width={500}
                  height={400}
                  className="w-full h-80 object-cover rounded-2xl shadow-xl"
                />
                <div className="absolute -top-4 -right-4 bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-lg">
                  <span className="text-lg">⭐ 4.9/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profil Aromatique */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Profil Aromatique</h2>
            <p className="text-xl text-gray-600">Découvrez la richesse gustative de notre Robusta</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Intensité", value: "10/10", icon: "🔥", color: "bg-red-500" },
              { label: "Corps", value: "Épais", icon: "💪", color: "bg-amber-500" },
              { label: "Saveurs", value: "Boisé & Cacao", icon: "🌰", color: "bg-amber-600" },
              { label: "Acidité", value: "Faible", icon: "⚖️", color: "bg-green-500" }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-center space-y-4">
                  <div className="text-4xl">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800">{item.label}</h3>
                  <div className={`${item.color} text-white px-4 py-2 rounded-full font-bold`}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Origine & Terroir */}
      <section className="py-20 px-4 bg-amber-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-6">Origine & Terroir</h2>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <Leaf className="w-5 h-5" />
                    Culture Raisonnée
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <div className="flex items-center gap-2 text-amber-600 font-semibold">
                    <Heart className="w-5 h-5" />
                    Commerce Équitable
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600"
                alt="Plantation de café en Côte d'Ivoire"
                width={600}
                height={400}
                className="w-full h-96 object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-xl font-bold">Plantations ivoiriennes</p>
                <p className="text-amber-200">Soutien aux producteurs locaux</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formats & Utilisation */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Formats & Utilisation</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formats */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-6 h-6 text-amber-600" />
                Formats Disponibles
              </h3>
              <div className="space-y-4">
                {Object.entries(formats).map(([format, details]) => (
                  <div key={format} className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-100 hover:border-amber-300 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800">{details.label}</h4>
                        <p className="text-gray-600">Emballage zippé avec valve fraîcheur</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-600">{formatPrice(details.price)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Utilisation */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Coffee className="w-6 h-6 text-amber-600" />
                Utilisation Recommandée
              </h3>
              <div className="space-y-4">
                {[
                  { icon: "☕", title: "Machines Espresso", desc: "Idéal pour machines manuelles ou italiennes" },
                  { icon: "🫖", title: "Cafetières à Filtre", desc: "Excellent pour méthodes douces" },
                  { icon: "🥃", title: "French Press", desc: "Parfait pour l'extraction lente" }
                ].map((method, index) => (
                  <div key={index} className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{method.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">{method.title}</h4>
                        <p className="text-gray-600">{method.desc}</p>
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
      <section className="py-20 px-4 bg-gradient-to-r from-amber-100 to-orange-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-12 shadow-2xl">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="text-2xl text-gray-800 mb-6 leading-relaxed">
              &quot;Un Robusta pur et puissant, parfait pour bien démarrer la journée. 
              Très bonne crema et goût intense. Je recommande !&quot;
            </blockquote>
            <cite className="text-lg font-semibold text-amber-600">— Hervé K., Client fidèle</cite>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-900 to-red-900 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Prêt à Découvrir l&apos;Exception ?</h2>
          <p className="text-xl text-amber-200">
            Commandez dès maintenant votre Espresso Moulu Robusta et savourez l&apos;authenticité ivoirienne.
          </p>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xl px-12 py-6 h-auto rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <ShoppingCart className="w-6 h-6 mr-3" />
            Commander Votre Robusta
          </Button>
          <div className="flex items-center justify-center gap-8 text-amber-200">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Livraison 24-48h</span>
            </div>
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5" />
              <span>Fraîcheur garantie</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Commande */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Coffee className="w-6 h-6 text-amber-600" />
              Commander Espresso Robusta
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8">
            {/* Image produit */}
            <div className="text-center">
              <Image
                src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400"
                alt="Espresso Moulu Robusta"
                width={200}
                height={150}
                className="mx-auto rounded-lg shadow-md"
              />
            </div>

            {/* Sélection format */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Choisissez votre format :</Label>
              <div className="grid grid-cols-1 gap-3">
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
                    <div className={`p-4 rounded-xl border-2 transition-all ${
                      selectedFormat === format 
                        ? 'border-amber-500 bg-amber-50' 
                        : 'border-gray-200 hover:border-amber-300'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{details.label}</span>
                        <span className="text-xl font-bold text-amber-600">
                          {formatPrice(details.price)}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Quantité */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Quantité :</Label>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12"
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Total */}
            <div className="bg-amber-50 p-6 rounded-xl text-center">
              <p className="text-lg text-gray-700 mb-2">Total de votre commande :</p>
              <p className="text-3xl font-bold text-amber-600">
                {formatPrice(formats[selectedFormat as keyof typeof formats].price * quantity)}
              </p>
            </div>

            {/* Formulaire */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Vos informations :</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    placeholder="Votre nom complet"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    placeholder="+225 XX XX XX XX XX"
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (optionnel)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    className="bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Bouton de commande */}
            <Button
              onClick={handleOrder}
              disabled={!form.name || !form.phone}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 text-lg font-semibold h-auto"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Confirmer ma Commande - {formatPrice(formats[selectedFormat as keyof typeof formats].price * quantity)}
            </Button>

            <p className="text-sm text-gray-500 text-center">
              🚚 Livraison sous 24-48h à Abidjan • 📞 Nous vous contacterons pour confirmer
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}