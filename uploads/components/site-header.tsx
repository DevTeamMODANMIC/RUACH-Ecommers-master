"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import {
  Heart,
  ShoppingCart,
  Menu,
  X,
  Search,
  ChevronDown,
  Phone,
  LogOut,
  Package,
  User,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar } from "@/components/ui/avatar"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "@/hooks/use-wishlist"
import { useAuth } from "@/components/auth-provider"
import { useVendor } from "@/hooks/use-vendor"
import { VendorHeaderSwitcher } from "@/components/vendor-header-switcher"
import { DesktopMegaMenu, MobileMegaMenu } from "@/components/mega-menu"
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
  { title: "Stores", href: "/stores" },
  { title: "Become a Vendor", href: "/vendor/register" },
  { title: "Bulk Order", href: "/bulk-order" },
  { title: "FAQs", href: "/faq" },
]

export default function HeaderImproved() {
  const pathname = usePathname()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const { wishlistCount } = useWishlist()
  const { getTotalItems } = useCart()
  const { user, logout } = useAuth()
  const { isVendor } = useVendor()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.trim()) return
    router.push(`/shop?search=${encodeURIComponent(search.trim())}`)
    setSearch("")
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur shadow-sm">
      {/* Top Utility Bar */}
      <div className="hidden md:flex items-center justify-between px-6 py-1 text-xs text-gray-600 bg-gray-50">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            +2348160662997
          </span>
        </div>
        {/*<Link href="/vendor/register" className="text-green-700 hover:underline">
          Sell with Us
        </Link>*/}
      </div>

      {/* Main Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        {/* Mobile Nav */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Toggle menu" className="md:hidden mr-2">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetHeader className="px-6">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="px-6 pt-4 space-y-4 text-sm">
              {primaryLinks.map(link => (
                <Link
                  key={link.title}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx("block", pathname === link.href ? "text-green-600 font-medium" : "text-gray-700")}
                >
                  {link.title}
                </Link>
              ))}
              <div>
                <p className="uppercase text-xs text-gray-500 mb-2">Categories</p>
                <MobileMegaMenu onNavigate={() => setMobileOpen(false)} />
              </div>

              {/* Mobile Vendor CTA */}
              <div className="pt-4 border-t">
                <Link
                  href="/vendor/register"
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
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo/logo.png" alt="RUACH Logo" width={120} height={40} className="h-10 w-auto" />
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
          
          <Link href="/wishlist" className="relative" aria-label="Wishlist">
            <Button variant="ghost" size="icon" className="hover:text-green-600">
              <Heart className="h-5 w-5" />
            </Button>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] font-semibold bg-green-600 text-white rounded-full h-4 w-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative" aria-label="Cart">
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
            <DropdownMenuContent align="end" className="w-48">
              {user ? (
                <>
                  <DropdownMenuItem onSelect={() => router.push("/profile")}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/profile/orders")}>Orders</DropdownMenuItem>
                  {isVendor && (
                    <DropdownMenuItem onSelect={() => router.push("/vendor/dashboard")}>
                      Vendor Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={logout} className="text-red-600">
                    Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onSelect={() => router.push("/login")}>Sign In</DropdownMenuItem>
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
                href={link.href}
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
