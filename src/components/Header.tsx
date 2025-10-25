"use client";

import { useState } from "react";
import { useSession, signOut } from 'next-auth/react';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Coffee, ShoppingCart, Menu, X, User, LogOut, Settings, ChevronDown, Package } from "lucide-react";

interface HeaderProps {
  cartItemsCount?: number;
  onCartClick?: () => void;
  showCart?: boolean;
  theme?: 'light' | 'dark';
}

export default function Header({ cartItemsCount = 0, onCartClick, showCart = true, theme = 'light' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "Capsules Robusta", href: "/produits/capsules-robusta" },
    { name: "Expresso Moulu", href: "/produits/espresso-moulu-robusta" },
    { name: "Grains Robusta", href: "/produits/grains-robusta" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Couleurs adaptées au thème
  const headerBg = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';

  return (
    <header className={`${headerBg} shadow-sm border-b ${borderColor} sticky top-0 z-50`}>
      {/* Debug temporaire - supprime après test */}
      

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo mosescafe */}
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <div className="relative">
              <Image 
                src="/logo-mosescafe.png" 
                alt="mosescafe" 
                width={80} 
                height={80} 
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-12 h-12 bg-gradient-to-br from-red-500 via-green-600 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                <Coffee className="w-7 h-7 text-white" />
              </div>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-colors hover:text-red-600 ${
                  isActive(item.href)
                    ? "text-red-600 border-b-2 border-red-600 pb-1"
                    : theme === 'dark' ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions à droite */}
          <div className="flex items-center gap-4">
            {/* Panier */}
            {showCart && onCartClick && (
              <Button
                onClick={onCartClick}
                variant="outline"
                className="relative hover:bg-red-50 border-red-200 hover:border-red-300 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Panier</span>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            )}

            {/* Authentification Desktop */}
            <div className="hidden md:flex items-center">
              {status === 'loading' ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              ) : session ? (
                <div className="relative">
                  {/* Bouton Profil */}
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2"
                  >
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                      {session.user?.image ? (
                        <img 
                          src={session.user.image} 
                          alt="Profile" 
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <span className="font-medium text-sm">{session.user?.name?.split(' ')[0]}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* Menu Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                        <p className="text-sm text-gray-500">{session.user?.email}</p>
                      </div>
                      
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="inline h-4 w-4 mr-2" />
                        Mon Profil
                      </Link>
                      
                      <Link
                        href="/suivi"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Package className="inline h-4 w-4 mr-2" />
                        Suivre ma commande
                      </Link>
                      
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <ShoppingCart className="inline h-4 w-4 mr-2" />
                        Mes Commandes
                      </Link>

                      {session.user?.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings className="inline h-4 w-4 mr-2" />
                          Administration
                        </Link>
                      )}
                      
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleSignOut();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="inline h-4 w-4 mr-2" />
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Utilisateur non connecté
                <div className="flex items-center space-x-3">
                  <Link
                    href="/suivi"
                    className="text-gray-700 hover:text-red-600 transition-colors font-medium text-sm"
                  >
                    Suivre ma commande
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-red-600 transition-colors font-medium text-sm"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors font-medium text-sm"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>

            {/* Menu mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation Mobile */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t ${borderColor} py-4`}>
            <nav className="flex flex-col space-y-3">
              {/* Navigation principale */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-left transition-colors hover:bg-red-50 hover:text-red-600 ${
                    isActive(item.href)
                      ? "bg-red-50 text-red-600 font-semibold"
                      : theme === 'dark' ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Authentification Mobile */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                {session ? (
                  <div className="space-y-3">
                    {/* Info utilisateur */}
                    <div className="flex items-center space-x-3 px-4 py-2">
                      <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                        {session.user?.image ? (
                          <img 
                            src={session.user.image} 
                            alt="Profile" 
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{session.user?.name}</p>
                        <p className="text-xs text-gray-500">{session.user?.email}</p>
                      </div>
                    </div>
                    
                    {/* Liens utilisateur */}
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg mx-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="inline h-4 w-4 mr-2" />
                      Mon Profil
                    </Link>
                    
                    <Link
                      href="/suivi"
                      className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg mx-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Package className="inline h-4 w-4 mr-2" />
                      Suivre ma commande
                    </Link>
                    
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg mx-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="inline h-4 w-4 mr-2" />
                      Mes Commandes
                    </Link>

                    {/* Admin uniquement */}
                    {session.user?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg mx-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="inline h-4 w-4 mr-2" />
                        Administration
                      </Link>
                    )}
                    
                    {/* Déconnexion */}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors rounded-lg mx-2"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Se déconnecter
                    </button>
                  </div>
                ) : (
                  // Utilisateur non connecté Mobile
                  <div className="space-y-3">
                    <Link
                      href="/suivi"
                      className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg mx-2 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Package className="inline h-4 w-4 mr-2" />
                      Suivre ma commande
                    </Link>
                    <Link
                      href="/auth/signin"
                      className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg mx-2 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors font-medium text-center mx-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      S'inscrire
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Overlay pour fermer le menu profil */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </header>
  );
}