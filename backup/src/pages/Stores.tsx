import { useState, useEffect } from "react"
import { getAllVendors, Vendor, getVendorProducts } from "../lib/firebase-vendors"

import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Store, MapPin, Package, Star, Search, Filter, Users, Calendar } from "lucide-react"
import { Loader2 } from "lucide-react"

// Using Vendor type from firebase-vendors with additional optional fields
interface ExtendedVendor extends Vendor {
  productCount?: number
  rating?: number
  location?: string
}

export default function StoresPage() {
  const [vendors, setVendors] = useState<ExtendedVendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<ExtendedVendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest") // newest, oldest, name, rating

  useEffect(() => {
    async function loadVendors() {
      try {
        setIsLoading(true)
        const vendorsList = await getAllVendors()
        
        // Only show approved vendors
        const approvedVendors = vendorsList.filter(vendor => vendor.approved)
        
        // Fetch product counts for each vendor
        const vendorsWithCounts = await Promise.all(
          approvedVendors.map(async (vendor) => {
            try {
              const products = await getVendorProducts(vendor.id)
              return {
                ...vendor,
                productCount: products.length
              } as ExtendedVendor
            } catch (error) {
              console.error(`Error fetching products for vendor ${vendor.id}:`, error)
              return {
                ...vendor,
                productCount: 0
              } as ExtendedVendor
            }
          })
        )
        
        setVendors(vendorsWithCounts)
        setFilteredVendors(vendorsWithCounts)
      } catch (error) {
        console.error("Error loading vendors:", error)
        setVendors([])
        setFilteredVendors([])
      } finally {
        setIsLoading(false)
      }
    }

    loadVendors()
  }, [])

  // Filter and sort vendors
  useEffect(() => {
    let filtered = [...vendors]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(vendor => 
        vendor.shopName.toLowerCase().includes(term) ||
        (vendor.bio && vendor.bio.toLowerCase().includes(term))
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.shopName.localeCompare(b.shopName)
        case "oldest":
          return new Date(a.createdAt.toDate()).getTime() - new Date(b.createdAt.toDate()).getTime()
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "newest":
        default:
          return new Date(b.createdAt.toDate()).getTime() - new Date(a.createdAt.toDate()).getTime()
      }
    })

    setFilteredVendors(filtered)
  }, [vendors, searchTerm, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-800">Loading stores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse All Stores</h1>
            <p className="text-lg text-gray-800 max-w-2xl mx-auto">
              Discover authentic products from verified vendors across Nigeria and beyond
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search stores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 bg-white"
                />
              </div>
            </form>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-800">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name A-Z</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-800">
            Showing {filteredVendors.length} of {vendors.length} stores
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredVendors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No stores found" : "No stores available"}
              </h3>
              <p className="text-gray-800">
                {searchTerm 
                  ? "Try adjusting your search terms or browse all stores." 
                  : "Check back later for new vendor stores!"
                }
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardContent className="p-6">
                  {/* Store Logo */}
                  <div className="flex items-center justify-center mb-4">
                    {vendor.logoUrl ? (
                      <img 
                        src={vendor.logoUrl} 
                        alt={vendor.shopName} 
                        width={80} 
                        height={80} 
                        className="rounded-full border-4 border-green-100 object-cover" 
                      />
                    ) : (
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <Store className="h-10 w-10 text-green-600" />
                      </div>
                    )}
                  </div>

                  {/* Store Info */}
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {vendor.shopName}
                    </h3>
                    
                    <p className="text-sm text-gray-800 line-clamp-2 mb-3">
                      {vendor.bio || "Quality African products and authentic flavors"}
                    </p>

                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                        Verified
                      </Badge>
                    </div>
                  </div>

                  {/* Store Stats */}
                  <div className="space-y-2 mb-4 text-xs text-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <span>Products</span>
                      </div>
                      <span>{vendor.productCount || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined</span>
                      </div>
                      <span>{new Date(vendor.createdAt.toDate()).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>Location</span>
                      </div>
                      <span>{vendor.location || "Nigeria"}</span>
                    </div>

                    {vendor.rating && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          <span>Rating</span>
                        </div>
                        <span>{vendor.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Visit Store Button */}
                  <Link to={`/vendor/${vendor.id}`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white group-hover:bg-green-700 transition-colors border-0">
                      <Store className="h-4 w-4 mr-2 text-white" />
                      <span className="text-white">Visit Store</span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action for Vendors */}
      <div className="bg-green-50 border-t">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Want to Start Your Own Store?</h2>
          <p className="text-gray-800 mb-6 max-w-2xl mx-auto">
            Join our marketplace and reach thousands of customers looking for authentic African products. 
            It’s easy to get started!
          </p>
          <Link to="/vendor/register">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <Users className="h-5 w-5 mr-2" />
              Become a Vendor
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}