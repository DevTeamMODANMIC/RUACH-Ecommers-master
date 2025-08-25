import { useState, useEffect } from "react"
import { useRouter } from "react-router-dom"
import Link from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "../components/ui/badge"
import { Label } from "../components/ui/label"
import { 
  ArrowLeft,
  Plus,
  X,
  Save,
  DollarSign,
  Clock,
  MapPin,
  Settings,
  FileText,
  Loader2
} from "lucide-react"
import { Service, ServiceCategory } from "../types"
import { useAuth } from "../components/auth-provider"
import { getServiceProviderByOwnerId } from "../lib/firebase-service-providers"
import { getService, updateService } from "../lib/firebase-services"
import { serviceCategories } from "../lib/categories"

interface EditServicePageProps {
  params: {
    id: string
  }
}

export default function EditServicePage({ params }: EditServicePageProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [service, setService] = useState<Service | null>(null)

  // Form state
  const [formData, setFormData] = useState<Partial<Service>>({
    name: "",
    description: "",
    category: "" as ServiceCategory,
    pricingType: "fixed",
    basePrice: 0,
    hourlyRate: 0,
    duration: 60,
    serviceAreas: [],
    features: [],
    isActive: true,
    images: []
  })

  // Temporary input states
  const [newServiceArea, setNewServiceArea] = useState("")
  const [newFeature, setNewFeature] = useState("")

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
          throw new Error("You don't have permission to edit this service")
        }

        setService(serviceData)
        setFormData({
          name: serviceData.name,
          description: serviceData.description,
          category: serviceData.category,
          pricingType: serviceData.pricingType,
          basePrice: serviceData.basePrice,
          hourlyRate: serviceData.hourlyRate,
          duration: serviceData.duration,
          serviceAreas: serviceData.serviceAreas,
          features: serviceData.features,
          isActive: serviceData.isActive,
          images: serviceData.images || []
        })

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

  const handleInputChange = (field: keyof Service, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addServiceArea = () => {
    if (newServiceArea.trim() && !formData.serviceAreas?.includes(newServiceArea.trim())) {
      setFormData(prev => ({
        ...prev,
        serviceAreas: [...(prev.serviceAreas || []), newServiceArea.trim()]
      }))
      setNewServiceArea("")
    }
  }

  const removeServiceArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas?.filter(a => a !== area) || []
    }))
  }

  const addFeature = () => {
    if (newFeature.trim() && !formData.features?.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter(f => f !== feature) || []
    }))
  }

  const validateForm = (): string | null => {
    if (!formData.name?.trim()) return "Service name is required"
    if (!formData.description?.trim()) return "Service description is required"
    if (!formData.category) return "Service category is required"
    if (formData.pricingType === "fixed" && (!formData.basePrice || formData.basePrice <= 0)) {
      return "Base price must be greater than 0 for fixed pricing"
    }
    if (formData.pricingType === "hourly" && (!formData.hourlyRate || formData.hourlyRate <= 0)) {
      return "Hourly rate must be greater than 0 for hourly pricing"
    }
    if (!formData.serviceAreas?.length) return "At least one service area is required"
    if (!formData.features?.length) return "At least one feature is required"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      if (!service?.id) {
        throw new Error("Service ID not found")
      }

      // Create update data
      const updateData: Partial<Service> = {
        name: formData.name!.trim(),
        description: formData.description!.trim(),
        category: formData.category!,
        pricingType: formData.pricingType!,
        basePrice: formData.pricingType === "fixed" ? formData.basePrice : undefined,
        hourlyRate: formData.pricingType === "hourly" ? formData.hourlyRate : undefined,
        duration: formData.duration || 60,
        serviceAreas: formData.serviceAreas!,
        features: formData.features!,
        isActive: formData.isActive!,
        images: formData.images || []
      }

      // Update the service
      await updateService(service.id, updateData)

      // Show success message and redirect
      alert("Service updated successfully!")
      navigate("/service-provider/dashboard/services")

    } catch (error: any) {
      console.error("Error updating service:", error)
      setError(error.message || "Failed to update service")
    } finally {
      setIsSaving(false)
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
  if (error && !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <X className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Service</h3>
          <p className="text-gray-600 mb-6">{error}</p>
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
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
              <p className="text-gray-600 mt-1">Update your service offering</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <X className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}

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
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter service name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your service in detail"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={formData.category || ""}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a category</option>
                    {serviceCategories.map((category: any) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Pricing Type *</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="pricingType"
                        value="fixed"
                        checked={formData.pricingType === "fixed"}
                        onChange={(e) => handleInputChange("pricingType", e.target.value)}
                        className="mr-2"
                      />
                      Fixed Price
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="pricingType"
                        value="hourly"
                        checked={formData.pricingType === "hourly"}
                        onChange={(e) => handleInputChange("pricingType", e.target.value)}
                        className="mr-2"
                      />
                      Hourly Rate
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="pricingType"
                        value="custom"
                        checked={formData.pricingType === "custom"}
                        onChange={(e) => handleInputChange("pricingType", e.target.value)}
                        className="mr-2"
                      />
                      Custom Quote
                    </label>
                  </div>
                </div>

                {formData.pricingType === "fixed" && (
                  <div>
                    <Label htmlFor="basePrice">Base Price (₦) *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      value={formData.basePrice || ""}
                      onChange={(e) => handleInputChange("basePrice", parseFloat(e.target.value) || 0)}
                      placeholder="Enter fixed price"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                )}

                {formData.pricingType === "hourly" && (
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (₦) *</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={formData.hourlyRate || ""}
                      onChange={(e) => handleInputChange("hourlyRate", parseFloat(e.target.value) || 0)}
                      placeholder="Enter hourly rate"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Duration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration || 60}
                    onChange={(e) => handleInputChange("duration", parseInt(e.target.value) || 60)}
                    placeholder="Duration in minutes"
                    min="15"
                    step="15"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Current: {formatDuration(formData.duration || 60)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Service Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Service Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newServiceArea}
                    onChange={(e) => setNewServiceArea(e.target.value)}
                    placeholder="Enter location (e.g., Lagos, Abuja)"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addServiceArea())}
                  />
                  <Button type="button" onClick={addServiceArea} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.serviceAreas?.map((area, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {area}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeServiceArea(area)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                {formData.serviceAreas?.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Add at least one service area where you can provide this service
                  </p>
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
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Enter what's included (e.g., Free consultation)"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.features?.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {feature}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeFeature(feature)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                {formData.features?.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Add features and inclusions to help customers understand what they'll get
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Service Status */}
            <Card>
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
              </CardHeader>
              <CardContent>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange("isActive", e.target.checked)}
                    className="mr-2"
                  />
                  Service is active and visible to customers
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Active services can receive bookings from customers
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Service
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}