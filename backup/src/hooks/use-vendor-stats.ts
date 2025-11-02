import { useState, useEffect } from "react"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "../lib/firebase"
import { getVendorProducts } from "../lib/firebase-vendors"
import { Order } from "../types"

export interface VendorStats {
  totalSales: number
  pendingOrders: number
  completedOrders: number
  averageRating: number
  totalCustomers: number
  walletBalance: number
}

export const useVendorStats = (vendorId: string | null) => {
  const [stats, setStats] = useState<VendorStats>({
    totalSales: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageRating: 0,
    totalCustomers: 0,
    walletBalance: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!vendorId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Get vendor products
        const vendorProducts = await getVendorProducts(vendorId)
        const vendorProductIds = vendorProducts.map(product => product.id)
        
        // Initialize stats
        let totalSales = 0
        let pendingOrders = 0
        let completedOrders = 0
        let totalCustomersSet = new Set<string>()
        
        if (vendorProductIds.length > 0) {
          // Get orders that contain vendor's products
          const ordersQuery = query(
            collection(db, "orders"),
            orderBy("createdAt", "desc")
          )
          
          const ordersSnapshot = await getDocs(ordersQuery)
          const allOrders = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          } as Order))
          
          // Filter and process orders
          const vendorOrders = allOrders.filter(order => 
            order.items.some(item => vendorProductIds.includes(item.productId))
          )
          
          // Calculate statistics
          vendorOrders.forEach(order => {
            // Add customer to set
            totalCustomersSet.add(order.userId)
            
            // Calculate sales
            const orderTotal = order.items
              .filter(item => vendorProductIds.includes(item.productId))
              .reduce((sum, item) => sum + (item.price * item.quantity), 0)
            
            totalSales += orderTotal
            
            // Count orders by status
            if (order.status === "pending" || order.status === "processing") {
              pendingOrders++
            } else if (order.status === "delivered") {
              completedOrders++
            }
          })
        }
        
        // For now, we'll set average rating to a fixed value
        // In a real implementation, you would calculate this from product reviews
        const averageRating = 4.8
        
        setStats({
          totalSales,
          pendingOrders,
          completedOrders,
          averageRating,
          totalCustomers: totalCustomersSet.size,
          walletBalance: 0 // This should come from vendor data
        })
      } catch (err) {
        console.error("Error fetching vendor stats:", err)
        setError("Failed to load vendor statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [vendorId])

  return { stats, loading, error }
}