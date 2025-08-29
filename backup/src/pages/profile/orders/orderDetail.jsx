"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Truck, 
  Calendar, 
  Loader2, 
  AlertTriangle,
  Clock,
  Package,
  Home
} from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Separator } from "../../../components/ui/separator"
import { useCurrency } from "../../../components/currency-provider"
import { getOrder, listenToOrder, updateOrder } from "../../../lib/firebase-orders"
import { useAuth } from "../../../components/auth-provider"
import { useToast } from "../../../hooks/use-toast"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb"

export default function OrderDetailPage() {
  // ❌ Wrong in JSX: useParams<{ id: string }>()
  // ✅ Correct:
  const { id } = useParams()
  const navigate = useNavigate()
  const orderId = id || ""
  const { formatPrice } = useCurrency()
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()

  // ❌ Wrong in JSX: useState<Order | null>(null)
  // ✅ Correct:
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState({})
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let unsubscribe

    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false)
        setError("No order ID provided")
        return
      }

      try {
        const initialOrder = await getOrder(orderId)

        if (!initialOrder) {
          setLoading(false)
          setError("Order not found")
          return
        }

        if (!isAdmin && user?.uid !== initialOrder.userId) {
          setLoading(false)
          setError("You are not authorized to view this order")
          return
        }

        setOrderDetails(initialOrder)
        setLoading(false)

        unsubscribe = listenToOrder(orderId, (order) => {
          if (order) setOrderDetails(order)
        })
      } catch (err) {
        console.error("Error fetching order:", err)
        setError(err.message || "Failed to load order details")
        setLoading(false)
      }
    }

    fetchOrder()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [orderId, user, isAdmin])

  const handleStatusUpdate = async (newStatus) => {
    if (!isAdmin || !orderDetails) return

    setUpdating(true)
    try {
      await updateOrder(orderId, { 
        status: newStatus,
        ...(newStatus === "shipped" ? {
          trackingNumber: `TRK-${Date.now().toString().slice(-8)}`,
          trackingUrl: "https://tracking.example.com"
        } : {})
      })

      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}`,
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update order status",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-medium">Loading order details...</h2>
        </div>
      </div>
    )
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">
              {error === "Order not found" ? "Order Not Found" : "Error Loading Order"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {error || "We couldn't find the order you're looking for."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/profile/orders">Back to Orders</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Return Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const estimatedDeliveryDate = orderDetails.estimatedDelivery 
    ? new Date(orderDetails.estimatedDelivery) 
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusBadgeVariant = (status = "pending") => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "refunded":
        return "bg-purple-100 text-purple-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/profile">My Account</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/profile/orders">My Orders</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{orderId.slice(-6)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 🟢 Your order detail layout continues here */}
      </div>
    </div>
  )
}
