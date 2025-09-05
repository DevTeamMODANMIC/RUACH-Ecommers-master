import { useAuth } from "../components/auth-provider"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from 'react-router-dom'
import { createVendorStore } from "../lib/firebase-vendors"
import { useVendor } from "../hooks/use-vendor"
import { useServiceProvider } from "../hooks/use-service-provider"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import CloudinaryUploadWidget from "../components/cloudinary-upload-widget"

const schema = z.object({
  shopName: z.string().min(3, "Shop name is required"),
  bio: z.string().min(10, "Please provide a short description"),
  logoUrl: z.string().url("Please upload a valid logo image"),
})

type FormValues = z.infer<typeof schema>

export default function VendorForm() {
  const { user } = useAuth()
  const { allStores, canCreateMoreStores, refreshStores } = useVendor()
  const { isServiceProvider, loading: serviceProviderLoading } = useServiceProvider()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if user is already a service provider
  useEffect(() => {
    if (!serviceProviderLoading && isServiceProvider) {
      toast.error("You are already registered as a service provider. Users can only be either a vendor or service provider, not both.")
      navigate("/service-provider/dashboard")
    }
  }, [isServiceProvider, serviceProviderLoading, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      shopName: "",
      bio: "",
      logoUrl: "",
    },
  })

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (!user) {
      toast.error("You must be logged in to register as a vendor")
      return
    }
    
    if (!canCreateMoreStores) {
      toast.error("You have reached the maximum limit of 3 stores per account")
      return
    }
    
    // Ensure all required fields are present
    if (!values.shopName || !values.bio || !values.logoUrl) {
      toast.error("Please fill in all required fields")
      return
    }
    
    setIsSubmitting(true)
    try {
      // Type assertion to ensure we have the required fields
      const vendorData: { shopName: string; bio: string; logoUrl: string } = {
        shopName: values.shopName,
        bio: values.bio,
        logoUrl: values.logoUrl,
      }
      
      const storeId = await createVendorStore(user.uid, vendorData)
      await refreshStores()
      
      const storeNumber = allStores.length + 1
      toast.success(
        `Your ${storeNumber === 1 ? 'first' : storeNumber === 2 ? 'second' : 'third'} store application has been submitted! We will notify you once it has been reviewed.`
      )
      navigate("/vendor/dashboard")
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "An error occurred while submitting your application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading while checking service provider status
  if (serviceProviderLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render form if user is a service provider
  if (isServiceProvider) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      {/* Warning about service provider exclusivity */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">Important Notice</h3>
            <p className="mt-1 text-sm text-amber-700">
              By registering as a vendor, you will not be able to offer services as a service provider. 
              Users can only be either a vendor or service provider, not both.
            </p>
          </div>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-900">Vendor Application</CardTitle>
          <p className="text-gray-600 mt-2">Fill out the form below to get started selling products</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Shop Name</label>
              <Input type="text" {...register("shopName")} placeholder="Enter your shop name" />
              {errors.shopName && (
                <p className="text-xs text-red-500 mt-1">{errors.shopName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Bio</label>
              <Textarea 
                rows={4} 
                {...register("bio")} 
                placeholder="Tell us about your business and what you sell..."
              />
              {errors.bio && (
                <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Logo</label>
              <CloudinaryUploadWidget
                onUploadSuccess={(_publicId: string, url: string) => setValue("logoUrl", url, { shouldValidate: true })}
                multiple={false}
              />
              {errors.logoUrl && (
                <p className="text-xs text-red-500 mt-1">{errors.logoUrl.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? "Submitting..." : "Submit Vendor Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}