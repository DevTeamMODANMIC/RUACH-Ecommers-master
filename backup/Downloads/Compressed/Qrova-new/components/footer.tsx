"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, Send, ChevronUp } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState("")
  const { toast } = useToast()

  return (
    <footer className="mt-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">Grova</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Your everyday grocery shop for authentic international foods delivered fresh to your door.
            </p>
            <div className="flex space-x-3">
              {[
                { Icon: Facebook, href: "#", label: "Facebook" },
                { Icon: Instagram, href: "#", label: "Instagram" },
                { Icon: Twitter, href: "#", label: "Twitter" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-emerald-500 hover:to-teal-600 hover:text-white transition-all shadow-sm hover:shadow-lg hover:scale-110"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { href: "/about", label: "About Us" },
                { href: "/shop", label: "Shop" },
                { href: "/contact", label: "Contact" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-gray-600 hover:text-emerald-600 transition-colors inline-block font-medium hover:translate-x-1 transform transition-transform"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wider">Help</h4>
            <ul className="space-y-3">
              {[
                { href: "/faq", label: "FAQs" },
                { href: "/shipping", label: "Shipping" },
                { href: "/returns", label: "Returns" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-gray-600 hover:text-emerald-600 transition-colors inline-block font-medium hover:translate-x-1 transform transition-transform"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wider">Stay Updated</h4>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Subscribe for exclusive deals and updates delivered to your inbox.
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
                className="flex gap-2"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Your email"
                  className="flex-1 text-sm px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white shadow-sm"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl"
                  aria-label="Subscribe"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <div className="pt-3 space-y-3">
                <p className="text-sm text-gray-600 flex items-center font-medium">
                  <Mail className="h-4 w-4 mr-3 text-emerald-600" />
                  info@grova.co.uk
                </p>
                <p className="text-sm text-gray-600 flex items-center font-medium">
                  <Phone className="h-4 w-4 mr-3 text-emerald-600" />
                  +44 20 1234 5678
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-200 pt-8 text-sm text-gray-500">
          <p className="mb-4 md:mb-0 font-medium">© {currentYear} Grova. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-emerald-600 transition-colors font-medium">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-emerald-600 transition-colors font-medium">Terms of Service</Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-700 font-semibold transition-all shadow-sm hover:shadow-md"
            >
              <ChevronUp className="h-4 w-4 mr-1" />
              Back to Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}