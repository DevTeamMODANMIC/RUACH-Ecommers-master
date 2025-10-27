"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CloudinaryUploadWidget from "@/components/cloudinary-upload-widget"
import { 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Upload,
  Phone,
  Mail,
  ChevronRight
} from "lucide-react"

const complaintTypes = [
  { value: "product", label: "Product Issue" },
  { value: "service", label: "Service Issue" },
  { value: "vendor", label: "Product Vendor Issue" },
  { value: "service_provider", label: "Service Provider Issue" },
  { value: "platform", label: "Platform/Website Issue" },
  { value: "other", label: "Other" }
]

const priorityLevels = [
  { value: "low", label: "Low - General inquiry" },
  { value: "medium", label: "Medium - Standard complaint" },
  { value: "high", label: "High - Urgent issue" },
  { value: "urgent", label: "Urgent - Critical problem" }
]

const schema = z.object({
  type: z.string().min(1, "Please select a complaint type"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(20, "Please provide a detailed description (at least 20 characters)"),
  orderId: z.string().optional(),
  bookingId: z.string().optional(),
  priority: z.string().min(1, "Please select a priority level"),
  attachments: z.array(z.string()).optional(),
})

type FormValues = z.infer<typeof schema>

const complaintStatuses = [
  {
    status: "open",
    label: "Open",
    description: "Your complaint has been submitted and is waiting for review",
    color: "bg-blue-100 text-blue-800"
  },
  {
    status: "in_progress",
    label: "In Progress",
    description: "Our team is actively working on your complaint",
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    status: "resolved",
    label: "Resolved",
    description: "Your complaint has been resolved",
    color: "bg-green-100 text-green-800"
  },
  {
    status: "closed",
    label: "Closed",
    description: "The complaint has been closed",
    color: "bg-gray-100 text-gray-800"
  }
]

export default function ComplaintPage() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([])
  const [showForm, setShowForm] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "",
      subject: "",
      description: "",
      orderId: "",
      bookingId: "",
      priority: "medium",
      attachments: [],
    },
  })

  const handleAttachmentUpload = (publicId: string, url: string) => {
    const newUrls = [...attachmentUrls, url]
    setAttachmentUrls(newUrls)
    setValue("attachments", newUrls)
  }

  const removeAttachment = (index: number) => {
    const newUrls = attachmentUrls.filter((_, i) => i !== index)
    setAttachmentUrls(newUrls)
    setValue("attachments", newUrls)
  }

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (!user) {
      alert("You must be logged in to submit a complaint")
      return
    }
    
    setIsSubmitting(true)
    try {
      // TODO: Implement complaint submission to Firebase
      console.log("Complaint Data:", {
        ...values,
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        status: "open",
        createdAt: new Date().toISOString()
      })
      
      // Show success message
      alert("Your complaint has been submitted successfully! We will review it and get back to you within 24-48 hours.")
      reset()
      setAttachmentUrls([])
      setShowForm(false)
    } catch (err: any) {
      console.error(err)
      alert("An error occurred while submitting your complaint. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-gray-900">Login Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              You need to be logged in to submit a complaint.
            </p>
            <Button asChild className="w-full">
              <a href="/login">Login to Continue</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Submit a Complaint
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We take your concerns seriously. Please provide detailed information 
              so we can resolve your issue quickly.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Complaint Form */}
          <div className="lg:col-span-2">
            {showForm ? (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Complaint Details</CardTitle>
                  <p className="text-gray-600">Please fill out all required fields below</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Complaint Type */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Complaint Type *</label>
                      <Select onValueChange={(value) => setValue("type", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the type of complaint" />
                        </SelectTrigger>
                        <SelectContent>
                          {complaintTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.type && (
                        <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>
                      )}
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Subject *</label>
                      <Input 
                        type="text" 
                        {...register("subject")} 
                        placeholder="Brief summary of your complaint"
                      />
                      {errors.subject && (
                        <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Description *</label>
                      <Textarea 
                        rows={6} 
                        {...register("description")} 
                        placeholder="Please provide a detailed description of your complaint. Include dates, names, and any relevant information that will help us resolve your issue."
                      />
                      {errors.description && (
                        <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    {/* Reference Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Order ID (if applicable)</label>
                        <Input 
                          type="text" 
                          {...register("orderId")} 
                          placeholder="ORD-xxxxx"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Booking ID (if applicable)</label>
                        <Input 
                          type="text" 
                          {...register("bookingId")} 
                          placeholder="BKG-xxxxx"
                        />
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Priority Level *</label>
                      <Select onValueChange={(value) => setValue("priority", value)} defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityLevels.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.priority && (
                        <p className="text-xs text-red-500 mt-1">{errors.priority.message}</p>
                      )}
                    </div>

                    {/* Attachments */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Attachments (Optional)</label>
                      <div className="space-y-3">
                        <CloudinaryUploadWidget
                          onUploadSuccess={handleAttachmentUpload}
                          multiple={true}
                        />
                        {attachmentUrls.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Uploaded files:</p>
                            {attachmentUrls.map((url, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <span className="text-sm text-gray-700 truncate flex-1">File {index + 1}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttachment(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload screenshots, receipts, or other relevant files to help us understand your complaint.
                      </p>
                    </div>

                    {/* Submit */}
                    <div className="pt-6 border-t">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
                      >
                        {isSubmitting ? "Submitting Complaint..." : "Submit Complaint"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm text-center">
                <CardContent className="py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Complaint Submitted Successfully!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Thank you for bringing this to our attention. We will review your complaint 
                    and get back to you within 24-48 hours.
                  </p>
                  <Button 
                    onClick={() => setShowForm(true)}
                    variant="outline"
                    className="mr-4"
                  >
                    Submit Another Complaint
                  </Button>
                  <Button asChild>
                    <a href="/profile">Go to Profile</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Need Immediate Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Support</p>
                    <p className="text-sm text-gray-600">+234 816 066 2997</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">WhatsApp</p>
                    <Button asChild variant="ghost" className="p-0 h-auto text-sm text-blue-600">
                      <a href="https://wa.me/2348160662997" target="_blank" rel="noopener noreferrer">
                        Chat with us
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">support@ruachestore.com.ng</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Complaint Process */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Complaint Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complaintStatuses.map((status, index) => (
                    <div key={status.status} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                        </div>
                      </div>
                      <div>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${status.color} mb-1`}>
                          {status.label}
                        </div>
                        <p className="text-sm text-gray-600">{status.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Expected Response Time</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• <span className="font-medium">Urgent:</span> Within 4 hours</li>
                  <li>• <span className="font-medium">High:</span> Within 12 hours</li>
                  <li>• <span className="font-medium">Medium:</span> Within 24 hours</li>
                  <li>• <span className="font-medium">Low:</span> Within 48 hours</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}