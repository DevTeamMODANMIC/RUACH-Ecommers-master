"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useParams, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Calendar,
  Clock,
  User,
  Star,
  ArrowLeft,
  MapPin,
  CheckCircle,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Service, ServiceProvider } from "@/types"
import { getService } from "@/lib/firebase-services"
import { getServiceProvider } from "@/lib/firebase-service-providers"

export default function ServiceDetailPage() {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const serviceId = params.serviceId as string

  const [service, setService] = useState<Service | null>(null)
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isProviderOnly, setIsProviderOnly] = useState(false)

  // Load service and provider data
  useEffect(() => {
    const loadServiceData = async () => {
      // Check if we're viewing a provider directly (no service)
      const searchParams = new URLSearchParams(location.search)
      const providerIdParam = searchParams.get('providerId')
      
      // If we have a providerId query parameter, load provider only
      if (providerIdParam) {
        // Load provider only
        setIsProviderOnly(true)
        try {
          setIsLoading(true)
          setError(null)

          console.log('🔍 Loading provider only:', providerIdParam)
          
          const providerData = await getServiceProvider(providerIdParam)
          
          if (!providerData) {
            setError("Service provider not found")
            setIsLoading(false)
            return
          }

          // Check if provider is active and approved
          if (!providerData.isActive || !providerData.isApproved) {
            setError("This service provider is currently not available")
            setIsLoading(false)
            return
          }

          console.log('✅ Provider loaded:', providerData.name)
          setProvider(providerData)
        } catch (err: any) {
          console.error('💥 Error loading provider data:', err)
          setError(err.message || 'Failed to load provider data')
        } finally {
          setIsLoading(false)
        }
        return
      }

      // If the serviceId parameter looks like a provider ID (no service found with this ID),
      // treat it as a provider detail request
      if (serviceId) {
        try {
          setIsLoading(true)
          setError(null)

          console.log('🔍 Attempting to load as service ID:', serviceId)
          
          // Load service data
          const serviceData = await getService(serviceId)
          
          if (serviceData) {
            // Valid service found
            // Check if service is active
            if (!serviceData.isActive) {
              setError("This service is currently not available")
              setIsLoading(false)
              return
            }

            console.log('✅ Service loaded:', serviceData.name)
            setService(serviceData)

            // Load provider data
            console.log('🔍 Loading provider:', serviceData.providerId)
            const providerData = await getServiceProvider(serviceData.providerId)
            
            if (!providerData) {
              setError("Service provider not found")
              setIsLoading(false)
              return
            }

            // Check if provider is active and approved
            if (!providerData.isActive || !providerData.isApproved) {
              setError("This service provider is currently not available")
              setIsLoading(false)
              return
            }

            console.log('✅ Provider loaded:', providerData.name)
            setProvider(providerData)
            setIsProviderOnly(false)
            return
          } else {
            // No service found with this ID, check if it's a provider ID
            console.log('🔍 No service found, checking if ID is a provider ID:', serviceId)
            
            const providerData = await getServiceProvider(serviceId)
            
            if (providerData) {
              // Valid provider found
              setIsProviderOnly(true)
              
              // Check if provider is active and approved
              if (!providerData.isActive || !providerData.isApproved) {
                setError("This service provider is currently not available")
                setIsLoading(false)
                return
              }

              console.log('✅ Provider loaded:', providerData.name)
              setProvider(providerData)
              return
            }
            
            // Neither service nor provider found
            setError("Service or provider not found")
            setIsLoading(false)
            return
          }
        } catch (err: any) {
          console.error('💥 Error loading service/provider data:', err)
          setError(err.message || 'Failed to load service or provider data')
        } finally {
          setIsLoading(false)
        }
      } else {
        setError("No service or provider ID provided")
        setIsLoading(false)
      }
    }

    loadServiceData()
  }, [serviceId, location.search])

  // Navigation functions for image gallery
  const nextImage = () => {
    if (service?.images && service.images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === service.images!.length - 1 ? 0 : prevIndex + 1
      )
    }
  }

  const prevImage = () => {
    if (service?.images && service.images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? service.images!.length - 1 : prevIndex - 1
      )
    }
  }

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((service?.images && service.images.length > 1) || (provider && !service)) {
        if (e.key === 'ArrowLeft') {
          prevImage()
        } else if (e.key === 'ArrowRight') {
          nextImage()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [service?.images, provider])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isProviderOnly ? "Loading Provider Details" : "Loading Service Details"}
          </h3>
          <p className="text-gray-600">Please wait while we fetch the information...</p>
        </div>
      </div>
    )
  }

  // Show error state if service/provider data is not available
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Details</h3>
            <p className="text-gray-600">{error}</p>
          </div>
          <Button onClick={() => navigate('/services/marketplace')} variant="outline">
            Back to Marketplace
          </Button>
        </div>
      </div>
    )
  }

  // Show error state if service/provider data is not available
  if ((!service && !isProviderOnly) || !provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isProviderOnly ? "Provider Not Found" : "Service Not Found"}
            </h3>
            <p className="text-gray-600">
              {isProviderOnly 
                ? "The requested provider could not be found or is no longer available."
                : "The requested service could not be found or is no longer available."}
            </p>
          </div>
          <Button onClick={() => navigate('/services/marketplace')} variant="outline">
            Back to Marketplace
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isProviderOnly ? "Provider Details" : "Service Details"}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Service/Provider Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Images Gallery */}
              <Card>
                <CardContent className="p-0">
                  {isProviderOnly ? (
                    // Provider image gallery
                    <div className="relative">
                      {/* Main Image */}
                      <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gray-100">
                        <img
                          src={provider?.profileImage?.url || '/placeholder.jpg'}
                          alt={`${provider?.name} profile`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                    </div>
                  ) : service?.images && service.images.length > 0 ? (
                    // Service image gallery
                    <div className="relative">
                      {/* Main Image */}
                      <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gray-100">
                        <img
                          src={service.images[currentImageIndex]?.url || '/placeholder.jpg'}
                          alt={`${service.name} - Image ${currentImageIndex + 1} of ${service.images.length}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.jpg';
                          }}
                        />
                        
                        {/* Image Navigation Arrows */}
                        {service.images.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                              aria-label="Next image"
                            >
                              <ChevronRight className="h-6 w-6" />
                            </button>
                            
                            {/* Image Counter */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                              {currentImageIndex + 1} / {service.images.length}
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Thumbnails */}
                      {service.images.length > 1 && (
                        <div className="p-4 border-t bg-white">
                          <div className="flex space-x-2 overflow-x-auto pb-2">
                            {service.images.map((image, index) => (
                              <button
                                key={index}
                                onClick={() => handleThumbnailClick(index)}
                                className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                                  currentImageIndex === index 
                                    ? 'border-blue-500 ring-2 ring-blue-200' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                aria-label={`View image ${index + 1}`}
                              >
                                <img
                                  src={image.url || '/placeholder.jpg'}
                                  alt={`${service.name} thumbnail ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder.jpg';
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Placeholder if no images
                    <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Eye className="h-12 w-12 mx-auto mb-2" />
                        <p>No images available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {isProviderOnly ? provider?.name : service?.name}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {isProviderOnly ? provider?.description : service?.description}
                  </p>
                  
                  {!isProviderOnly && service && (
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.duration} minutes
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
                  )}

                  {/* Features */}
                  {!isProviderOnly && service?.features && service.features.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">What's included</h3>
                      <ul className="space-y-2">
                        {service.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Requirements */}
                  {!isProviderOnly && service?.requirements && service.requirements.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                      <h3 className="text-lg font-semibold mb-2 text-yellow-800">Please ensure</h3>
                      <ul className="space-y-2">
                        {service.requirements.map((req: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-yellow-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {isProviderOnly && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-blue-800">About This Provider</h3>
                      <p className="text-blue-700">
                        {provider?.name} is a verified service provider on our platform. 
                        They offer a range of services and can provide custom solutions for your specific needs.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Provider Info and Booking */}
            <div className="space-y-6">
              {/* Provider Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Service Provider</h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{provider?.name}</h4>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(provider?.rating || 0)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">
                          {provider?.rating || 0} ({provider?.reviewCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{provider?.description}</p>
                  
                  {provider?.isApproved && (
                    <div className="flex items-center text-green-600 text-sm mb-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Verified Provider</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Booking Card */}
              <Card className="border-blue-200 border-2">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {isProviderOnly ? "Book This Provider" : "Book This Service"}
                  </h3>
                  
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {isProviderOnly 
                        ? "Contact for Quote" 
                        : (service?.pricingType === "custom" ? "Custom Quote" : 
                           service?.pricingType === "hourly" ? `₦${service.hourlyRate?.toLocaleString()}/hr` : 
                           `₦${service.basePrice?.toLocaleString()}`)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isProviderOnly
                        ? "Custom pricing based on your needs"
                        : (service?.pricingType === "fixed" && "Fixed price") ||
                          (service?.pricingType === "hourly" && "Hourly rate") ||
                          (service?.pricingType === "custom" && "Custom pricing")}
                    </div>
                  </div>

                  {!isProviderOnly && service && (
                    <div className="flex items-center text-sm text-gray-500 mb-6">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Duration: {service.duration} minutes</span>
                    </div>
                  )}

                  {isProviderOnly ? (
                    <Link to={`/services/book?providerId=${provider?.id}`} className="block">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-3">
                        <Calendar className="h-4 w-4 mr-2" />
                        Contact Provider
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/services/book/${serviceId}`} className="block">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-3">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Service
                      </Button>
                    </Link>
                  )}
                  
                  <p className="text-xs text-gray-500 text-center">
                    {isProviderOnly
                      ? "You will be redirected to contact the provider directly"
                      : "You will be redirected to the booking form to complete your reservation"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}