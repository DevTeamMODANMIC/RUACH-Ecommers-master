import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { formatCurrency } from "@/lib/utils"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useState, useEffect } from "react"
import { Package, ShoppingCart, DollarSign } from "lucide-react"
import { getVendorProducts } from "@/lib/firebase-vendors"

interface VendorStats {
  totalProducts: number
  totalOrders: number
  totalSales: number
}

export function VendorDashboardStats({ storeId }: { storeId: string }) {
  const [stats, setStats] = useState<VendorStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        // Fetch total products
        const vendorProducts = await getVendorProducts(storeId)
        const totalProducts = vendorProducts.length

        // Fetch total orders and sales
        // First get all orders
        const allOrdersQuery = query(
          collection(db, "orders"), 
          orderBy("createdAt", "desc")
        )
        const allOrdersSnapshot = await getDocs(allOrdersQuery)
        
        // Filter orders that contain vendor's products
        const vendorProductIds = vendorProducts.map(p => p.id)
        let totalOrders = 0
        let totalSales = 0
        
        if (vendorProductIds.length > 0) {
          allOrdersSnapshot.docs.forEach(doc => {
            const orderData: any = doc.data()
            const orderItems = orderData.items || []
            
            // Check if any item in this order belongs to the vendor
            const hasVendorProduct = orderItems.some((item: any) => 
              vendorProductIds.includes(item.productId)
            )
            
            if (hasVendorProduct) {
              totalOrders++
              
              // Calculate sales for vendor's products in this order
              const orderSales = orderItems
                .filter((item: any) => vendorProductIds.includes(item.productId))
                .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
              
              totalSales += orderSales
            }
          })
        }

        setStats({
          totalProducts,
          totalOrders,
          totalSales
        })
      } catch (error) {
        console.error("Failed to fetch vendor stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (storeId) {
      fetchStats()
    }
  }, [storeId])

  // Show loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-500"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-green-500"
    },
    {
      title: "Total Sales",
      value: formatCurrency(stats.totalSales),
      icon: DollarSign,
      color: "text-purple-500"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}