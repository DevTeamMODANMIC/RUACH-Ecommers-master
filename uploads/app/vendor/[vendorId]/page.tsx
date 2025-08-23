import { getVendor, getVendorProducts } from "@/lib/firebase-vendors"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Store, MapPin, Calendar, Package, Star } from "lucide-react"

interface Props {
  params: { vendorId: string }
}

export default async function VendorStorefront({ params }: Props) {
  const vendor = await getVendor(params.vendorId)
  if (!vendor || !vendor.approved) {
    notFound()
  }
  const products = await getVendorProducts(params.vendorId)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Vendor Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0">
              {vendor.logoUrl ? (
                <Image 
                  src={vendor.logoUrl} 
                  alt={vendor.shopName} 
                  width={100} 
                  height={100} 
                  className="rounded-full border-4 border-green-100 object-cover" 
                />
              ) : (
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <Store className="h-12 w-12 text-green-600" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{vendor.shopName}</h1>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  Verified Vendor
                </Badge>
              </div>
              
              <p className="text-gray-600 text-lg mb-4 max-w-2xl">{vendor.bio}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>{products.length} Products</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(vendor.createdAt.toDate()).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Nigeria</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Products ({products.length})</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Sort by Price
            </Button>
            <Button variant="outline" size="sm">
              Filter
            </Button>
          </div>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Yet</h3>
              <p className="text-gray-600">
                This vendor hasn't added any products yet. Check back later!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <Link href={`/products/${product.id}`}>
                    <Image 
                      src={product.cloudinaryImages?.[0]?.url || product.images?.[0] || "/placeholder.jpg"} 
                      alt={product.name} 
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </Link>
                  
                  {product.discount && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-500 hover:bg-red-600">
                        -{product.discount}% OFF
                      </Badge>
                    </div>
                  )}
                  
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-medium text-lg hover:text-green-600 transition-colors mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-gray-500 mb-2">
                    {product.displayCategory || product.category}
                  </p>
                  
                  {product.reviews?.average > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">
                        {product.reviews.average.toFixed(1)} ({product.reviews.count})
                      </span>
                    </div>
                  )}
                  
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
                    
                    {product.inStock && (
                      <Badge variant="outline" className="text-xs">
                        In Stock
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 