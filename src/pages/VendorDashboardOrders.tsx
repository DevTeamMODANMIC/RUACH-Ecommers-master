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
  Loader2
} from "lucide-react"
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { listenToVendorOrders, updateOrderStatus, type Order } from "../lib/firebase-orders"
import { useToast } from "../hooks/use-toast"
import { useCurrency } from "../components/currency-provider"
// Add PDF generation imports
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function VendorOrdersPage() {
  const { vendor, activeStore, loading: vendorLoading } = useVendor()
  const { formatPrice } = useCurrency()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  // Load orders for vendor
  useEffect(() => {
    // If vendor data is still loading, show loading state
    if (vendorLoading) {
      return
    }

    // If no vendor or vendor ID, show no orders
    if (!vendor?.id) {
      setOrders([])
      setLoading(false)
      return
    }

    setLoading(true)
    
    // Set up real-time listener for vendor orders
    const unsubscribe = listenToVendorOrders(vendor.id, (vendorOrders) => {
      setOrders(vendorOrders)
      setLoading(false)
    })

    // Cleanup listener on unmount
    return () => {
      unsubscribe()
    }
  }, [vendor?.id, vendorLoading])

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    if (activeTab !== "all") {
      filtered = filtered.filter(order => order.status === activeTab)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter, activeTab])

  const getStatusBadge = (status: Order['status']) => {
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

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (!orderId) return;
    
    setUpdatingOrderId(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}`
      })
    } catch (error: any) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error updating order",
        description: error.message || "Failed to update order status",
        variant: "destructive"
      })
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // Add this function to generate and download the invoice
  const handleDownloadInvoice = async (order: Order) => {
    try {
      // Create a temporary div to hold the invoice content
      const invoiceContent = document.createElement('div')
      invoiceContent.style.padding = '30px'
      invoiceContent.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      invoiceContent.style.maxWidth = '800px'
      invoiceContent.style.margin = '0 auto'
      invoiceContent.style.backgroundColor = 'white'
      invoiceContent.style.color = '#333'
      invoiceContent.style.lineHeight = '1.5'
      
      // Generate invoice HTML content
      let itemsHtml = ''
      order.items.forEach(item => {
        // Handle options if they exist
        const optionsHtml = item.options && Object.keys(item.options).length > 0 ? 
          `<div style="font-size: 13px; color: #666; margin-top: 4px;">
            ${Object.entries(item.options).map(([key, value]) => `${key}: ${value}`).join(', ')}
          </div>` : ''
        
        // Calculate item total if not provided
        const itemTotal = item.total || (item.price * item.quantity)
        
        itemsHtml += `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px 16px;">
              <div style="font-weight: 500; color: #1f2937;">${item.name || 'Unknown Item'}</div>
              ${optionsHtml}
            </td>
            <td style="text-align: center; padding: 12px 16px; color: #6b7280;">${item.quantity || 0}</td>
            <td style="text-align: right; padding: 12px 16px; color: #6b7280;">${formatPrice(item.price || 0)}</td>
            <td style="text-align: right; padding: 12px 16px; font-weight: 500;">${formatPrice(itemTotal)}</td>
          </tr>
        `
      })
      
      // Use default values if properties don't exist
      const subtotal = order.subtotal || 0
      const shipping = order.shipping || 0
      const tax = order.tax || 0
      const total = order.total || (subtotal + shipping + tax)
      
      invoiceContent.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto; background: white; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; line-height: 1.5;">
          <!-- Header -->
          <div style="padding: 30px; border-bottom: 2px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h1 style="font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 8px 0;">INVOICE</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 0;">Order #${order.id.slice(-6)}</p>
                <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">${new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 24px; font-weight: 700; color: #111827;">${formatPrice(total)}</div>
                <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">Total Amount</div>
              </div>
            </div>
          </div>
          
          <!-- Company & Customer Info -->
          <div style="padding: 30px; border-bottom: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between;">
              <div style="flex: 1;">
                <h2 style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">From</h2>
                <p style="margin: 0 0 4px 0; font-weight: 500;">Ruach Ecommers</p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">123 Business Street</p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Business City, 10001</p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Nigeria</p>
                <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">contact@ruach.com</p>
              </div>
              
              <div style="flex: 1;">
                <h2 style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">Bill To</h2>
                <p style="margin: 0 0 4px 0; font-weight: 500;">
                  ${(order.billingAddress?.firstName || '')} ${(order.billingAddress?.lastName || '')}
                </p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${order.billingAddress?.address1 || ''}</p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
                  ${(order.billingAddress?.city || '')}, ${(order.billingAddress?.postalCode || '')}
                </p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${order.billingAddress?.country || ''}</p>
                <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">${order.billingAddress?.email || ''}</p>
              </div>
              
              <div style="flex: 1;">
                <h2 style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">Ship To</h2>
                <p style="margin: 0 0 4px 0; font-weight: 500;">
                  ${(order.shippingAddress?.firstName || '')} ${(order.shippingAddress?.lastName || '')}
                </p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${order.shippingAddress?.address1 || ''}</p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
                  ${(order.shippingAddress?.city || '')}, ${(order.shippingAddress?.postalCode || '')}
                </p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${order.shippingAddress?.country || ''}</p>
              </div>
            </div>
          </div>
          
          <!-- Order Items -->
          <div style="padding: 0 30px 30px 30px;">
            <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 24px 0 16px 0;">Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                  <th style="text-align: left; padding: 12px 16px; font-weight: 600; color: #6b7280; text-transform: uppercase; font-size: 12px;">Item</th>
                  <th style="text-align: center; padding: 12px 16px; font-weight: 600; color: #6b7280; text-transform: uppercase; font-size: 12px;">Qty</th>
                  <th style="text-align: right; padding: 12px 16px; font-weight: 600; color: #6b7280; text-transform: uppercase; font-size: 12px;">Price</th>
                  <th style="text-align: right; padding: 12px 16px; font-weight: 600; color: #6b7280; text-transform: uppercase; font-size: 12px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <!-- Order Summary -->
            <div style="margin-top: 30px; max-width: 300px; margin-left: auto;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Subtotal:</span>
                <span style="font-weight: 500;">${formatPrice(subtotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Shipping:</span>
                <span style="font-weight: 500;">${formatPrice(shipping)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Tax:</span>
                <span style="font-weight: 500;">${formatPrice(tax)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 16px 0 8px 0; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <span style="font-weight: 600; color: #111827;">Total:</span>
                <span style="font-weight: 700; font-size: 18px; color: #111827;">${formatPrice(total)}</span>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Thank you for your business! If you have any questions about this invoice, please contact us at contact@ruach.com
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
              © ${new Date().getFullYear()} Ruach Ecommers. All rights reserved.
            </p>
          </div>
        </div>
      `
      
      // Add the temporary div to the document
      document.body.appendChild(invoiceContent)
      
      // Use html2canvas to capture the content
      const canvas = await html2canvas(invoiceContent, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: '#ffffff'
      })
      
      // Remove the temporary div
      document.body.removeChild(invoiceContent)
      
      // Create PDF from canvas
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      // Add new pages if content is too long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      // Save the PDF
      pdf.save(`invoice-${order.id.slice(-6)}.pdf`)
      
      toast({
        title: "Invoice downloaded",
        description: "Invoice has been successfully downloaded."
      })
    } catch (error: any) {
      console.error("Error generating invoice:", error)
      toast({
        title: "Download failed",
        description: "Failed to generate invoice. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Show loading state while vendor data is loading
  if (vendorLoading) {
    return (
      <VendorLayout 
        title="Orders" 
        description="Manage and track your customer orders"
      >
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading vendor information...</p>
          </CardContent>
        </Card>
      </VendorLayout>
    )
  }

  // Show message if user is not a vendor
  if (!vendor?.id) {
    return (
      <VendorLayout 
        title="Orders" 
        description="Manage and track your customer orders"
      >
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Vendor Access Required</h3>
            <p className="text-gray-600 mb-6">
              You need to be a registered vendor to view orders. Please register as a vendor first.
            </p>
            <Button asChild>
              <Link to="/vendor/register">
                <Plus className="h-4 w-4 mr-2" />
                Register as Vendor
              </Link>
            </Button>
          </CardContent>
        </Card>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout 
      title="Orders" 
      description="Manage and track your customer orders"
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
                placeholder="Search orders by number, customer name, or email..."
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
          {loading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading orders...</p>
              </CardContent>
            </Card>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You haven't received any orders yet. Start by adding products to your store to begin receiving orders from customers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link to="/vendor/dashboard/products/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/vendor/dashboard/products">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Manage Products
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "Orders will appear here when customers make purchases"
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
                          <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Customer:</strong> {order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                          <p><strong>Email:</strong> {order.shippingAddress.email}</p>
                          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                          <p><strong>Total:</strong> ₦{order.total.toFixed(2)}</p>
                          {order.trackingNumber && (
                            <p><strong>Tracking:</strong> {order.trackingNumber}</p>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="flex-1 max-w-md">
                        <h4 className="font-medium mb-2">Items ({order.items.filter(item => item.vendorId === vendor?.id).length})</h4>
                        <div className="space-y-2">
                          {order.items
                            .filter(item => item.vendorId === vendor?.id)
                            .map((item) => (
                              <div key={`${order.id}-${item.productId}`} className="flex justify-between text-sm">
                                <span className="truncate">{item.name}</span>
                                <span>×{item.quantity}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/profile/orders/${order.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={updatingOrderId === order.id}>
                              {updatingOrderId === order.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {order.status === 'pending' && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                              >
                                Mark as Processing
                              </DropdownMenuItem>
                            )}
                            {order.status === 'processing' && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                              >
                                Mark as Shipped
                              </DropdownMenuItem>
                            )}
                            {order.status === 'shipped' && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                              >
                                Mark as Delivered
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDownloadInvoice(order)}>
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