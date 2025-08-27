import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Link from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { 
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  MapPin,
  Settings,
  FileText,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Eye,
  X
} from "lucide-react"
import { Service } from "../types"
import { useAuth } from "../components/auth-provider"
import { getServiceProviderByOwnerId } from "../lib/firebase-service-providers"
import { getService, deleteService, toggleServiceStatus } from "../lib/firebase-services"

interface ViewServicePageProps {
  params: {
    id: string
  }
}

export default function ViewServicePage({ params }: ViewServicePageProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [isToggling, setIsToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load service data
  useEffect(() => {
    const loadService = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!user?.uid) {
          throw new Error("User not authenticated")
        }

        // Get service provider profile first for security
        const serviceProvider = await getServiceProviderByOwnerId(user.uid)
        if (!serviceProvider) {
          throw new Error("Service provider profile not found")
        }

        // Load the service
        const serviceData = await getService(params.id)
        if (!serviceData) {
          throw new Error("Service not found")
        }

        // Security check: ensure service belongs to current user
        if (serviceData.providerId !== serviceProvider.id) {
          throw new Error("You don't have permission to view this service")
        }

        setService(serviceData)

      } catch (error: any) {
        console.error("Error loading service:", error)
        setError(error.message || "Failed to load service")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadService()
    }
  }, [params.id, user?.uid])

  const handleToggleStatus = async () => {
    if (!service) return

    try {
      setIsToggling(true)
      await toggleServiceStatus(service.id, !service.isActive)
      
      // Update local state
      setService(prev => prev ? { ...prev, isActive: !prev.isActive } : null)
      
      alert(`Service ${service.isActive ? 'deactivated' : 'activated'} successfully`)
    } catch (error: any) {
      console.error("Error toggling service status:", error)
      alert("Failed to update service status")
    } finally {
      setIsToggling(false)
    }
  }

  const handleDeleteService = async () => {
    if (!service) return
    
    if (!confirm(`Permanently delete service "${service.name}"? This cannot be undone.`)) return

    try {
      setIsDeleting(true)
      await deleteService(service.id)
      
      alert(`Deleted service: ${service.name}`)
      navigate("/service-provider/dashboard/services")
    } catch (error: any) {
      console.error("Delete service failed:", error)
      alert(error?.message || "Failed to delete service")
    } finally {
      setIsDeleting(false)
    }
  }

  const formatPrice = (service: Service) => {
    if (service.pricingType === "fixed" && service.basePrice) {
      return `₦${service.basePrice.toLocaleString()}`
    } else if (service.pricingType === "hourly" && service.hourlyRate) {
      return `₦${service.hourlyRate.toLocaleString()}/hr`
    } else {
      return "Custom pricing"
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}m`
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading service...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <X className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Service Not Found</h3>
          <p className="text-gray-600 mb-6">{error || "The requested service could not be found"}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button 
              onClick={() => navigate("/service-provider/dashboard/services")}
              variant="outline"
            >
              Back to Services
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
                <p className="text-gray-600 mt-1">Service Details</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={handleToggleStatus}
                disabled={isToggling}
                variant="outline"
                className={service.isActive ? "text-orange-600 hover:bg-orange-50 border-orange-200" : "text-green-600 hover:bg-green-50 border-green-200"}
              >
                {isToggling ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : service.isActive ? (
                  <ToggleLeft className="h-4 w-4 mr-2" />
                ) : (
                  <ToggleRight className="h-4 w-4 mr-2" />
                )}
                {service.isActive ? 'Deactivate' : 'Activate'}
              </Button>
              
              <Button asChild variant="outline">
                <Link to={`/service-provider/dashboard/services/${service.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              
              <Button
                onClick={handleDeleteService}
                disabled={isDeleting}
                variant="outline"
                className="text-red-600 hover:bg-red-50 border-red-200"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Status Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant={service.isActive ? "default" : "secondary"} className="text-sm">
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {service.isActive ? "Visible to customers and accepting bookings" : "Hidden from customers"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Created: {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : "Unknown"}</span>
                  {service.updatedAt && (
                    <span>Updated: {new Date(service.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Service Name</h3>
                <p className="text-gray-700">{service.name}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-1">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{service.description}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-1">Category</h3>
                <Badge variant="outline">{service.category}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-2xl text-green-600">{formatPrice(service)}</span>
                  </div>
                  <div>
                    <Badge variant="outline" className="capitalize">
                      {service.pricingType} pricing
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-2xl text-blue-600">
                      {formatDuration(service.duration || 60)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Estimated completion time</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Service Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {service.serviceAreas.map((area, index) => (
                  <Badge key={index} variant="secondary">
                    {area}
                  </Badge>
                ))}
              </div>
              {service.serviceAreas.length === 0 && (
                <p className="text-gray-500">No service areas specified</p>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Features & Inclusions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              {service.features.length === 0 && (
                <p className="text-gray-500">No features specified</p>
              )}
            </CardContent>
          </Card>

          {/* Service Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Service Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{service.bookingCount || 0}</div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {service.rating ? service.rating.toFixed(1) : "0.0"}
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{service.reviewCount || 0}</div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => navigate("/service-provider/dashboard/services")}
            >
              Back to Services
            </Button>

            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link to={`/service-provider/dashboard/services/${service.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Service
                </Link>
              </Button>
              <Button asChild>
                <Link to={`/services/${service.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View as Customer
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}