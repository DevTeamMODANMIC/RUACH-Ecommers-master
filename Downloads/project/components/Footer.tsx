import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-red-700 to-orange-700 text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <Heart className="w-8 h-8 text-orange-300 mr-3 fill-current" />
              <h3 className="text-2xl font-serif">Practical Love</h3>
            </div>
            <p className="text-orange-100 leading-relaxed mb-6 max-w-md">
              Discover the winning power behind all human endeavours through practical, 
              biblical principles of love that transform lives, relationships, and communities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-orange-100 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/characteristics" className="text-orange-100 hover:text-white transition-colors">
                  Characteristics of Love
                </Link>
              </li>
              <li>
                <Link to="/bible-passages" className="text-orange-100 hover:text-white transition-colors">
                  Bible Passages
                </Link>
              </li>
              <li>
                <Link to="/love-in-nigeria" className="text-orange-100 hover:text-white transition-colors">
                  Love in Nigeria
                </Link>
              </li>
              <li>
                <Link to="/testimonies" className="text-orange-100 hover:text-white transition-colors">
                  Testimonies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-orange-300 mr-3" />
                <span className="text-orange-100">info@practicallove.org</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-orange-300 mr-3" />
                <span className="text-orange-100">+234 123 456 7890</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-orange-300 mr-3 mt-1" />
                <span className="text-orange-100">Lagos, Nigeria</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-red-600 pt-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-lg font-semibold mb-4">Stay Connected</h4>
            <p className="text-orange-100 mb-6">
              Get weekly insights on practical love delivered to your inbox
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-red-600 border border-red-500 rounded-l-lg focus:outline-none focus:border-orange-300 text-white placeholder-orange-200"
              />
              <button className="bg-orange-500 px-6 py-3 rounded-r-lg hover:bg-orange-400 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-red-600 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-orange-200 text-sm mb-4 md:mb-0">
            © 2024 Practical Love. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-orange-200 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-orange-200 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-orange-200 hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}