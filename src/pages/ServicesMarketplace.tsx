import { useState, useEffect } from "react"
import { Link } from "react-router-dom";
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
  BookOpen
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

export default function ServicesMarketplace() {
  const [services, setServices] = useState<(Service & { provider: ServiceProvider })[]>([])
  const [filteredServices, setFilteredServices] = useState<(Service & { provider: ServiceProvider })[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredServiceId, setHoveredServiceId] = useState<string | null>(null)

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
    let filtered = [...services]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.provider.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category === selectedCategory)
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(service => 
        service.serviceAreas.includes(selectedLocation)
      )
    }

    // Price filter
    if (selectedPriceRange) {
      const range = priceRanges.find(r => r.label === selectedPriceRange)
      if (range) {
        filtered = filtered.filter(service => {
          const price = service.basePrice || 0
          return price >= range.min && price <= range.max
        })
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.provider.rating - a.provider.rating
        case "price-low":
          return (a.basePrice || 0) - (b.basePrice || 0)
        case "price-high":
          return (b.basePrice || 0) - (a.basePrice || 0)
        case "newest":
          return (b.createdAt as number) - (a.createdAt as number)
        default:
          return 0
      }
    })

    setFilteredServices(filtered)
  }, [searchQuery, selectedCategory, selectedLocation, selectedPriceRange, sortBy, services])

  const formatPrice = (service: Service) => {
    if (service.pricingType === "custom") {
      return "Custom Quote"
    } else if (service.pricingType === "hourly") {
      return `₦${service.hourlyRate?.toLocaleString()}/hr`
    } else {
      return `₦${service.basePrice?.toLocaleString()}`
    }
  }

  const ServiceCard = ({ service }: { service: Service & { provider: ServiceProvider } }) => {
    if (viewMode === "list") {
      return (
        <Card className="group relative overflow-hidden border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={service.images?.[0]?.url || '/placeholder.jpg'}
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <User className="h-4 w-4 mr-1" />
                      {service.provider.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 mb-1">
                      {formatPrice(service)}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {service.provider.rating} ({service.provider.reviewCount})
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration} min
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {service.serviceAreas && service.serviceAreas.length > 0 ? (
                        <>
                          {service.serviceAreas.slice(0, 2).join(", ")}
                          {service.serviceAreas.length > 2 && " +more"}
                        </>
                      ) : (
                        "Location not specified"
                      )}
                    </div>
                  </div>
                  
                  <Link to={`/services/book/${service.id}`}>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Book Now
                    </Button>
                  </Link>
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
        onMouseEnter={() => setHoveredServiceId(service.id)}
        onMouseLeave={() => setHoveredServiceId(null)}
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

        {/* Service Image */}
        <Link to={`/services/book/${service.id}`} className="block cursor-pointer">
          <div className="relative h-60 bg-white overflow-hidden">
            <img
              src={service.images?.[0]?.url || '/placeholder.jpg'}
              alt={service.name}
              className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
            />
            
            {/* Price Badge */}
            <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">
              {formatPrice(service)}
            </div>

            {/* Hover Actions */}
            {hoveredServiceId === service.id && (
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center gap-2 transition-opacity duration-300">
                <button
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                >
                  <BookOpen className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </Link>

        {/* Service Content */}
        <CardContent className="pt-4 flex-grow">
          <Link to={`/services/book/${service.id}`} className="block cursor-pointer">
            <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem] group-hover:text-green-600 transition-colors">
              {service.name}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2 h-10">
            {service.description}
          </p>
          
          {/* Provider Info */}
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <User className="h-4 w-4 mr-1" />
            {service.provider.name}
          </div>

          {/* Rating and Duration */}
          <div className="flex items-center justify-between mb-3 mt-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {service.provider.rating} ({service.provider.reviewCount})
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {service.duration} min
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            {service.serviceAreas && service.serviceAreas.length > 0 ? (
              <>
                {service.serviceAreas.slice(0, 2).join(", ")}
                {service.serviceAreas.length > 2 && " +more"}
              </>
            ) : (
              "Location not specified"
            )}
          </div>
        </CardContent>

        {/* Book Button */}
        <CardFooter className="pt-0 mt-auto">
          <Link to={`/services/book/${service.id}`} className="block w-full">
            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
              Book Service
            </Button>
          </Link>
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
              Find Professional Services
            </h1>
            <p className="text-xl max-w-2xl mx-auto">
              Connect with verified service providers across Nigeria
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
                  {filteredServices.length} services found
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

            {/* Services Grid/List */}
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
            ) : filteredServices.length > 0 ? (
              <div className={`${
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  : "space-y-4"
              }`}>
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No services found
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
    </div>
  )
}