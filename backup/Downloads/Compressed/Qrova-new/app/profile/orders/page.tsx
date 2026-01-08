"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Package, Search, ShoppingBag, Filter, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { useCurrency } from "@/components/currency-provider"
import { getUserOrders, listenToUserOrders } from "@/lib/firebase-orders"
import { Order } from "@/types"
import { useToast } from "@/hooks/use-toast"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { formatPrice } = useCurrency()
  const { toast } = useToast()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest" | "lowest">("newest")

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadOrders = async () => {
      if (!user) {
        setLoading(false)
        setError("Please log in to view your orders")
        return
      }

      try {
        // First get initial orders
        const initialOrders = await getUserOrders(user.uid)
        setOrders(initialOrders)
        setLoading(false)
        
        // Then set up real-time listener
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

    // Clean up listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user, toast])

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      // Apply status filter
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false
      }
      
      // Apply search filter (search by ID or product names)
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
      // Sort by date (newest/oldest)
      if (sortOrder === "newest") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      } else if (sortOrder === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      } 
      // Sort by total (highest/lowest)
      else if (sortOrder === "highest") {
        return b.total - a.total
      } else {
        return a.total - b.total
      }
    })

  // Function to get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'processing':
        return "bg-blue-100 text-blue-800";
      case 'shipped':
        return "bg-purple-100 text-purple-800";
      case 'delivered':
        return "bg-green-100 text-green-800";
      case 'cancelled':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to format date
  const formatDate = (timestamp: string | number | null) => {
    if (!timestamp) return "Unknown date";
    
    return new Date(timestamp).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Please Log In</h1>
            <p className="text-muted-foreground mb-8">You need to be logged in to view your orders.</p>
            <Button asChild>
              <Link href="/login?redirect=/profile/orders">Log In</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

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
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/profile">My Account</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My Orders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">View and track all your orders</p>
          </div>
          <Button asChild>
            <Link href="/products">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Filters and Search */}
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
              <div className="flex gap-4">
                <div className="w-[180px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
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
                </div>
                <div className="w-[180px]">
                  <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                    <SelectTrigger>
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
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-8">
            {error}
          </div>
        )}

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
              <Card key={order.id} className="overflow-hidden">
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
                      <Badge variant="secondary" className={getStatusBadgeVariant(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <span className="font-medium">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={`${order.id}-${item.productId}`} className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/product_images/unknown-product.jpg";
                                }}
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
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          + {order.items.length - 3} more items
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Order Summary & Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Shipping to:</span>{" "}
                          <span>
                            {order.shippingAddress.firstName} {order.shippingAddress.lastName}, {order.shippingAddress.city}
                          </span>
                      </div>
                        {order.trackingNumber && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Tracking:</span>{" "}
                            <span>{order.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                      <Button asChild>
                        <Link href={`/profile/orders/${order.id}`}>View Order Details</Link>
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