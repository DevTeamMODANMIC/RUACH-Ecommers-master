
import comLogog from "../a/new_logo.jpg"

import {Link} from "react-router-dom";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
;
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
  Store,
  Info,
  Package,
  MessageCircle,
  LogOut,
  Phone,
} from "lucide-react";
import { useCart } from "../../src/components/cart-provider";
import { useSafeCurrency } from "../../src/hooks/use-safe-currency";
import React from "react";
import { useAuth } from "../../src/components/auth-provider";
import { useWishlist } from "../../src/hooks/use-wishlist";
import ClientOnly from "../../src/components/client-only";
import { useVendor } from "../../src/hooks/use-vendor";
import { useServiceProvider } from "../../src/hooks/use-service-provider";
import { ServiceProviderHeaderSwitcher } from "../../src/components/service-provider-header-switcher";
import SmartSearch from "../../src/components/smart-search";
import { products } from "../lib/product-data";

// We'll use CSS classes instead of inline styles

const mainNavItems = [
  { title: "Home", href: "/", icon: Home },
  {
    title: "Shop",
    href: "/shop",
    icon: ShoppingBag,
    dropdown: [
      { title: "Drinks", href: "/shop?category=drinks" },
      { title: "Flour", href: "/shop?category=flour" },
      { title: "Rice", href: "/shop?category=rice" },
      { title: "Pap/Custard", href: "/shop?category=pap-custard" },
      { title: "Spices", href: "/shop?category=spices" },
      { title: "Beverages", href: "/shop?category=beverages" },
      { title: "Dried Spices", href: "/shop?category=dried-spices" },
      { title: "Oil", href: "/shop?category=oil" },
      { title: "Provisions", href: "/shop?category=provisions" },
      { title: "Fresh Produce", href: "/shop?category=fresh-produce" },
      { title: "Fresh Vegetables", href: "/shop?category=fresh-vegetables" },
      { title: "Fish & Meat", href: "/shop?category=meat" },
    ],
  },
  { title: "Stores", href: "/stores", icon: Store },
  { title: "Become a Vendor", href: "/vendor/register", icon: User },
  { title: "Bulk Order", href: "/bulk-order", icon: Package },
  { title: "Contact us", href: "/contact", icon: MessageCircle },
];

export default function Header() {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { items, getTotalItems, getTotalPrice, isClient } = useCart();
  const { formatCurrency } = useSafeCurrency();
  const { wishlistCount } = useWishlist();
  const [logoError, setLogoError] = useState(false);
  const { user, logout } = useAuth();
  const { isVendor } = useVendor();
  const { isServiceProvider } = useServiceProvider();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle dropdown menu
  const toggleDropdown = (title: string) => {
    if (activeDropdown === title) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(title);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeDropdown &&
        !(event.target as Element).closest(".dropdown-menu-container")
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeDropdown]);

  const handleLogout = async () => {
    try {
      await logout();
      setActiveDropdown(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
        className={`fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-gray-200 shadow-lg transition-all duration-300 ${isScrolled ? "py-1" : "py-2"}`}
      >
        <div className="container mx-auto px-4">
          
          {/* Main Header */}
          <div className="flex items-center justify-between py-2">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              {!logoError ? (
                <div className="mr-2 flex items-center">
                  <img
                    src={comLogog}
                    alt="Ruach Logo"
                    width={120}
                    height={40}
                    className="h-10 w-auto"
                    // priority
                    onError={() => setLogoError(true)}
                  />
                </div>
              ) : (
                <div className="bg-green-600 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-lg mr-2 shadow-md">
                  R
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 tracking-tight leading-tight">

                  RUACH E-STORE
                </span>
              </div>
            </Link>

            {/* Smart Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-6">
              <SmartSearch
                placeholder="Search for products, categories, or brands..."
                className="w-full"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center">
              <ul className="flex items-center">
                {mainNavItems.map((item, index) => (
                  <li key={item.title} className="relative">
                    <div
                      onClick={(e) => {
                        if (item.dropdown) {
                          e.stopPropagation();
                          toggleDropdown(item.title);
                        }
                      }}
                      className="flex items-center cursor-pointer dropdown-menu-container px-3 rounded-md hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Link
                        to={item.href}
                        className={`flex items-center font-medium py-2 transition-colors duration-150 relative text-sm
                          ${
                            pathname === item.href
                              ? "text-green-700 after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-green-500 after:rounded-full"
                              : "text-gray-800 hover:text-green-600"
                          }`}
                      >
                        {item.title}
                      </Link>
                      {item.dropdown && (
                        <ChevronDown
                          className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                            activeDropdown === item.title ? "rotate-180" : ""
                          } text-gray-500`}
                        />
                      )}
                    </div>

                    {/* Dropdown Menu */}
                    {item.dropdown && (
                      <div
                        className={`absolute top-full left-0 shadow-xl rounded-md w-64 z-50 transition-all duration-200 dropdown-menu-container
                          bg-white border border-gray-200 max-h-60 overflow-hidden ${
                            activeDropdown === item.title
                              ? "opacity-100 translate-y-2 visible scale-100"
                              : "opacity-0 -translate-y-2 invisible scale-95"
                          }`}
                      >
                        <div className="overflow-y-auto h-full py-2">
                          <div className="grid grid-cols-2 gap-1.5 px-3">
                            {item.dropdown.map((subItem) => (
                              <Link
                                key={subItem.title}
                                to={subItem.href}
                                className="flex items-center px-2 py-1 text-gray-700 hover:bg-green-50 hover:text-green-700 text-xs transition-colors duration-150 rounded"
                                onClick={() => setActiveDropdown(null)}
                              >
                                {subItem.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
                {/* More menu dropdown */}
                <li className="relative">
                  <div
                    onClick={() => toggleDropdown("more-nav")}
                    className="flex items-center cursor-pointer dropdown-menu-container px-3"
                  >
                    <span className="flex items-center font-medium py-2 transition-colors duration-150 relative text-sm text-gray-800 hover:text-green-600">
                      More
                    </span>
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                        activeDropdown === "more-nav" ? "rotate-180" : ""
                      } text-gray-500`}
                    />
                  </div>
                  
                  {/* More Dropdown Menu */}
                  <div
                    className={`absolute top-full right-0 shadow-lg rounded-b-lg w-40 z-30 transition-all duration-300 dropdown-menu-container
                      bg-white border-t-2 border-green-500 ${
                        activeDropdown === "more-nav"
                          ? "opacity-100 translate-y-0 visible"
                          : "opacity-0 -translate-y-2 invisible"
                      }`}
                  >
                    <ul className="py-1">
                      {mainNavItems.slice(4).map((item) => (
                        <li key={item.title}>
                          <Link
                            to={item.href}
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 text-sm"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              </ul>

              {/* Right Icons */}
              <div className="flex items-center space-x-5 ml-8 border-l pl-6 border-gray-100">
                {/* Service Provider Switcher */}
                <ServiceProviderHeaderSwitcher />
                
                <Link
                  to="/wishlist"
                  className="relative hover:text-green-600 p-2"
                >
                  <Heart className="h-6 w-6 text-gray-700" />
                  <ClientOnly>
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </ClientOnly>
                </Link>

                <Link
                  to="/cart"
                  className="relative hover:text-green-600 p-2 flex items-center"
                >
                  <ShoppingCart className="h-6 w-6 text-gray-700" />
                  <ClientOnly>
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </ClientOnly>
                  <ClientOnly>
                    <span className="hidden lg:inline-block ml-1 text-gray-800 font-medium text-sm">
                      {formatCurrency(getTotalPrice())}
                    </span>
                  </ClientOnly>
                </Link>

                <Link
                  to="/vendor/register"
                  className="hidden lg:flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200 shadow-sm text-sm font-medium"
                >
                  <Store className="h-4 w-4 mr-1" />
                  Sell on RUACH
                </Link>

                <Link
                  to="https://wa.me/2348160662997"
                  target="_blank"
                  rel="noopener noreferrer"
                  suppressHydrationWarning
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors duration-200 shadow-sm"
                >
                  <Phone className="h-5 w-5" />
                  <span className="hidden lg:inline ml-1 text-sm">WhatsApp</span>
                </Link>

                {user ? (
                  <div className="relative dropdown-menu-container">
                    <div
                      onClick={() => toggleDropdown("profile")}
                      className="hidden md:flex items-center hover:text-green-600 cursor-pointer p-1"
                    >
                      <div className="h-8 w-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-700 font-medium mr-1">
                        {user.displayName
                          ? user.displayName.charAt(0).toUpperCase()
                          : user.email?.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden lg:inline text-sm font-medium text-gray-700">
                        {user.displayName || user.email?.split("../../src")[0]}
                      </span>
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                          activeDropdown === "profile" ? "rotate-180" : ""
                        } text-gray-500`}
                      />
                    </div>

                    {/* Profile Dropdown */}
                    <div
                      className={`absolute top-full right-0 shadow-lg rounded-lg w-48 z-30 transition-all duration-300
                        bg-white border-t-2 border-green-500 ${
                          activeDropdown === "profile"
                            ? "opacity-100 translate-y-0 visible"
                            : "opacity-0 -translate-y-2 invisible"
                        }`}
                    >
                      <div className="py-1">
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-xs font-medium text-gray-900">
                            {user.displayName || "Welcome!"}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        <ul className="py-1">
                          <li>
                            <Link
                              to="/profile"
                              className="flex items-center px-3 py-1.5 text-gray-700 hover:bg-green-50 hover:text-green-700 text-xs"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <User className="h-3 w-3 mr-1.5 text-gray-500" />
                              My Profile
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/profile/orders"
                              className="flex items-center px-3 py-1.5 text-gray-700 hover:bg-green-50 hover:text-green-700 text-xs"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <Package className="h-3 w-3 mr-1.5 text-gray-500" />
                              My Orders
                            </Link>
                          </li>
                          {isVendor && (
                            <li>
                              <Link
                                to="/vendor/dashboard"
                                className="flex items-center px-3 py-1.5 text-gray-700 hover:bg-green-50 hover:text-green-700 text-xs"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <Package className="h-3 w-3 mr-1.5 text-gray-500" />
                                Vendor Dashboard
                              </Link>
                            </li>
                          )}
                          {isServiceProvider && (
                            <li>
                              <Link
                                to="/service-provider/dashboard"
                                className="flex items-center px-3 py-1.5 text-gray-700 hover:bg-green-50 hover:text-green-700 text-xs"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <Package className="h-3 w-3 mr-1.5 text-gray-500" />
                                Service Provider
                              </Link>
                            </li>
                          )}
                          <li>
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full text-left px-3 py-1.5 text-gray-700 hover:bg-red-50 hover:text-red-700 text-xs"
                            >
                              <LogOut className="h-3 w-3 mr-1.5 text-gray-500" />
                              Sign Out
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="hidden md:flex items-center hover:text-green-600"
                  >
                    <User className="h-6 w-6 text-gray-700" />
                  </Link>
                )}
              </div>
            </nav>

            {/* Mobile Right Icons */}
            <div className="flex md:hidden items-center space-x-3">
              <Link
                to="/wishlist"
                className="relative hover:text-green-600 p-1"
              >
                <Heart className="h-6 w-6 text-gray-700" />
                <ClientOnly>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </ClientOnly>
              </Link>

              <Link to="/cart" className="relative hover:text-green-600 p-1">
                <ShoppingCart className="h-6 w-6 text-gray-700" />
                <ClientOnly>
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </ClientOnly>
              </Link>
              
              <Link
                to="https://wa.me/2348012345678"
                target="_blank"
                rel="noopener noreferrer"
                suppressHydrationWarning
                className="flex items-center p-2 bg-green-600 hover:bg-green-700 text-white rounded-full"
              >
                <Phone className="h-5 w-5" />
              </Link>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:bg-gray-100 p-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>


        </div>
        
        {/* Category Navigation removed – categories are now accessed via the "Shop" dropdown to create a cleaner header */}
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed top-[calc(7.5rem+1px)] left-0 right-0 md:hidden border-t shadow-lg transform transition-all duration-300 max-h-[80vh] overflow-y-auto
          bg-white border-t border-gray-200 z-40 ${
            mobileMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
      >
        <div className="container mx-auto px-4 py-4">
          <ul className="space-y-4 divide-y divide-gray-200">
            {mainNavItems.map((item) => (
              <li key={item.title} className="py-2">
                {!item.dropdown ? (
                  <Link
                    to={item.href}
                    className={`flex items-center py-2 space-x-2 ${
                      pathname === item.href
                        ? "text-green-600 font-medium"
                        : "text-gray-700"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.title}</span>
                  </Link>
                ) : (
                  <div>
                    <div
                      className="flex justify-between items-center py-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(item.title);
                      }}
                    >
                      <div
                        className={`flex items-center space-x-2 ${
                          pathname === item.href
                            ? "text-green-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                      </div>
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                          activeDropdown === item.title ? "rotate-180" : ""
                        } text-gray-500`}
                      />
                    </div>
                    <div
                      className={`overflow-hidden transition-all duration-200 ${
                        activeDropdown === item.title
                          ? "max-h-60 opacity-100 mt-1 overflow-y-auto"
                          : "max-h-0 opacity-0 mt-0"
                      }`}
                    >
                      <div className="pl-3 border-l-2 border-green-500/30 py-1.5">
                        <div className="grid grid-cols-2 gap-1">
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.title}
                              to={subItem.href}
                              className="flex items-center py-1.5 px-2 text-gray-600 hover:text-green-700 transition-colors duration-150 text-sm rounded hover:bg-green-50"
                              onClick={() => {
                                setActiveDropdown(null);
                                setMobileMenuOpen(false);
                              }}
                            >
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
            <li className="py-2">
              {/* WhatsApp Button for Mobile */}
              <Link
                to="/vendor/register"
                className="flex items-center py-2 space-x-2 text-white bg-blue-600 rounded-full justify-center mb-2 px-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Store className="h-4 w-4" />
                <span>Become a Vendor</span>
              </Link>
              
              <Link
                to="https://wa.me/2348012345678"
                target="_blank"
                rel="noopener noreferrer"
                suppressHydrationWarning
                className="flex items-center py-2 space-x-2 text-white bg-green-600 rounded-full justify-center mb-2 px-4"
              >
                <Phone className="h-4 w-4" />
                <span>WhatsApp</span>
              </Link>
              {user ? (
                <>
                  <div className="flex items-center py-2 px-4 mb-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-700 font-medium mr-2">
                      {user.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.displayName || "Welcome!"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center py-2 space-x-2 text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/profile/orders"
                    className="flex items-center py-2 space-x-2 text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="h-4 w-4" />
                    <span>My Orders</span>
                  </Link>
                  {isVendor && (
                    <Link
                      to="/vendor/dashboard"
                      className="flex items-center py-2 space-x-2 text-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Package className="h-4 w-4" />
                      <span>Vendor Dashboard</span>
                    </Link>
                  )}
                  {isServiceProvider && (
                    <Link
                      to="/service-provider/dashboard"
                      className="flex items-center py-2 space-x-2 text-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Package className="h-4 w-4" />
                      <span>Service Provider</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center py-2 space-x-2 text-red-600 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center py-2 space-x-2 text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Login / Register</span>
                </Link>
              )}
            </li>

            {/* Mobile Categories */}
            <li className="py-1">
              <div className="font-medium text-gray-900 py-1.5 text-sm">Categories</div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {mainNavItems[1].dropdown?.map((category) => (
                  <Link
                    key={category.title}
                    to={category.href}
                    className="text-gray-700 py-1.5 px-2.5 bg-gray-100 rounded hover:bg-green-50 hover:text-green-700 text-xs transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.title}
                  </Link>
                ))}
              </div>
            </li>

            {/* Mobile Smart Search - Top of mobile menu */}
            <li className="py-2">
              <div className="font-medium text-gray-900 py-2">Search</div>
              <div className="lg:hidden pt-4 px-4">
                <SmartSearch
                  placeholder="Search products..."
                  className="w-full"
                />
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className={`${isScrolled ? "h-28" : "h-32"} md:h-40`}></div>
    </>
  );
}
