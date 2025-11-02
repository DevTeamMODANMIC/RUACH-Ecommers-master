import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  CheckCircle,
  Download,
  Mail,
  Truck,
  Calendar,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Clock,
  Package,
  Home,
  ExternalLink,
  Lock
} from "lucide-react";

import { useCurrency } from "../components/currency-provider";
import { getOrder, listenToOrder, getOrderByIdAndEmail } from "../lib/firebase-orders";
// Use the Order interface directly from firebase-orders to avoid type conflicts
import { Order } from "../lib/firebase-orders";
import { useToast } from "../hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";

export default function GuestOrderTracking() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = typeof params.id === "string" ? params.id : "";
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  
  // Get guest access state and email from location state
  const guestAccess = location.state?.guestAccess === true;
  const guestEmail = location.state?.email || "";
  
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        setError("No order ID provided");
        return;
      }

      try {
        // Check if this is a guest access and verify with email
        if (guestAccess && guestEmail) {
          const order = await getOrderByIdAndEmail(orderId, guestEmail);
          
          if (!order) {
            setLoading(false);
            setError("Order not found or access denied");
            return;
          }
          
          setOrderDetails(order);
          setLoading(false);
          
          // Set up real-time listener
          unsubscribe = listenToOrder(orderId, (updatedOrder) => {
            if (updatedOrder) {
              setOrderDetails(updatedOrder);
            }
          });
        } else {
          // If not valid guest access, redirect to the tracking form
          navigate("/track-order");
          return;
        }
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to load order details");
        setLoading(false);
      }
    };

    fetchOrder();

    // Clean up listener when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [orderId, guestAccess, guestEmail, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-medium">Loading order details...</h2>
        </div>
      </div>
    );
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
                <Link to="/track-order">Back to Order Tracking</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Return Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format the estimated delivery date
  const estimatedDeliveryDate = orderDetails.estimatedDelivery
    ? new Date(orderDetails.estimatedDelivery)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to 7 days from now

  // Get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to handle contact support
  const handleContactSupport = () => {
    navigate('/contact?subject=Order Support&orderId=' + (orderDetails?.id || orderId));
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/track-order">Order Tracking</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{orderDetails.orderNumber ? orderDetails.orderNumber.slice(-8) : orderDetails.id.slice(-8)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-lg p-4 mb-6 flex items-center gap-2">
          <Lock className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">You're viewing this order as a guest. <Link to="/login" className="underline font-medium">Sign in</Link> to manage all your orders in one place.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Order #{orderDetails?.id || orderId}</h1>
            <p className="text-muted-foreground">
              Placed on {new Date(orderDetails.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-2 md:mt-0 flex flex-col md:items-end gap-2">
            <Badge variant="secondary" className={getStatusBadgeVariant(orderDetails.status)}>
              {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Items Ordered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetails.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {item.image && !imageError[item.productId] ? (
                          <img
                            src={imageError[item.productId] ? "/product_images/unknown-product.jpg" : item.image}
                            alt={item.name}
                            className="object-cover w-full h-full"
                            onError={() => setImageError((prev) => ({ ...prev, [item.productId]: true }))}
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × {formatPrice(item.price)}
                        </p>
                        {item.options && Object.keys(item.options).length > 0 && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Options: {Object.entries(item.options).map(([key, value]) => `${key}: ${value}`).join(", ")}
                          </div>
                        )}
                      </div>
                      <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Delivery Address</h4>
                  <div className="text-sm text-muted-foreground">
                    <div>{orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}</div>
                    <div>{orderDetails.shippingAddress.address1}</div>
                    <div>
                      {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.postalCode}
                    </div>
                    <div>{orderDetails.shippingAddress.country}</div>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground">Shipping Method:</span>
                    <div className="font-medium">
                      {orderDetails.shipping === 4.99 ? "Standard Delivery" : "Express Delivery"}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estimated Delivery:</span>
                    <div className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {estimatedDeliveryDate.toLocaleDateString("en-GB", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                {orderDetails.trackingNumber && (
                  <div>
                    <span className="text-muted-foreground">Tracking Number:</span>
                    <div className="font-medium flex items-center gap-2">
                      {orderDetails.trackingNumber}
                      {orderDetails.trackingUrl && (
                        <Button variant="link" className="p-0 h-auto" asChild>
                          <a href={orderDetails.trackingUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Track Package
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(orderDetails.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(orderDetails.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(orderDetails.tax)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(orderDetails.total)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Order Confirmed</div>
                      <div className="text-muted-foreground">
                        {new Date(orderDetails.createdAt || Date.now()).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        orderDetails.status === "processing" ||
                        orderDetails.status === "shipped" ||
                        orderDetails.status === "delivered"
                          ? "bg-green-100"
                          : "bg-muted"
                      }`}
                    >
                      {orderDetails.status === "processing" ||
                      orderDetails.status === "shipped" ||
                      orderDetails.status === "delivered" ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">Processing</div>
                      <div className="text-muted-foreground">Your order is being prepared</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        orderDetails.status === "shipped" || orderDetails.status === "delivered"
                          ? "bg-green-100"
                          : "bg-muted"
                      }`}
                    >
                      {orderDetails.status === "shipped" || orderDetails.status === "delivered" ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Package className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">Shipped</div>
                      <div className="text-muted-foreground">On its way to you</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        orderDetails.status === "delivered" ? "bg-green-100" : "bg-muted"
                      }`}
                    >
                      {orderDetails.status === "delivered" ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Home className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">Delivered</div>
                      <div className="text-muted-foreground">Package received</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Fix: Add onClick handler to contact support button */}
                <Button variant="outline" className="w-full justify-start" onClick={handleContactSupport}>
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/faq">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    View FAQs
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}