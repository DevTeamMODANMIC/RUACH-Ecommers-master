"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Truck,
  Clock,
  MapPin,
  Package,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Globe,
  Zap
} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function ShippingPage() {
  const shippingOptions = [
    {
      id: "standard",
      name: "Standard Delivery",
      price: "£4.99",
      freeThreshold: "FREE on orders over £50",
      timeframe: "5-7 business days",
      description: "Most economical option for everyday deliveries",
      features: [
        "Tracked delivery",
        "Signature not required",
        "Delivery to home or work address",
        "Weekend delivery available"
      ],
      icon: Truck,
      recommended: false
    },
    {
      id: "express",
      name: "Express Delivery",
      price: "£9.99",
      freeThreshold: "No free option",
      timeframe: "2-3 business days",
      description: "Faster delivery for urgent orders",
      features: [
        "Priority processing",
        "Tracked delivery",
        "Next-day delivery available",
        "Signature required"
      ],
      icon: Zap,
      recommended: true
    }
  ]

  const deliveryAreas = [
    {
      area: "Mainland UK",
      timeframe: "5-7 business days (Standard)",
      cost: "£4.99 (FREE over £50)",
      details: "England, Scotland, Wales"
    },
    {
      area: "Northern Ireland",
      timeframe: "7-10 business days",
      cost: "£8.99",
      details: "All Northern Ireland postcodes"
    },
    {
      area: "Scottish Highlands & Islands",
      timeframe: "7-10 business days",
      cost: "£9.99",
      details: "IV, KW, PA, PH, ZE postcodes"
    }
  ]

  const shippingInfo = [
    {
      title: "Order Processing",
      description: "Orders are processed within 1-2 business days",
      icon: Package
    },
    {
      title: "Tracking Updates",
      description: "Receive email and SMS notifications with tracking information",
      icon: Mail
    },
    {
      title: "Delivery Instructions",
      description: "Leave delivery instructions during checkout",
      icon: MapPin
    },
    {
      title: "Secure Delivery",
      description: "All packages are securely packaged and tamper-evident",
      icon: CheckCircle
    }
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Shipping</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping & Delivery</h1>
          <p className="text-gray-600">Fast, reliable delivery across the UK</p>
        </div>

        {/* UK Only Notice */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🇬🇧</div>
              <div>
                <h2 className="font-semibold text-blue-900">UK Delivery Only</h2>
                <p className="text-sm text-blue-700">We currently deliver to United Kingdom addresses only. International shipping will be available in the future.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Options */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Options</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {shippingOptions.map((option) => {
              const Icon = option.icon
              return (
                <Card key={option.id} className={`relative ${option.recommended ? 'border-emerald-200 bg-emerald-50' : ''}`}>
                  {option.recommended && (
                    <div className="absolute -top-3 left-4">
                      <Badge className="bg-emerald-600 hover:bg-emerald-700">Recommended</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-emerald-600" />
                        {option.name}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-emerald-600">{option.price}</div>
                        <div className="text-xs text-gray-500">{option.freeThreshold}</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="font-medium text-gray-900">{option.timeframe}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
                        <ul className="space-y-1">
                          {option.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Delivery Areas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              Delivery Areas & Timeframes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deliveryAreas.map((area, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{area.area}</div>
                    <div className="text-sm text-gray-600">{area.details}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{area.timeframe}</div>
                    <div className="text-sm text-emerald-600 font-medium">{area.cost}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shippingInfo.map((info) => {
                  const Icon = info.icon
                  return (
                    <div key={info.title} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{info.title}</div>
                        <div className="text-sm text-gray-600">{info.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Business Days Only</div>
                    <div className="text-gray-600">Deliveries are made Monday-Friday, excluding bank holidays</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Signature Required</div>
                    <div className="text-gray-600">Someone must be available to sign for express deliveries</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Delivery Address</div>
                    <div className="text-gray-600">Please ensure your delivery address is complete and accurate</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tracking Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-emerald-600" />
              Order Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How to Track Your Order</h3>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-medium text-emerald-600">1</div>
                    <span>Check your email for tracking information</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-medium text-emerald-600">2</div>
                    <span>Visit our tracking page or use the carrier's website</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-medium text-emerald-600">3</div>
                    <span>Enter your tracking number to see updates</span>
                  </li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tracking Notifications</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Email notifications when order ships</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>SMS updates for express deliveries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Real-time tracking on our website</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Questions About Shipping?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Our customer service team can help with shipping questions, address changes, or delivery issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Support
              </Button>
              <Button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Phone className="h-4 w-4" />
                Call 020 1234 5678
              </Button>
            </div>
            <Separator className="my-6" />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Support available Monday-Friday, 9 AM - 6 PM GMT
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}