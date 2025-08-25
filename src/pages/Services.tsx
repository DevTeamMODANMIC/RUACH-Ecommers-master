import { Link } from "react-router-dom";
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { 
  Wrench,
  Zap,
  Sparkles,
  Calendar,
  UtensilsCrossed,
  Heart,
  Dumbbell,
  GraduationCap,
  Camera,
  Hammer,
  TreePine,
  Settings,
  ArrowRight,
  Search,
  Star,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageCircle
} from "lucide-react"

const serviceCategories: any[] = [
  // Service categories will be loaded from the database
]

const getColorClasses = (color: string) => {
  const colorMap = {
    blue: "from-blue-500 to-blue-600 text-blue-600 bg-blue-50 border-blue-200",
    yellow: "from-yellow-500 to-yellow-600 text-yellow-600 bg-yellow-50 border-yellow-200",
    green: "from-green-500 to-green-600 text-green-600 bg-green-50 border-green-200",
    purple: "from-purple-500 to-purple-600 text-purple-600 bg-purple-50 border-purple-200",
    orange: "from-orange-500 to-orange-600 text-orange-600 bg-orange-50 border-orange-200",
    pink: "from-pink-500 to-pink-600 text-pink-600 bg-pink-50 border-pink-200",
    red: "from-red-500 to-red-600 text-red-600 bg-red-50 border-red-200",
    indigo: "from-indigo-500 to-indigo-600 text-indigo-600 bg-indigo-50 border-indigo-200",
    gray: "from-gray-500 to-gray-600 text-gray-600 bg-gray-50 border-gray-200",
    amber: "from-amber-500 to-amber-600 text-amber-600 bg-amber-50 border-amber-200",
    emerald: "from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-50 border-emerald-200",
    slate: "from-slate-500 to-slate-600 text-slate-600 bg-slate-50 border-slate-200"
  }
  return colorMap[color as keyof typeof colorMap] || colorMap.blue
}

const stats: any[] = [
  // Stats will be loaded from the database
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Professional Services
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Connect with verified service providers across Nigeria. 
            From home repairs to event planning, we've got you covered.
          </p>
          
          {/* Quick Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="What service do you need?"
                  className="w-full px-4 py-3 pl-12 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
              <Link to="/services/marketplace">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
                  Find Services
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.length > 0 ? (
              stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="h-6 w-6 text-white/80" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-white/80 text-sm">{stat.label}</div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center">
                <div className="text-white/80">Platform statistics will be displayed here</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse Service Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the perfect service provider for your needs from our comprehensive categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {serviceCategories.length > 0 ? (
              serviceCategories.map((category) => {
                const IconComponent = category.icon
                const colorClasses = getColorClasses(category.color)
                
                return (
                  <Card key={category.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <div className={`rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ${colorClasses.split(' ')[2]} ${colorClasses.split(' ')[3]}`}>
                          <IconComponent className={`h-8 w-8 ${colorClasses.split(' ')[1]}`} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                        
                        {/* Category Stats */}
                        <div className="space-y-2 text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>Providers:</span>
                            <span className="font-medium">{category.providers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Price Range:</span>
                            <span className="font-medium">{category.avgPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rating:</span>
                            <span className="font-medium">{category.rating}★</span>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 mb-4">
                        {category.features.slice(0, 3).map((feature: string, index: number) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                        {category.features.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{category.features.length - 3} more services
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <Link to={`/services/marketplace?category=${category.id}`}>
                        <Button className={`w-full bg-gradient-to-r ${colorClasses.split(' ')[0]} text-white`} size="sm">
                          Find Providers
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-4 text-center py-12">
                <div className="text-gray-500 mb-4">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Categories Available</h3>
                  <p className="text-gray-600">Service categories will be displayed here once they are added to the platform.</p>
                </div>
              </div>
            )}
          </div>

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
              Getting the service you need is simple with our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Browse Services",
                description: "Search through our categories or browse all available services in your area"
              },
              {
                step: "2", 
                title: "Select Provider",
                description: "Compare providers, read reviews, and choose the one that fits your needs"
              },
              {
                step: "3",
                title: "Book & Schedule", 
                description: "Book your service, choose a convenient time, and provide service details"
              },
              {
                step: "4",
                title: "Get Service",
                description: "Professional arrives on time, completes the service, and you pay upon completion"
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
                  <p className="font-semibold text-blue-600">+234 816 066 2997</p>
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
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust our platform for their service needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services/marketplace">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Search className="mr-2 h-5 w-5" />
                Find Services Now
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