"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  AlertTriangle
} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function ReturnsPage() {
  const returnSteps = [
    {
      step: 1,
      title: "Contact Us",
      description: "Contact our customer service team within 30 days of delivery",
      icon: Phone,
      details: "Call 020 1234 5678 or email support@qrova.co.uk with your order number"
    },
    {
      step: 2,
      title: "Get Return Label",
      description: "We'll provide you with a prepaid return label",
      icon: Package,
      details: "Return shipping is free for defective items or our error"
    },
    {
      step: 3,
      title: "Pack & Send",
      description: "Pack items securely in original packaging with tags attached",
      icon: Truck,
      details: "Drop off at any post office or collection point"
    },
    {
      step: 4,
      title: "Refund Processed",
      description: "Refund issued within 3-5 business days of receiving return",
      icon: CreditCard,
      details: "You'll receive an email confirmation once processed"
    }
  ]

  const returnConditions = [
    {
      title: "Eligible Items",
      items: [
        "Items must be in original condition with tags attached",
        "Items must be unworn, unwashed, and free from odors",
        "Original packaging should be included when possible",
        "Items must be returned within 30 days of delivery"
      ],
      icon: CheckCircle,
      color: "text-emerald-600"
    },
    {
      title: "Non-Returnable Items",
      items: [
        "Items that have been worn, washed, or damaged",
        "Items without original tags or packaging",
        "Underwear, earrings, or personal care items",
        "Items returned after 30 days",
        "Sale items marked as final sale"
      ],
      icon: XCircle,
      color: "text-red-600"
    }
  ]

  const refundInfo = [
    {
      title: "Processing Time",
      description: "3-5 business days after we receive your return",
      icon: Clock
    },
    {
      title: "Original Payment Method",
      description: "Refunds are issued to your original payment method",
      icon: CreditCard
    },
    {
      title: "Email Confirmation",
      description: "You'll receive an email when refund is processed",
      icon: Mail
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
              <BreadcrumbPage>Returns</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Returns & Exchanges</h1>
          <p className="text-gray-600">Easy returns within 30 days of delivery</p>
        </div>

        {/* Return Policy Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-emerald-600" />
              Our Return Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">30-Day Returns</h3>
                <p className="text-sm text-gray-600">Return any item within 30 days of delivery</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Free Returns</h3>
                <p className="text-sm text-gray-600">Free return shipping for defective items</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Easy Process</h3>
                <p className="text-sm text-gray-600">Simple 4-step return process</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Return Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How to Return an Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {returnSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {step.step}
                      </div>
                      {index < returnSteps.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 ml-4 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-2">{step.description}</p>
                      <p className="text-sm text-gray-500">{step.details}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Return Conditions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {returnConditions.map((condition) => {
            const Icon = condition.icon
            return (
              <Card key={condition.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${condition.color}`} />
                    {condition.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {condition.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${condition.color.replace('text-', 'bg-')}`} />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Refund Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Refund Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {refundInfo.map((info) => {
                const Icon = info.icon
                return (
                  <div key={info.title} className="text-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Special Notice */}
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Important Notes</h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Sale items are eligible for return unless marked as final sale</li>
                  <li>• Original shipping charges are not refundable unless the return is due to our error</li>
                  <li>• Items must be returned in their original packaging when possible</li>
                  <li>• We recommend using tracked shipping for your return</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help with Your Return?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Our customer service team is here to help you with any questions about returns or exchanges.
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
                Our support team is available Monday-Friday, 9 AM - 6 PM GMT
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}