import { Link } from "react-router-dom";
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import ServiceProvidersShowcase from "../components/service-providers-showcase"
import { 
  Search,
  Star,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Award,
  Shield,
  ThumbsUp
} from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Service Providers"
  },
  {
    icon: Star,
    value: "4.8",
    label: "Average Rating"
  },
  {
    icon: CheckCircle,
    value: "10K+",
    label: "Services Completed"
  },
  {
    icon: Shield,
    value: "100%",
    label: "Verified Providers"
  }
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Trusted Service Providers
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Connect with verified, professional service providers across Nigeria. 
            Find experts you can trust for all your service needs.
          </p>
          
          {/* Quick Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for service providers..."
                  className="w-full px-4 py-3 pl-12 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
              <Link to="/services/marketplace">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
                  Browse Services
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-6 w-6 text-white/80" />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Providers */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Service Providers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with verified professionals who deliver exceptional service quality
            </p>
          </div>

          <ServiceProvidersShowcase />

          {/* Browse All Button */}
          <div className="text-center mt-12">
            <Link to="/services/marketplace">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Search className="mr-2 h-5 w-5" />
                Browse All Services
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Finding and booking trusted service providers is simple with our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Find Providers",
                description: "Browse verified service providers in your area and compare their profiles and ratings"
              },
              {
                step: "2", 
                title: "Check Reviews",
                description: "Read authentic reviews from previous customers to make an informed decision"
              },
              {
                step: "3",
                title: "Contact & Book", 
                description: "Contact providers directly or browse their services to book what you need"
              },
              {
                step: "4",
                title: "Get Quality Service",
                description: "Enjoy professional service delivery from verified and trusted providers"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="rounded-full w-12 h-12 bg-blue-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Help Finding a Service?</h2>
              <p className="text-lg text-gray-600">
                Our support team is here to help you find the perfect service provider
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="rounded-full w-16 h-16 bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Call Us</h3>
                  <p className="text-gray-600 mb-3">Speak directly with our team</p>
                  <p className="font-semibold text-blue-600">+2347054915173</p>
                  <p className="text-sm text-gray-500">Mon-Sat: 8AM - 8PM</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="rounded-full w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
                  <p className="text-gray-600 mb-3">Get instant help online</p>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Start Chat
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">Available 24/7</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="rounded-full w-16 h-16 bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Email Us</h3>
                  <p className="text-gray-600 mb-3">Send us your inquiry</p>
                  <p className="font-semibold text-purple-600">support@ruachestore.com.ng</p>
                  <p className="text-sm text-gray-500">Response within 4 hours</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Connect with Providers?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust our verified service providers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services/marketplace">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Search className="mr-2 h-5 w-5" />
                Browse Services
              </Button>
            </Link>
            <Link to="/vendor/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Become a Provider
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}