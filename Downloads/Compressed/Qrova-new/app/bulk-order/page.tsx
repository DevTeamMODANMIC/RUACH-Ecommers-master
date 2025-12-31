"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useCurrency } from "@/components/currency-provider"
import { Package2, TrendingDown, Building2, Truck, CheckCircle, Clock, FileText } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CurrencyProvider } from "@/components/currency-provider"

export default function BulkOrderPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { formatPrice } = useCurrency()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Inquiry Submitted",
      description: "Our team will contact you within 24 hours to discuss your requirements.",
    })

    setIsSubmitting(false)
  }

  return (
    <CurrencyProvider>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Bulk Orders</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Bulk Orders & Wholesale</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Special pricing and dedicated support for businesses, restaurants, and large volume customers. Save more
              when you order more with our tiered pricing structure.
            </p>
          </div>

          {/* Hero Section */}
          <div className="relative rounded-xl overflow-hidden mb-16 bg-gradient-to-r from-green-600 to-green-800">
            <div className="absolute inset-0 opacity-20">
              <Image src="/placeholder.svg?height=600&width=1200" alt="Bulk Orders" fill className="object-cover" />
            </div>
            <div className="relative z-10 p-8 md:p-12 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold">Volume Discounts Up To 25%</h2>
                  <p className="text-lg text-green-100">
                    Whether you're a restaurant owner, retailer, or planning a large event, our bulk ordering system
                    offers significant savings and personalized service.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button size="lg" className="bg-green-600 text-white hover:bg-green-700">
                      Get Started
                    </Button>
                    <Button size="lg" variant="outline" className="border-gray-400 text-white hover:bg-gray-800/50">
                      View Pricing
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 space-y-4">
                  <h3 className="text-xl font-semibold">Bulk Order Savings</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>10+ units</span>
                      <span className="font-bold">10% OFF</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>25+ units</span>
                      <span className="font-bold">15% OFF</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>50+ units</span>
                      <span className="font-bold">20% OFF</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>100+ units</span>
                      <span className="font-bold">25% OFF</span>
                    </div>
                    <div className="pt-2 border-t border-white/20 text-sm">
                      Custom pricing available for larger quantities
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Why Choose Our Bulk Ordering Service?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                      <TrendingDown className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Tiered Discounts</h3>
                    <p className="text-muted-foreground">
                      Our volume-based pricing ensures you get better rates as your order quantity increases. Save up to
                      25% on large orders.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                      <Truck className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
                    <p className="text-muted-foreground">
                      Qualify for free shipping options on bulk orders. Express delivery available for time-sensitive
                      requirements.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                      <Building2 className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Business Accounts</h3>
                    <p className="text-muted-foreground">
                      Create a business account for streamlined ordering, invoicing, and special terms for regular
                      customers.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-green-600 text-white flex items-center justify-center mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Select Products</h3>
                <p className="text-sm text-muted-foreground">
                  Browse our catalog and choose the products you need in bulk quantities.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-green-600 text-white flex items-center justify-center mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">Request Quote</h3>
                <p className="text-sm text-muted-foreground">
                  Submit your bulk order request with quantities and business details.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-green-600 text-white flex items-center justify-center mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Receive Confirmation</h3>
                <p className="text-sm text-muted-foreground">
                  Our team will contact you to confirm details and provide a final quote.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-green-600 text-white flex items-center justify-center mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="font-semibold mb-2">Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Your bulk order will be prepared and delivered according to your requirements.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mb-16">
            <Tabs defaultValue="businesses" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="businesses">For Businesses</TabsTrigger>
                <TabsTrigger value="events">For Events</TabsTrigger>
                <TabsTrigger value="resellers">For Resellers</TabsTrigger>
              </TabsList>
              <TabsContent value="businesses" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bulk Solutions for Businesses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      We offer specialized bulk ordering solutions for restaurants, cafes, grocery stores, and other
                      food businesses. Our business accounts include:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Dedicated account manager for personalized service</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Flexible payment terms with net-30 invoicing options</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Regular delivery schedules to ensure consistent stock levels</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Product customization and private labeling options</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="events" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bulk Orders for Events</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      Planning a wedding, corporate event, or cultural celebration? Our event bulk ordering service
                      helps you:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Get exactly the right quantities for your guest count</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Coordinate delivery timing with your event schedule</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Access special event packaging and presentation options</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Receive guidance on quantities and popular selections</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="resellers" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Wholesale for Resellers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>Our wholesale program for resellers and distributors offers competitive advantages:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Maximum discounts on large volume orders</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Dropshipping options available for online retailers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Marketing materials and product information sheets</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Territory protection options for exclusive distributors</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Inquiry Form */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold">Get in Touch</h2>
                <p className="text-muted-foreground">
                  Fill out the form to discuss your bulk order requirements with our team. We'll provide a custom quote
                  based on your specific needs.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-medium">Quick Response</h3>
                      <p className="text-sm text-muted-foreground">We'll respond to your inquiry within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-medium">Detailed Quote</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive a comprehensive quote with all costs clearly outlined
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package2 className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-medium">Sample Orders</h3>
                      <p className="text-sm text-muted-foreground">
                        Request product samples before committing to large orders
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Contact Us Directly</h3>
                  <p className="text-sm text-muted-foreground mb-2">For immediate assistance with bulk orders:</p>
                  <p className="text-sm">
                    Email: <span className="font-medium">bulk@grova.com</span>
                    <br />
                    Phone: <span className="font-medium">+44 20 1234 5678</span>
                  </p>
                </div>
              </div>

              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Bulk Order Inquiry</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="businessName">Business Name *</Label>
                          <Input id="businessName" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactName">Contact Name *</Label>
                          <Input id="contactName" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input id="email" type="email" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input id="phone" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type *</Label>
                        <select id="businessType" className="w-full p-2 border rounded-md bg-background" required>
                          <option value="">Select Business Type</option>
                          <option value="restaurant">Restaurant</option>
                          <option value="retailer">Retailer</option>
                          <option value="wholesaler">Wholesaler</option>
                          <option value="caterer">Caterer</option>
                          <option value="event">Event Planner</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="orderFrequency">Expected Order Frequency</Label>
                        <select id="orderFrequency" className="w-full p-2 border rounded-md bg-background">
                          <option value="one-time">One-time Order</option>
                          <option value="weekly">Weekly</option>
                          <option value="bi-weekly">Bi-weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="productInterest">Products of Interest *</Label>
                        <Textarea
                          id="productInterest"
                          placeholder="Please list the products and approximate quantities you're interested in"
                          required
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additionalInfo">Additional Information</Label>
                        <Textarea id="additionalInfo" placeholder="Any special requirements or questions" rows={3} />
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        By submitting this form, you agree to our{" "}
                        <Link href="/terms" className="underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">What is the minimum order quantity for bulk pricing?</h3>
                  <p className="text-sm text-muted-foreground">
                    Our bulk pricing starts at 10 units per product. Higher discounts are available at 25, 50, and 100+
                    units.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">How long does bulk order delivery take?</h3>
                  <p className="text-sm text-muted-foreground">
                    Standard bulk orders typically ship within 3-5 business days. Express options are available for
                    urgent requirements.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Can I mix different products in a bulk order?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can combine different products. Discounts are applied based on the quantity of each
                    individual product.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Do you offer payment terms for businesses?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes, established businesses can apply for net-30 payment terms after their first order. Credit
                    applications are required.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Can I request samples before placing a bulk order?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes, we offer sample packs for business customers. Sample costs are credited toward your first bulk
                    order.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Do you ship bulk orders internationally?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes, we ship bulk orders worldwide. International shipping costs and delivery times vary by
                    destination.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Save with Bulk Orders?</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Contact our bulk order specialists today to discuss your requirements and get a custom quote.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Request a Quote
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CurrencyProvider>
  )
}
