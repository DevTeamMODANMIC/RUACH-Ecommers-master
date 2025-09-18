import { useState } from "react"
import { useAuth } from "../components/auth-provider"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from 'react-router-dom'
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Checkbox } from "../components/ui/checkbox"
import CloudinaryUploadWidget from "../components/cloudinary-upload-widget"
import { ServiceCategory } from "../types"
import { createServiceProvider } from "../lib/firebase-service-providers"
import { toast } from "sonner"

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT-Abuja", "Gombe", "Imo", "Jigawa", "Kaduna",
  "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
]

const serviceCategories: { value: ServiceCategory; label: string }[] = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "cleaning", label: "Cleaning Services" },
  { value: "event-planning", label: "Event Planning" },
  { value: "catering", label: "Catering Services" },
  { value: "beauty", label: "Beauty & Wellness" },
  { value: "fitness", label: "Fitness & Personal Training" },
  { value: "tutoring", label: "Tutoring & Education" },
  { value: "photography", label: "Photography" },
  { value: "repairs", label: "Repairs & Maintenance" },
  { value: "landscaping", label: "Landscaping" },
  { value: "other", label: "Other" }
]

const schema = z.object({
  businessName: z.string().min(3, "Business name is required"),
  description: z.string().min(20, "Please provide a detailed description (at least 20 characters)"),
  category: z.string().min(1, "Please select a service category"),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
  serviceAreas: z.array(z.string()).min(1, "Please select at least one service area"),
  profileImageUrl: z.string().url().optional(),
  yearsOfExperience: z.string().min(1, "Years of experience is required"),
  qualifications: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function ServiceProviderForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: "",
      description: "",
      category: "",
      contactEmail: user?.email || "",
      contactPhone: "",
      serviceAreas: [],
      profileImageUrl: "",
      yearsOfExperience: "",
      qualifications: "",
    },
  })

  const watchedCategory = watch("category")

  const handleAreaToggle = (area: string) => {
    const newAreas = selectedAreas.includes(area)
      ? selectedAreas.filter(a => a !== area)
      : [...selectedAreas, area]
    
    setSelectedAreas(newAreas)
    setValue("serviceAreas", newAreas)
  }

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (!user) {
      toast.error("You must be logged in to register as a service provider")
      return
    }
    
    setIsSubmitting(true)
    try {
      // Create service provider profile
      const providerId = await createServiceProvider({
        ownerId: user.uid,
        name: values.businessName,
        description: values.description,
        category: values.category as ServiceCategory,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        serviceAreas: values.serviceAreas,
        qualifications: values.qualifications ? [values.qualifications] : [],
        profileImage: values.profileImageUrl ? {
          publicId: "",
          url: values.profileImageUrl,
          alt: "Profile image"
        } : undefined,
        rating: 0,
        reviewCount: 0,
        totalBookings: 0
      })
      
      console.log("Service provider created with ID:", providerId)
      toast.success("Your service provider application has been submitted successfully! We will notify you once it has been reviewed.")
      navigate("/service-provider/dashboard")
    } catch (err: any) {
      console.error("Service provider registration error:", err)
      toast.error(err.message || "An error occurred while submitting your application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-900">Service Provider Application</CardTitle>
          <p className="text-gray-600 mt-2">Fill out the form below to start offering your services</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Business/Service Name *</label>
                <Input 
                  type="text" 
                  {...register("businessName")} 
                  placeholder="e.g., John's Plumbing Services"
                />
                {errors.businessName && (
                  <p className="text-xs text-red-500 mt-1">{errors.businessName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Service Category *</label>
                <Select onValueChange={(value) => setValue("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your service category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Service Description *</label>
                <Textarea 
                  rows={4} 
                  {...register("description")} 
                  placeholder="Describe your services, specializations, and what makes you unique..."
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Contact Email *</label>
                <Input 
                  type="email" 
                  {...register("contactEmail")} 
                  placeholder="your.email@example.com"
                />
                {errors.contactEmail && (
                  <p className="text-xs text-red-500 mt-1">{errors.contactEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Contact Phone *</label>
                <Input 
                  type="tel" 
                  {...register("contactPhone")} 
                  placeholder="+234 800 000 0000"
                />
                {errors.contactPhone && (
                  <p className="text-xs text-red-500 mt-1">{errors.contactPhone.message}</p>
                )}
              </div>
            </div>

            {/* Service Areas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Service Areas *</h3>
              <p className="text-sm text-gray-600">Select the states where you provide services:</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                {nigerianStates.map((state) => (
                  <div key={state} className="flex items-center space-x-2">
                    <Checkbox
                      id={`area-${state}`}
                      checked={selectedAreas.includes(state)}
                      onCheckedChange={() => handleAreaToggle(state)}
                    />
                    <label 
                      htmlFor={`area-${state}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {state}
                    </label>
                  </div>
                ))}
              </div>
              {errors.serviceAreas && (
                <p className="text-xs text-red-500 mt-1">{errors.serviceAreas.message}</p>
              )}
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Years of Experience *</label>
                <Select onValueChange={(value) => setValue("yearsOfExperience", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years (Beginner)</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10+">10+ years (Expert)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.yearsOfExperience && (
                  <p className="text-xs text-red-500 mt-1">{errors.yearsOfExperience.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Qualifications & Certifications</label>
                <Textarea 
                  rows={3} 
                  {...register("qualifications")} 
                  placeholder="List any relevant qualifications, certifications, or training (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Profile Image</label>
                <CloudinaryUploadWidget
                  onUploadSuccess={(_publicId: string, url: string) => setValue("profileImageUrl", url)}
                  multiple={false}
                />
                <p className="text-xs text-gray-500 mt-1">Upload a professional photo (optional)</p>
              </div>
            </div>

            {/* Terms and Submit */}
            <div className="space-y-4 pt-4 border-t">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your application will be reviewed within 2-3 business days</li>
                  <li>• We may contact you for additional verification</li>
                  <li>• Once approved, you can start creating service listings</li>
                  <li>• You'll get access to the service provider dashboard</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
              >
                {isSubmitting ? "Submitting Application..." : "Submit Service Provider Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}