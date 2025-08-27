"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Search,
  MapPin,
  Star,
  Clock,
  Grid,
  List,
  User,
  SlidersHorizontal
} from "lucide-react"
import { Service, ServiceProvider, ServiceCategory } from "@/types"

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
  const [services] = useState(mockServices)
  const [filteredServices, setFilteredServices] = useState(mockServices)
  const [searchQuery, setSearchQuery] = useState("")
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
        service.serviceAreas && service.serviceAreas.includes(selectedLocation)
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
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <img
                src={service.images?.[0]?.url || '/placeholder.jpg'}
                alt={service.name}
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
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
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
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
      <Card className="hover:shadow-lg transition-shadow">
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <img
            src={service.images?.[0]?.url || '/placeholder.jpg'}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded text-sm font-medium">
            {formatPrice(service)}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
              {service.name}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-2">
              {service.description}
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <User className="h-4 w-4 mr-1" />
              {service.provider.name}
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
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

          <Link to={`/services/book/${service.id}`} className="block">
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
              Book Service
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="py-12 bg-gradient-to-r from-blue-600 to-purple-600">
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
                      selectedCategory === "" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
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
                          ? "bg-blue-100 text-blue-700"
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
                      selectedPriceRange === "" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
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
                          ? "bg-blue-100 text-blue-700"
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
                    className={`p-2 ${viewMode === "grid" ? "bg-blue-100 text-blue-700" : ""}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-blue-100 text-blue-700" : ""}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Services Grid/List */}
            <div className={`${
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
            }`}>
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {/* Empty State */}
            {filteredServices.length === 0 && (
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