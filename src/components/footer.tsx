import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
  Mail,
  Phone,
  Truck,
  CreditCard,
  Shield,
  Heart,
  Send,
  ChevronUp,
  Clock,
  Headphones,
  Package,
  ArrowRight,
} from "lucide-react"
import { useState } from "react"
import { useToast } from "../../src/components/ui/use-toast"
import React from "react"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState("")
  const [isHovered, setIsHovered] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setEmail("")
    toast({
      title: "🎉 Welcome aboard!",
      description: "You're now part of the RUACH family. Check your inbox soon!",
    })
  }

  return (
    <footer className="mt-16 select-none">
      {/* Features Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { Icon: Truck, title: "Free Delivery", desc: "On orders over ₦50,000" },
              { Icon: Shield, title: "Secure Payment", desc: "100% protected checkout" },
              { Icon: Package, title: "Easy Returns", desc: "30-day return policy" },
              { Icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
            ].map(({ Icon, title, desc }) => (
              <div 
                key={title} 
                className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 cursor-default group"
              >
                <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-green-100">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-gray-300 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Newsletter Section */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl p-6 md:p-8 mb-12 border border-green-500/20 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Join Our Newsletter</h3>
                <p className="text-gray-400 max-w-md">
                  Get exclusive deals, new arrivals, and insider-only discounts delivered to your inbox.
                </p>
              </div>
              <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
                <div className="relative flex-1 md:w-72">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 flex items-center gap-2 group"
                >
                  Subscribe
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-xl font-bold text-white">RUACH</span>
              </div>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Your trusted marketplace for authentic products. Quality guaranteed, delivered with care.
              </p>
              <div className="flex gap-3">
                {[
                  { Icon: Facebook, href: "#", label: "Facebook", color: "hover:bg-blue-600" },
                  { Icon: Instagram, href: "#", label: "Instagram", color: "hover:bg-pink-600" },
                  { Icon: Twitter, href: "#", label: "Twitter", color: "hover:bg-sky-500" },
                  { Icon: Youtube, href: "#", label: "Youtube", color: "hover:bg-red-600" },
                ].map(({ Icon, href, label, color }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className={`p-2.5 rounded-lg bg-white/5 ${color} transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                Quick Links
              </h4>
              <ul className="space-y-3">
                {[
                  { href: "/shop", label: "Shop All" },
                  { href: "/stores", label: "Browse Stores" },
                  { href: "/vendor/register", label: "Become a Vendor" },
                  { href: "/contact", label: "Contact Us" },
                  { href: "/bulk-order", label: "Bulk Orders" },
                ].map(({ href, label }) => (
                  <li key={label}>
                    <Link 
                      to={href} 
                      className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-1 group"
                      onMouseEnter={() => setIsHovered(label)}
                      onMouseLeave={() => setIsHovered(null)}
                    >
                      <ArrowRight className={`h-3 w-3 transition-all duration-300 ${isHovered === label ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                Services
              </h4>
              <ul className="space-y-3">
                {[
                  { href: "/services", label: "All Services" },
                  { href: "/services/delivery", label: "Fast Delivery" },
                  { href: "/services/bulk-orders", label: "Wholesale" },
                  { href: "/services/vendor-onboarding", label: "Vendor Support" },
                  { href: "/request-service", label: "Request Service" },
                ].map(({ href, label }) => (
                  <li key={label}>
                    <Link 
                      to={href} 
                      className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-1 group"
                      onMouseEnter={() => setIsHovered(label)}
                      onMouseLeave={() => setIsHovered(null)}
                    >
                      <ArrowRight className={`h-3 w-3 transition-all duration-300 ${isHovered === label ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-lime-500 rounded-full"></span>
                Support
              </h4>
              <ul className="space-y-3">
                {[
                  { href: "/faq", label: "FAQs" },
                  { href: "/shipping-and-delivery", label: "Shipping Info" },
                  { href: "/returns-and-refunds", label: "Returns" },
                  { href: "/privacy-policy", label: "Privacy Policy" },
                  { href: "/terms", label: "Terms of Service" },
                ].map(({ href, label }) => (
                  <li key={label}>
                    <Link 
                      to={href} 
                      className="text-sm text-gray-400 hover:text-lime-400 transition-colors flex items-center gap-1 group"
                      onMouseEnter={() => setIsHovered(label)}
                      onMouseLeave={() => setIsHovered(null)}
                    >
                      <ArrowRight className={`h-3 w-3 transition-all duration-300 ${isHovered === label ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
                Contact Us
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Lagos, Nigeria</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <a href="mailto:support@ruachestore.com.ng" className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                    support@ruachestore.com.ng
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <a href="tel:+2348160662997" className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                    +234 816 066 2997
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Mon - Sat: 8am - 8pm</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-500">
                <p>© {currentYear} RUACH E-STORE. All rights reserved.</p>
                <span className="hidden md:inline">•</span>
                <p>Powered by <span className="text-green-500 font-medium">MODANMIC</span></p>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">We Accept:</span>
                <div className="flex items-center gap-2">
                  {[
                    { name: 'Visa', color: '#1A1F71' },
                    { name: 'Mastercard', color: '#EB001B' },
                    { name: 'Verve', color: '#00425F' },
                  ].map((card) => (
                    <div key={card.name} className="px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                      <span className="text-xs font-semibold text-white">{card.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="https://wa.me/2348160662997"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
                >
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </a>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  aria-label="Back to top"
                  className="p-2.5 rounded-full bg-white/5 hover:bg-green-600 text-gray-400 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
