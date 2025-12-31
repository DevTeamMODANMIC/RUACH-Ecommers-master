"use client"

import { useState, useEffect } from "react"
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
import { useCurrency } from "@/components/currency-provider"
import Link from "next/link"

// TEMPORARILY DISABLED: import StripeCheckout from "@/components/stripe-checkout"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCart()
  const { formatPrice } = useSafeCurrency()
  const { user, profile } = useAuth() // Get profile as well
  const { toast } = useToast()
  const currencyContext = useCurrency()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    firstName: (profile?.name ? profile.name.split(" ")[0] : user?.email?.split("@")[0]) || "",
    lastName: profile?.name ? profile.name.split(" ")[1] || "" : "",
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
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
  })
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [sameAsShipping, setSameAsShipping] = useState(true)

  const subtotal = getTotalPrice()
  const shippingCost = shippingMethod === "express" ? 9.99 : shippingMethod === "standard" ? 4.99 : 0
  const tax = subtotal * 0.2 // 20% VAT
  const total = subtotal + shippingCost + tax

  const handleShippingChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleBillingChange = (field: string, value: string) => {
    setBillingInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handlePaymentChange = (field: string, value: string) => {
    setPaymentInfo((prev) => ({ ...prev, [field]: value }))
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
      case 3:
        if (paymentMethod === "card") {
          return paymentInfo.cardNumber && paymentInfo.expiryDate && paymentInfo.cvv && paymentInfo.nameOnCard
        }
        if (paymentMethod === "external") {
          // External payment method doesn't need validation
          return true
        }
        return true
      default:
        return false
    }
  }

  const handlePlaceOrder = async () => {
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

      // Prepare the order data
      const orderData: any = {
        userId: user.uid,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          total: item.price * item.quantity // Add total property
        })),
        subtotal,
        shipping: shippingCost,
        tax,
        total,
        currency: currencyContext?.currency || "GBP", // Add required currency property
        status: "pending" as const,
        paymentStatus: "pending" as const,
        paymentMethod: paymentMethod,
        shippingAddress: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: "", // Add missing state field
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country,
          phone: shippingInfo.phone,
        },
        billingAddress: sameAsShipping
          ? {
              firstName: shippingInfo.firstName,
              lastName: shippingInfo.lastName,
              street: shippingInfo.address,
              city: shippingInfo.city,
              state: "", // Add missing state field
              postalCode: shippingInfo.postalCode,
              country: shippingInfo.country,
              phone: shippingInfo.phone,
            }
          : {
              firstName: billingInfo.firstName,
              lastName: billingInfo.lastName,
              street: billingInfo.address,
              city: billingInfo.city,
              state: "", // Add missing state field
              postalCode: billingInfo.postalCode,
              country: billingInfo.country,
              phone: shippingInfo.phone,
            },
        estimatedDelivery: new Date(
          shippingMethod === "express" 
            ? Date.now() + 2 * 24 * 60 * 60 * 1000  // 2 days for express
            : Date.now() + 5 * 24 * 60 * 60 * 1000  // 5 days for standard
        ),
      }

      // Process payment (this would be integrated with a payment provider)
      // For demo purposes, we're simulating a successful payment
      // Handle different payment methods
      if (paymentMethod === "external") {
        // For external payment redirect, we create the order first as pending
        orderData.paymentStatus = "pending" as const;
        
        // Create the order in Firebase Realtime Database
        const orderResult = await createOrder(orderData);
        
        // For now, we redirect to the payment successful page for testing
        // This will be replaced with the actual payment link later
        router.push(`/payment-successful?orderId=${orderResult.id}&amount=${total.toFixed(2)}&items=${items.length}&email=${shippingInfo.email}`);
        
        // Note: The above redirect will be replaced with your external payment link
        // Example: router.push(`https://payment-provider.com?orderId=${orderId}&amount=${total}`);
        
        // Don't clear cart yet - this will be done after successful payment
        
      } else {
        // Standard card payment processing
        const paymentResult = await simulatePaymentProcessing();
        
        if (paymentResult.success) {
          // Add payment details to order
          orderData.paymentStatus = "paid" as const;
          orderData.paymentId = paymentResult.paymentId;
          
          // Create the order in Firebase Realtime Database
          const orderResult = await createOrder(orderData);
  
          // Clear cart
          clearCart();
          
          // Show success message
          toast({
            title: "Order placed successfully",
            description: "Your order has been placed and is being processed.",
          });
  
          // Redirect to payment successful page with order details
          router.push(`/payment-successful?orderId=${orderResult.id}&amount=${total.toFixed(2)}&items=${items.length}&email=${shippingInfo.email}`);
        } else {
          throw new Error("Payment processing failed");
        }
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast({
        title: "Order failed",
        description: error.message || "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Add a function to simulate payment processing
  const simulatePaymentProcessing = async () => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful payment 95% of the time
    const isSuccessful = Math.random() < 0.95;
    
    if (isSuccessful) {
      return {
        success: true,
        paymentId: `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      };
    } else {
      throw new Error("Payment declined. Please try a different payment method.");
    }
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

  // Don't render the page content until we're on the client side
  if (!isClient) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="h-8 bg-gray-200 rounded-lg animate-pulse mb-4 mx-auto max-w-md"></div>
            <div className="h-6 bg-gray-200 rounded-lg animate-pulse mb-8 mx-auto max-w-sm"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded-lg animate-pulse mx-auto max-w-lg"></div>
              <div className="h-4 bg-gray-200 rounded-lg animate-pulse mx-auto max-w-md"></div>
              <div className="h-4 bg-gray-200 rounded-lg animate-pulse mx-auto max-w-lg"></div>
            </div>
          </div>
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
              <BreadcrumbLink href="/cart">Cart</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Checkout</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* UK Only Notice */}
        <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-lg">🇬🇧</div>
            <div>
              <span className="font-medium text-gray-800">UK Delivery Only - </span>
              <span className="text-sm text-gray-600">We currently deliver to United Kingdom addresses only</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Secure UK checkout</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { number: 1, title: "Shipping" },
              { number: 2, title: "Billing" },
              { number: 3, title: "Payment" },
              { number: 4, title: "Review" },
            ].map((stepItem) => (
              <div key={stepItem.number} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepItem.number ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {stepItem.number}
                </div>
                <span className="ml-2 text-sm font-medium">{stepItem.title}</span>
                {stepItem.number < 4 && <div className="w-16 h-px bg-muted ml-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={shippingInfo.firstName}
                        onChange={(e) => handleShippingChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={shippingInfo.lastName}
                        onChange={(e) => handleShippingChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => handleShippingChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={shippingInfo.phone}
                        onChange={(e) => handleShippingChange("phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => handleShippingChange("address", e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => handleShippingChange("city", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={(e) => handleShippingChange("postalCode", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="text-2xl">🇬🇧</div>
                          <div>
                            <div className="font-medium text-gray-900">United Kingdom</div>
                            <div className="text-sm text-gray-600">Delivery available to UK addresses only</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div className="mt-6">
                    <Label className="text-base font-semibold">Shipping Method</Label>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="mt-3">
                      <div className="flex items-center space-x-2 border p-3 rounded-lg">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard" className="flex-1 cursor-pointer">
                          <div className="flex justify-between">
                            <div>
                              <div className="font-medium">Standard Delivery</div>
                              <div className="text-sm text-muted-foreground">5-7 business days</div>
                            </div>
                            <div className="font-medium">{formatPrice(4.99)}</div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border p-3 rounded-lg">
                        <RadioGroupItem value="express" id="express" />
                        <Label htmlFor="express" className="flex-1 cursor-pointer">
                          <div className="flex justify-between">
                            <div>
                              <div className="font-medium">Express Delivery</div>
                              <div className="text-sm text-muted-foreground">2-3 business days</div>
                            </div>
                            <div className="font-medium">{formatPrice(9.99)}</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Billing Information */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sameAsShipping"
                      checked={sameAsShipping}
                      onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
                    />
                    <Label htmlFor="sameAsShipping">Same as shipping address</Label>
                  </div>

                  {!sameAsShipping && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billingFirstName">First Name *</Label>
                          <Input
                            id="billingFirstName"
                            value={billingInfo.firstName}
                            onChange={(e) => handleBillingChange("firstName", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingLastName">Last Name *</Label>
                          <Input
                            id="billingLastName"
                            value={billingInfo.lastName}
                            onChange={(e) => handleBillingChange("lastName", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="billingAddress">Address *</Label>
                        <Input
                          id="billingAddress"
                          value={billingInfo.address}
                          onChange={(e) => handleBillingChange("address", e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="billingCity">City *</Label>
                          <Input
                            id="billingCity"
                            value={billingInfo.city}
                            onChange={(e) => handleBillingChange("city", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingPostalCode">Postal Code *</Label>
                          <Input
                            id="billingPostalCode"
                            value={billingInfo.postalCode}
                            onChange={(e) => handleBillingChange("postalCode", e.target.value)}
                            required
                          />
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="text-2xl">🇬🇧</div>
                            <div>
                              <div className="font-medium text-gray-900">United Kingdom</div>
                              <div className="text-sm text-gray-600">UK delivery only</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment Information */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">Payment Method</Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-3">
                      <div className="flex items-center space-x-2 border p-3 rounded-lg">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span>Credit/Debit Card</span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border p-3 rounded-lg mt-2">
                        <RadioGroupItem value="external" id="external" />
                        <Label htmlFor="external" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            <span>Secure Direct Payment</span>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                    
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm mb-2">We also support additional secure payment options:</p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={() => setPaymentMethod("external")}
                        >
                          Secure Payment
                        </Button>
                        <Button variant="outline" size="sm" className="h-8" disabled>
                          {/* Additional payment links can be added here */}
                          Coming Soon
                        </Button>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === "card" && (
                    <>
                      <div>
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => handlePaymentChange("cardNumber", e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={paymentInfo.expiryDate}
                            onChange={(e) => handlePaymentChange("expiryDate", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={paymentInfo.cvv}
                            onChange={(e) => handlePaymentChange("cvv", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="nameOnCard">Name on Card *</Label>
                        <Input
                          id="nameOnCard"
                          value={paymentInfo.nameOnCard}
                          onChange={(e) => handlePaymentChange("nameOnCard", e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}
                  
                  {paymentMethod === "external" && (
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <h3 className="text-sm font-medium text-gray-800 mb-2">External Payment Redirect</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        After placing your order, you'll be redirected to our external payment processor.
                      </p>
                      
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mb-4">
                        <div className="flex gap-2 items-start">
                          <div className="text-amber-500 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                          </div>
                          <div className="text-xs text-amber-800">
                            <p className="font-medium">Payment link will be added later</p>
                            <p>The system will currently redirect to the payment successful page for testing purposes.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 border rounded-md bg-white">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium">Order Total:</span>
                          <span className="text-sm font-bold">{formatPrice(total)}</span>
                        </div>
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white" 
                          asChild
                        >
                          {/* REPLACE THIS HREF WITH YOUR PAYMENT LINK LATER */}
                          <Link href={`/payment-successful?orderId=ORDER-${Date.now()}&amount=${total.toFixed(2)}&items=${items.length}&email=${shippingInfo.email}`}>
                            Proceed to Payment
                          </Link>
                        </Button>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                        <p className="text-xs text-gray-500">
                          You'll be able to review your order before completing payment
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review Order */}
            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {items.map((item, index) => (
                        <div key={`${item.productId}-${index}`} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="relative w-12 h-12 rounded overflow-hidden">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </div>
                          </div>
                          <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                    <div className="p-3 bg-muted rounded-lg">
                      <div>
                        {shippingInfo.firstName} {shippingInfo.lastName}
                      </div>
                      <div>{shippingInfo.address}</div>
                      <div>
                        {shippingInfo.city}, {shippingInfo.postalCode}
                      </div>
                      <div>{shippingInfo.country}</div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="font-semibold mb-2">Payment Method</h3>
                    <div className="p-3 bg-muted rounded-lg">
                      {paymentMethod === "card" ? (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Credit Card ending in {paymentInfo.cardNumber.slice(-4)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <span>Secure Direct Payment</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => (step > 1 ? setStep(step - 1) : router.push("/cart"))}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {step > 1 ? "Previous" : "Back to Cart"}
              </Button>

              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!validateStep(step)}>
                  Continue
                </Button>
              ) : (
                <Button onClick={handlePlaceOrder} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
                  {isProcessing ? "Processing..." : `Place Order - ${formatPrice(total)}`}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={`${item.productId}-${index}-summary`} className="flex justify-between text-sm">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (VAT)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                  <Shield className="h-4 w-4" />
                  <span>Secure payment protected by SSL</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}