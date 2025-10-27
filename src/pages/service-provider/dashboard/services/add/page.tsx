"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
<<<<<<< HEAD
<<<<<<<< HEAD:src/pages/service-provider/dashboard/services/add/page.tsx
=======
>>>>>>> 5b5fd8b87f3bdfb44b59524083be90d21966c083
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
<<<<<<< HEAD
========
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "../components/ui/badge"
import { Label } from "../components/ui/label"
>>>>>>>> 5b5fd8b87f3bdfb44b59524083be90d21966c083:src/pages/Service-providerDashboardServicesAdd.tsx
=======
>>>>>>> 5b5fd8b87f3bdfb44b59524083be90d21966c083
import { 
  ArrowLeft,
  Plus,
  X,
  Save,
  DollarSign,
  Clock,
  MapPin,
  Settings,
  FileText
} from "lucide-react"
<<<<<<< HEAD
<<<<<<<< HEAD:src/pages/service-provider/dashboard/services/add/page.tsx
=======
>>>>>>> 5b5fd8b87f3bdfb44b59524083be90d21966c083
import { Service, ServiceCategory } from "@/types"
import { useAuth } from "@/components/auth-provider"
import { getServiceProviderByOwnerId } from "@/lib/firebase-service-providers"
import { createService } from "@/lib/firebase-services"

// Service categories constant
const serviceCategories: { value: ServiceCategory; label: string }[] = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "cleaning", label: "Cleaning" },
  { value: "event-planning", label: "Event Planning" },
  { value: "catering", label: "Catering" },
  { value: "beauty", label: "Beauty & Wellness" },
  { value: "fitness", label: "Fitness" },
  { value: "tutoring", label: "Tutoring" },
  { value: "photography", label: "Photography" },
  { value: "repairs", label: "Repairs" },
  { value: "landscaping", label: "Landscaping" },
  { value: "other", label: "Other" }
]
<<<<<<< HEAD
========
import { Service, ServiceCategory } from "../types"
import { useAuth } from "../components/auth-provider"
import { getServiceProviderByOwnerId } from "../lib/firebase-service-providers"
import { createService } from "../lib/firebase-services"
import { useVendor } from "../hooks/use-vendor"
import { serviceCategories } from "../lib/categories"
import { ServiceProviderLayout } from "../components/service-provider-layout"
>>>>>>>> 5b5fd8b87f3bdfb44b59524083be90d21966c083:src/pages/Service-providerDashboardServicesAdd.tsx
=======
>>>>>>> 5b5fd8b87f3bdfb44b59524083be90d21966c083

export default function AddServicePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
<<<<<<< HEAD
  const { isVendor } = useVendor()
=======
>>>>>>> 5b5fd8b87f3bdfb44b59524083be90d21966c083
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<Partial<Service>>({
    name: "",
    description: "",
    category: "" as ServiceCategory,
    pricingType: "fixed",
    basePrice: 0,
    hourlyRate: 0,
    duration: 60, // Default 1 hour in minutes
    serviceAreas: [],
    features: [],
    isActive: true,
    images: [],
    bookingRequiresApproval: false,
    depositRequired: false
  })

  // Temporary input states
  const [newServiceArea, setNewServiceArea] = useState("")
  const [newFeature, setNewFeature] = useState("")

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
<<<<<<< HEAD
    
    // Validate pricing based on type
    if (formData.pricingType === "fixed") {
      if (!formData.basePrice || formData.basePrice <= 0) {
        return "Base price must be greater than 0 for fixed pricing"
      }
    } else if (formData.pricingType === "hourly") {
      if (!formData.hourlyRate || formData.hourlyRate <= 0) {
        return "Hourly rate must be greater than 0 for hourly pricing"
      }
    }
    // Custom pricing doesn't require price validation
    
=======
    if (formData.pricingType === "fixed" && (!formData.basePrice || formData.basePrice <= 0)) {
      return "Base price must be greater than 0 for fixed pricing"
    }
    if (formData.pricingType === "hourly" && (!formData.hourlyRate || formData.hourlyRate <= 0)) {
      return "Hourly rate must be greater than 0 for hourly pricing"
    }
>>>>>>> 5b5fd8b87f3bdfb44b59524083be90d21966c083
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
      setIsLoading(true)
      setError(null)

      // Get service provider profile
      if (!user?.uid) {
        throw new Error("User not authenticated")
      }

      const serviceProvider = await getServiceProviderByOwnerId(user.uid)
      if (!serviceProvider) {
        throw new Error("Service provider profile not found. Please complete your registration.")
      }

      // Create service data
      const serviceData: Omit<Service, "id" | "createdAt" | "updatedAt"> = {
        name: formData.name!.trim(),
        description: formData.description!.trim(),
        category: formData.category!,
        providerId: serviceProvider.id,
        // Required base properties
        price: formData.pricingType === "fixed" ? (formData.basePrice || 0) : (formData.hourlyRate || 0),
        availability: {
          days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
          hours: {
            start: "09:00",
            end: "17:00"
          }
        },
        // Extended properties
        pricingType: formData.pricingType!,
<<<<<<< HEAD
        // Only include basePrice for fixed pricing
        ...(formData.pricingType === "fixed" && formData.basePrice ? { basePrice: formData.basePrice } : {}),
        // Only include hourlyRate for hourly pricing
        ...(formData.pricingType === "hourly" && formData.hourlyRate ? { hourlyRate: formData.hourlyRate } : {}),
=======
        basePrice: formData.pricingType === "fixed" ? formData.basePrice : undefined,
        hourlyRate: formData.pricingType === "hourly" ? formData.hourlyRate : undefined,
>>>>>>> 5b5fd8b87f3bdfb44b59524083be90d21966c083
        duration: formData.duration || 60,
        serviceAreas: formData.serviceAreas!,
        features: formData.features!,
        isActive: formData.isActive!,
        images: formData.images || [],
        bookingRequiresApproval: formData.bookingRequiresApproval || false,
        depositRequired: formData.depositRequired || false,
<<<<<<< HEAD
<<<<<<<< HEAD:src/pages/service-provider/dashboard/services/add/page.tsx
        depositAmount: formData.depositAmount
        // Note: Service statistics like bookingCount, rating, reviewCount are not part of the base Service type
========
        // Only include depositAmount if depositRequired is true and amount is provided
        ...(formData.depositRequired && formData.depositAmount ? { depositAmount: formData.depositAmount } : {}),
        // Initialize statistics
        bookingCount: 0,
        rating: 0,
        reviewCount: 0
>>>>>>>> 5b5fd8b87f3bdfb44b59524083be90d21966c083:src/pages/Service-providerDashboardServicesAdd.tsx
=======
        depositAmount: formData.depositAmount
        // Note: Service statistics like bookingCount, rating, reviewCount are not part of the base Service type
>>>>>>> 5b5fd8b87f3bdfb44b59524083be90d21966c083
      }

      // Create the service
      await createService(serviceData)

      // Force clear any caches to ensure the service appears
      Object.keys(localStorage).forEach(key => {
        if (key.includes('service') || key.includes('firebase')) {
          localStorage.removeItem(key)
        }
      })

<<<<<<< HEAD
      // Show success message and redirect based on user context
      alert("Service created successfully! You'll be redirected to services page.")
      
      // Smart redirect: Use user role and referrer to determine best destination
      const referrer = document.referrer
      const currentOrigin = window.location.origin
      
      // First priority: User role
      if (isVendor) {
        navigate("/vendor/dashboard/services")
        return
      }
      
      // Second priority: Referrer path analysis
      if (referrer && referrer.startsWith(currentOrigin)) {
        const referrerPath = new URL(referrer).pathname
        
        if (referrerPath.includes('/vendor/dashboard')) {
          navigate("/vendor/dashboard/services")
          return
        } else if (referrerPath.includes('/service-provider/dashboard')) {
          navigate("/service-provider/dashboard/services")
          return
        }
      }
      
      // Default fallback: service provider dashboard (since this is a service provider component)
=======
      // Show success message and redirect
      alert("Service created successfully! You'll be redirected to services page.")
>>>>>>> 5b5fd8b87f3bdfb44b59524083be90d21966c083
      navigate("/service-provider/dashboard/services")

    } catch (error: any) {
      console.error("Error creating service:", error)
      setError(error.message || "Failed to create service")
    } finally {
      setIsLoading(false)
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

  return (
<<<<<<< HEAD
<<<<<<<< HEAD:src/pages/service-provider/dashboard/services/add/page.tsx
=======
>>>>>>> 5b5fd8b87f3bdfb44b59524083be90d21966c083
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="w-full px-6 py-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Service</h1>
              <p className="text-gray-600 mt-1">Create a new service offering for your customers</p>
            </div>
          </div>
<<<<<<< HEAD
========
    <ServiceProviderLayout 
      title="Add New Service" 
      description="Create a new service offering for your customers"
    >
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
>>>>>>>> 5b5fd8b87f3bdfb44b59524083be90d21966c083:src/pages/Service-providerDashboardServicesAdd.tsx
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
=======
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
>>>>>>> 5b5fd8b87f3bdfb44b59524083be90d21966c083
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
                  Make this service active immediately
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Active services will be visible to customers and can receive bookings
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleInputChange("isActive", false)}
                  disabled={isLoading}
                >
                  Save as Draft
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Service
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
<<<<<<< HEAD
    </ServiceProviderLayout>
=======
      </div>
    </div>
>>>>>>> 5b5fd8b87f3bdfb44b59524083be90d21966c083
  )
}