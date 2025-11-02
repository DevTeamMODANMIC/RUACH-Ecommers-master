import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button"
import { Card, CardContent, CardFooter } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { 
  Search,
  MapPin,
  Star,
  Clock,
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  User,
  Calendar,
  ArrowRight,
  Eye,
  Heart,
  BookOpen,
  X,
  MessageCircle,
  CheckCircle
} from "lucide-react"
import { Service, ServiceProvider, ServiceCategory } from "../types"
import { getAllActiveServices } from "../lib/firebase-services"
import { getServiceProvider } from "../lib/firebase-service-providers"

// Services data will be loaded from the database
const mockServices: (Service & { provider: ServiceProvider })[] = []

const categories: { value: ServiceCategory; label: string; count: number }[] = [
  // Categories will be loaded from the database
]

const priceRanges = [
  { label: "Under ₦10,000", min: 0, max: 10000 },
  { label: "₦10,000 - ₦25,000", min: 10000, max: 25000 },
  { label: "₦25,000 - ₦50,000", min: 25000, max: 50000 },
  { label: "₦50,000 - ₦100,000", min: 50000, max: 100000 },
  { label: "Over ₦100,000", min: 100000, max: Infinity }
]

const locations = ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Benin City"]

// Type for items displayed in the marketplace (either services or providers)
type MarketplaceItem = 
  | { type: "service"; data: Service & { provider: ServiceProvider } }
  | { type: "provider"; data: ServiceProvider }

export default function ServicesMarketplace() {
  const location = useLocation()
  const navigate = useNavigate()
  const [services, setServices] = useState<(Service & { provider: ServiceProvider })[]>([])
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)
  const [selectedProviderId, setSelectedProviderId] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: 1,
      type: "bot",
      message: "Hello! How can I help you with our services today?",
      timestamp: new Date()
    }
  ])
  const [chatMessage, setChatMessage] = useState("")

  // Parse URL parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const providerId = searchParams.get('provider')
    const category = searchParams.get('category')
    const chatParam = searchParams.get('chat')
    
    if (providerId) {
      setSelectedProviderId(providerId)
    }
    if (category) {
      setSelectedCategory(category as ServiceCategory)
    }
    if (chatParam === 'true' && providerId) {
      setShowChat(true)
    }
  }, [location.search])

  // Load services and providers on component mount
  useEffect(() => {
    const loadServicesAndProviders = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('🔍 [Marketplace] Loading all active services...')
        
        // Get all active services
        const allServices = await getAllActiveServices()
        
        console.log('📊 [Marketplace] Services loaded:', allServices.length)
        
        // Get unique provider IDs
        const providerIds = [...new Set(allServices.map(service => service.providerId))]
        
        console.log('👥 [Marketplace] Loading providers for', providerIds.length, 'unique providers')
        
        // Load all service providers
        const providerPromises = providerIds.map(async (providerId) => {
          try {
            const provider = await getServiceProvider(providerId)
            return { providerId, provider }
          } catch (error) {
            console.warn('⚠️ [Marketplace] Failed to load provider:', providerId, error)
            return { providerId, provider: null }
          }
        })
        
        const providerResults = await Promise.all(providerPromises)
        const providersMap = new Map<string, ServiceProvider>()
        
        providerResults.forEach(({ providerId, provider }) => {
          if (provider) {
            providersMap.set(providerId, provider)
          }
        })
        
        console.log('✅ [Marketplace] Loaded', providersMap.size, 'providers successfully')
        
        // Combine services with their providers
        const servicesWithProviders = allServices
          .map(service => {
            const provider = providersMap.get(service.providerId)
            if (!provider) {
              console.warn('⚠️ [Marketplace] No provider found for service:', service.id, service.name)
              return null
            }
            return {
              ...service,
              provider
            }
          })
          .filter((item): item is Service & { provider: ServiceProvider } => item !== null)
        
        console.log('🎯 [Marketplace] Final services with providers:', servicesWithProviders.length)
        
        setServices(servicesWithProviders)
        
        // Load all approved providers (to show providers without services)
        const allProviders = await import("../lib/firebase-service-providers").then(
          module => module.getApprovedServiceProviders()
        )
        setProviders(allProviders)
        
      } catch (err: any) {
        console.error('💥 [Marketplace] Error loading services:', err)
        setError(err?.message || 'Failed to load services')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadServicesAndProviders()
  }, [])
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "">("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedPriceRange, setSelectedPriceRange] = useState("")
  const [sortBy, setSortBy] = useState("rating") // rating, price-low, price-high, newest
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let filtered: MarketplaceItem[] = []
    
    // Filter services
    let filteredServices = [...services]
    
    // Search filter
    if (searchQuery) {
      filteredServices = filteredServices.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.provider.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory) {
      filteredServices = filteredServices.filter(service => service.category === selectedCategory)
    }

    // Provider filter
    if (selectedProviderId) {
      filteredServices = filteredServices.filter(service => service.providerId === selectedProviderId)
    }

    // Location filter
    if (selectedLocation) {
      filteredServices = filteredServices.filter(service => 
        service.serviceAreas.includes(selectedLocation)
      )
    }

    // Price filter
    if (selectedPriceRange) {
      const range = priceRanges.find(r => r.label === selectedPriceRange)
      if (range) {
        filteredServices = filteredServices.filter(service => {
          const price = service.basePrice || 0
          return price >= range.min && price <= range.max
        })
      }
    }

    // Convert services to marketplace items
    filtered = filteredServices.map(service => ({
      type: "service",
      data: service
    } as MarketplaceItem))
    
    // Add providers without services
    const providerIdsWithServices = new Set(services.map(s => s.providerId))
    const providersWithoutServices = providers.filter(provider => 
      !providerIdsWithServices.has(provider.id) && 
      provider.isActive && 
      provider.isApproved
    )
    
    // Apply filters to providers without services
    let filteredProviders = [...providersWithoutServices]
    
    // Search filter for providers
    if (searchQuery) {
      filteredProviders = filteredProviders.filter(provider =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Category filter for providers
    if (selectedCategory) {
      filteredProviders = filteredProviders.filter(provider => provider.category === selectedCategory)
    }
    
    // Provider filter for providers
    if (selectedProviderId) {
      filteredProviders = filteredProviders.filter(provider => provider.id === selectedProviderId)
    }
    
    // Location filter for providers
    if (selectedLocation) {
      filteredProviders = filteredProviders.filter(provider => 
        provider.serviceAreas.includes(selectedLocation)
      )
    }
    
    // Add providers without services to filtered items
    filtered = [
      ...filtered,
      ...filteredProviders.map(provider => ({
        type: "provider",
        data: provider
      } as MarketplaceItem))
    ]

    // Sort
    filtered.sort((a, b) => {
      const getRating = (item: MarketplaceItem) => {
        if (item.type === "service") {
          return item.data.provider.rating
        } else {
          return item.data.rating
        }
      }
      
      const getCreatedAt = (item: MarketplaceItem) => {
        if (item.type === "service") {
          return item.data.createdAt
        } else {
          return item.data.createdAt
        }
      }
      
      const getPrice = (item: MarketplaceItem) => {
        if (item.type === "service") {
          return item.data.basePrice || 0
        } else {
          return 0 // Providers without services don't have a price
        }
      }
      
      switch (sortBy) {
        case "rating":
          return getRating(b) - getRating(a)
        case "price-low":
          return getPrice(a) - getPrice(b)
        case "price-high":
          return getPrice(b) - getPrice(a)
        case "newest":
          return (getCreatedAt(b) as number) - (getCreatedAt(a) as number)
        default:
          return 0
      }
    })

    setFilteredItems(filtered)
  }, [searchQuery, selectedCategory, selectedLocation, selectedPriceRange, sortBy, services, providers, selectedProviderId])

  const formatPrice = (item: MarketplaceItem) => {
    if (item.type === "service") {
      const service = item.data
      if (service.pricingType === "custom") {
        return "Custom Quote"
      } else if (service.pricingType === "hourly") {
        return `₦${service.hourlyRate?.toLocaleString()}/hr`
      } else {
        return `₦${service.basePrice?.toLocaleString()}`
      }
    } else {
      // For providers without services, show "Contact for Quote"
      return "Contact for Quote"
    }
  }

  // Handle sending a chat message
  const handleSendChatMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: chatMessages.length + 1,
      type: "user",
      message: chatMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newMessage]);
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: chatMessages.length + 2,
        type: "bot",
        message: "Thank you for your message. A service provider representative will get back to you shortly.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);

    setChatMessage("");
  };

  // Handle key press in chat input
  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  const MarketplaceItemCard = ({ item }: { item: MarketplaceItem }) => {
    if (viewMode === "list") {
      return (
        <Card className="group relative overflow-hidden border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.type === "service" 
                    ? (item.data.images?.[0]?.url || '/placeholder.jpg')
                    : (item.data.profileImage?.url || '/placeholder.jpg')}
                  alt={item.type === "service" ? item.data.name : item.data.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                      {item.type === "service" ? item.data.name : item.data.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {item.type === "service" ? item.data.description : item.data.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <User className="h-4 w-4 mr-1" />
                      {item.type === "service" ? item.data.provider.name : item.data.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 mb-1">
                      {formatPrice(item)}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {item.type === "service" 
                          ? `${item.data.provider.rating} (${item.data.provider.reviewCount} reviews)`
                          : `${item.data.rating} (${item.data.reviewCount} reviews)`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {item.type === "service" 
                        ? `${item.data.duration} min`
                        : "Available for bookings"}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {item.type === "service" 
                        ? (item.data.serviceAreas && item.data.serviceAreas.length > 0 
                            ? `${item.data.serviceAreas.slice(0, 2).join(", ")}${item.data.serviceAreas.length > 2 ? " +more" : ""}`
                            : "Location not specified")
                        : (item.data.serviceAreas && item.data.serviceAreas.length > 0 
                            ? `${item.data.serviceAreas.slice(0, 2).join(", ")}${item.data.serviceAreas.length > 2 ? " +more" : ""}`
                            : "Location not specified")}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {item.type === "service" ? (
                      <>
                        <Link to={`/services/detail/${item.data.id}`}>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </Link>
                        <Link to={`/services/book/${item.data.id}`}>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Book Now
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          // For providers without services, go directly to booking with provider ID
                          navigate(`/services/book?providerId=${item.data.id}`)
                        }}
                      >
                        Contact Provider
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card 
        className="group relative overflow-hidden border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all duration-200 rounded-xl bg-white flex flex-col h-full"
        onMouseEnter={() => setHoveredItemId(item.type === "service" ? item.data.id : item.data.id)}
        onMouseLeave={() => setHoveredItemId(null)}
      >
        {/* Wishlist/Favorite Button */}
        <div className="absolute right-3 top-3 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-100 text-gray-500 hover:text-rose-500 backdrop-blur-sm shadow-sm"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Item Image */}
        <div className="block cursor-pointer">
          <div className="relative h-60 bg-white overflow-hidden">
            <img
              src={item.type === "service" 
                ? (item.data.images?.[0]?.url || '/placeholder.jpg')
                : (item.data.profileImage?.url || '/placeholder.jpg')}
              alt={item.type === "service" ? item.data.name : item.data.name}
              className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
            />
            
            {/* Multiple Images Indicator for services */}
            {item.type === "service" && item.data.images && item.data.images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <span className="mr-1">{item.data.images.length}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            
            {/* Price Badge */}
            <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">
              {formatPrice(item)}
            </div>

            {/* Hover Actions */}
            {hoveredItemId === (item.type === "service" ? item.data.id : item.data.id) && (
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center gap-2 transition-opacity duration-300">
                {item.type === "service" ? (
                  <>
                    <button
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/services/detail/${item.data.id}`);
                      }}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowChat(true);
                      }}
                    >
                      <MessageCircle className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        // For providers without services, go directly to booking
                        navigate(`/services/book?providerId=${item.data.id}`);
                      }}
                    >
                      <BookOpen className="h-5 w-5" />
                    </button>
                    <button
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowChat(true);
                      }}
                    >
                      <MessageCircle className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Item Content */}
        <CardContent className="pt-4 flex-grow">
          <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem] group-hover:text-green-600 transition-colors">
            {item.type === "service" ? item.data.name : item.data.name}
          </h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2 h-10">
            {item.type === "service" ? item.data.description : item.data.description}
          </p>
          
          {/* Provider Info */}
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <User className="h-4 w-4 mr-1" />
            {item.type === "service" ? item.data.provider.name : item.data.name}
          </div>

          {/* Rating and Duration */}
          <div className="flex items-center justify-between mb-3 mt-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {item.type === "service" 
                  ? `${item.data.provider.rating} (${item.data.provider.reviewCount} reviews)`
                  : `${item.data.rating} (${item.data.reviewCount} reviews)`}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {item.type === "service" 
                ? `${item.data.duration} min`
                : "Available"}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            {item.type === "service" 
              ? (item.data.serviceAreas && item.data.serviceAreas.length > 0 
                  ? `${item.data.serviceAreas.slice(0, 2).join(", ")}${item.data.serviceAreas.length > 2 ? " +more" : ""}`
                  : "Location not specified")
              : (item.data.serviceAreas && item.data.serviceAreas.length > 0 
                  ? `${item.data.serviceAreas.slice(0, 2).join(", ")}${item.data.serviceAreas.length > 2 ? " +more" : ""}`
                  : "Location not specified")}
          </div>
          
          {/* Verification Status for providers */}
          {item.type === "provider" && item.data.isApproved && (
            <div className="flex items-center text-sm text-green-600 mb-3">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>Verified Provider</span>
            </div>
          )}
        </CardContent>

        {/* Action Buttons */}
        <CardFooter className="pt-0 mt-auto">
          <div className="flex space-x-2 w-full">
            {item.type === "service" ? (
              <>
                <Link to={`/services/detail/${item.data.id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
                <Link to={`/services/book/${item.data.id}`} className="flex-1">
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                    Book
                  </Button>
                </Link>
              </>
            ) : (
              <Button 
                size="sm" 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => {
                  // For providers without services, go directly to booking
                  navigate(`/services/book?providerId=${item.data.id}`);
                }}
              >
                Contact Provider
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="py-12 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse Professional Services
            </h1>
            <p className="text-xl max-w-2xl mx-auto">
              {selectedProviderId 
                ? "Services from your selected provider"
                : "Discover and book services from verified professionals across Nigeria"}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search for services, providers, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-12 py-3 text-lg"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between lg:hidden">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  ✕
                </Button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-semibold mb-3">Categories</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`block w-full text-left px-3 py-2 rounded text-sm ${
                      selectedCategory === "" ? "bg-green-100 text-green-700" : "hover:bg-gray-100"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`block w-full text-left px-3 py-2 rounded text-sm ${
                        selectedCategory === category.value
                          ? "bg-green-100 text-green-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>{category.label}</span>
                        <span className="text-gray-500">({category.count})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="font-semibold mb-3">Location</h4>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-semibold mb-3">Price Range</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedPriceRange("")}
                    className={`block w-full text-left px-3 py-2 rounded text-sm ${
                      selectedPriceRange === "" ? "bg-green-100 text-green-700" : "hover:bg-gray-100"
                    }`}
                  >
                    Any Price
                  </button>
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setSelectedPriceRange(range.label)}
                      className={`block w-full text-left px-3 py-2 rounded text-sm ${
                        selectedPriceRange === range.label
                          ? "bg-green-100 text-green-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Active Filters */}
            {selectedProviderId && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Filtered by provider:</span>
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                    <span>
                      {services.find(s => s.providerId === selectedProviderId)?.provider.name || 
                       providers.find(p => p.id === selectedProviderId)?.name || 
                       'Selected Provider'}
                    </span>
                    <button
                      onClick={() => setSelectedProviderId("")}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                
                <div className="text-gray-600">
                  {filteredItems.length} items found
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-green-100 text-green-700" : ""}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-green-100 text-green-700" : ""}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Items Grid/List */}
            {isLoading ? (
              <div className={`${
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  : "space-y-4"
              }`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="animate-pulse border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <div className="h-60 bg-gray-100" />
                    <CardContent className="pt-4">
                      <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
                      <div className="h-4 bg-gray-100 rounded w-5/6" />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="h-5 bg-gray-100 rounded w-1/4" />
                      <div className="h-9 bg-gray-100 rounded w-1/3" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className={`${
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  : "space-y-4"
              }`}>
                {filteredItems.map((item, index) => (
                  <MarketplaceItemCard key={index} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No services or providers found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("")
                    setSelectedLocation("")
                    setSelectedPriceRange("")
                    setSelectedProviderId("")
                  }}
                  variant="outline"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[500px] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            {/* Chat Header */}
            <div className="bg-green-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Chat with Provider</h3>
                  <p className="text-sm text-green-100">
                    Service Provider
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 p-0"
              >
                ×
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.type === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.type === 'user' ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t rounded-b-2xl">
              <div className="flex space-x-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleChatKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
                <Button
                  onClick={handleSendChatMessage}
                  disabled={!chatMessage.trim()}
                  className="bg-green-600 hover:bg-green-700 px-6"
                >
                  Send
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Messages will be sent to the service provider
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}