import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { 
  Truck, 
  Clock, 
  Shield, 
  MapPin, 
  Package, 
  CheckCircle,
  Star,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  Zap,
  Users,
  Target
} from "lucide-react"

const deliveryZones = [
  {
    name: "Lagos Mainland",
    duration: "Same Day",
    price: "₦1,500",
    areas: ["Yaba", "Surulere", "Ikeja", "Mushin", "Shomolu"]
  },
  {
    name: "Lagos Island", 
    duration: "Same Day",
    price: "₦2,000",
    areas: ["Victoria Island", "Ikoyi", "Lagos Island", "Lekki"]
  },
  {
    name: "Lagos Suburbs",
    duration: "1-2 Days", 
    price: "₦2,500",
    areas: ["Ajah", "Epe", "Badagry", "Ikorodu", "Alimosho"]
  },
  {
    name: "Other States",
    duration: "2-5 Days",
    price: "₦3,000+",
    areas: ["Abuja", "Kano", "Port Harcourt", "Ibadan", "Other Cities"]
  }
]

const deliveryFeatures = [
  {
    icon: Clock,
    title: "Fast Delivery",
    description: "Same day delivery within Lagos, 2-5 days nationwide"
  },
  {
    icon: Shield,
    title: "Secure Handling", 
    description: "Your packages are handled with care and tracked in real-time"
  },
  {
    icon: Package,
    title: "Flexible Options",
    description: "Standard, express, and bulk delivery options available"
  },
  {
    icon: MapPin,
    title: "Wide Coverage",
    description: "We deliver to all 36 states in Nigeria"
  }
]

const testimonials = [
  {
    name: "Adeyemi Johnson",
    location: "Ikeja, Lagos", 
    rating: 5,
    comment: "RUACH delivery is incredibly fast and reliable. My order arrived the same day!"
  },
  {
    name: "Sarah Okafor",
    location: "Abuja",
    rating: 5, 
    comment: "Even though I'm in Abuja, my package arrived in just 2 days. Excellent service!"
  },
  {
    name: "Michael Eze",
    location: "Victoria Island",
    rating: 5,
    comment: "The tracking system is amazing. I knew exactly when my delivery would arrive."
  }
]

export default function DeliveryService() {
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    serviceType: "",
    message: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Delivery inquiry:", inquiryForm)
    alert("Thank you for your inquiry! We'll contact you within 24 hours.")
    setInquiryForm({ name: "", email: "", phone: "", location: "", serviceType: "", message: "" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full w-20 h-20 bg-white/20 flex items-center justify-center">
              <Truck className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Fast & Reliable Delivery
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Get your orders delivered quickly and safely across Nigeria. 
            Same day delivery in Lagos, nationwide coverage.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">Same Day</div>
              <div className="text-white/80">Lagos Delivery</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">36 States</div>
              <div className="text-white/80">Nationwide Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-white/80">Secure Delivery</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Delivery Service?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide reliable, fast, and secure delivery services across Nigeria
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {deliveryFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="rounded-full w-16 h-16 bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Zones */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Delivery Zones & Pricing</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our flexible delivery options based on your location
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deliveryZones.map((zone, index) => (
              <Card key={index} className="border-2 hover:border-blue-500 transition-colors">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{zone.name}</CardTitle>
                  <div className="text-2xl font-bold text-blue-600">{zone.price}</div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {zone.duration}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium mb-2">Areas covered:</div>
                    <ul className="space-y-1">
                      {zone.areas.map((area, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Our Delivery Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, fast, and transparent delivery process
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="rounded-full w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Place Your Order</h3>
              <p className="text-gray-600">Browse products and add them to your cart</p>
            </div>
            <div className="text-center">
              <div className="rounded-full w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">We Process</h3>
              <p className="text-gray-600">Your order is prepared and packaged securely</p>
            </div>
            <div className="text-center">
              <div className="rounded-full w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Out for Delivery</h3>
              <p className="text-gray-600">Track your package in real-time</p>
            </div>
            <div className="text-center">
              <div className="rounded-full w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Delivered</h3>
              <p className="text-gray-600">Receive your order at your doorstep</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Testimonials */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600">Real experiences from satisfied customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Custom Delivery?</h2>
              <p className="text-lg text-gray-600">
                Contact us for special delivery requirements or bulk shipments
              </p>
            </div>
            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
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
                        Delivery Location
                      </label>
                      <Input
                        type="text"
                        value={inquiryForm.location}
                        onChange={(e) => setInquiryForm({...inquiryForm, location: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type Needed
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={inquiryForm.serviceType}
                      onChange={(e) => setInquiryForm({...inquiryForm, serviceType: e.target.value})}
                      required
                    >
                      <option value="">Select service type</option>
                      <option value="express">Express Delivery</option>
                      <option value="bulk">Bulk Delivery</option>
                      <option value="scheduled">Scheduled Delivery</option>
                      <option value="custom">Custom Delivery Solution</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Details
                    </label>
                    <Textarea
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})}
                      placeholder="Tell us more about your delivery requirements..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Submit Inquiry
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Your Orders Delivered?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Start shopping and experience our fast, reliable delivery service
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => window.location.href = '/shop'}
            >
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={() => window.location.href = 'tel:+2348160662997'}
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Us Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}