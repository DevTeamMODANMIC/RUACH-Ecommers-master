"use client"

import { useState, useEffect } from "react"
import { collection, query, getDocs, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Store, Package, User, CheckCircle, XCircle } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  vendorId?: string
  inStock: boolean
  [key: string]: any
}

interface Vendor {
  id: string
  shopName: string
  approved: boolean
  isActive: boolean
  ownerId: string
  [key: string]: any
}

interface DebugData {
  vendors: Vendor[]
  products: Product[]
  productsByVendor: Record<string, Product[]>
}

export default function StoreProductsDebugPage() {
  const [data, setData] = useState<DebugData>({
    vendors: [],
    products: [],
    productsByVendor: {}
  })
  const [loading, setLoading] = useState(false)

  const fetchDebugData = async () => {
    setLoading(true)
    try {
      // Fetch all vendors
      const vendorsQuery = query(collection(db, "vendors"))
      const vendorsSnapshot = await getDocs(vendorsQuery)
      const vendors = vendorsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vendor[]

      // Fetch all products
      const productsQuery = query(collection(db, "products"))
      const productsSnapshot = await getDocs(productsQuery)
      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[]

      // Group products by vendor
      const productsByVendor: Record<string, Product[]> = {}
      products.forEach(product => {
        const vendorId = product.vendorId
        if (vendorId) {
          if (!productsByVendor[vendorId]) {
            productsByVendor[vendorId] = []
          }
          productsByVendor[vendorId].push(product)
        }
      })

      setData({
        vendors,
        products,
        productsByVendor
      })

      console.log("🔍 Debug Data:", {
        totalVendors: vendors.length,
        totalProducts: products.length,
        vendorsWithProducts: Object.keys(productsByVendor).length,
        productsByVendor
      })

    } catch (error) {
      console.error("Error fetching debug data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Products Debug</h1>
          <p className="text-gray-600 mt-2">Debug tool to check vendor and product data</p>
        </div>
        <Button onClick={fetchDebugData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold">{data.vendors.length}</div>
                <div className="text-sm text-gray-600">Total Vendors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold">
                  {data.vendors.filter(v => v.approved).length}
                </div>
                <div className="text-sm text-gray-600">Approved Vendors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold">{data.products.length}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold">
                  {Object.keys(data.productsByVendor).length}
                </div>
                <div className="text-sm text-gray-600">Vendors with Products</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendors List */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.vendors.map((vendor) => (
              <div key={vendor.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{vendor.shopName}</h3>
                  <div className="flex gap-2">
                    <Badge variant={vendor.approved ? "default" : "secondary"}>
                      {vendor.approved ? "Approved" : "Pending"}
                    </Badge>
                    <Badge variant={vendor.isActive ? "default" : "outline"}>
                      {vendor.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                  <div>Store ID: <code className="bg-gray-100 px-1 rounded">{vendor.id}</code></div>
                  <div>Owner ID: <code className="bg-gray-100 px-1 rounded">{vendor.ownerId}</code></div>
                  <div>Products: {data.productsByVendor[vendor.id]?.length || 0}</div>
                  <div>Store URL: <a href={`/vendor/${vendor.id}`} className="text-blue-600 hover:underline" target="_blank">/vendor/{vendor.id}</a></div>
                </div>
                {data.productsByVendor[vendor.id] && (
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-2">Products ({data.productsByVendor[vendor.id].length}):</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {data.productsByVendor[vendor.id].map((product) => (
                        <div key={product.id} className="bg-gray-50 rounded p-2 text-xs">
                          <div className="font-medium truncate">{product.name}</div>
                          <div className="text-gray-600">₦{product.price}</div>
                          <div className="text-gray-500">ID: {product.id}</div>
                          <Badge variant={product.inStock ? "default" : "outline"} className="text-xs">
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Products without Vendor */}
      {data.products.filter(p => !p.vendorId).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Products without Vendor ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.products.filter(p => !p.vendorId).map((product) => (
                <div key={product.id} className="border rounded-lg p-4 border-red-200 bg-red-50">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-600">₦{product.price}</div>
                  <div className="text-xs text-gray-500">ID: {product.id}</div>
                  <div className="text-xs text-red-600 mt-2">Missing vendorId field</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}