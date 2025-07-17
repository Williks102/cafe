"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, User, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation du mot de passe
  const passwordValidation = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid || !passwordsMatch) {
      alert('Veuillez vérifier les critères du mot de passe');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      // Connexion automatique après inscription réussie
const result = await signIn('credentials', {
  email: formData.email,
  password: formData.password,
  redirect: false, // ← Changer à false
  callbackUrl: '/dashboard'
});

if (result?.error) {
  throw new Error('Inscription réussie mais erreur de connexion');
} else if (result?.ok) {
  // Redirection manuelle après succès
  window.location.href = '/dashboard';
}

    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header showCart={false} />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Retour */}
            <div className="mb-6">
              <Link 
                href="/"
                className="inline-flex items-center text-amber-600 hover:text-amber-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Link>
            </div>

            {/* Card d'inscription */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Rejoignez Moses Café
                </h1>
                <p className="text-gray-600">
                  Créez votre compte pour une expérience personnalisée
                </p>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom */}
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nom complet
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="name"
                      type="text"
                      required
                      placeholder="Votre nom complet"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-10 bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mot de passe
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10 bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Critères du mot de passe */}
                  {formData.password && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Critères du mot de passe :</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center ${passwordValidation.length ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="mr-1">{passwordValidation.length ? '✓' : '✗'}</span>
                          8 caractères min.
                        </div>
                        <div className={`flex items-center ${passwordValidation.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="mr-1">{passwordValidation.uppercase ? '✓' : '✗'}</span>
                          1 majuscule
                        </div>
                        <div className={`flex items-center ${passwordValidation.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="mr-1">{passwordValidation.lowercase ? '✓' : '✗'}</span>
                          1 minuscule
                        </div>
                        <div className={`flex items-center ${passwordValidation.number ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="mr-1">{passwordValidation.number ? '✓' : '✗'}</span>
                          1 chiffre
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirmation mot de passe */}
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10 pr-10 bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Validation confirmation */}
                  {formData.confirmPassword && (
                    <div className={`mt-2 text-xs flex items-center ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-1">{passwordsMatch ? '✓' : '✗'}</span>
                      Les mots de passe correspondent
                    </div>
                  )}
                </div>

                {/* Bouton d'inscription */}
                <Button
                  type="submit"
                  disabled={loading || !isPasswordValid || !passwordsMatch || !formData.name || !formData.email}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    "Créer mon compte"
                  )}
                </Button>

                {/* Lien vers connexion */}
                <div className="text-center text-sm text-gray-600">
                  Vous avez déjà un compte ?{' '}
                  <Link 
                    href="/auth/signin" 
                    className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                  >
                    Se connecter
                  </Link>
                </div>
              </form>
            </div>

            {/* Avantages */}
            <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Avantages de votre compte Moses Café
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                  Suivi de vos commandes en temps réel
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                  Historique de tous vos achats
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                  Commandes plus rapides (infos sauvegardées)
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                  Accès prioritaire aux nouveautés
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}