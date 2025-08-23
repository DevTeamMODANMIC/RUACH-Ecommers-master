"use client"

import { useVendor } from "@/hooks/use-vendor"
import { useEffect, useState } from "react"
import { getVendorProducts } from "@/lib/firebase-vendors"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Eye,
  Star,
  Plus,
  ArrowUpRight,
  Sparkles,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  totalRevenue: number
  viewsThisMonth: number
  averageRating: number
  lowStockProducts: number
}

// Helper function to get time-based greeting
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default function VendorDashboardHome() {
  const { vendor, activeStore, allStores } = useVendor()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    viewsThisMonth: 0,
    averageRating: 0,
    lowStockProducts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!activeStore) return
      
      try {
        const vendorProducts = await getVendorProducts(activeStore.id)
        
        // Calculate stats from actual products
        const activeProducts = vendorProducts.filter((p: any) => p.inStock).length
        const lowStock = vendorProducts.filter((p: any) => p.stockQuantity < 10).length
        
        setStats({
          totalProducts: vendorProducts.length,
          activeProducts,
          totalOrders: 0, // Start with 0 for new vendors
          totalRevenue: 0, // Start with 0 for new vendors
          viewsThisMonth: 0, // Start with 0 for new vendors
          averageRating: 0, // Start with 0 for new vendors
          lowStockProducts: lowStock
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [activeStore])

  if (!activeStore || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-t-green-500 border-l-green-600 border-r-green-600 border-b-green-700 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Check if this is a new vendor (no products yet)
  const isNewVendor = stats.totalProducts === 0

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: isNewVendor ? "Get started" : `${stats.activeProducts}/${stats.totalProducts} active`
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: isNewVendor ? "Awaiting first order" : "+12% from last month"
    },
    {
      title: "Revenue",
      value: `₦${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: isNewVendor ? "Start selling" : "+8.2% from last month"
    },
    {
      title: "Store Views",
      value: stats.viewsThisMonth,
      icon: Eye,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      change: isNewVendor ? "Add products to get views" : "This month"
    }
  ]

  if (isNewVendor) {
    return (
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <Sparkles className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {getTimeBasedGreeting()}, {activeStore.shopName}!
          </h1>
          <p className="text-lg text-gray-500 mb-2">Welcome to your vendor dashboard</p>
          <p className="text-xl text-gray-600 mb-8">
            Let's get your store set up and start selling amazing products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/vendor/dashboard/products/new">
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Product
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/vendor/dashboard/analytics">
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
              <CheckCircle className="h-5 w-5 text-green-600" />
              Getting Started Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-green-800">Store Created</h3>
                  <p className="text-sm text-green-700">Your vendor account is set up and ready!</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">Add Your First Product</h3>
                  <p className="text-sm text-gray-600">Start building your inventory with your first product listing</p>
                </div>
                <Button asChild size="sm">
                  <Link href="/vendor/dashboard/products/new">
                    Add Product
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">Customize Your Store</h3>
                  <p className="text-sm text-gray-600">Add more products and optimize your store for better visibility</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/vendor/dashboard/products">
                    Manage Products
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid - Empty State */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions for New Vendors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto p-6 justify-start">
                <Link href="/vendor/dashboard/products/new">
                  <div className="text-left">
                    <Plus className="h-5 w-5 mb-2 text-green-600" />
                    <div className="font-medium">Add New Product</div>
                    <div className="text-sm text-gray-500">Start building your inventory</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-6 justify-start">
                <Link href={`/vendor/${activeStore.id}`}>
                  <div className="text-left">
                    <Eye className="h-5 w-5 mb-2 text-blue-600" />
                    <div className="font-medium">Preview Store</div>
                    <div className="text-sm text-gray-500">See how customers view your store</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-6 justify-start">
                <Link href="/vendor/dashboard/analytics">
                  <div className="text-left">
                    <TrendingUp className="h-5 w-5 mb-2 text-purple-600" />
                    <div className="font-medium">View Analytics</div>
                    <div className="text-sm text-gray-500">Track your store performance</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips for New Vendors */}
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
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">High-Quality Photos</h4>
                    <p className="text-sm text-gray-600">Use clear, well-lit photos to showcase your products</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Detailed Descriptions</h4>
                    <p className="text-sm text-gray-600">Write compelling product descriptions with key details</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Competitive Pricing</h4>
                    <p className="text-sm text-gray-600">Research market prices to stay competitive</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Fast Response</h4>
                    <p className="text-sm text-gray-600">Respond quickly to customer inquiries and orders</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Existing vendor dashboard (when they have products)
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getTimeBasedGreeting()}, {activeStore.shopName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your store today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button asChild variant="outline">
            <Link href="/vendor/dashboard/analytics">
              <Eye className="h-4 w-4 mr-2" />
              View Analytics
            </Link>
          </Button>
          <Button asChild>
            <Link href="/vendor/dashboard/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 justify-start">
              <Link href="/vendor/dashboard/products/new">
                <div className="text-left">
                  <div className="font-medium">Add New Product</div>
                  <div className="text-sm text-gray-500">Expand your inventory</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 justify-start">
              <Link href="/vendor/dashboard/orders">
                <div className="text-left">
                  <div className="font-medium">Manage Orders</div>
                  <div className="text-sm text-gray-500">Process pending orders</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 justify-start">
              <Link href="/vendor/dashboard/products">
                <div className="text-left">
                  <div className="font-medium">Update Inventory</div>
                  <div className="text-sm text-gray-500">Manage stock levels</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 justify-start">
              <Link href={`/vendor/${activeStore.id}`}>
                <div className="text-left">
                  <div className="font-medium">View Storefront</div>
                  <div className="text-sm text-gray-500">See your public store</div>
                </div>
                <ArrowUpRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Store Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Store Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Store Completion</span>
              <span>{Math.min(100, (stats.totalProducts * 20))}%</span>
            </div>
            <Progress value={Math.min(100, (stats.totalProducts * 20))} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              Add more products to improve store completion
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.totalProducts}</p>
              <p className="text-sm text-gray-600">Products Listed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.activeProducts}</p>
              <p className="text-sm text-gray-600">Active Products</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.totalOrders}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}