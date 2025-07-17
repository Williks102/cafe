// components/Navbar.tsx
'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Coffee, Menu, X, User, LogOut, Settings, ShoppingBag } from 'lucide-react'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-amber-600 rounded-full flex items-center justify-center">
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Moses Café</span>
          </Link>

          {/* Navigation principale (desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-amber-600 transition-colors">
              Accueil
            </Link>
            <Link href="/menu" className="text-gray-700 hover:text-amber-600 transition-colors">
              Menu
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-amber-600 transition-colors">
              À propos
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-amber-600 transition-colors">
              Contact
            </Link>
          </div>

          {/* Auth & Profile (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
            ) : session ? (
              <div className="relative">
                {/* Bouton panier (si connecté) */}
                <Link 
                  href="/cart" 
                  className="p-2 text-gray-700 hover:text-amber-600 transition-colors mr-2"
                >
                  <ShoppingBag className="h-5 w-5" />
                </Link>

                {/* Menu utilisateur */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-amber-600 transition-colors"
                >
                  <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                    {session.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt="Profile" 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-amber-600" />
                    )}
                  </div>
                  <span className="font-medium">{session.user?.name?.split(' ')[0]}</span>
                </button>

                {/* Dropdown menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-sm text-gray-500">{session.user?.email}</p>
                    </div>
                    
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="inline h-4 w-4 mr-2" />
                      Mon Profil
                    </Link>
                    
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <ShoppingBag className="inline h-4 w-4 mr-2" />
                      Mes Commandes
                    </Link>

                    {session.user?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="inline h-4 w-4 mr-2" />
                        Administration
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        setIsProfileOpen(false)
                        handleSignOut()
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-amber-600 transition-colors font-medium"
                >
                  Se connecter
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Menu burger (mobile) */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-amber-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-3">
              <Link
                href="/"
                className="block text-gray-700 hover:text-amber-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                href="/menu"
                className="block text-gray-700 hover:text-amber-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Menu
              </Link>
              <Link
                href="/about"
                className="block text-gray-700 hover:text-amber-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                À propos
              </Link>
              <Link
                href="/contact"
                className="block text-gray-700 hover:text-amber-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {session ? (
                <div className="pt-3 border-t border-gray-200 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                      {session.user?.image ? (
                        <img 
                          src={session.user.image} 
                          alt="Profile" 
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-sm text-gray-500">{session.user?.email}</p>
                    </div>
                  </div>
                  
                  <Link
                    href="/dashboard"
                    className="block text-gray-700 hover:text-amber-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mon Profil
                  </Link>
                  
                  <Link
                    href="/orders"
                    className="block text-gray-700 hover:text-amber-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mes Commandes
                  </Link>

                  <Link
                    href="/cart"
                    className="block text-gray-700 hover:text-amber-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mon Panier
                  </Link>

                  {session.user?.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="block text-gray-700 hover:text-amber-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Administration
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleSignOut()
                    }}
                    className="block w-full text-left text-red-600 hover:text-red-700 transition-colors"
                  >
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-200 space-y-3">
                  <Link
                    href="/auth/signin"
                    className="block text-gray-700 hover:text-amber-600 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay pour fermer le menu profile */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
        </nav>
      )
    }