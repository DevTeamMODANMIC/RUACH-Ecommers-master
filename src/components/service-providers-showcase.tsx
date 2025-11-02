import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter } from "./ui/card"
import { Badge } from "./ui/badge"
import { 
  Star,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Award,
  Eye,
  MessageCircle
} from "lucide-react"
import { ServiceProvider } from "../types"
import { getAllServiceProviders } from "../lib/firebase-service-providers"
import { getServicesByProviderId } from "../lib/firebase-services"
import CustomerServiceChat from "./customer-service-chat"
import LazyImage from "./lazy-image"

export default function ServiceProvidersShowcase() {
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [hoveredProviderId, setHoveredProviderId] = useState<string | null>(null)
  const [providerServices, setProviderServices] = useState<Record<string, number>>({})
  const [showChat, setShowChat] = useState(false)
  const [chatProvider, setChatProvider] = useState<ServiceProvider | null>(null)
  const navigate = useNavigate()

  // Load service providers on component mount
  useEffect(() => {
    const loadProviders = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('🔍 [Providers] Loading all service providers...')
        
        const allProviders = await getAllServiceProviders()
        
        console.log('📊 [Providers] Providers loaded:', allProviders.length)
        
        // Filter only active and approved providers
        const activeProviders = allProviders.filter(provider => 
          provider.isActive && provider.isApproved
        )
        
        console.log('✅ [Providers] Active and approved providers:', activeProviders.length)
        
        setProviders(activeProviders)
        
        // Load service counts for each provider
        const servicesCount: Record<string, number> = {}
        for (const provider of activeProviders) {
          try {
            const services = await getServicesByProviderId(provider.id)
            servicesCount[provider.id] = services.length
          } catch (err) {
            console.warn('⚠️ [Providers] Failed to load services for provider:', provider.id, err)
            servicesCount[provider.id] = 0
          }
        }
        setProviderServices(servicesCount)
        
      } catch (err: any) {
        console.error('💥 [Providers] Error loading providers:', err)
        setError(err?.message || 'Failed to load service providers')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProviders()
  }, [])

  // Filter providers based on search and category
  useEffect(() => {
    let filtered = [...providers]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(provider => 
        provider.category === selectedCategory
      )
    }

    // Sort by rating
    filtered.sort((a, b) => b.rating - a.rating)

    setFilteredProviders(filtered)
  }, [searchQuery, selectedCategory, providers])

  // Handle view services button click
  const handleViewServices = (providerId: string) => {
    console.log("View Services button clicked for provider ID:", providerId);
    const serviceCount = providerServices[providerId] || 0
    if (serviceCount > 0) {
      // Provider has services, go to marketplace filtered by provider
      console.log("Navigating to marketplace with provider filter");
      navigate(`/services/marketplace?provider=${providerId}`)
    } else {
      // Provider has no services, go to provider detail page
      console.log("Navigating to provider detail page");
      navigate(`/services/detail/${providerId}`)
    }
  }

  // Handle chat button click
  const handleChatWithProvider = (provider: ServiceProvider) => {
    console.log("Contact Provider button clicked for provider:", provider);
    setChatProvider(provider)
    setShowChat(true)
    console.log("Chat state set to show for provider:", provider.name);
  }

  const ProviderCard = ({ provider }: { provider: ServiceProvider }) => {
    const serviceCount = providerServices[provider.id] || 0
    
    return (
      <Card 
        className="group relative overflow-hidden border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 rounded-xl bg-white flex flex-col h-full"
        onMouseEnter={() => setHoveredProviderId(provider.id)}
        onMouseLeave={() => setHoveredProviderId(null)}
      >
        {/* Provider Image/Avatar */}
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
          <LazyImage
            src={provider.profileImage?.url}
            alt={provider.profileImage?.alt || provider.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
              </div>
            }
          />
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-green-600 text-white">
              {provider.isApproved ? 'Verified' : 'Active'}
            </Badge>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm font-medium">{provider.rating}</span>
          </div>

          {/* Hover Actions */}
          {hoveredProviderId === provider.id && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center gap-2 transition-opacity duration-300">
              <button 
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleViewServices(provider.id);
                }}
              >
                <Eye className="h-5 w-5" />
              </button>
              <button 
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleChatWithProvider(provider);
                }}
              >
                <MessageCircle className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Provider Content */}
        <CardContent className="pt-4 flex-grow">
          <div className="mb-3">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
              {provider.name}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 h-10">
              {provider.description}
            </p>
          </div>

          {/* Category */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs capitalize">
                {provider.category.replace('-', ' ')}
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-500">
                <Star className="h-4 w-4 mr-1 text-yellow-400" />
                <span>{provider.rating} ({provider.reviewCount} reviews)</span>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {provider.serviceAreas && provider.serviceAreas.length > 0 ? (
                  <>
                    {provider.serviceAreas.slice(0, 2).join(", ")}
                    {provider.serviceAreas.length > 2 && " +more"}
                  </>
                ) : (
                  "Location not specified"
                )}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                {serviceCount > 0 
                  ? `${serviceCount} service${serviceCount !== 1 ? 's' : ''} available` 
                  : "Available for custom bookings"}
              </span>
            </div>
          </div>

          {/* Verification Status */}
          {provider.isApproved && (
            <div className="flex items-center text-sm text-green-600 mb-3">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>Verified Provider</span>
            </div>
          )}
        </CardContent>

        {/* Action Buttons */}
        <CardFooter className="pt-0 mt-auto space-y-2">
          <div className="flex gap-2 w-full">
            <Button 
              size="sm" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleViewServices(provider.id);
              }}
            >
              {serviceCount > 0 ? "View Services" : "View Profile"}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="px-3"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleChatWithProvider(provider);
              }}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="h-48 bg-gray-100" />
            <CardContent className="pt-4">
              <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
            </CardContent>
            <CardFooter>
              <div className="h-9 bg-gray-100 rounded w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Providers
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (filteredProviders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No service providers found
        </h3>
        <p className="text-gray-600 mb-4">
          {providers.length === 0 
            ? "No service providers are currently available on the platform. Service providers need to register and be approved by administrators."
            : "Try adjusting your search terms or filters."
          }
        </p>
        {providers.length > 0 && (
          <Button 
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory("")
            }}
            variant="outline"
          >
            Clear Filters
          </Button>
        )}
        <div className="mt-4 text-sm text-gray-500">
          <p>Total providers loaded: {providers.length}</p>
          <p>Active search query: "{searchQuery}"</p>
          <p>Selected category: "{selectedCategory || 'None'}"</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search providers by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {/* Get unique categories from all providers */}
          {[...new Set(providers.map(p => p.category))].map(category => (
            <option key={category} value={category} className="capitalize">
              {category.replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <div className="text-gray-600 flex items-center justify-between">
        <span>
          {filteredProviders.length} service provider{filteredProviders.length !== 1 ? 's' : ''} found
        </span>
        <span className="text-sm text-gray-400">
          ({providers.length} total loaded)
        </span>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProviders.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>

      {/* Chat Component */}
      {showChat && chatProvider && (
        <CustomerServiceChat
          providerId={chatProvider.id}
          providerName={chatProvider.name}
          customerId="customer123" // This would be the actual customer ID
          onClose={() => {
            console.log("Closing chat for provider:", chatProvider.name);
            setShowChat(false);
          }}
        />
      )}
    </div>
  )
}