import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Badge } from "../../../components/ui/badge"
import { 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Clock,
  DollarSign,
  MapPin,
  Star,
  Users,
  ToggleLeft,
  ToggleRight,
  Wrench,
  RefreshCw
} from "lucide-react"
import { Service, ServiceCategory } from "../../../types"
import { useAuth } from "../../../components/auth-provider"
import { getServiceProviderByOwnerId } from "../../../lib/firebase-service-providers"
import { getServicesByProviderId, toggleServiceStatus, deleteService } from "../../../lib/firebase-services"
import { ServiceProviderLayout } from "../../../components/service-provider-layout"


export default function ServiceProviderServicesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadServices = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)
      
      // Check if user is available
      if (!user?.uid) {
        setError("User not authenticated")
        setServices([])
        return
      }
      
      // First get the service provider profile to get the provider ID
      const serviceProvider = await getServiceProviderByOwnerId(user.uid)
      
      if (!serviceProvider) {
        setError("Service provider profile not found. Please complete your service provider registration.")
        setServices([])
        return
      }
      
      // Additional security check: Ensure the service provider belongs to the current user
      if (serviceProvider.ownerId !== user.uid) {
        setError("Security error: Invalid service provider access")
        setServices([])
        return
      }
      
      // Load services for this provider
      const providerServices = await getServicesByProviderId(serviceProvider.id)
      
      // Additional client-side filtering for extra security
      const validServices = providerServices.filter(service => service.providerId === serviceProvider.id)
      
      setServices(validServices)
      
    } catch (err: any) {
      setError(err?.message || "Failed to load services")
      setServices([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    loadServices()
  }, [user])

  useEffect(() => {
    let filtered = [...services]
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(service => 
        statusFilter === "active" ? service.isActive : !service.isActive
      )
    }

    setFilteredServices(filtered)
  }, [services, searchQuery, statusFilter])

  const handleToggleService = async (serviceId: string) => {
    try {
      const service = services.find(s => s.id === serviceId)
      if (!service) return
      
      await toggleServiceStatus(serviceId, !service.isActive)
      
      // Update local state
      setServices(services.map(service => 
        service.id === serviceId 
          ? { ...service, isActive: !service.isActive }
          : service
      ))
    } catch (error) {
      console.error("Error toggling service status:", error)
      alert("Failed to update service status")
    }
  }

  const handleDeleteService = async (service: Service) => {
    if (!service?.id) return
    if (!confirm(`Permanently delete service "${service.name}"? This cannot be undone.`)) return
    
    try {
      setDeletingId(service.id)
      
      await deleteService(service.id)
      
      // Show success message (you can replace with toast if available)
      alert(`Deleted service: ${service.name}`)
      
      // Refresh services list
      await loadServices(true)
      
    } catch (error: any) {
      console.error("Delete service failed:", error)
      alert(error?.message || "Failed to delete service")
    } finally {
      setDeletingId(null)
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

  const stats = {
    totalServices: services.length,
    activeServices: services.filter(s => s.isActive).length,
    inactiveServices: services.filter(s => !s.isActive).length,
    avgBookings: 0 // TODO: Calculate from real booking data
  }

  if (isLoading) {
    return (
      <ServiceProviderLayout title="My Services" description="Manage your service offerings and pricing">
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        </div>
      </ServiceProviderLayout>
    )
  }

  if (error) {
    return (
      <ServiceProviderLayout title="My Services" description="Manage your service offerings and pricing">
        <div className="min-h-[400px] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Wrench className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Services</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => loadServices()}>
                Try Again
              </Button>
              <Button 
                onClick={() => {
                  // Clear all caches and force refresh
                  localStorage.clear()
                  sessionStorage.clear()
                  window.location.reload()
                }}
                variant="outline"
              >
                Clear Cache & Reload
              </Button>
            </div>
          </div>
        </div>
      </ServiceProviderLayout>
    )
  }

  return (
    <ServiceProviderLayout title="My Services" description="Manage your service offerings and pricing">
      <div>
      {/* Header Actions */}
      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => loadServices(true)}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button asChild>
            <Link to="/service-provider/dashboard/services/add">
              <Plus className="h-4 w-4 mr-2" />
              Add New Service
            </Link>
          </Button>
        </div>
      </div>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.totalServices}</div>
              <div className="text-sm text-gray-600">Total Services</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.activeServices}</div>
              <div className="text-sm text-gray-600">Active Services</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.inactiveServices}</div>
              <div className="text-sm text-gray-600">Inactive Services</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.avgBookings}</div>
              <div className="text-sm text-gray-600">Avg Bookings/Month</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All Services
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("inactive")}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {service.description}
                    </p>
                  </div>
                  <Badge variant={service.isActive ? "default" : "secondary"} className="ml-2">
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Pricing */}
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                  <span className="font-medium text-lg">{formatPrice(service)}</span>
                </div>

                {/* Duration */}
                {service.duration && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{Math.floor(service.duration / 60)}h {service.duration % 60}m</span>
                  </div>
                )}

                {/* Service Areas */}
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="line-clamp-1">
                    {service.serviceAreas.slice(0, 2).join(", ")}
                    {service.serviceAreas.length > 2 && ` +${service.serviceAreas.length - 2} more`}
                  </span>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {service.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {service.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{service.features.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/service-provider/dashboard/services/${service.id}`}>
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/service-provider/dashboard/services/${service.id}/edit`}>
                        <Edit className="h-3 w-3" />
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteService(service)}
                      disabled={deletingId === service.id}
                      className="text-red-600 hover:bg-red-50 border-red-200"
                    >
                      {deletingId === service.id ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleService(service.id)}
                    className="px-2"
                  >
                    {service.isActive ? (
                      <ToggleRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <Wrench className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || statusFilter !== "all" ? "No services found" : "No services yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first service offering"
                }
              </p>
              {(!searchQuery && statusFilter === "all") && (
                <Button asChild>
                  <Link to="/service-provider/dashboard/services/add">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Service
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ServiceProviderLayout>
  )
}
