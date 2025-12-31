import { useState, useEffect } from "react"
import { useVendor } from "../hooks/use-vendor"
import { VendorLayout } from "../components/vendor-layout"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  MoreHorizontal,
  Plus,
  ShoppingBag,
  Package2
} from "lucide-react"
import { Link } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { getVendorBulkOrders, updateBulkOrderStatus, onVendorBulkOrdersUpdate } from "../lib/firebase-bulk-orders"

interface BulkOrderItem {
  productId: string
  productName: string
  quantity: number
  basePrice: number
  discountedPrice: number
  discountPercentage: number
  total: number
}

interface BulkOrderBusinessInfo {
  businessName: string
  contactName: string
  email: string
  phone: string
  businessType: string
  taxId?: string
  address: string
}

interface BulkOrder {
  id: string
  orderNumber: string
  businessInfo: BulkOrderBusinessInfo
  items: BulkOrderItem[]
  subtotal: number
  deliveryCost: number
  total: number
  currency: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  deliveryOption: string
  deliveryEstimate: string
  additionalInfo?: string
  createdAt: Date
  updatedAt: Date
}

export default function VendorBulkOrdersPage() {
  const { vendor, activeStore } = useVendor()
  const [orders, setOrders] = useState<BulkOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<BulkOrder[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)

  // Load bulk orders for vendor
  useEffect(() => {
    if (!vendor?.id) return;

    setLoading(true);
    
    // Set up real-time listener for bulk orders
    const unsubscribe = onVendorBulkOrdersUpdate(vendor.id, (bulkOrders) => {
      setOrders(bulkOrders);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [vendor?.id]);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.businessInfo.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.businessInfo.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.businessInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (activeTab !== "all") {
      filtered = filtered.filter(order => order.status === activeTab);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, activeTab]);

  const getStatusBadge = (status: BulkOrder['status']) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
      processing: { label: "Processing", variant: "default" as const, icon: Package },
      shipped: { label: "Shipped", variant: "outline" as const, icon: Truck },
      delivered: { label: "Delivered", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "Cancelled", variant: "destructive" as const, icon: AlertCircle }
    }
    
    const config = statusConfig[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getOrderCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length
    }
  }

  const counts = getOrderCounts()

  const updateOrderStatus = async (orderId: string, newStatus: BulkOrder['status']) => {
    try {
      await updateBulkOrderStatus(orderId, newStatus);
      // The real-time listener will automatically update the UI
    } catch (error) {
      console.error("Error updating bulk order status:", error);
    }
  }

  if (loading) {
    return (
      <VendorLayout 
        title="Bulk Orders" 
        description="Manage and track your bulk customer orders"
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p>Loading bulk orders...</p>
          </div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout 
      title="Bulk Orders" 
      description="Manage and track your bulk customer orders"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search bulk orders by number, business name, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({counts.processing})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({counts.shipped})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({counts.delivered})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <Package2 className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bulk Orders Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You haven't received any bulk orders yet. Bulk orders will appear here when businesses make bulk purchases from your products.
                </p>
              </CardContent>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bulk orders found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "Bulk orders will appear here when businesses make bulk purchases"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Business:</strong> {order.businessInfo.businessName}</p>
                          <p><strong>Contact:</strong> {order.businessInfo.contactName} ({order.businessInfo.email})</p>
                          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                          <p><strong>Total:</strong> ₦{order.total.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="flex-1 max-w-md">
                        <h4 className="font-medium mb-2">Items ({order.items.length})</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.productId} className="flex justify-between text-sm">
                              <span className="truncate">{item.productName}</span>
                              <span>×{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {order.status === 'pending' && (
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'processing')}>
                                Mark as Processing
                              </DropdownMenuItem>
                            )}
                            {order.status === 'processing' && (
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'shipped')}>
                                Mark as Shipped
                              </DropdownMenuItem>
                            )}
                            {order.status === 'shipped' && (
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'delivered')}>
                                Mark as Delivered
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              Print Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Contact Customer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </VendorLayout>
  )
}