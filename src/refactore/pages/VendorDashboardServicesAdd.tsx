import { useState } from "react"
import { useRouter } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "../components/ui/badge"
import { 
  ArrowLeft,
  Plus,
  X,
  Upload,
  MapPin,
  Clock,
  DollarSign,
  Check,
  AlertCircle
} from "lucide-react"

const serviceCategories = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "cleaning", label: "Cleaning Services" },
  { value: "event-planning", label: "Event Planning" },
  { value: "catering", label: "Catering Services" },
  { value: "beauty", label: "Beauty & Wellness" },
  { value: "fitness", label: "Fitness & Training" },
  { value: "tutoring", label: "Tutoring & Education" },
  { value: "photography", label: "Photography" },
  { value: "repairs", label: "General Repairs" },
  { value: "landscaping", label: "Landscaping & Gardening" },
  { value: "other", label: "Other Services" }
]

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", 
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", 
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", 
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT (Abuja)"
]

export default function AddServicePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    pricingType: "fixed",
    basePrice: "",
    hourlyRate: "",
    duration: "",
    features: [""],
    requirements: [""],
    serviceAreas: [] as string[],
    bookingRequiresApproval: true,
    depositRequired: false,
    depositAmount: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, ""]
    }))
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }))
  }

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, ""]
    }))
  }

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }))
  }

  const toggleServiceArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(area)
        ? prev.serviceAreas.filter(a => a !== area)
        : [...prev.serviceAreas, area]
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Service name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.duration) newErrors.duration = "Duration is required"
    if (formData.serviceAreas.length === 0) newErrors.serviceAreas = "At least one service area is required"

    if (formData.pricingType === "fixed" && !formData.basePrice) {
      newErrors.basePrice = "Base price is required for fixed pricing"
    }
    if (formData.pricingType === "hourly" && !formData.hourlyRate) {
      newErrors.hourlyRate = "Hourly rate is required for hourly pricing"
    }

    if (formData.depositRequired && !formData.depositAmount) {
      newErrors.depositAmount = "Deposit amount is required when deposit is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In real app, submit to API
      console.log("Service data:", formData)
      
      // Redirect back to services list
      navigate("/vendor/dashboard/services")
    } catch (error) {
      console.error("Error creating service:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Service</h1>
          <p className="text-gray-600">Create a new service offering for your customers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g. Home Plumbing Repair"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Detailed description of your service..."
                className={`min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className={`w-full p-2 border border-gray-300 rounded-md ${errors.category ? "border-red-500" : ""}`}
                >
                  <option value="">Select category</option>
                  {serviceCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange("subcategory", e.target.value)}
                  placeholder="e.g. Emergency Repairs"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes) *
              </label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                placeholder="120"
                className={errors.duration ? "border-red-500" : ""}
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.duration}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: "fixed", label: "Fixed Price", desc: "Set price for the service" },
                  { value: "hourly", label: "Hourly Rate", desc: "Charge per hour" },
                  { value: "custom", label: "Custom Quote", desc: "Negotiate with customer" }
                ].map(option => (
                  <div 
                    key={option.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.pricingType === option.value 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => handleInputChange("pricingType", option.value)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        formData.pricingType === option.value ? "bg-blue-500 border-blue-500" : "border-gray-300"
                      }`} />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-sm text-gray-600">{option.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {formData.pricingType === "fixed" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price (₦) *
                </label>
                <Input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => handleInputChange("basePrice", e.target.value)}
                  placeholder="15000"
                  className={errors.basePrice ? "border-red-500" : ""}
                />
                {errors.basePrice && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.basePrice}
                  </p>
                )}
              </div>
            )}

            {formData.pricingType === "hourly" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (₦) *
                </label>
                <Input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                  placeholder="5000"
                  className={errors.hourlyRate ? "border-red-500" : ""}
                />
                {errors.hourlyRate && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.hourlyRate}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="depositRequired"
                checked={formData.depositRequired}
                onChange={(e) => handleInputChange("depositRequired", e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="depositRequired" className="text-sm font-medium text-gray-700">
                Require deposit before booking
              </label>
            </div>

            {formData.depositRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount (₦) *
                </label>
                <Input
                  type="number"
                  value={formData.depositAmount}
                  onChange={(e) => handleInputChange("depositAmount", e.target.value)}
                  placeholder="5000"
                  className={errors.depositAmount ? "border-red-500" : ""}
                />
                {errors.depositAmount && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.depositAmount}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Features */}
        <Card>
          <CardHeader>
            <CardTitle>Service Features</CardTitle>
            <p className="text-sm text-gray-600">What's included in this service?</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  placeholder="e.g. Free consultation"
                  className="flex-1"
                />
                {formData.features.length > 1 && (
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button 
              type="button" 
              variant="outline" 
              onClick={addFeature}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Feature
            </Button>
          </CardContent>
        </Card>

        {/* Customer Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Requirements</CardTitle>
            <p className="text-sm text-gray-600">What do customers need to provide?</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.requirements.map((requirement, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="text"
                  value={requirement}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  placeholder="e.g. Access to water supply"
                  className="flex-1"
                />
                {formData.requirements.length > 1 && (
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => removeRequirement(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button 
              type="button" 
              variant="outline" 
              onClick={addRequirement}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Requirement
            </Button>
          </CardContent>
        </Card>

        {/* Service Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Service Areas *
            </CardTitle>
            <p className="text-sm text-gray-600">Select the areas where you provide this service</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {nigerianStates.map(state => (
                <div key={state} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`area-${state}`}
                    checked={formData.serviceAreas.includes(state)}
                    onChange={() => toggleServiceArea(state)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`area-${state}`} className="text-sm text-gray-700">
                    {state}
                  </label>
                </div>
              ))}
            </div>
            {formData.serviceAreas.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected areas:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.serviceAreas.map(area => (
                    <Badge key={area} variant="secondary" className="text-xs">
                      {area}
                      <button
                        type="button"
                        onClick={() => toggleServiceArea(area)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {errors.serviceAreas && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.serviceAreas}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Booking Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="bookingRequiresApproval"
                checked={formData.bookingRequiresApproval}
                onChange={(e) => handleInputChange("bookingRequiresApproval", e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="bookingRequiresApproval" className="text-sm font-medium text-gray-700">
                Require approval before booking confirmation
              </label>
            </div>
            <p className="text-xs text-gray-600 mt-1 ml-6">
              When enabled, you'll need to approve each booking request before it's confirmed.
            </p>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating Service...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Create Service
              </>
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}