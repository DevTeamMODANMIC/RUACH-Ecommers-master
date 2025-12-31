"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Truck, Shield, Lock, ArrowLeft } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useSafeCurrency } from "@/hooks/use-safe-currency"
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
import { createOrder } from "@/lib/firebase-orders"
import StripeCheckout from "@/components/stripe-checkout"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCart()
  const { formatPrice } = useSafeCurrency()
  const { user } = useAuth()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "UK",
  })
  const [billingInfo, setBillingInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "UK",
  })
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [orderId, setOrderId] = useState<string | null>(null)

  const subtotal = getTotalPrice()
  const shippingCost = shippingMethod === "express" ? 9.99 : shippingMethod === "standard" ? 4.99 : 0
  const tax = subtotal * 0.2 // 20% VAT
  const total = subtotal + shippingCost + tax

  // Convert to cents for Stripe
  const totalInCents = Math.round(total * 100)

  const handleShippingChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleBillingChange = (field: string, value: string) => {
    setBillingInfo((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return (
          shippingInfo.firstName &&
          shippingInfo.lastName &&
          shippingInfo.email &&
          shippingInfo.phone &&
          shippingInfo.address &&
          shippingInfo.city &&
          shippingInfo.postalCode
        )
      case 2:
        if (sameAsShipping) return true
        return (
          billingInfo.firstName &&
          billingInfo.lastName &&
          billingInfo.address &&
          billingInfo.city &&
          billingInfo.postalCode
        )
      default:
        return false
    }
  }

  const handleCreateOrder = async () => {
    setIsProcessing(true)

    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to place an order.",
          variant: "destructive",
        })
        router.push("/login?redirect=/checkout")
        return
      }

      // Prepare the order data without payment details yet
      const orderData = {
        userId: user.uid,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          options: item.options
        })),
        subtotal,
        shipping: shippingCost,
        tax,
        total,
        status: "pending" as const,
        paymentStatus: "pending" as const,
        paymentMethod: "stripe", // Always use Stripe now
        shippingAddress: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          address1: shippingInfo.address,
          city: shippingInfo.city,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country,
          phone: shippingInfo.phone,
        },
        billingAddress: sameAsShipping
          ? {
              firstName: shippingInfo.firstName,
              lastName: shippingInfo.lastName,
              address1: shippingInfo.address,
              city: shippingInfo.city,
              postalCode: shippingInfo.postalCode,
              country: shippingInfo.country,
              phone: shippingInfo.phone,
            }
          : {
              firstName: billingInfo.firstName,
              lastName: billingInfo.lastName,
              address1: billingInfo.address,
              city: billingInfo.city,
              postalCode: billingInfo.postalCode,
              country: billingInfo.country,
              phone: shippingInfo.phone,
            },
        estimatedDelivery: shippingMethod === "express" 
          ? Date.now() + 2 * 24 * 60 * 60 * 1000  // 2 days for express
          : Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days for standard
      }

      // Create the order in Firebase Realtime Database
      const createdOrderId = await createOrder(orderData);
      setOrderId(createdOrderId);
      
      // Move to payment step
      setStep(3);
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        title: "Order setup failed",
        description: error.message || "There was an error setting up your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Update order with payment success
      // This would update the order with the payment ID
      
      // Clear cart after successful payment
      clearCart();
      
      toast({
        title: "Payment successful",
        description: "Your order has been placed successfully.",
      });
      
      // Redirect will happen from the Stripe component
    } catch (error) {
      console.error("Error updating order after payment:", error);
    }
  };

  const handlePaymentError = (error: Error) => {
    toast({
      title: "Payment failed",
      description: error.message || "There was an issue processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">Add some items to your cart before checking out.</p>
            <Button asChild>
              <a href="/products">Continue Shopping</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }
