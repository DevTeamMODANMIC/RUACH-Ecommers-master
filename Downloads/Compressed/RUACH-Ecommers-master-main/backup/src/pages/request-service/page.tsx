"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Send, 
  CheckCircle,
  Clock,
  User,
  Calendar,
  MapPin,
  FileText
} from "lucide-react"

const serviceTypes = [
  { value: "delivery", label: "Delivery Service" },
  { value: "bulk-order", label: "Bulk Order Request" },
  { value: "vendor-onboarding", label: "Become a Vendor" },
  { value: "customer-support", label: "Customer Support" },
  { value: "technical-support", label: "Technical Support" },
  { value: "partnership", label: "Business Partnership" },
  { value: "custom", label: "Custom Service Request" }
]

const urgencyLevels = [
  { value: "low", label: "Low - General inquiry", color: "text-gray-600" },
  { value: "medium", label: "Medium - Need response within 24 hours", color: "text-yellow-600" },
  { value: "high", label: "High - Need response within 4 hours", color: "text-orange-600" },
  { value: "urgent", label: "Urgent - Need immediate response", color: "text-red-600" }
]

const contactMethods = [
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our team",
    contact: "+234 816 066 2997",
    availability: "Mon-Sat: 8AM - 8PM"
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Get instant help online",
    contact: "Available on website",
    availability: "24/7 Available"
  },
  {
    icon: Mail,
    title: "Email Support", 
    description: "Send detailed inquiries",
    contact: "support@ruachestore.com.ng",
    availability: "Response within 4 hours"
  }
]

export default function ServiceRequestPage() {
  const [requestForm, setRequestForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    serviceType: "",
    urgency: "",
    preferredContact: "",
    location: "",
    budget: "",
    timeline: "",
    subject: "",
    description: "",
    attachments: ""
  })

  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Service request:", requestForm)
    setIsSubmitted(true)
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setRequestForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        serviceType: "",
        urgency: "",
        preferredContact: "",
        location: "",
        budget: "",
        timeline: "",
        subject: "",
        description: "",
        attachments: ""
      })
    }, 3000)
  }

  const handleInputChange = (field: string, value: string) => {
    setRequestForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="rounded-full w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your service request. Our team will review it and get back to you 
              within the timeframe you specified.
            </p>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-green-700">
                <strong>What's Next?</strong><br />
                • You'll receive a confirmation email shortly<br />
                • Our team will review your request<br />
                • We'll contact you via your preferred method<br />
                • Track your request status via email updates
              </p>
            </div>
            <Button 
              onClick={() => setIsSubmitted(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="py-12 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Request a Service
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Need help with something specific? Fill out the form below and our expert team 
            will get back to you with a customized solution.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Service Request Form</CardTitle>
                <p className="text-gray-600">
                  Please provide as much detail as possible to help us serve you better.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <Input
                          type="text"
                          value={requestForm.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <Input
                          type="text"
                          value={requestForm.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          value={requestForm.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <Input
                          type="tel"
                          value={requestForm.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company/Organization (Optional)
                        </label>
                        <Input
                          type="text"
                          value={requestForm.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Service Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Type *
                        </label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={requestForm.serviceType}
                          onChange={(e) => handleInputChange("serviceType", e.target.value)}
                          required
                        >
                          <option value="">Select service type</option>
                          {serviceTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Urgency Level *
                        </label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={requestForm.urgency}
                          onChange={(e) => handleInputChange("urgency", e.target.value)}
                          required
                        >
                          <option value="">Select urgency level</option>
                          {urgencyLevels.map(level => (
                            <option key={level.value} value={level.value} className={level.color}>
                              {level.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Contact Method *
                        </label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={requestForm.preferredContact}
                          onChange={(e) => handleInputChange("preferredContact", e.target.value)}
                          required
                        >
                          <option value="">Select contact method</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone Call</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="sms">SMS</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location *
                        </label>
                        <Input
                          type="text"
                          placeholder="City, State"
                          value={requestForm.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Budget Range (Optional)
                        </label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={requestForm.budget}
                          onChange={(e) => handleInputChange("budget", e.target.value)}
                        >
                          <option value="">Select budget range</option>
                          <option value="under-50k">Under ₦50,000</option>
                          <option value="50k-200k">₦50,000 - ₦200,000</option>
                          <option value="200k-500k">₦200,000 - ₦500,000</option>
                          <option value="500k-1m">₦500,000 - ₦1,000,000</option>
                          <option value="over-1m">Over ₦1,000,000</option>
                          <option value="custom">Custom/Discuss</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timeline (Optional)
                        </label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={requestForm.timeline}
                          onChange={(e) => handleInputChange("timeline", e.target.value)}
                        >
                          <option value="">Select timeline</option>
                          <option value="asap">ASAP</option>
                          <option value="this-week">This week</option>
                          <option value="this-month">This month</option>
                          <option value="next-month">Next month</option>
                          <option value="flexible">Flexible</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Request Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject *
                        </label>
                        <Input
                          type="text"
                          placeholder="Brief summary of your request"
                          value={requestForm.subject}
                          onChange={(e) => handleInputChange("subject", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Detailed Description *
                        </label>
                        <Textarea
                          placeholder="Please provide a detailed description of what you need, including any specific requirements, preferences, or constraints..."
                          value={requestForm.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          className="min-h-[120px]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attachments (Optional)
                        </label>
                        <Input
                          type="text"
                          placeholder="List any documents or files you'd like to share (provide links or mention you'll email them)"
                          value={requestForm.attachments}
                          onChange={(e) => handleInputChange("attachments", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    <Send className="mr-2 h-5 w-5" />
                    Submit Service Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Alternative Contact Methods</CardTitle>
                <p className="text-sm text-gray-600">
                  Prefer to contact us directly? Use any of these methods.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMethods.map((method, index) => (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <div className="flex items-start space-x-3">
                      <div className="rounded-full w-10 h-10 bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <method.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{method.title}</h4>
                        <p className="text-xs text-gray-600 mb-1">{method.description}</p>
                        <p className="text-sm font-medium text-blue-600">{method.contact}</p>
                        <p className="text-xs text-gray-500">{method.availability}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Urgent requests:</span>
                    <span className="font-medium text-red-600">Within 1 hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>High priority:</span>
                    <span className="font-medium text-orange-600">Within 4 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Standard requests:</span>
                    <span className="font-medium text-green-600">Within 24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>General inquiries:</span>
                    <span className="font-medium text-blue-600">Within 48 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = 'tel:+2348160662997'}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now: +234 816 066 2997
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = 'https://wa.me/2348160662997'}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp Chat
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = 'mailto:support@ruachestore.com.ng'}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}