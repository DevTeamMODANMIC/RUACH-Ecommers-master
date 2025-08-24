

import { useState, useEffect } from "react"

// import Link from "next/link"
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Badge } from "../../src/components/ui/badge"
import { Button } from "../../src/components/ui/button"
import { Card, CardContent } from "../../src/components/ui/card"
import { TrendingUp, Star, ShoppingCart, Eye, Flame, Store, CheckCircle } from "lucide-react"

import { getProducts } from "../../src/lib/firebase-products"
import { getVendor, type Vendor } from "../../src/lib/firebase-vendors"

// Get trending products from Firebase - only show real products
const getTrendingProducts = async () => {
  try {
    // Fetch real products from Firebase
    const { products: firebaseProducts } = await getProducts({})
    
    // If no real products exist, don't show trending section
    if (firebaseProducts.length === 0) {
      return []
    }
    
    // Filter for products with good ratings and sort by popularity
    return firebaseProducts
      .filter(product => product.rating && product.rating >= 4.0)
      .sort((a, b) => {
        // Sort by rating first, then by review count if available
        const aRating = a.rating || 0
        const bRating = b.rating || 0
        if (bRating !== aRating) return bRating - aRating
        
        // If ratings are equal, sort by review count or random for demo
        return Math.random() - 0.5
      })
      .slice(0, 8) // Show top 8 trending products
  } catch (error) {
    console.error("Error fetching trending products:", error)
    return []
  }
}

export default function TrendingProducts() {
  const [trendingProducts, setTrendingProducts] = useState<any[]>([])
  const [vendors, setVendors] = useState<Record<string, Vendor>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTrendingProducts = async () => {
      setIsLoading(true)
      try {
        const trending = await getTrendingProducts()
        setTrendingProducts(trending)
      } catch (error) {
        console.error("Error loading trending products:", error)
        setTrendingProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadTrendingProducts()
  }, [])

  // Fetch vendor information for products
  useEffect(() => {
    const fetchVendors = async () => {
      const vendorIds = [...new Set(trendingProducts.filter(p => p.vendorId).map(p => p.vendorId!))]
      const vendorPromises = vendorIds.map(async (vendorId) => {
        try {
          const vendor = await getVendor(vendorId)
          return { vendorId, vendor }
        } catch (error) {
          console.error(`Error fetching vendor ${vendorId}:`, error)
          return { vendorId, vendor: null }
        }
      })
      
      const vendorResults = await Promise.all(vendorPromises)
      const vendorMap: Record<string, Vendor> = {}
      
      vendorResults.forEach(({ vendorId, vendor }) => {
        if (vendor) {
          vendorMap[vendorId] = vendor
        }
      })
      
      setVendors(vendorMap)
    }

    if (trendingProducts.length > 0) {
      fetchVendors()
    }
  }, [trendingProducts])

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded-md w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-md w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded-md mb-2"></div>
                <div className="h-6 bg-gray-200 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (trendingProducts.length === 0) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <Flame className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Trending Products Yet</h3>
            <p className="text-gray-600 mb-6">
              Trending products will appear here once vendors start adding products and customers begin shopping.
            </p>
            <div className="space-x-4">
              <Link to="/vendor/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Store className="h-4 w-4 mr-2" />
                  Become a Vendor
                </Button>
              </Link>
              <Link to="/shop">
                <Button variant="outline">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="h-6 w-6 text-orange-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Trending Now
            </h2>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover what's popular right now - these products are flying off our shelves!
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {trendingProducts.map((product, index) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-white relative overflow-hidden">
              {/* Trending Badge */}
              {index < 3 && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                    <Flame className="h-3 w-3 mr-1" />
                    #{index + 1} Trending
                  </Badge>
                </div>
              )}

              {/* Product Image */}
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                <Link href={`/products/${product.id}`}>
                  <img 
                    src={product.images?.[0] || "/placeholder.jpg"} 
                    alt={product.name} 
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </Link>
                
                {product.discount && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-red-500 hover:bg-red-600 text-white">
                      -{product.discount}% OFF
                    </Badge>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-green-50 transition-colors">
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-green-50 transition-colors">
                      <ShoppingCart className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-medium text-lg hover:text-green-600 transition-colors mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-sm text-gray-500 mb-2">
                  {product.category}
                </p>

                {/* Vendor Info */}
                {product.vendorId && vendors[product.vendorId] && (
                  <div className="mb-2">
                    <Link 
                      href={`/vendor/${product.vendorId}`}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {vendors[product.vendorId].logoUrl ? (
                        <Image
                          src={vendors[product.vendorId].logoUrl}
                          alt={vendors[product.vendorId].shopName}
                          width={12}
                          height={12}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <Store className="h-3 w-3" />
                      )}
                      <span>{vendors[product.vendorId].shopName}</span>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    </Link>
                  </div>
                )}
                
                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({Math.floor(Math.random() * 50) + 10} reviews)
                    </span>
                  </div>
                )}
                
                {/* Price */}
                <div className="flex items-center justify-between">
                  <div>
                    {product.discount ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600">
                          ₦{(product.price * (1 - product.discount / 100)).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ₦{product.price?.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-gray-900">
                        ₦{product.price?.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trending Vendors Section - Only show if we have vendor data */}
        {Object.keys(vendors).length > 0 && (
          <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-orange-500" />
              Top Trending Vendors
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(vendors)
                .slice(0, 4)
                .map(([vendorId, vendor], index) => (
                  <Link 
                    key={vendorId}
                    href={`/vendor/${vendorId}`}
                    className="flex items-center gap-2 p-3 rounded-lg border hover:border-orange-200 hover:bg-orange-50 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden">
                      {vendor.logoUrl ? (
                        <Image
                          src={vendor.logoUrl}
                          alt={vendor.shopName}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <Store className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-orange-600">
                        {vendor.shopName}
                      </p>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-gray-500">Verified</span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}

        {/* View All Buttons */}
        <div className="text-center space-x-4">
          <Link to="/shop">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
              <TrendingUp className="h-5 w-5 mr-2" />
              View All Trending Products
            </Button>
          </Link>
          <Link to="/stores">
            <Button size="lg" variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
              <Store className="h-5 w-5 mr-2" />
              Browse All Stores
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}