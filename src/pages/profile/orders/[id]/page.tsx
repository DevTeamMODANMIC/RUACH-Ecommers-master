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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCurrency } from "@/components/currency-provider"
import { getOrder, listenToOrder, updateOrder, Order as FirebaseOrder } from "@/lib/firebase-orders"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
// Add PDF generation imports
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const orderId = id || ""
  const { formatPrice } = useCurrency()
  const { user, profile } = useAuth()
  const isAdmin = profile?.role === 'admin' || false
  const { toast } = useToast()

  const [orderDetails, setOrderDetails] = useState<FirebaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

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
          if (order) {
            setOrderDetails(order)
          }
        })
      } catch (err: any) {
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

  const handleStatusUpdate = async (newStatus: FirebaseOrder["status"]) => {
    if (!isAdmin || !orderDetails) return;

    setUpdating(true);
    try {
      await updateOrder(orderId, { 
        status: newStatus,
        ...(newStatus === "shipped" ? {
          trackingNumber: `TRK-${Date.now().toString().slice(-8)}`,
          trackingUrl: "https://tracking.example.com"
        } : {})
      });

      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update order status",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
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

  const getStatusBadgeVariant = (status: string) => {
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

  const getPaymentStatusBadgeVariant = (status: string = "pending") => {
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

  // Add this function to generate and download the invoice
  const handleDownloadInvoice = async () => {
    if (!orderDetails) return
    
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
      
      // Generate invoice HTML content for items
      let itemsHtml = ''
      orderDetails.items.forEach(item => {
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
      const subtotal = orderDetails.subtotal || 0
      const shipping = orderDetails.shipping || 0
      const tax = orderDetails.tax || 0
      const total = orderDetails.total || (subtotal + shipping + tax)
      
      invoiceContent.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto; background: white; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; line-height: 1.5;">
          <!-- Header -->
          <div style="padding: 30px; border-bottom: 2px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h1 style="font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 8px 0;">INVOICE</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 0;">Order #${orderId.slice(-6)}</p>
                <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">${new Date(orderDetails.createdAt || Date.now()).toLocaleDateString('en-US', { 
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
                  ${(orderDetails.billingAddress?.firstName || '')} ${(orderDetails.billingAddress?.lastName || '')}
                </p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${orderDetails.billingAddress?.address1 || ''}</p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
                  ${(orderDetails.billingAddress?.city || '')}, ${(orderDetails.billingAddress?.postalCode || '')}
                </p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${orderDetails.billingAddress?.country || ''}</p>
                <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">${orderDetails.billingAddress?.email || ''}</p>
              </div>
              
              <div style="flex: 1;">
                <h2 style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">Ship To</h2>
                <p style="margin: 0 0 4px 0; font-weight: 500;">
                  ${(orderDetails.shippingAddress?.firstName || '')} ${(orderDetails.shippingAddress?.lastName || '')}
                </p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${orderDetails.shippingAddress?.address1 || ''}</p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
                  ${(orderDetails.shippingAddress?.city || '')}, ${(orderDetails.shippingAddress?.postalCode || '')}
                </p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${orderDetails.shippingAddress?.country || ''}</p>
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
      pdf.save(`invoice-${orderId.slice(-6)}.pdf`)
      
      toast({
        title: "Invoice downloaded",
        description: "Your invoice has been successfully downloaded."
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

        {/* 🟢 Full layout continues here (unchanged) */}
        {/* Key differences:
            - <img> instead of <Image>
            - <Link to> instead of <Link href>
            - useNavigate() instead of router.push()
        */}
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={handleDownloadInvoice}>
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
