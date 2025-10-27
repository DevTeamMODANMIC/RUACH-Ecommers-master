"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Store, 
  TrendingUp, 
  Users, 
  Shield, 
  Package, 
  CheckCircle,
  Star,
  Phone,
  Mail,
  ArrowRight,
  Zap,
  Target,
  Globe,
  BarChart,
  CreditCard,
  Headphones
} from "lucide-react"

const onboardingSteps = [
  {
    step: 1,
    title: "Registration",
    description: "Complete your vendor registration with business details",
    duration: "5 minutes"
  },
  {
    step: 2,
    title: "Verification",
    description: "Submit required documents for business verification",
    duration: "1-2 days"
  },
  {
    step: 3,
    title: "Store Setup",
    description: "Customize your store and upload your first products",
    duration: "30 minutes"
  },
  {
    step: 4,
    title: "Go Live",
    description: "Your store goes live and customers can start purchasing",
    duration: "Instant"
  }
]

const vendorBenefits = [
  {
    icon: Users,
    title: "Large Customer Base",
    description: "Access to thousands of active customers across Nigeria"
  },
  {
    icon: TrendingUp,
    title: "Sales Growth",
    description: "Proven track record of helping vendors grow their sales by 300%+"
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Safe and secure transactions with fraud protection"
  },
  {
    icon: Zap,
    title: "Easy Management",
    description: "User-friendly dashboard to manage orders, inventory, and analytics"
  },
  {
    icon: CreditCard,
    title: "Fast Payments",
    description: "Quick and reliable payment processing with multiple payout options"
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated support team to help you succeed on our platform"
  }
]

const requiredDocuments = [
  "Valid Government ID (National ID, Driver's License, or Passport)",
  "Business Registration Certificate (CAC Certificate)",
  "Tax Identification Number (TIN)",
  "Bank Account Details for payments",
  "Business Address Verification",
  "Product Photos and Descriptions"
]

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for new businesses getting started",
    features: [
      "Up to 50 products",
      "5% transaction fee", 
      "Basic analytics",
      "Email support",
      "Standard listing"
    ],
    popular: false
  },
  {
    name: "Growth",
    price: "₦15,000/month",
    description: "For established businesses ready to scale",
    features: [
      "Up to 500 products",
      "3% transaction fee",
      "Advanced analytics", 
      "Priority support",
      "Featured listings",
      "Marketing tools"
    ],
    popular: true
  },
  {
    name: "Enterprise", 
    price: "Custom",
    description: "For large businesses with custom needs",
    features: [
      "Unlimited products",
      "2% transaction fee",
      "Custom analytics",
      "Dedicated manager",
      "Premium placement",
      "API access"
    ],
    popular: false
  }
]

export default function VendorOnboardingService() {
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "",
    message: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Vendor inquiry:", inquiryForm)
    alert("Thank you for your interest! Our team will contact you within 24 hours.")
    setInquiryForm({ name: "", email: "", phone: "", businessName: "", businessType: "", message: "" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full w-20 h-20 bg-white/20 flex items-center justify-center">
              <Store className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Become a RUACH Vendor
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Join thousands of successful vendors selling on Nigeria's fastest growing 
            e-commerce platform. Start growing your business today.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">5,000+</div>
              <div className="text-white/80">Active Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">100K+</div>
              <div className="text-white/80">Monthly Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">₦50M+</div>
              <div className="text-white/80">Monthly Sales</div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Sell on RUACH?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join a platform designed to help your business succeed and grow
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vendorBenefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="rounded-full w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Onboarding Process */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple 4-Step Onboarding</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get your store online and start selling in less than a week
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {onboardingSteps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="rounded-full w-16 h-16 bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{step.title}</h3>
                <p className="text-gray-600 mb-2">{step.description}</p>
                <div className="text-sm text-blue-600 font-medium">{step.duration}</div>
                {index < onboardingSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <ArrowRight className="h-6 w-6 text-gray-400 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Required Documents */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What You'll Need</h2>
              <p className="text-lg text-gray-600">
                Prepare these documents to speed up your verification process
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requiredDocuments.map((document, index) => (
                <div key={index} className="flex items-start space-x-3 bg-white p-4 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{document}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Flexible pricing options to match your business size and goals
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-green-500 border-2 shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{plan.price}</div>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                    onClick={() => window.location.href = '/vendor/register'}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-gray-600">
                Have questions? Contact our vendor success team for personalized assistance
              </p>
            </div>
            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <Input
                        type="text"
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm({...inquiryForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm({...inquiryForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({...inquiryForm, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name
                      </label>
                      <Input
                        type="text"
                        value={inquiryForm.businessName}
                        onChange={(e) => setInquiryForm({...inquiryForm, businessName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={inquiryForm.businessType}
                      onChange={(e) => setInquiryForm({...inquiryForm, businessType: e.target.value})}
                      required
                    >
                      <option value="">Select business type</option>
                      <option value="food-beverages">Food & Beverages</option>
                      <option value="electronics">Electronics & Gadgets</option>
                      <option value="fashion">Fashion & Clothing</option>
                      <option value="beauty">Beauty & Personal Care</option>
                      <option value="home-garden">Home & Garden</option>
                      <option value="health">Health & Wellness</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Questions or Comments
                    </label>
                    <Textarea
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})}
                      placeholder="Tell us about your business and how we can help..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Submit Application
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Nigeria's Fastest Growing E-commerce Platform
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Over 5,000 vendors trust RUACH to grow their business. Start your success story today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100"
              onClick={() => window.location.href = '/vendor/register'}
            >
              Start Selling Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-green-600"
              onClick={() => window.location.href = 'tel:+2348160662997'}
            >
              <Phone className="mr-2 h-5 w-5" />
              Speak to Our Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}