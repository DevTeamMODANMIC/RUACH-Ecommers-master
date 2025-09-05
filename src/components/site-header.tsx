import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import comLogog from "../a/new_logo.jpg"
// React doesn't need Image component from Next.js
import {
  Heart,
  ShoppingCart,
  Menu,
  X,
  Search,
  ChevronDown,
  ChevronRight,
  Phone,
  LogOut,
  Package,
  User,
  ArrowLeft,
  Layers,
  DollarSign
} from "lucide-react"
import { Input } from "../../src/components/ui/input"
import { Button } from "../../src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../src/components/ui/dropdown-menu"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../src/components/ui/sheet"
import { Avatar } from "../../src/components/ui/avatar"
import { useCart } from "../../src/components/cart-provider"
import { useWishlist } from "../../src/hooks/use-wishlist"
import { useAuth } from "../../src/components/auth-provider"
import { useVendor } from "../../src/hooks/use-vendor"
import { useServiceProvider } from "../../src/hooks/use-service-provider"
import { VendorHeaderSwitcher } from "../../src/components/vendor-header-switcher"
import { ServiceProviderHeaderSwitcher } from "../../src/components/service-provider-header-switcher"
import { DesktopMegaMenu, MobileMegaMenu } from "../../src/components/mega-menu"
import clsx from "clsx"

// Legacy categories - keeping for backward compatibility if needed
const legacyCategories = [
  { id: "drinks", name: "Drinks & Beverages" },
  { id: "flour", name: "Flour" },
  { id: "rice", name: "Rice" },
  { id: "pap-custard", name: "Pap/Custard" },
  { id: "spices", name: "Spices" },
  { id: "dried-spices", name: "Dried Spices" },
  { id: "oil", name: "Oil" },
  { id: "provisions", name: "Provisions" },
  { id: "fresh-produce", name: "Fresh Produce" },
  { id: "fresh-vegetables", name: "Fresh Vegetables" },
  { id: "meat", name: "Fish & Meat" },
]

const primaryLinks = [
  { title: "Home", href: "/" },
  { title: "Shop", href: "/shop" },
  { title: "Services", href: "/services" },
  { title: "Stores", href: "/stores" },
  { title: "Become a Vendor", href: "/vendor/register" },
  { title: "Bulk Order", href: "/bulk-order" },
  { title: "Track Order", href: "/track-order" },
  { title: "FAQs", href: "/faq" },
]

export default function HeaderImproved() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const { wishlistCount } = useWishlist()
  const { getTotalItems } = useCart()
  const { user, logout } = useAuth()
  const { isVendor } = useVendor()
  const { isServiceProvider } = useServiceProvider()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(true) // Default to open

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.trim()) return
    navigate(`/shop?search=${encodeURIComponent(search.trim())}`)
    setSearch("")
  }

  const handleNavigate = () => {
    // Only close the mobile menu when navigating to a specific page
    setMobileOpen(false)
  }

  const handleCategoriesToggle = () => {
    setCategoriesOpen(!categoriesOpen)
  }

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setCategoriesOpen(true);
  }
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur shadow-sm">
      {/* Top Utility Bar */}
      <div className="hidden md:flex items-center justify-between px-6 py-1 text-xs text-gray-600 bg-gray-50">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            +2347054915173
          </span>
        </div>
        {/*<Link to="/vendor/register" className="text-green-700 hover:underline">
          Sell with Us
        </Link>*/}
      </div>

      {/* Main Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        {/* Mobile Nav */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Toggle menu" 
              className="md:hidden mr-2 hover:bg-gray-100/80 backdrop-blur-sm border border-transparent hover:border-gray-200/50 transition-all duration-300"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 bg-white/95 backdrop-blur-md border-r border-gray-200/50 shadow-2xl overflow-y-auto mobile-menu-scrollbar">
            <SheetHeader className="px-6 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200/50 mb-4">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="px-6 pt-4 space-y-4 text-sm bg-gradient-to-b from-white/50 to-transparent">
              {primaryLinks.map(link => (
                <Link
                  key={link.title}
                  to={link.href}
                  onClick={(e) => {
                    if (link.title === "Shop") {
                      // Always navigate to the shop page when clicking on Shop
                      handleNavigate();
                    } else {
                      setMobileOpen(false);
                    }
                  }}
                  className={clsx(
                    "block py-3 px-4 rounded-lg transition-all duration-300 backdrop-blur-sm", 
                    pathname === link.href 
                      ? "text-green-600 font-medium bg-green-50/80 border border-green-200/50" 
                      : "text-gray-700 hover:text-green-600 hover:bg-gray-50/80 hover:border hover:border-gray-200/50"
                  )}
                >
                  {link.title}
                </Link>
              ))}
              <div className="bg-gray-50/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200/30">
                <MobileMegaMenu 
                  onNavigate={handleNavigate}
                  isOpen={categoriesOpen}
                  onToggle={handleCategoriesToggle}
                />
              </div>

              {/* Mobile Vendor CTA */}
              <div className="pt-4 border-t border-gray-200/50 bg-gray-50/30 backdrop-blur-sm rounded-lg p-4 mt-4">
                <Link
                  to="/vendor/register"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded font-medium"
                >
                  Become a Vendor
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src={comLogog} alt="RUACH Logo" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-bold tracking-tight text-gray-900 hidden sm:inline">
            RUACH E-STORE
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 justify-center px-4">
          <div className="relative w-full max-w-md">
            <Input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-4 pr-10 h-10 rounded-md bg-gray-100/70 border border-gray-200 focus:bg-white"
              aria-label="Search products"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </form>

        {/* Icons */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Vendor Store Switcher */}
          <VendorHeaderSwitcher />
          
          {/* Service Provider Switcher */}
          <ServiceProviderHeaderSwitcher />
          
          <Link to="/wishlist" className="relative" aria-label="Wishlist">
            <Button variant="ghost" size="icon" className="hover:text-green-600">
              <Heart className="h-5 w-5" />
            </Button>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] font-semibold bg-green-600 text-white rounded-full h-4 w-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative" aria-label="Cart">
            <Button variant="ghost" size="icon" className="hover:text-green-600">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] font-semibold bg-green-600 text-white rounded-full h-4 w-4 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Link>

          {/* Sell on RUACH Button - Removed */}

          {/* WhatsApp Floating Icon */}
          <a
            href="https://wa.me/2348160662997"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium"
            aria-label="Contact on WhatsApp"
          >
            WhatsApp
          </a>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:text-green-600" aria-label="User profile">
                {user ? (
                  <Avatar className="h-8 w-8 bg-green-600 text-white font-bold flex items-center justify-center">
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </Avatar>
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden">
              {user ? (
                <>
                  <DropdownMenuItem onSelect={() => navigate("/profile")} className="cursor-pointer hover:bg-gray-50 transition-colors">Profile</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate("/profile/orders")} className="cursor-pointer hover:bg-gray-50 transition-colors">Orders</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate("/my-bookings")} className="cursor-pointer hover:bg-gray-50 transition-colors">My Bookings</DropdownMenuItem>
                  {isVendor && (
                    <DropdownMenuItem onSelect={() => navigate("/vendor/dashboard")} className="cursor-pointer hover:bg-gray-50 transition-colors">
                      Vendor Dashboard
                    </DropdownMenuItem>
                  )}
                  {isServiceProvider && (
                    <DropdownMenuItem onSelect={() => navigate("/service-provider/dashboard")} className="cursor-pointer hover:bg-gray-50 transition-colors">
                      Service Provider
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={logout} className="text-red-600 cursor-pointer hover:bg-red-50 transition-colors">
                    Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onSelect={() => navigate("/track-order")} className="cursor-pointer hover:bg-gray-50 transition-colors">Track Order</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate("/login")} className="cursor-pointer hover:bg-gray-50 transition-colors">Sign In</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="hidden md:block border-t bg-white shadow-sm">
        <nav className="flex items-center justify-center space-x-8 text-sm h-10">
          {primaryLinks.map(link =>
            link.title === "Shop" ? (
              <DesktopMegaMenu key={link.title} pathname={pathname} />
            ) : (
              <Link
                key={link.title}
                to={link.href}
                className={clsx(
                  "py-2",
                  pathname === link.href ? "text-green-700 font-semibold border-b-2 border-green-600" : "text-gray-800 hover:text-green-600"
                )}
              >
                {link.title}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  )
}
