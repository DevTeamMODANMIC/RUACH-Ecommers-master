"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Send, 
  CheckCircle,
  X,
  Headphones,
  Calendar,
  Clock
} from "lucide-react"

interface ContactIntegrationProps {
  title?: string
  description?: string
  showQuickContact?: boolean
  showContactForm?: boolean
  formType?: 'general' | 'support' | 'sales' | 'partnership'
  className?: string
}

const quickContactMethods = [
  {
    id: 'phone',
    icon: Phone,
    title: 'Phone Support',
    description: 'Mon-Sat: 8AM - 8PM',
    contact: '+234 816 066 2997',
    action: () => window.location.href = 'tel:+2348160662997',
    color: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    id: 'whatsapp', 
    icon: MessageCircle,
    title: 'WhatsApp Chat',
    description: 'Available 24/7',
    contact: 'Instant messaging',
    action: () => window.open('https://wa.me/2348160662997', '_blank'),
    color: 'bg-green-600 hover:bg-green-700'
  },
  {
    id: 'email',
    icon: Mail,
    title: 'Email Support',
    description: 'Response within 4 hours',
    contact: 'support@ruachestore.com.ng',
    action: () => window.location.href = 'mailto:support@ruachestore.com.ng',
    color: 'bg-purple-600 hover:bg-purple-700'
  }
]

const getFormConfig = (formType: string) => {
  const configs = {
    general: {
      title: 'Get in Touch',
      description: 'Send us a message and we\'ll get back to you soon.',
      submitText: 'Send Message',
      emailSubject: '[General Inquiry]'
    },
    support: {
      title: 'Need Help?',
      description: 'Describe your issue and our support team will assist you.',
      submitText: 'Submit Support Request',
      emailSubject: '[Support Request]'
    },
    sales: {
      title: 'Sales Inquiry',
      description: 'Interested in our services? Let\'s discuss your needs.',
      submitText: 'Submit Sales Inquiry',
      emailSubject: '[Sales Inquiry]'
    },
    partnership: {
      title: 'Partnership Opportunity',
      description: 'Explore partnership opportunities with RUACH.',
      submitText: 'Submit Partnership Inquiry',
      emailSubject: '[Partnership Inquiry]'
    }
  }
  return configs[formType as keyof typeof configs] || configs.general
}

export default function ContactIntegration({
  title = "Contact Us",
  description = "We're here to help. Choose how you'd like to get in touch.",
  showQuickContact = true,
  showContactForm = true,
  formType = 'general',
  className = ""
}: ContactIntegrationProps) {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    priority: "medium"
  })
  
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showFloatingWidget, setShowFloatingWidget] = useState(true)

  const formConfig = getFormConfig(formType)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission (integrate with your backend)
    console.log('Contact form submission:', contactForm)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setContactForm({ name: "", email: "", phone: "", subject: "", message: "", priority: "medium" })
    }, 3000)
  }

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }))
  }

  // Floating Contact Widget
  const FloatingContactWidget = () => (
    <div className={`fixed bottom-6 right-6 z-50 ${showFloatingWidget ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-lg shadow-lg border p-4 max-w-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Headphones className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sm">Need Help?</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFloatingWidget(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Get instant support via WhatsApp or phone
        </p>
        <div className="space-y-2">
          <Button
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700 text-xs"
            onClick={() => window.open('https://wa.me/2348160662997', '_blank')}
          >
            <MessageCircle className="mr-1 h-3 w-3" />
            WhatsApp
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={() => window.location.href = 'tel:+2348160662997'}
          >
            <Phone className="mr-1 h-3 w-3" />
            Call Now
          </Button>
        </div>
      </div>
    </div>
  )

  if (isSubmitted) {
    return (
      <div className={`bg-white rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <div className="rounded-full w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
          <p className="text-gray-600 mb-4">
            Thank you for contacting us. We'll get back to you within 24 hours.
          </p>
          <Button 
            onClick={() => setIsSubmitted(false)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Send Another Message
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`bg-white ${className}`}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Contact Methods */}
          {showQuickContact && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Quick Contact</h3>
              <div className="space-y-4">
                {quickContactMethods.map((method) => (
                  <Card key={method.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`rounded-full w-12 h-12 ${method.color.split(' ')[0]} flex items-center justify-center`}>
                          <method.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{method.title}</h4>
                          <p className="text-sm text-gray-600">{method.description}</p>
                          <p className="text-sm font-medium text-blue-600">{method.contact}</p>
                        </div>
                        <Button
                          onClick={method.action}
                          className={method.color}
                          size="sm"
                        >
                          Contact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Business Hours */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Clock className="h-5 w-5 mr-2" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span className="font-medium">8:00 AM - 8:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span className="font-medium">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span className="font-medium text-red-600">Closed</span>
                    </div>
                    <div className="border-t pt-2 mt-3">
                      <div className="flex justify-between">
                        <span>WhatsApp Support:</span>
                        <span className="font-medium text-green-600">24/7 Available</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Contact Form */}
          {showContactForm && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{formConfig.title}</CardTitle>
                  <p className="text-gray-600">{formConfig.description}</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <Input
                        type="text"
                        value={contactForm.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        required
                      />
                    </div>
                    {formType === 'support' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority Level
                        </label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={contactForm.priority}
                          onChange={(e) => handleInputChange("priority", e.target.value)}
                        >
                          <option value="low">Low - General question</option>
                          <option value="medium">Medium - Need response today</option>
                          <option value="high">High - Urgent issue</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <Textarea
                        value={contactForm.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Please describe your inquiry in detail..."
                        className="min-h-[120px]"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                      <Send className="mr-2 h-4 w-4" />
                      {formConfig.submitText}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Floating Contact Widget */}
      <FloatingContactWidget />
    </>
  )
}