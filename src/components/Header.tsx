"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Coffee, ShoppingCart, Menu, X } from "lucide-react";

interface HeaderProps {
  cartItemsCount?: number;
  onCartClick?: () => void;
  showCart?: boolean;
  theme?: 'light' | 'dark';
}

export default function Header({ cartItemsCount = 0, onCartClick, showCart = true, theme = 'light' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "Capsules Robusta", href: "/produits/capsules-robusta" },
    { name: "Expresso Moulu", href: "/produits/expresso-moulu-robusta" },
    { name: "Grains Robusta", href: "/produits/grains-robusta" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Couleurs adaptées au thème
  const headerBg = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';

  return (
    <header className={`${headerBg} shadow-sm border-b ${borderColor} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo mosescafe seul */}
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <div className="relative">
              {/* Logo - utilisez votre vraie image */}
              <Image 
                src="/logo-mosescafe.png" 
                alt="mosescafe" 
                width={80} 
                height={80} 
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  // Fallback si l'image n'est pas trouvée
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              {/* Fallback design inspiré de votre logo */}
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
            {/* Panier (si activé) */}
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}