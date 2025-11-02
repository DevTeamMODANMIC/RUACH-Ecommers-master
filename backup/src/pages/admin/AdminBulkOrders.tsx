import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Package2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  ShoppingCart,
  ArrowLeft
} from "lucide-react"
import { useAdmin } from "@/hooks/use-admin"
import { 
  getAllBulkOrders, 
  updateBulkOrderStatus,
  onAllBulkOrdersUpdate 
} from "@/lib/firebase-bulk-orders"
import { RequireAdmin } from "@/components/require-admin"

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
  vendorId?: string
  createdAt: Date
  updatedAt: Date
}

export default function AdminBulkOrders() {
  const { isAdmin, loading } = useAdmin()
  const [orders, setOrders] = useState<BulkOrder[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 10
  const [loadingOrders, setLoadingOrders] = useState(true)

  // Load all bulk orders for admin
  useEffect(() => {
    if (!isAdmin) return;

    setLoadingOrders(true);
    
    // Set up real-time listener for all bulk orders
    const unsubscribe = onAllBulkOrdersUpdate((bulkOrders) => {
      setOrders(bulkOrders);
      setLoadingOrders(false);
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [isAdmin])

  const updateOrderStatus = async (orderId: string, newStatus: BulkOrder['status']) => {
    try {
      await updateBulkOrderStatus(orderId, newStatus);
      // The real-time listener will automatically update the UI
    } catch (error) {
      console.error("Error updating bulk order status:", error);
    }
  }

  if (loading || loadingOrders) {
    return (
      <RequireAdmin>
        <div className="container flex items-center justify-center min-h-screen">
          <div className="text-center">Loading...</div>
        </div>
      </RequireAdmin>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.businessInfo.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.businessInfo.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.businessInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
  const startIndex = (currentPage - 1) * ordersPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage)

  const getStatusBadge = (status: BulkOrder['status']) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "processing":
        return <Badge variant="default"><Package2 className="h-3 w-3 mr-1" />Processing</Badge>
      case "shipped":
        return <Badge variant="default" className="bg-blue-600"><Package2 className="h-3 w-3 mr-1" />Shipped</Badge>
      case "delivered":
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const totalRevenue = orders.filter(o => o.status === "delivered").reduce((sum, o) => sum + o.total, 0)
  const pendingOrders = orders.filter(o => o.status === "pending").length
  const processingOrders = orders.filter(o => o.status === "processing").length

  return (
    <RequireAdmin>
      <div className="container py-10">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">Bulk Order Management</h1>
          <p className="text-gray-600">Manage bulk orders from business customers</p>
        </div>

        {/* Admin navigation for smaller screens - with better contrast */}
        <div className="md:hidden mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium mb-3 text-slate-800">Quick Navigation</h3>
            <div className="flex flex-col gap-2">
              <Link to="/admin" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Dashboard
              </Link>
              <Link to="/admin/products" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Products
              </Link>
              <Link to="/admin/orders" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Orders
              </Link>
              <Link to="/admin/bulk-orders" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Bulk Orders
              </Link>
              <Link to="/admin/vendors" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Vendors
              </Link>
              <Link to="/admin/service-providers" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Service Providers
              </Link>
              <Link to="/admin/products/cloudinary-migration" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Cloudinary Migration
              </Link>
              <Link to="/admin/migration" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Vendor Migration
              </Link>
              <Link to="/admin/products/import" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Import Products
              </Link>
              <Link to="/" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Back to Site
              </Link>
            </div>
          </div>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{orders.length}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{pendingOrders}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Package2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{processingOrders}</div>
                <div className="text-sm text-gray-600">Processing</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">₦{totalRevenue.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Revenue</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Bulk Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Search by order number, business name, contact, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
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

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Package2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Bulk Orders Found</h3>
              <p className="text-gray-600">No bulk orders match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">
                          {order.businessInfo.businessName} - {order.businessInfo.contactName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.businessInfo.email} | {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        {order.vendorId && (
                          <p className="text-xs text-gray-500 mt-1">Vendor ID: {order.vendorId}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">₦{order.total.toFixed(2)}</div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Order Items ({order.items.length}):</h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="truncate max-w-[200px]">{item.productName} x{item.quantity}</span>
                            <span>₦{item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Select 
                        value={order.status} 
                        onValueChange={(status) => updateOrderStatus(order.id, status as BulkOrder['status'])}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </RequireAdmin>
  )
}