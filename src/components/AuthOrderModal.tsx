"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from 'next-auth/react'
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, ShoppingCart, X, Coffee, Loader2, User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { Product, CreateOrderRequest } from "@/types";

interface CartItem extends Product {
  quantity: number;
}

interface AuthOrderModalProps {
  cart: CartItem[];
  showCart: boolean;
  setShowCart: (show: boolean) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  formatPrice: (price: number) => string;
  setCart: (cart: CartItem[]) => void;
}

type OrderStep = 'auth' | 'guest_form' | 'user_form' | 'confirmation';

export default function AuthOrderModal({
  cart,
  showCart,
  setShowCart,
  removeFromCart,
  updateQuantity,
  getTotalPrice,
  getTotalItems,
  formatPrice,
  setCart
}: AuthOrderModalProps) {
  const { data: session, status } = useSession()
  
  // États pour les étapes
  const [currentStep, setCurrentStep] = useState<OrderStep>('auth')
  const [orderLoading, setOrderLoading] = useState(false)
  
  // États pour l'authentification
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  
  // Formulaires
  const [guestForm, setGuestForm] = useState({ name: "", email: "", phone: "" })
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  })

  // Réinitialiser le modal quand il s'ouvre
  useEffect(() => {
    if (showCart) {
      if (session) {
        setCurrentStep('user_form')
      } else {
        setCurrentStep('auth')
      }
    }
  }, [showCart, session])

  // Validation
  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/[\s\-\.]/g, '');
    const phoneRegex = /^(\+225|225)?[0-9]{8,10}$/;
    return phoneRegex.test(cleanPhone);
  };

  const validateEmail = (email: string) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const passwordValidation = {
    length: authForm.password.length >= 8,
    uppercase: /[A-Z]/.test(authForm.password),
    lowercase: /[a-z]/.test(authForm.password),
    number: /\d/.test(authForm.password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = authForm.password === authForm.confirmPassword && authForm.confirmPassword !== '';

  // Gestion de l'authentification
  const handleAuth = async () => {
    setAuthLoading(true)
    
    try {
      if (authMode === 'signup') {
        // Inscription
        if (!isPasswordValid || !passwordsMatch) {
          alert('Veuillez vérifier les critères du mot de passe')
          return
        }

        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: authForm.name,
            email: authForm.email,
            password: authForm.password,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Erreur lors de l\'inscription')
        }

        // Connexion automatique après inscription
        await signIn('credentials', {
          email: authForm.email,
          password: authForm.password,
          redirect: false,
        })
      } else {
        // Connexion
        const result = await signIn('credentials', {
          email: authForm.email,
          password: authForm.password,
          redirect: false,
        })

        if (result?.error) {
          throw new Error('Email ou mot de passe incorrect')
        }
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur d\'authentification')
    } finally {
      setAuthLoading(false)
    }
  }

  // Commande utilisateur connecté
  const handleUserOrder = async () => {
    if (!session) return

    setOrderLoading(true)
    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        notes: 'Commande passée via le site web (utilisateur connecté)'
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la commande')
      }

      const order = await response.json()
      setCurrentStep('confirmation')
      
      // Nettoyer le panier après 3 secondes
      setTimeout(() => {
        setCart([])
        setShowCart(false)
        setCurrentStep('auth')
      }, 3000)

    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la commande')
    } finally {
      setOrderLoading(false)
    }
  }

  // Commande invité
  const handleGuestOrder = async () => {
    if (!guestForm.name.trim() || !validatePhone(guestForm.phone) || (guestForm.email && !validateEmail(guestForm.email))) {
      return
    }

    setOrderLoading(true)
    try {
      const orderData: CreateOrderRequest = {
        customerName: guestForm.name.trim(),
        customerEmail: guestForm.email.trim() || undefined,
        customerPhone: guestForm.phone.trim(),
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        notes: 'Commande passée via le site web (invité)'
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la commande')
      }

      setCurrentStep('confirmation')
      
      // Nettoyer après 3 secondes
      setTimeout(() => {
        setCart([])
        setShowCart(false)
        setGuestForm({ name: "", email: "", phone: "" })
        setCurrentStep('auth')
      }, 3000)

    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la commande')
    } finally {
      setOrderLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-4 sm:mb-6">
      <div className="flex items-center space-x-2">
        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
          currentStep === 'auth' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          1
        </div>
        <div className="w-4 sm:w-8 h-0.5 bg-gray-200" />
        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
          ['guest_form', 'user_form'].includes(currentStep) ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          2
        </div>
        <div className="w-4 sm:w-8 h-0.5 bg-gray-200" />
        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
          currentStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          3
        </div>
      </div>
    </div>
  )

  const renderAuthStep = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <User className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-amber-600 mb-3 sm:mb-4" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
          Finaliser votre commande
        </h3>
        <p className="text-gray-600 text-sm sm:text-base">
          Connectez-vous ou continuez en tant qu'invité
        </p>
      </div>

      {/* Boutons d'authentification */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Button
            onClick={() => setAuthMode('signin')}
            variant={authMode === 'signin' ? 'default' : 'outline'}
            className={`text-xs sm:text-sm ${authMode === 'signin' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
          >
            Se connecter
          </Button>
          <Button
            onClick={() => setAuthMode('signup')}
            variant={authMode === 'signup' ? 'default' : 'outline'}
            className={`text-xs sm:text-sm ${authMode === 'signup' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
          >
            S'inscrire
          </Button>
        </div>

        {/* Formulaire d'authentification */}
        <div className="space-y-3 sm:space-y-4">
          {authMode === 'signup' && (
            <div>
              <Label htmlFor="auth-name" className="text-sm">Nom complet</Label>
              <Input
                id="auth-name"
                value={authForm.name}
                onChange={(e) => setAuthForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Votre nom complet"
                className="bg-white text-sm"
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="auth-email" className="text-sm">Email</Label>
            <Input
              id="auth-email"
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm(f => ({ ...f, email: e.target.value }))}
              placeholder="votre@email.com"
              className="bg-white text-sm"
            />
          </div>

          <div>
            <Label htmlFor="auth-password" className="text-sm">Mot de passe</Label>
            <div className="relative">
              <Input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={authForm.password}
                onChange={(e) => setAuthForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="bg-white pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {authMode === 'signup' && (
            <>
              <div>
                <Label htmlFor="auth-confirm-password" className="text-sm">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                    className="bg-white pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Critères du mot de passe */}
              {authForm.password && (
                <div className="text-xs space-y-1">
                  <div className={`flex items-center ${passwordValidation.length ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordValidation.length ? '✓' : '✗'} Au moins 8 caractères
                  </div>
                  <div className={`flex items-center ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordsMatch ? '✓' : '✗'} Les mots de passe correspondent
                  </div>
                </div>
              )}
            </>
          )}

          <Button
            onClick={handleAuth}
            disabled={authLoading || !authForm.email || !authForm.password || (authMode === 'signup' && (!isPasswordValid || !passwordsMatch))}
            className="w-full bg-amber-600 hover:bg-amber-700 text-sm sm:text-base"
          >
            {authLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {authMode === 'signin' ? 'Connexion...' : 'Inscription...'}
              </>
            ) : (
              authMode === 'signin' ? 'Se connecter' : 'S\'inscrire'
            )}
          </Button>
        </div>

        {/* Séparateur */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou</span>
          </div>
        </div>

        {/* Continuer en invité */}
        <Button
          onClick={() => setCurrentStep('guest_form')}
          variant="outline"
          className="w-full text-sm sm:text-base"
        >
          Continuer en tant qu'invité
        </Button>
      </div>
    </div>
  )

  const renderGuestForm = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setCurrentStep('auth')}
          variant="ghost"
          size="sm"
          className="text-xs sm:text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour
        </Button>
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">
          Informations de livraison
        </h3>
        <div />
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <Label htmlFor="guest-name" className="text-sm">Nom complet *</Label>
          <Input
            id="guest-name"
            placeholder="Votre nom complet"
            value={guestForm.name}
            onChange={(e) => setGuestForm(f => ({ ...f, name: e.target.value }))}
            className="bg-white text-sm"
          />
        </div>
        
        <div>
          <Label htmlFor="guest-phone" className="text-sm">Téléphone *</Label>
          <Input
            id="guest-phone"
            placeholder="+225 XX XX XX XX XX"
            value={guestForm.phone}
            onChange={(e) => setGuestForm(f => ({ ...f, phone: e.target.value }))}
            className="bg-white text-sm"
          />
        </div>
        
        <div>
          <Label htmlFor="guest-email" className="text-sm">Email (optionnel)</Label>
          <Input
            id="guest-email"
            type="email"
            placeholder="votre@email.com"
            value={guestForm.email}
            onChange={(e) => setGuestForm(f => ({ ...f, email: e.target.value }))}
            className="bg-white text-sm"
          />
        </div>
      </div>

      <div className="bg-amber-50 p-3 sm:p-4 rounded-lg">
        <div className="flex justify-between items-center text-lg sm:text-xl font-bold text-gray-800">
          <span>Total:</span>
          <span className="text-amber-600">{formatPrice(getTotalPrice())}</span>
        </div>
      </div>

      <Button
        onClick={handleGuestOrder}
        disabled={orderLoading || !guestForm.name.trim() || !validatePhone(guestForm.phone)}
        className="w-full bg-amber-600 hover:bg-amber-700 py-3 text-sm sm:text-base"
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
    </div>
  )

  const renderUserForm = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
          Prêt à commander, {session?.user?.name?.split(' ')[0]} !
        </h3>
        <p className="text-gray-600 text-sm sm:text-base">
          Votre commande sera liée à votre compte
        </p>
      </div>

      <div className="bg-amber-50 p-3 sm:p-4 rounded-lg">
        <div className="flex justify-between items-center text-lg sm:text-xl font-bold text-gray-800">
          <span>Total:</span>
          <span className="text-amber-600">{formatPrice(getTotalPrice())}</span>
        </div>
      </div>

      <Button
        onClick={handleUserOrder}
        disabled={orderLoading}
        className="w-full bg-amber-600 hover:bg-amber-700 py-3 text-sm sm:text-base"
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
    </div>
  )

  const renderConfirmation = () => (
    <div className="text-center space-y-4 sm:space-y-6">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Commande confirmée !
        </h3>
        <p className="text-gray-600 text-sm sm:text-base">
          Merci pour votre commande. Nous vous contacterons bientôt.
        </p>
      </div>
      <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
        <p className="text-green-800 font-medium text-sm sm:text-base">
          Total payé : {formatPrice(getTotalPrice())}
        </p>
      </div>
    </div>
  )

  return (
    <Dialog open={showCart} onOpenChange={setShowCart}>
      <DialogContent className="!bg-white max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center justify-between pr-6">
            <span>Mon Panier ({getTotalItems()} article{getTotalItems() > 1 ? 's' : ''})</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowCart(false)}
              className="p-1 shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-base sm:text-lg">Votre panier est vide</p>
            </div>
          ) : (
            <>
              {/* Articles du panier - toujours visible */}
              <div className="space-y-3 sm:space-y-4 max-h-48 sm:max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <Image 
                      src={item.image} 
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.name}</h4>
                      <p className="text-amber-600 font-bold text-sm sm:text-base">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 sm:w-8 sm:h-8 p-0"
                      >
                        <Minus className="w-2 h-2 sm:w-3 sm:h-3" />
                      </Button>
                      <span className="w-6 sm:w-8 text-center font-semibold text-sm sm:text-base">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 sm:w-8 sm:h-8 p-0"
                      >
                        <Plus className="w-2 h-2 sm:w-3 sm:h-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 shrink-0"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Indicateur d'étapes */}
              {currentStep !== 'confirmation' && renderStepIndicator()}

              {/* Étapes du processus */}
              {currentStep === 'auth' && renderAuthStep()}
              {currentStep === 'guest_form' && renderGuestForm()}
              {currentStep === 'user_form' && renderUserForm()}
              {currentStep === 'confirmation' && renderConfirmation()}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}