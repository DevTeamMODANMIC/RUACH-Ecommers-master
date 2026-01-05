"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Headphones, 
  Clock, 
  MessageCircle, 
  Mail, 
  Phone, 
  CheckCircle,
  Star,
  Search,
  ArrowRight,
  Users,
  Shield,
  Zap,
  Heart,
  HelpCircle,
  FileText,
  Video
} from "lucide-react"

const supportChannels = [
  {
    icon: Phone,
    title: "Phone Support",
    description: "Talk directly to our support team",
    availability: "Mon-Sat: 8AM - 8PM",
    contact: "+2348160662997",
    responseTime: "Immediate"
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Get instant help through our website chat",
    availability: "24/7 Available",
    contact: "Website Chat Widget",
    responseTime: "< 2 minutes"
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us detailed inquiries via email",
    availability: "24/7 Available",
    contact: "support@ruachestore.com.ng",
    responseTime: "< 4 hours"
  },
  {
    icon: Video,
    title: "Video Support",
    description: "Screen sharing for complex issues",
    availability: "Mon-Fri: 9AM - 6PM", 
    contact: "By Appointment",
    responseTime: "Same Day"
  }
]

const supportCategories = [
  {
    icon: Package,
    title: "Order Issues",
    description: "Help with orders, tracking, returns, and refunds",
    commonIssues: ["Order status", "Delivery tracking", "Returns & refunds", "Payment issues"]
  },
  {
    icon: Users,
    title: "Account Support", 
    description: "Account management, login issues, and profile updates",
    commonIssues: ["Login problems", "Password reset", "Profile updates", "Account verification"]
  },
  {
    icon: Store,
    title: "Vendor Support",
    description: "Support for vendors selling on our platform", 
    commonIssues: ["Store setup", "Product listing", "Payment issues", "Analytics help"]
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    description: "Data protection, security concerns, and privacy issues",
    commonIssues: ["Data privacy", "Security alerts", "Fraud reports", "Account security"]
  }
]

const faqItems = [
  {
    question: "How do I track my order?",
    answer: "You can track your order by logging into your account and visiting the 'My Orders' section. You'll also receive SMS and email updates with tracking information."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 7-day return policy for most items. Products must be in original condition with tags attached. Some categories like perishable foods cannot be returned."
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery times vary by location. Lagos same-day delivery, other major cities 1-3 days, and remote areas 3-7 days."
  },
  {
    question: "Do you offer bulk discounts?",
    answer: "Yes! We offer special pricing for bulk orders. Contact our sales team at sales@ruachestore.com.ng for custom quotes on large orders."
  },
  {
    question: "How do I become a vendor?",
    answer: "Visit our vendor registration page, complete the application with your business details, submit required documents, and our team will review your application within 2-3 business days."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept bank transfers, card payments (Visa, Mastercard), mobile money, and cash on delivery for selected locations."
  }
]

const satisfactionStats = [
  { metric: "95%", label: "Customer Satisfaction" },
  { metric: "< 2 min", label: "Average Response Time" },
  { metric: "24/7", label: "Support Availability" },
  { metric: "98%", label: "Issue Resolution Rate" }
]

import { Package, Store } from "lucide-react"

export default function CustomerSupportService() {
  const [ticketForm, setTicketForm] = useState({
    name: "",
    email: "", 
    phone: "",
    category: "",
    priority: "",
    subject: "",
    message: ""
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFAQs, setFilteredFAQs] = useState(faqItems)

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle ticket submission
    console.log("Support ticket:", ticketForm)
    alert("Support ticket submitted! We'll respond within 4 hours.")
    setTicketForm({ name: "", email: "", phone: "", category: "", priority: "", subject: "", message: "" })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const filtered = faqItems.filter(item => 
      item.question.toLowerCase().includes(query.toLowerCase()) ||
      item.answer.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredFAQs(filtered)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full w-20 h-20 bg-white/20 flex items-center justify-center">
              <Headphones className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            We're Here to Help
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Get fast, friendly support from our expert team. 
            We're committed to resolving your issues quickly and efficiently.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {satisfactionStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.metric}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support Channels */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Multiple Ways to Reach Us</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the support channel that works best for you
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportChannels.map((channel, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="rounded-full w-16 h-16 bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <channel.icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">{channel.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">{channel.description}</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Available:</span> {channel.availability}
                    </div>
                    <div>
                      <span className="font-medium">Response:</span> {channel.responseTime}
                    </div>
                    <div className="pt-2">
                      <span className="font-medium text-purple-600">{channel.contact}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Support Categories */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Can We Help You With?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our support categories to find quick solutions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="rounded-full w-12 h-12 bg-blue-100 flex items-center justify-center mb-3">
                    <category.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <div className="space-y-1">
                    {category.commonIssues.map((issue, i) => (
                      <div key={i} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        {issue}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600 mb-8">
                Find quick answers to common questions
              </p>
              
              {/* Search FAQ */}
              <div className="relative max-w-md mx-auto">
                <Input
                  type="search"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-4 pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="rounded-full w-8 h-8 bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <HelpCircle className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Support Ticket */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
              <p className="text-lg text-gray-600">
                Can't find what you're looking for? Submit a support ticket and we'll get back to you.
              </p>
            </div>
            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleTicketSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        value={ticketForm.name}
                        onChange={(e) => setTicketForm({...ticketForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={ticketForm.email}
                        onChange={(e) => setTicketForm({...ticketForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={ticketForm.phone}
                        onChange={(e) => setTicketForm({...ticketForm, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={ticketForm.category}
                        onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                        required
                      >
                        <option value="">Select category</option>
                        <option value="order">Order Issues</option>
                        <option value="account">Account Support</option>
                        <option value="vendor">Vendor Support</option>
                        <option value="technical">Technical Issues</option>
                        <option value="billing">Billing & Payments</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                      required
                    >
                      <option value="">Select priority</option>
                      <option value="low">Low - General inquiry</option>
                      <option value="medium">Medium - Issue affecting service</option>
                      <option value="high">High - Urgent issue</option>
                      <option value="critical">Critical - Service completely unavailable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <Input
                      type="text"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detailed Description
                    </label>
                    <Textarea
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                      placeholder="Please provide as much detail as possible about your issue..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    Submit Support Ticket
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Contact Options */}
      <div className="py-16 bg-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need Immediate Assistance?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            For urgent issues, contact us directly via phone or live chat
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => window.location.href = 'tel:+2348160662997'}
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Now: +234 816 066 2997
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-purple-600"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Live Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}