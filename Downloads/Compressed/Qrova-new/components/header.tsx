"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  ShoppingCart,
  Heart,
  Menu,
  X,
  Search,
  User,
  ChevronDown,
  Home,
  ShoppingBag,
  Info,
  Package,
  MessageCircle,
  LogOut,
  Phone,
} from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { useSafeCurrency } from "@/hooks/use-safe-currency";
import React from "react";
import { useAuth } from "@/components/auth-provider";
import { useWishlist } from "@/hooks/use-wishlist";
import ClientOnly from "@/components/client-only";

// Simplified navigation - fewer items
const mainNavItems = [
  { title: "Home", href: "/", icon: Home },
  {
    title: "Shop",
    href: "/shop",
    icon: ShoppingBag,
  },
  { title: "About", href: "/about", icon: Info },
  { title: "Contact", href: "/contact", icon: MessageCircle },
];

// Simplified categories
const categoryNavItems = [
  { title: "Drinks", href: "/shop?category=drinks" },
  { title: "Food", href: "/shop?category=food" },
  { title: "Flour", href: "/shop?category=flour" },
  { title: "Rice", href: "/shop?category=rice" },
  { title: "Spices", href: "/shop?category=spices" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { items, getTotalItems, getTotalPrice, isClient } = useCart();
  const { formatCurrency } = useSafeCurrency();
  const { wishlistCount } = useWishlist();
  const [logoError, setLogoError] = useState(false);
  const { user, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full bg-white/90 backdrop-blur-xl transition-all duration-300 border-b border-gray-200/60 shadow-sm ${
          isScrolled ? "py-2.5 shadow-md" : "py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          {/* Main Header - Clean and simple */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              {!logoError ? (
                <div className="relative h-11 w-11 rounded-2xl overflow-hidden transition-all group-hover:scale-105 group-hover:rotate-3 shadow-md">
                  <Image
                    src="/images/logo/borderlessbuy-logo.png"
                    alt="Grova Logo"
                    width={44}
                    height={44}
                    className="object-contain"
                    priority
                    onError={() => setLogoError(true)}
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-2xl h-11 w-11 flex items-center justify-center font-bold text-xl transition-all group-hover:scale-105 group-hover:rotate-3 shadow-md">
                  G
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:to-teal-700 transition-all">Grova</span>
                <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Fresh Everyday</span>
              </div>
            </Link>

            {/* Desktop Navigation - Minimal */}
            <nav className="hidden md:flex items-center space-x-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                    pathname === item.href
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pr-11 h-11 text-sm rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-gray-50 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg hover:bg-emerald-100 hover:text-emerald-700"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-2">
              {user ? (
                <Link href="/profile" className="relative p-2.5 rounded-xl hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 transition-all group">
                  <User className="h-5 w-5 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                  <ClientOnly>
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                        {wishlistCount}
                      </span>
                    )}
                  </ClientOnly>
                </Link>
              ) : (
                <Link href="/wishlist" className="relative p-2.5 rounded-xl hover:bg-gradient-to-br hover:from-rose-50 hover:to-pink-50 transition-all group">
                  <Heart className="h-5 w-5 text-gray-600 group-hover:text-rose-500 transition-colors" />
                  <ClientOnly>
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-br from-rose-500 to-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                        {wishlistCount}
                      </span>
                    )}
                  </ClientOnly>
                </Link>
              )}

              <Link href="/cart" className="relative p-2.5 rounded-xl hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 transition-all group">
                <ShoppingCart className="h-5 w-5 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                <ClientOnly>
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                      {getTotalItems()}
                    </span>
                  )}
                </ClientOnly>
              </Link>

              {user ? (
                <div className="hidden md:flex items-center space-x-3 ml-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-emerald-100">
                    {user.displayName
                      ? user.displayName.charAt(0).toUpperCase()
                      : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={logout}
                    className="px-5 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all font-semibold shadow-lg shadow-red-500/30"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-2 px-6 py-2.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-xl font-semibold transition-all ml-3 shadow-lg shadow-green-500/30"
                >
                  <User className="h-4 w-4" />
                  Login
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-700 hover:bg-gray-100 rounded-lg ml-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="pt-3 md:hidden">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search products..."
                className="pr-10 h-10 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 bg-gray-50/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md hover:bg-emerald-50 hover:text-emerald-600"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center space-x-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {!logoError ? (
                <div className="relative h-8 w-8">
                  <Image
                    src="/images/logo/borderlessbuy-logo.png"
                    alt="Grova Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                    onError={() => setLogoError(true)}
                  />
                </div>
              ) : (
                <div className="bg-green-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm">
                  G
                </div>
              )}
              <span className="text-lg font-bold text-gray-900">Grova</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <nav className="space-y-4">
            {mainNavItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center space-x-2 py-2 ${
                  pathname === item.href
                    ? "text-green-600 font-medium"
                    : "text-gray-600"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon && React.createElement(item.icon, { className: "h-5 w-5" })}
                <span>{item.title}</span>
              </Link>
            ))}
            
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Categories</h3>
              <div className="space-y-2">
                {categoryNavItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="block py-1 text-gray-600 hover:text-green-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium text-sm">
                      {user.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">
                      {user.displayName || user.email?.split("@")[0]}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center space-x-2 py-2 text-gray-600 hover:text-green-600"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-2 py-2 text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Spacer for fixed header */}
      <div className={`${isScrolled ? "h-16" : "h-20"}`}></div>
    </>
  );
}
