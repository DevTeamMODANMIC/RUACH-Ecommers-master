"use client"

import Link from "next/link"
import {
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Mail,
  Phone,
  Truck,
  CreditCard,
  Shield,
  Heart,
  Send,
  ChevronUp,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import React from "react"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState("")
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  // Force style update after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <footer className="mt-16 select-none bg-transparent">
      <div className="bg-gradient-to-b from-green-800 via-green-900 to-green-950 text-gray-100 overflow-hidden relative">
        {/* Accent gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 via-emerald-400 to-lime-300" />

        <div className="container mx-auto px-4 py-10">
          {/* Top sections */}
          <div className="flex flex-wrap gap-8 justify-between">
            {/* About */}
            <div className="w-full sm:w-1/2 lg:w-1/4 text-center sm:text-left">
              <h3 className="text-lg font-semibold text-white mb-4">RUACH E-STORE</h3>
              <p className="text-sm leading-relaxed mb-6">
                Your trusted source for authentic products –delivered with care and quality assurance.
              </p>
              <p className="text-sm leading-relaxed mb-6">
                Partnered with Modanmic.
              </p>
              <div className="flex space-x-4">
                {[
                  { Icon: Facebook, href: "#", label: "Facebook" },
                  { Icon: Instagram, href: "#", label: "Instagram" },
                  { Icon: Twitter, href: "#", label: "Twitter" },
                ].map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="hover:text-white transition-transform transform hover:scale-110"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="w-full sm:w-1/2 lg:w-1/4 text-center sm:text-left">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { href: "/shop", label: "Shop" },
                  { href: "/stores", label: "Browse Stores" },
                  { href: "/vendor/register", label: "Become a Vendor" },
                  { href: "/contact", label: "Contact" },
                  { href: "/bulk-order", label: "Bulk Orders" },
                ].map(({ href, label }) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-white transition-transform transform hover:scale-110">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div className="w-full sm:w-1/2 lg:w-1/4 text-center sm:text-left">
              <h3 className="text-lg font-semibold text-white mb-4">Customer Service</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { href: "/faq", label: "FAQs" },
                  { href: "/shipping-and-delivery", label: "Shipping & Delivery" },
                  { href: "/returns-and-refunds", label: "Returns & Refunds" },
                  { href: "/privacy-policy", label: "Privacy Policy" },
                  { href: "/terms", label: "Terms & Conditions" },
                ].map(({ href, label }) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-white transition-transform transform hover:scale-110">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="w-full sm:w-1/2 lg:w-1/4 text-center sm:text-left">
              <h3 className="text-lg font-semibold text-white mb-4">Stay Updated with RUACH E-STORE</h3>
              <p className="text-sm leading-relaxed mb-4">
                Get exclusive updates on new products, special discounts, and latest arrivals from our trusted vendors delivered straight to your inbox.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setEmail("")
                  toast({
                    title: "Subscribed!",
                    description: "You'll receive our next newsletter soon.",
                  })
                }}
                className="flex flex-col w-full max-w-md mx-auto sm:mx-0 gap-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                                    className="w-full rounded-md border border-gray-300 px-4 py-2 h-10 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
                <button
                  type="submit"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-md transition-colors flex items-center justify-center"
                  aria-label="Subscribe"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Unique selling points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 text-center sm:text-left">
            {[
              { Icon: Truck, title: "Fast Delivery", desc: "Always on time" },
              { Icon: Shield, title: "Secure Payment", desc: "100% protected" },
              { Icon: CreditCard, title: "Quality Products", desc: "Authentic guarantee" },
              { Icon: Heart, title: "Customer Love", desc: "24/7 support" },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-center space-x-3">
                <Icon className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-700 pt-6 mt-10 text-sm text-gray-400 gap-4">
            <p className="mb-4 md:mb-0">© {currentYear} RUACH E-STORE. Partnered with Modanmic.</p>
            <div className="flex items-center flex-wrap justify-center md:justify-start gap-4">
              <span>We Accept</span>
              <img src="/visa.svg" alt="Visa" className="h-6 w-auto" />
              <img src="/mastercard.svg" alt="Mastercard" className="h-6 w-auto" />
              <img src="/paypal.svg" alt="Paypal" className="h-6 w-auto" />
              <a
                href="https://wa.me/2348160662997"
                target="_blank"
                rel="noopener noreferrer"
                suppressHydrationWarning
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full flex items-center transition-transform transform hover:scale-110 text-sm"
              >
                <Phone className="h-4 w-4 mr-1" /> WhatsApp
              </a>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Back to top"
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-transform transform hover:scale-110"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
