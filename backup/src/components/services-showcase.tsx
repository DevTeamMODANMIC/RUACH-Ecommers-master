"use client"

import {Link} from "react-router-dom"
// import { Button } from "./ui/button"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { 
  Truck, 
  ShoppingBag, 
  Store, 
  Headphones, 
  ArrowRight,
  Clock,
  Shield,
  Users,
  Star,
  CheckCircle
} from "lucide-react"

const services = [
  {
    id: "delivery",
    title: "Fast Delivery",
    description: "Same day delivery in Lagos, nationwide coverage across Nigeria",
    icon: Truck,
    color: "blue",
    features: ["Same day delivery", "Real-time tracking", "Secure handling", "36 states coverage"],
    href: "/services/delivery",
    stats: { metric: "Same Day", label: "Lagos Delivery" }
  },
  {
    id: "bulk-orders",
    title: "Bulk Orders",
    description: "Special pricing and dedicated support for bulk purchases",
    icon: ShoppingBag,
    color: "green", 
    features: ["Volume discounts", "Custom quotes", "Priority processing", "Dedicated manager"],
    href: "/services/bulk-orders",
    stats: { metric: "Up to 30%", label: "Bulk Savings" }
  },
  {
    id: "vendor-onboarding",
    title: "Sell with Us",
    description: "Join thousands of vendors growing their business on RUACH",
    icon: Store,
    color: "purple",
    features: ["Easy setup", "Large customer base", "Marketing support", "Fast payments"],
    href: "/services/vendor-onboarding",
    stats: { metric: "5,000+", label: "Active Vendors" }
  },
  {
    id: "customer-support",
    title: "24/7 Support",
    description: "Expert support team ready to help with any questions or issues",
    icon: Headphones,
    color: "orange",
    features: ["Multiple channels", "Fast response", "Expert team", "Issue resolution"],
    href: "/services/customer-support", 
    stats: { metric: "< 2 min", label: "Response Time" }
  }
]

const getColorClasses = (color: string) => {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
      accent: "text-blue-600"
    },
    green: {
      bg: "bg-green-50",
      iconBg: "bg-green-100", 
      iconColor: "text-green-600",
      button: "bg-green-600 hover:bg-green-700",
      accent: "text-green-600"
    },
    purple: {
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600", 
      button: "bg-purple-600 hover:bg-purple-700",
      accent: "text-purple-600"
    },
    orange: {
      bg: "bg-orange-50",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      button: "bg-orange-600 hover:bg-orange-700", 
      accent: "text-orange-600"
    }
  }
  return colorMap[color as keyof typeof colorMap] || colorMap.blue
}

export default function ServicesShowcase() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Services for Your Success
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Beyond just an online marketplace, we provide comprehensive services 
            to support your buying and selling needs across Nigeria.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Trusted by 100K+ customers</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span>5,000+ active vendors</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span>4.8/5 average rating</span>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {services.map((service) => {
            const colors = getColorClasses(service.color)
            const IconComponent = service.icon
            
            return (
              <Card key={service.id} className={`${colors.bg} border-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className={`rounded-full w-16 h-16 ${colors.iconBg} flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className={`h-8 w-8 ${colors.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                    
                    {/* Key Stats */}
                    <div className="text-center mb-4">
                      <div className={`text-2xl font-bold ${colors.accent}`}>{service.stats.metric}</div>
                      <div className="text-xs text-gray-500">{service.stats.label}</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link href={service.href} className="block">
                    <Button className={`w-full ${colors.button} text-white`} size="sm">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Experience Our Services?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Whether you're looking to buy, sell, or need support, we have the right service for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Explore All Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/vendor/register">
              <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                <Store className="mr-2 h-5 w-5" />
                Become a Vendor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}