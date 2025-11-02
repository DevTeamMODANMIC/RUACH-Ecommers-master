"use client"

import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"

import { Link } from "react-router-dom"
import { 
  Sparkles, 
  CheckCircle, 
  Plus, 
  Eye, 
  TrendingUp, 
  Wrench, 
  Store,
  ShoppingBag,
  Star
} from "lucide-react"

interface DashboardWelcomeProps {
  userType: "vendor" | "service-provider"
  userName?: string
  onGetStarted?: () => void
  vendorId?: string // Add vendorId prop for vendor storefront link
}

export function DashboardWelcome({ userType, userName, onGetStarted, vendorId }: DashboardWelcomeProps) {
  const isVendor = userType === "vendor"
  const title = isVendor ? "Vendor" : "Service Provider"
  const icon = isVendor ? ShoppingBag : Wrench
  const bgColor = isVendor ? "bg-green-100" : "bg-blue-100"
  const textColor = isVendor ? "text-green-600" : "text-blue-600"
  const buttonColor = isVendor ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
  
  const addLink = isVendor ? "/vendor/dashboard/products/new" : "/service-provider/dashboard/services/add"
  const analyticsLink = isVendor ? "/vendor/dashboard/analytics" : "/service-provider/dashboard/analytics"
  const registerLink = isVendor ? "/vendor/register" : "/vendor/register?type=service-provider"
  const storefrontLink = vendorId ? `/vendor/${vendorId}` : "/vendor/dashboard" // Use vendor's public page if ID available
  
  const welcomeText = isVendor 
    ? "Let's get your store set up and start selling amazing products." 
    : "Let's get your service business set up and start receiving bookings."
    
  const checklistItems = isVendor
    ? [
        { 
          title: "Store Created", 
          description: "Your vendor account is set up and ready!",
          completed: true
        },
        { 
          title: "Add Your First Product", 
          description: "Start building your inventory with your first product listing",
          completed: false,
          link: "/vendor/dashboard/products/new"
        },
        { 
          title: "Customize Your Store", 
          description: "Add more products and optimize your store for better visibility",
          completed: false,
          link: "/vendor/dashboard/products"
        }
      ]
    : [
        { 
          title: "Profile Created", 
          description: "Your service provider profile is set up and ready!",
          completed: true
        },
        { 
          title: "Add Your First Service", 
          description: "Start building your service offerings with your first listing",
          completed: false,
          link: "/service-provider/dashboard/services/add"
        },
        { 
          title: "Start Receiving Bookings", 
          description: "Customers will be able to book your services",
          completed: false,
          link: "/service-provider/dashboard/bookings"
        }
      ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <div className={`p-4 ${bgColor} rounded-full`}>
            <Sparkles className={`h-8 w-8 ${textColor}`} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Good morning, {userName || title}!
        </h1>
        <p className="text-lg text-gray-500 mb-2">Welcome to your dashboard</p>
        <p className="text-xl text-gray-600 mb-8">
          {welcomeText}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className={buttonColor}>
            <Link to={addLink}>
              <Plus className="h-5 w-5 mr-2" />
              {isVendor ? "Add Your First Product" : "Add Your First Service"}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to={analyticsLink}>
              <Eye className="h-5 w-5 mr-2" />
              View Analytics
            </Link>
          </Button>
        </div>
      </div>

      {/* Getting Started Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className={`h-5 w-5 ${textColor}`} />
            Getting Started Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checklistItems.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  item.completed 
                    ? (isVendor ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200")
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  item.completed 
                    ? (isVendor ? "bg-green-600" : "bg-blue-600")
                    : "bg-gray-300"
                }`}>
                  {item.completed ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    item.completed 
                      ? (isVendor ? "text-green-800" : "text-blue-800")
                      : "text-gray-800"
                  }`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm ${
                    item.completed 
                      ? (isVendor ? "text-green-700" : "text-blue-700")
                      : "text-gray-600"
                  }`}>
                    {item.description}
                  </p>
                </div>
                {!item.completed && item.link && (
                  <Button asChild size="sm">
                    <Link to={item.link}>
                      {isVendor ? "Add Product" : "Add Service"}
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips for Success */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Tips for Success
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 ${isVendor ? "bg-green-600" : "bg-blue-600"} rounded-full mt-2`}></div>
                <div>
                  <h4 className="font-medium">High-Quality Content</h4>
                  <p className="text-sm text-gray-600">
                    {isVendor 
                      ? "Use clear, well-lit photos to showcase your products" 
                      : "Provide detailed descriptions of your services"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 ${isVendor ? "bg-green-600" : "bg-blue-600"} rounded-full mt-2`}></div>
                <div>
                  <h4 className="font-medium">Competitive Pricing</h4>
                  <p className="text-sm text-gray-600">Set fair prices based on market research</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 ${isVendor ? "bg-green-600" : "bg-blue-600"} rounded-full mt-2`}></div>
                <div>
                  <h4 className="font-medium">Detailed Information</h4>
                  <p className="text-sm text-gray-600">
                    {isVendor 
                      ? "Write compelling product descriptions with key details" 
                      : "Use high-quality images for your services"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 ${isVendor ? "bg-green-600" : "bg-blue-600"} rounded-full mt-2`}></div>
                <div>
                  <h4 className="font-medium">Fast Response</h4>
                  <p className="text-sm text-gray-600">Respond quickly to customer inquiries</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}