"use client"

import { useAuth } from "@/components/auth-provider"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { createVendorStore } from "@/lib/firebase-vendors"
import { useVendor } from "@/hooks/use-vendor"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CloudinaryUploadWidget from "@/components/cloudinary-upload-widget"

const schema = z.object({
  shopName: z.string().min(3, "Shop name is required"),
  bio: z.string().min(10, "Please provide a short description"),
  logoUrl: z.string().url().nonempty("Logo is required"),
})

type FormValues = z.infer<typeof schema>

export default function VendorRegisterPage() {
  const { user } = useAuth()
  const { allStores, canCreateMoreStores, refreshStores } = useVendor()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      alert("You must be logged in to register as a vendor")
      return
    }
    
    if (!canCreateMoreStores) {
      alert("You have reached the maximum limit of 3 stores per account")
      return
    }
    
    setIsSubmitting(true)
    try {
      const storeId = await createVendorStore(user.uid, values)
      await refreshStores()
      
      const storeNumber = allStores.length + 1
      alert(
        `Your ${storeNumber === 1 ? 'first' : storeNumber === 2 ? 'second' : 'third'} store application has been submitted! We will notify you once it has been reviewed.`,
      )
      router.push("/vendor/dashboard")
    } catch (err: any) {
      console.error(err)
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="py-16"
        style={{
          backgroundColor: '#1d4ed8',
          background: 'linear-gradient(to right, #2563eb, #1e40af)',
          minHeight: '400px'
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'white' }}>
            Start Selling on RUACH
          </h1>
          <p className="text-xl md:text-2xl mb-8" style={{ color: 'white', opacity: 0.9 }}>
            Join thousands of vendors reaching customers across Nigeria
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div 
                className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <span className="text-2xl">🏪</span>
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'white' }}>Easy Setup</h3>
              <p className="text-sm" style={{ color: 'white', opacity: 0.8 }}>Get your store online in minutes</p>
            </div>
            <div className="text-center">
              <div 
                className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'white' }}>Grow Your Business</h3>
              <p className="text-sm" style={{ color: 'white', opacity: 0.8 }}>Reach more customers online</p>
            </div>
            <div className="text-center">
              <div 
                className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'white' }}>Increase Sales</h3>
              <p className="text-sm" style={{ color: 'white', opacity: 0.8 }}>Boost your revenue with our platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="container mx-auto px-4 py-16 max-w-xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900">Vendor Application</CardTitle>
            <p className="text-gray-600 mt-2">Fill out the form below to get started</p>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Shop Name</label>
              <Input type="text" {...register("shopName")} />
              {errors.shopName && (
                <p className="text-xs text-red-500 mt-1">{errors.shopName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Bio</label>
              <Textarea rows={4} {...register("bio")} />
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
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <div className="mt-16 bg-white rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Why Choose RUACH?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full p-2">
              <span className="text-green-600">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">No Setup Fees</h3>
              <p className="text-gray-600 text-sm">Start selling without any upfront costs</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full p-2">
              <span className="text-green-600">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Marketing Support</h3>
              <p className="text-gray-600 text-sm">We help promote your products</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full p-2">
              <span className="text-green-600">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Secure Payments</h3>
              <p className="text-gray-600 text-sm">Safe and reliable payment processing</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full p-2">
              <span className="text-green-600">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Get help whenever you need it</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
} 