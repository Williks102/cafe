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
  Shield,
  Target,
  Sparkles
} from "lucide-react";

export default function GrainsRobustaLanding() {
  const [showModal, setShowModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("500g");
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const formats = {
    "250g": { price: 5000, label: "250g - Format découverte", desc: "Parfait pour tester" },
    "500g": { price: 9500, label: "500g - Format familial", desc: "Le plus populaire" },
    "1kg": { price: 18000, label: "1kg - Format économique", desc: "Meilleur rapport qualité/prix" }
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
        source: 'grains_robusta_landing',
        notes: `Commande Grains Robusta - ${quantity}x ${selectedFormat}`,
        items: [
          {
            productName: `Espresso en Grains Robusta - ${selectedFormat}`,
            description: `100% Robusta - Grains entiers - Torréfaction artisanale - ${quantity}x ${selectedFormat}`,
            price: selectedPrice,
            quantity: quantity,
            category: 'Grains',
            image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600'
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

      alert(`✅ Commande confirmée avec succès !\n\nNuméro de commande : #${order.id}\n${quantity}x Espresso en Grains ${selectedFormat}\nTotal: ${formatPrice(total)}\n\nNous vous contacterons au ${form.phone} pour confirmer votre commande.`);
      
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
                  Espresso en
                  <span className="block text-amber-300">Grains Robusta</span>
                </h1>
                <p className="text-xl text-gray-200 leading-relaxed">
                  Caractère africain, torréfaction artisanale. Plongez dans l&apos;authenticité 
                  d&apos;un espresso intense avec notre Robusta 100% pur origine.
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-3">
                <div className="bg-amber-600/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">100% Robusta</span>
                </div>
                <div className="bg-green-600/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">Grains Entiers</span>
                </div>
                <div className="bg-orange-600/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
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
                  🚚 Livraison rapide à Abidjan • ⚡ Fraîcheur garantie
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-red-400/20 rounded-3xl rotate-6"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600"
                  alt="Espresso en Grains Robusta MosesCafe"
                  width={500}
                  height={400}
                  className="w-full h-80 object-cover rounded-2xl shadow-xl"
                />
                <div className="absolute -top-4 -right-4 bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-lg">
                  <span className="text-lg">⭐ 4.9/5</span>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-amber-500 text-black px-6 py-3 rounded-full font-bold shadow-lg">
                  <span className="text-lg">Intensité 10/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profil Sensoriel */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Profil Sensoriel</h2>
            <p className="text-xl text-gray-600">Une personnalité affirmée et un goût franc</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { label: "Intensité", value: "10/10", icon: "🔥", color: "bg-red-500", desc: "Puissance maximale" },
              { label: "Corps", value: "Épais & Rond", icon: "💪", color: "bg-amber-500", desc: "Texture veloutée" },
              { label: "Créma", value: "Dense", icon: "☁️", color: "bg-orange-500", desc: "Persistante" },
              { label: "Notes", value: "Boisé & Épicé", icon: "🌰", color: "bg-amber-600", desc: "Cacao amer" },
              { label: "Torréfaction", value: "Foncée", icon: "☕", color: "bg-orange-600", desc: "À cœur" },
              { label: "Origine", value: "100% Côte d'Ivoire", icon: "🇨🇮", color: "bg-green-600", desc: "Pur Robusta" }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="text-center space-y-4">
                  <div className="text-4xl">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800">{item.label}</h3>
                  <div className={`${item.color} text-white px-3 py-2 rounded-full font-bold text-sm`}>
                    {item.value}
                  </div>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Machine Espresso & Utilisation */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-100 to-orange-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-6">Idéal pour Machine Espresso Broyeur</h2>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    ⚙️ <strong>Grains entiers préservés</strong> : 
                    La fraîcheur et les arômes sont conservés jusqu&apos;au moment du broyage pour un espresso optimal.
                  </p>
                  <p>
                    🎯 <strong>Mouture sur mesure</strong> : 
                    Adaptez la finesse selon votre machine pour extraire le maximum de saveurs du Robusta.
                  </p>
                  <p>
                    ☕ <strong>Créma exceptionnelle</strong> : 
                    La torréfaction foncée garantit une créma dense et persistante, signature d&apos;un excellent espresso.
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Coffee className="w-6 h-6 text-amber-600" />
                  Formats Disponibles
                </h3>
                <div className="space-y-3">
                  {Object.entries(formats).map(([format, details]) => (
                    <div key={format} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <div>
                        <span className="font-semibold">{details.label}</span>
                        <p className="text-sm text-gray-600">{details.desc}</p>
                      </div>
                      <span className="text-xl font-bold text-amber-600">
                        {formatPrice(details.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600"
                alt="Machine espresso avec grains de café"
                width={600}
                height={400}
                className="w-full h-96 object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-xl font-bold">Machine espresso broyeur</p>
                <p className="text-amber-200">Mouture fraîche à chaque tasse</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Engagements */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Nos Engagements MosesCafe</h2>
            <p className="text-xl text-gray-600">Du producteur à votre tasse, notre promesse qualité</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Durable */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Leaf className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Culture Durable</h3>
                <p className="text-gray-600 leading-relaxed">
                  Nous travaillons directement avec des producteurs locaux ivoiriens 
                  pour garantir un café cultivé de manière respectueuse de l&apos;environnement.
                </p>
              </div>
            </div>

            {/* Équitable */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Rémunération Équitable</h3>
                <p className="text-gray-600 leading-relaxed">
                  Nos partenaires producteurs bénéficient d&apos;une rémunération juste 
                  qui valorise leur savoir-faire et améliore leurs conditions de vie.
                </p>
              </div>
            </div>

            {/* Traçabilité */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Traçabilité Complète</h3>
                <p className="text-gray-600 leading-relaxed">
                  De la plantation à votre tasse, nous garantissons une traçabilité totale 
                  pour vous assurer l&apos;origine et la qualité de chaque grain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conservation & Qualité */}
      <section className="py-20 px-4 bg-gradient-to-r from-gray-100 to-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-12 shadow-2xl">
            <div className="space-y-8">
              <div className="space-y-4">
                <Package className="w-16 h-16 mx-auto text-amber-600" />
                <h2 className="text-3xl font-bold text-gray-800">Conservation Optimale</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Nos grains sont conditionnés dans un <strong>emballage hermétique avec valve fraîcheur</strong> 
                  qui préserve tous les arômes et maintient la qualité de votre café pendant des semaines.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-amber-50 p-6 rounded-xl">
                  <div className="text-3xl mb-2">🛡️</div>
                  <h3 className="font-bold text-gray-800 mb-2">Protection UV</h3>
                  <p className="text-gray-600 text-sm">Emballage opaque</p>
                </div>
                <div className="bg-amber-50 p-6 rounded-xl">
                  <div className="text-3xl mb-2">💨</div>
                  <h3 className="font-bold text-gray-800 mb-2">Valve de Dégazage</h3>
                  <p className="text-gray-600 text-sm">Évacue le CO2</p>
                </div>
                <div className="bg-amber-50 p-6 rounded-xl">
                  <div className="text-3xl mb-2">🔒</div>
                  <h3 className="font-bold text-gray-800 mb-2">Étanchéité</h3>
                  <p className="text-gray-600 text-sm">Préserve les arômes</p>
                </div>
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
              &quot;Un espresso corsé comme je les aime ! Super créma et goût intense. 
              J&apos;ai enfin trouvé un café ivoirien de qualité. Une très belle découverte !&quot;
            </blockquote>
            <cite className="text-lg font-semibold text-amber-600">— Pascal T., Amateur d&apos;espresso</cite>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-900 to-red-900 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Révélez le Caractère Africain</h2>
          <p className="text-xl text-amber-200">
            Commandez vos grains Robusta MosesCafe et savourez l&apos;intensité de la Côte d&apos;Ivoire.
          </p>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xl px-12 py-6 h-auto rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <ShoppingCart className="w-6 h-6 mr-3" />
            Commander Mes Grains Robusta
          </Button>
          <div className="flex items-center justify-center gap-8 text-amber-200">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Livraison 24-48h</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Fraîcheur garantie</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span>100% Robusta</span>
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
              Commander Espresso en Grains Robusta
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8">
            {/* Image produit */}
            <div className="text-center">
              <Image
                src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400"
                alt="Espresso en Grains Robusta MosesCafe"
                width={200}
                height={150}
                className="mx-auto rounded-lg shadow-md"
              />
              <p className="text-gray-600 mt-2">100% Robusta - Grains entiers - Torréfaction artisanale</p>
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
                        <div>
                          <span className="font-medium">{details.label}</span>
                          <p className="text-sm text-gray-600">{details.desc}</p>
                        </div>
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
            <div className="bg-amber-50 p-6 rounded-xl text-center border border-amber-200">
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
              🚚 Livraison sous 24-48h à Abidjan • ☕ Emballage hermétique avec valve fraîcheur
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}