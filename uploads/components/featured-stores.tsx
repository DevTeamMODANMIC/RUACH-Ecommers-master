"use client"

import { useState, useEffect } from "react"
import { getAllVendors, Vendor } from "@/lib/firebase-vendors"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Store, ArrowRight, Users, Package } from "lucide-react"

// Using Vendor type from firebase-vendors

export default function FeaturedStores() {
    const [vendors, setVendors] = useState<Vendor[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadFeaturedVendors() {
            try {
                setIsLoading(true)
                const vendorsList = await getAllVendors()

                // Only show approved vendors, limit to 4 for homepage
                const approvedVendors = vendorsList
                    .filter(vendor => vendor.approved)
                    .slice(0, 4)

                setVendors(approvedVendors)
            } catch (error) {
                console.error("Error loading featured vendors:", error)
                setVendors([])
            } finally {
                setIsLoading(false)
            }
        }

        loadFeaturedVendors()
    }, [])

    if (isLoading) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="h-8 bg-gray-200 rounded-md w-64 mx-auto mb-4 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded-md w-96 mx-auto animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                                <div className="h-6 bg-gray-200 rounded-md mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded-md mb-4"></div>
                                <div className="h-10 bg-gray-200 rounded-md"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (vendors.length === 0) {
        return null // Don't show section if no vendors
    }

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Featured Stores
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover authentic African products from our verified vendors
                    </p>
                </div>

                {/* Stores Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {vendors.map((vendor) => (
                        <Card key={vendor.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-white">
                            <CardContent className="p-6 text-center">
                                {/* Store Logo */}
                                <div className="flex items-center justify-center mb-4">
                                    {vendor.logoUrl ? (
                                        <Image
                                            src={vendor.logoUrl}
                                            alt={vendor.shopName}
                                            width={64}
                                            height={64}
                                            className="rounded-full border-4 border-green-100 object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                            <Store className="h-8 w-8 text-green-600" />
                                        </div>
                                    )}
                                </div>

                                {/* Store Info */}
                                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                                    {vendor.shopName}
                                </h3>

                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                    {vendor.bio || "Quality African products and authentic flavors"}
                                </p>

                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs mb-4">
                                    Verified Store
                                </Badge>

                                {/* Visit Store Button */}
                                <Link href={`/vendor/${vendor.id}`}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full group-hover:bg-green-50 group-hover:border-green-200 transition-colors"
                                    >
                                        <Store className="h-4 w-4 mr-2" />
                                        Visit Store
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* View All Stores CTA */}
                <div className="text-center">
                    <Link href="/stores">
                        <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white border-0">
                            <Users className="h-5 w-5 mr-2 text-white" />
                            <span className="text-white">View All Stores</span>
                            <ArrowRight className="h-5 w-5 ml-2 text-white" />
                        </Button>
                    </Link>
                </div>

                {/* Vendor CTA */}
                <div className="mt-12 bg-white rounded-lg p-8 text-center border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Want to Start Your Own Store?</h3>
                    <p className="text-gray-600 mb-4">
                        Join our marketplace and reach thousands of customers
                    </p>
                    <Link href="/vendor/register">
                        <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                            <Package className="h-4 w-4 mr-2" />
                            Become a Vendor
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}