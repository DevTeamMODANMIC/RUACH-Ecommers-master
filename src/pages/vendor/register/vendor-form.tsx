"use client"

import { useAuth } from "@/components/auth-provider"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router-dom"
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

export default function VendorForm() {
  const { user } = useAuth()
  const { allStores, canCreateMoreStores, refreshStores } = useVendor()
  const navigate = useNavigate()
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
      await createVendorStore(user.uid, values)
      await refreshStores()
      
      const storeNumber = allStores.length + 1
      alert(
        `Your ${storeNumber === 1 ? 'first' : storeNumber === 2 ? 'second' : 'third'} store application has been submitted! We will notify you once it has been reviewed.`,
      )
      navigate("/vendor/dashboard")
    } catch (err: any) {
      console.error(err)
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
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