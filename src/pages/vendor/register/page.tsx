"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Store, 
  Wrench, 
  Package, 
  Calendar, 
  Users, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  ShoppingBag,
  Clock
} from "lucide-react"
import VendorForm from "./vendor-form"
import ServiceProviderForm from "./service-provider-form"

type SelectionType = "vendor" | "service-provider" | null

const vendorBenefits = [
  "Sell physical products online",
  "Manage inventory and orders", 
  "Reach customers nationwide",
  "Built-in payment processing",
  "Marketing and promotion tools",
  "Detailed sales analytics"
]

const serviceProviderBenefits = [
  "Offer professional services",
  "Manage bookings and appointments",
  "Set your own service areas", 
  "Flexible pricing options",
  "Calendar integration",
  "Customer review system"
]

const serviceCategories = [
  "Plumbing & Electrical",
  "Event Planning", 
  "Cleaning Services",
  "Beauty & Wellness",
  "Tutoring & Education",
  "Photography",
  "Repairs & Maintenance",
  "Catering Services"
]

export default function VendorServiceSelection() {
  const [selectedType, setSelectedType] = useState<SelectionType>(null)

  if (selectedType === "vendor") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="container mx-auto px-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => setSelectedType(null)}
              className="mb-6 bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              ← Back to Selection
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Become a Product Vendor
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Start selling your products to customers across Nigeria
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="rounded-full w-16 h-16 bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Easy Setup</h3>
                <p className="text-sm text-white/80">Get your store online in minutes</p>
              </div>
              <div className="text-center">
                <div className="rounded-full w-16 h-16 bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Grow Your Business</h3>
                <p className="text-sm text-white/80">Reach more customers online</p>
              </div>
              <div className="text-center">
                <div className="rounded-full w-16 h-16 bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Increase Sales</h3>
                <p className="text-sm text-white/80">Boost your revenue with our platform</p>
              </div>
            </div>
          </div>
        </div>
        
        <VendorForm />

        {/* Benefits Section */}
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-xl mx-auto bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Why Choose RUACH for Selling Products?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">No Setup Fees</h3>
                  <p className="text-gray-600 text-sm">Start selling without any upfront costs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Marketing Support</h3>
                  <p className="text-gray-600 text-sm">We help promote your products</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Secure Payments</h3>
                  <p className="text-gray-600 text-sm">Safe and reliable payment processing</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">24/7 Support</h3>
                  <p className="text-gray-600 text-sm">Get help whenever you need it</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedType === "service-provider") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="py-16 bg-gradient-to-r from-green-600 to-green-800">
          <div className="container mx-auto px-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => setSelectedType(null)}
              className="mb-6 bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              ← Back to Selection
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Become a Service Provider
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Offer your professional services to customers across Nigeria
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="rounded-full w-16 h-16 bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Professional Services</h3>
                <p className="text-sm text-white/80">Offer your expertise to customers</p>
              </div>
              <div className="text-center">
                <div className="rounded-full w-16 h-16 bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Booking Management</h3>
                <p className="text-sm text-white/80">Manage appointments seamlessly</p>
              </div>
              <div className="text-center">
                <div className="rounded-full w-16 h-16 bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibent mb-2 text-white">Grow Your Clientele</h3>
                <p className="text-sm text-white/80">Connect with more customers</p>
              </div>
            </div>
          </div>
        </div>
        
        <ServiceProviderForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-green-600">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Join the RUACH Platform
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Whether you sell products or offer services, we have the perfect platform 
            to help you grow your business and reach more customers.
          </p>
        </div>
      </div>

      {/* Selection Cards */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Vendor Card */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Store className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl md:text-3xl text-gray-900 mb-3">
                Product Vendor
              </CardTitle>
              <p className="text-gray-600 text-lg">
                Sell physical products like food, beverages, spices, and more
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-lg">What you can do:</h4>
                <div className="space-y-2">
                  {vendorBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={() => setSelectedType("vendor")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-xl"
                  size="lg"
                >
                  Become a Product Vendor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Service Provider Card */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-green-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wrench className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl md:text-3xl text-gray-900 mb-3">
                Service Provider
              </CardTitle>
              <p className="text-gray-600 text-lg">
                Offer professional services like plumbing, event planning, cleaning, and more
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-lg">What you can do:</h4>
                <div className="space-y-2">
                  {serviceProviderBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={() => setSelectedType("service-provider")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg rounded-xl"
                  size="lg"
                >
                  Become a Service Provider
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Service Categories Preview */}
      <div className="container mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Service Categories
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of service providers across various categories
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {serviceCategories.map((category, index) => (
            <div key={index} className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm md:text-base font-medium text-gray-900">{category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Not Sure Which One to Choose?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Contact our team for guidance on the best option for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" className="px-8 py-6 text-lg">
              <a href="https://wa.me/2348160662997" target="_blank" rel="noopener noreferrer">
                <Clock className="mr-2 h-5 w-5" />
                Chat with Support
              </a>
            </Button>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 px-8 py-6 text-lg">
              <a href="mailto:support@ruachestore.com">
                Email Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}