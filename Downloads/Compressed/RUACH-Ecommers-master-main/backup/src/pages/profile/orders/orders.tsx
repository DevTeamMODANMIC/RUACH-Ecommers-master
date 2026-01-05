"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Separator } from "../../../components/ui/separator"
import { Loader2, Package, Search, ShoppingBag, Filter, ArrowUpDown } from "lucide-react"
import { Input } from "../../../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../../components/ui/select"
import { useAuth } from "../../../components/auth-provider"
import { useCurrency } from "../../../components/currency-provider"
import { getUserOrders, listenToUserOrders } from "../../../lib/firebase-orders"
import { Order } from "../../../types"
import { useToast } from "../../../hooks/use-toast"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb"

// ✅ helper: badge color by status
const getStatusBadgeVariant = (status: string) => {
  const variants: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }
  return variants[status] || "bg-gray-100 text-gray-800"
}

// ✅ helper: format timestamp safely
const formatDate = (timestamp: string | number | null) => {
  if (!timestamp) return "Unknown date"
  return new Date(timestamp).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { formatPrice } = useCurrency()
  const { toast } = useToast()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest" | "lowest">("newest")

  // ✅ reusable handler for image load error
  const handleImageError = useCallback((key: string) => {
    setImageError(prev => ({ ...prev, [key]: true }))
  }, [])

  // ✅ fetch + listen for updates
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const loadOrders = async () => {
      if (!user) {
        setLoading(false)
        setError("Please log in to view your orders")
        return
      }

      try {
        const initialOrders = await getUserOrders(user.uid)
        console.log("Fetched order:", initialOrders)
        setOrders(initialOrders)
        setLoading(false)

        unsubscribe = listenToUserOrders((updatedOrders) => {
          setOrders(updatedOrders)
        }, user.uid)
      } catch (err: any) {
        console.error("Error loading orders:", err)
        setError(err.message || "Failed to load orders")
        setLoading(false)

        toast({
          title: "Error loading orders",
          description: err.message || "There was a problem loading your orders",
          variant: "destructive",
        })
      }
    }

    loadOrders()
    return () => unsubscribe?.()
  }, [user, toast])

  // ✅ optimize: filter & sort memoized
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        if (statusFilter !== "all" && order.status !== statusFilter) return false
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          const idMatch = order.id?.toLowerCase().includes(searchLower)
          const productMatch = order.items.some(item =>
            item.name.toLowerCase().includes(searchLower)
          )
          return idMatch || productMatch
        }
        return true
      })
      .sort((a, b) => {
        if (sortOrder === "newest") {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        } else if (sortOrder === "oldest") {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        } else if (sortOrder === "highest") {
          return b.total - a.total
        } else {
          return a.total - b.total
        }
      })
  }, [orders, searchTerm, statusFilter, sortOrder])

  // 🚪 Not logged in
  if (!user) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">Please Log In</h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view your orders.
          </p>
          <Button asChild>
            <Link to="/login?redirect=/profile/orders">Log In</Link>
          </Button>
        </div>
      </div>
    )
  }

  // ⏳ Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-medium">Loading your orders...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">

        {/* 🥖 Breadcrumb */}
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
              <BreadcrumbPage>My Orders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 📝 Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">View and track all your orders</p>
          </div>
          <Button asChild>
            <Link to="/shop">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* 🔍 Filters & Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4 flex-wrap">
                {/* Status filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort filter */}
                <Select value={sortOrder} onValueChange={(value: "newest" | "oldest" | "highest" | "lowest") => setSortOrder(value)}>
                  <SelectTrigger className="w-[180px]">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest">Highest Amount</SelectItem>
                    <SelectItem value="lowest">Lowest Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ⚠️ Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-8">
            {error}
          </div>
        )}

        {/* 📦 Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Orders Found</h2>
            <p className="text-muted-foreground mb-8">
              {orders.length === 0
                ? "You haven't placed any orders yet."
                : "No orders match your current filters."}
            </p>
            {orders.length > 0 && (
              <Button variant="outline" onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
              }}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-muted/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order #{order.id.slice(-6)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusBadgeVariant(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <span className="font-medium">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">

                    {/* Items Preview */}
                    <div className="space-y-3">
                      {order.items.slice(0, 3).map((item) => {
                        const key = `${order.id}-${item.productId}`
                        return (
                          <div key={key} className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                              {item.image && !imageError[key] ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={() => handleImageError(key)}
                                />
                              ) : (
                                <Package className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      {order.items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          + {order.items.length - 3} more items
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Order Summary */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-muted-foreground">Shipping to:</span>{" "}
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}, {order.shippingAddress.city}
                        </div>
                        {order.trackingNumber && (
                          <div>
                            <span className="text-muted-foreground">Tracking:</span>{" "}
                            {order.trackingNumber}
                          </div>
                        )}
                      </div>
                      <Button asChild>
                        <Link to={`/profile/orders/${order.id}`}>View Order Details</Link>
                      </Button>
                    </div>
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
