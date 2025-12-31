"use client"

import { Shield, Truck, Clock, Award, Users, Star, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const trustSignals = [
  {
    icon: Shield,
    title: "Secure Shopping",
    description: "SSL encrypted checkout with secure payment processing",
    color: "text-green-600"
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Free UK delivery on orders over £50, next-day available",
    color: "text-blue-600"
  },
  {
    icon: Clock,
    title: "Fresh Guarantee",
    description: "All products checked for freshness before dispatch",
    color: "text-purple-600"
  },
  {
    icon: Award,
    title: "Quality Assured",
    description: "Authentic products sourced directly from trusted suppliers",
    color: "text-amber-600"
  }
]

const stats = [
  { number: "10,000+", label: "Happy Customers" },
  { number: "500+", label: "Products Available" },
  { number: "4.8/5", label: "Customer Rating" },
  { number: "99%", label: "Delivery Success" }
]

export default function TrustSignals() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-soft-lg my-12">
      <div className="container mx-auto px-4">
        {/* Trust Features */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Grova?</h2>
          <div className="w-20 h-1 bg-green-600 rounded mx-auto mb-4"></div>
          <p className="text-gray-700 max-w-xl mx-auto text-base font-medium">
            We're committed to bringing you the finest African and international foods with unmatched quality and service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {trustSignals.map((signal, index) => (
            <Card key={index} className="border-0 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 bg-white rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4 ${signal.color}`}>
                  <signal.icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{signal.title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{signal.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Statistics */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 text-white shadow-soft-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-green-50 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Reviews Preview */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">What Our Customers Say</h3>
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
              ))}
              <span className="ml-2 text-gray-700 text-base font-semibold">4.8 out of 5 stars</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah M.",
                location: "London",
                review: "Amazing quality products! The African spices are so authentic, just like back home. Fast delivery too!",
                rating: 5
              },
              {
                name: "David K.",
                location: "Manchester",
                review: "Great selection of international foods. The customer service is excellent and prices are very reasonable.",
                rating: 5
              },
              {
                name: "Amara O.",
                location: "Birmingham",
                review: "Finally found a reliable source for authentic African ingredients. The bulk ordering option is perfect for my restaurant.",
                rating: 5
              }
            ].map((review, index) => (
              <Card key={index} className="border-0 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 bg-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic text-sm leading-relaxed font-medium">"{review.review}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-soft">
                      <span className="text-white font-bold text-sm">
                        {review.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{review.name}</div>
                      <div className="text-xs text-gray-600">{review.location}</div>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}