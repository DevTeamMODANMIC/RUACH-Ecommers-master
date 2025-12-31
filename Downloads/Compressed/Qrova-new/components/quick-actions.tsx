"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  ShoppingCart, 
  Heart, 
  Plus, 
  X,
  Headphones
} from "lucide-react"
import Link from "next/link"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "@/hooks/use-wishlist"
import ClientOnly from "@/components/client-only"

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)
  const { getTotalItems } = useCart()
  const { wishlistCount } = useWishlist()

  const actions = [
    {
      icon: Phone,
      label: "Call Us",
      href: "tel:+441234567890",
      color: "bg-blue-600 hover:bg-blue-700",
      external: true
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      href: "https://wa.me/2348012345678",
      color: "bg-green-600 hover:bg-green-700",
      external: true
    },
    {
      icon: Mail,
      label: "Email",
      href: "mailto:info@grova.com",
      color: "bg-purple-600 hover:bg-purple-700",
      external: true
    },
    {
      icon: Headphones,
      label: "Support",
      href: "/contact",
      color: "bg-orange-600 hover:bg-orange-700",
      external: false
    }
  ]

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      {/* Quick action buttons */}
      <div className={`flex flex-col space-y-2 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {/* Cart button */}
        <Link href="/cart">
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-gray-800 hover:bg-gray-900 text-white shadow-lg relative"
          >
            <ShoppingCart className="h-4 w-4" />
            <ClientOnly>
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </ClientOnly>
          </Button>
        </Link>

        {/* Wishlist button */}
        <Link href="/wishlist">
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg relative"
          >
            <Heart className="h-4 w-4" />
            <ClientOnly>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </ClientOnly>
          </Button>
        </Link>

        {/* Contact actions */}
        {actions.map((action, index) => (
          action.external ? (
            <a
              key={index}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`h-10 w-10 rounded-full ${action.color} text-white shadow-lg flex items-center justify-center transition-colors`}
              aria-label={action.label}
            >
              <action.icon className="h-4 w-4" />
            </a>
          ) : (
            <Link key={index} href={action.href}>
              <Button
                size="icon"
                className={`h-10 w-10 rounded-full ${action.color} text-white shadow-lg`}
                aria-label={action.label}
              >
                <action.icon className="h-4 w-4" />
              </Button>
            </Link>
          )
        ))}
      </div>

      {/* Main toggle button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-300"
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Plus className="h-5 w-5" />
        )}
      </Button>
    </div>
  )
}