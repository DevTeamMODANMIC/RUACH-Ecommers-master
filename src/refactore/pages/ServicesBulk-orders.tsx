import { useState } from "react"

import Link from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { 
  Package, 
  TrendingDown, 
  Users, 
  Calculator, 
  CheckCircle,
  Building,
  Truck,
  Clock,
  ArrowLeft,
  Phone,
  Mail,
  FileText,
  Star,
  ChevronRight
} from "lucide-react"

const bulkTiers = [
  {
    tier: "Starter Bulk",
    minOrder: "₦50,000",
    discount: "5-10%",
    features: ["Minimum order ₦50,000", "5-10% discount", "Priority support", "Flexible payment terms"],
    recommended: false,
    color: "border-blue-200 bg-blue-50"
  },
  {
    tier: "Business Plus",
    minOrder: "₦150,000", 
    discount: "10-15%",
    features: ["Minimum order ₦150,000", "10-15% discount", "Dedicated account manager", "Custom packaging", "Extended credit terms"],
    recommended: true,
    color: "border-green-500 bg-green-50"
  },
  {
    tier: "Enterprise",
    minOrder: "₦500,000",
    discount: "15-25%",
    features: ["Minimum order ₦500,000", "15-25% discount", "White-label options", "Priority shipping", "Custom contracts", "Volume guarantees"],
    recommended: false,
    color: "border-purple-200 bg-purple-50"
  }
]

const businessTypes = [
  {
    type: "Restaurants & Cafes",
    icon: "🍽️",
    description: "Fresh ingredients and specialty items for food service",
    benefits: ["Consistent supply", "Quality guaranteed", "Competitive pricing"]
  },
  {
    type: "Retail Stores",
    icon: "🏪",
    description: "Stock your shelves with authentic African products",
    benefits: ["Popular products", "Marketing support", "Display materials"]
  },
  {
    type: "Event Planners",
    icon: "🎉",
    description: "Bulk catering supplies for events and celebrations",
    benefits: ["Event-sized quantities", "Timely delivery", "Flexible ordering"]
  },
  {
    type: "Corporate Offices",
    icon: "🏢",
    description: "Office pantry supplies and corporate catering",
    benefits: ["Regular deliveries", "Invoice billing", "Account management"]
  }
]

const testimonials = [
  {
    name: "James Okonkwo",
    business: "Taste of Lagos Restaurant",
    content: "RUACH's bulk ordering has transformed our supply chain. We save 20% on ingredients and never run out of stock.",
    rating: 5,
    savings: "20% cost reduction"
  },
  {
    name: "Sarah Ahmed",
    business: "Afro Foods Market",
    content: "The dedicated account manager and flexible payment terms help us manage cash flow better.",
    rating: 5,
    savings: "30-day payment terms"
  },
  {
    name: "Michael Chen",
    business: "Global Catering Services", 
    content: "Custom packaging with our logo has enhanced our brand presence at events.",
    rating: 5,
    savings: "Custom branding"
  }
]

const process = [
  {
    step: 1,
    title: "Submit Inquiry",
    description: "Tell us about your business and bulk requirements"
  },
  {
    step: 2,
    title: "Get Custom Quote",
    description: "Receive personalized pricing within 24 hours"
  },
  {
    step: 3,
    title: "Review Terms",
    description: "Discuss payment, delivery, and contract terms"
  },
  {
    step: 4,
    title: "Place Order",
    description: "Confirm your bulk order and delivery schedule"
  },
  {
    step: 5,
    title: "Delivery & Support",
    description: "Receive your products with ongoing account support"
  }
]

export default function BulkOrdersServicePage() {
  const [selectedTier, setSelectedTier] = useState(1)
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    businessType: "",
    monthlyVolume: "",
    requirements: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement form submission
    console.log("Bulk order inquiry:", formData)
    alert("Thank you for your inquiry! Our bulk sales team will contact you within 24 hours.")
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/services" className="hover:text-green-600 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Services
            </Link>
            <span>/</span>
            <span className="text-gray-900">Bulk Order Solutions</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-600 rounded-xl">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Bulk Order Solutions
                </h1>
              </div>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Power your business with wholesale pricing on authentic African and 
                international food products. From restaurants to retail stores, 
                we've got your bulk supply needs covered.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <TrendingDown className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-bold text-2xl text-gray-900">Up to 25%</p>
                  <p className="text-sm text-gray-600">Cost Savings</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-bold text-2xl text-gray-900">500+</p>
                  <p className="text-sm text-gray-600">Business Customers</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-full">
                  <Calculator className="mr-2 h-5 w-5" />
                  Get Custom Quote
                </Button>
                <Button size="lg" variant="outline" asChild className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-6 text-lg rounded-full">
                  <a href="https://wa.me/2348160662997" target="_blank" rel="noopener noreferrer">
                    <Phone className="mr-2 h-5 w-5" />
                    Speak with Expert
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80"
                  alt="Bulk Orders and Wholesale"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Flexible Bulk Pricing Tiers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the bulk pricing tier that matches your business needs. 
              Larger orders unlock better pricing and enhanced services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {bulkTiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative transition-all duration-300 hover:shadow-lg ${tier.color} ${
                  tier.recommended ? 'ring-2 ring-green-500 scale-105' : ''
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    {tier.tier}
                  </CardTitle>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">{tier.minOrder}</span>
                    <span className="text-gray-600"> minimum</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {tier.discount} OFF
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${tier.recommended ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                    onClick={() => setSelectedTier(index)}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Business Types */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perfect for Every Business Type
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're running a restaurant, retail store, or corporate office, 
              our bulk solutions are tailored to your industry needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessTypes.map((business, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4">{business.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {business.type}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {business.description}
                  </p>
                  <ul className="space-y-1">
                    {business.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="text-xs text-gray-500 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories from Our Business Partners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div className="mb-3">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.business}</p>
                  </div>
                  <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    {testimonial.savings}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Bulk Ordering Process
            </h2>
            <p className="text-lg text-gray-600">
              Get started with bulk orders in 5 easy steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {process.map((step, index) => (
              <div key={index} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                  {index < process.length - 1 && (
                    <div className="w-0.5 h-16 bg-green-200 mx-auto mt-4"></div>
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Request Your Custom Bulk Quote
              </h2>
              <p className="text-lg text-gray-600">
                Fill out this form and our bulk sales team will contact you within 24 hours
              </p>
            </div>

            <Card className="shadow-lg">
              <CardContent className="p-8">
                <form onSubmit={handleSubmitInquiry} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Business Name *</label>
                      <Input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        placeholder="Your business name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Contact Name *</label>
                      <Input
                        type="text"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Email Address *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="business@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Phone Number *</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+234 800 000 0000"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Business Type</label>
                      <Input
                        type="text"
                        value={formData.businessType}
                        onChange={(e) => handleInputChange('businessType', e.target.value)}
                        placeholder="e.g., Restaurant, Retail Store"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Expected Monthly Volume</label>
                      <Input
                        type="text"
                        value={formData.monthlyVolume}
                        onChange={(e) => handleInputChange('monthlyVolume', e.target.value)}
                        placeholder="e.g., ₦200,000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Specific Requirements</label>
                    <Textarea
                      rows={4}
                      value={formData.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                      placeholder="Tell us about your specific product needs, delivery requirements, or any other details..."
                    />
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg rounded-full">
                    <FileText className="mr-2 h-5 w-5" />
                    Submit Bulk Inquiry
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Save on Bulk Orders?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses already saving money and improving their supply chain with RUACH bulk solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-green-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full">
              <Link to="#inquiry-form">
                Get Your Quote
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-6 text-lg rounded-full">
              <a href="https://wa.me/2348160662997" target="_blank" rel="noopener noreferrer">
                <Phone className="mr-2 h-5 w-5" />
                Call Sales Team
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}