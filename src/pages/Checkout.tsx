import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"



import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Checkbox } from "../components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { Separator } from "../components/ui/separator"
import { CreditCard, Truck, Shield, Lock, ArrowLeft } from "lucide-react"
import { useCart } from "../components/cart-provider"
import { useAuth } from "../components/auth-provider"
import { useToast } from "../hooks/use-toast"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb"
import { createOrder } from "../lib/firebase-orders"
import { PaystackButton } from "react-paystack"


// Nigerian states for shipping
const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT Abuja"
]

const lagosShippingOptions = [
  { id: 'lagos-mainland-1', name: 'Lagos Mainland 1', price: 1500, description: 'Allen Avenue, Opebi, Toyin Ikeja' },
  { id: 'lagos-mainland-2', name: 'Lagos Mainland 2', price: 2000, description: 'Computer village, Alausa, Oregun Ikeja' },
  { id: 'lagos-mainland-3', name: 'Lagos Mainland 3', price: 3000, description: 'Omole phase 1 & 2, Magodo, Ogudu, Ojota, Oko oba, Agege' },
  { id: 'lagos-mainland-4', name: 'Lagos Mainland 4', price: 3500, description: 'Surulere, Yaba, Bariga, Gbagada, Ajao estate, Anthony, Ikosi, Ketu, Iju ishaga, Oshodi, Maryland, Mushin, Ilupeju' },
  { id: 'lagos-mainland-5', name: 'Lagos Mainland 5', price: 4500, description: 'Iyana ipaja, Ikotun, Egbeda, Abule Egba, Amuwo odofin, Igando, Festac, Meiran, Ayobo, Ago palace way, Satellite town, idimu, Ijaiye, Ejigbo' },
  { id: 'lagos-mainland-6', name: 'Lagos Mainland 6', price: 5000, description: 'Ojokoro, Ikorodu, Akute, Alagbado' },
  { id: 'lagos-island-1', name: 'Lagos Island 1', price: 4500, description: 'Eko idumota, IKOYI, Victoria island, Oniru' },
  { id: 'lagos-island-2', name: 'Lagos Island 2', price: 4500, description: 'Lekki, Agungi, Ikate, Ologolo' },
  { id: 'lagos-island-3', name: 'Lagos Island 3', price: 3000, description: 'CHEVRON, VGC, ORCHID, IKOTA, AJAH, IGBO-EFON' },
  { id: 'sangotedo', name: 'Sangotedo', price: 2000, description: '' },
  { id: 'abijo-awoyaya', name: 'Abijo/Awoyaya', price: 3000, description: '' },
]

const otherShippingOptions = [
  { id: 'gig-logistics', name: 'GIG Logistics', price: 6000, description: "Tracked delivery outside Lagos. 3-5 working days. Price may be higher for orders over 2kg." },
  { id: 'international-delivery', name: 'International Delivery', price: 3000, description: "Outside Nigeria. Price determined by weight. Agent will contact you." },
  { id: 'bus-park-delivery', name: 'Bus Park Delivery', price: 1000, description: '' },
]

// NGN currency formatter
const formatNaira = (amount: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(amount)

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "Lagos",
    postalCode: "",
    country: "Nigeria",
  })

  // Populate shipping info from authenticated user after mount
  useEffect(() => {
    if (user) {
      setShippingInfo((prev) => ({
        ...prev,
        firstName: user.displayName ? user.displayName.split(" ")[0] || "" : prev.firstName,
        lastName: user.displayName ? user.displayName.split(" ")[1] || "" : prev.lastName,
        email: user.email || prev.email,
      }))
    }
  }, [user])
  const [billingInfo, setBillingInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "Lagos",
    postalCode: "",
    country: "Nigeria",
  })
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
  })
  const [deliveryType, setDeliveryType] = useState('lagos')
  const [lagosShippingOptionId, setLagosShippingOptionId] = useState('lagos-mainland-1')
  const [otherShippingOptionId, setOtherShippingOptionId] = useState('gig-logistics')
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [orderId, setOrderId] = useState<string | null>(null)

  const subtotal = getTotalPrice()
  const shippingCost = deliveryType === 'lagos' 
    ? lagosShippingOptions.find(option => option.id === lagosShippingOptionId)?.price || 0
    : otherShippingOptions.find(option => option.id === otherShippingOptionId)?.price || 0
  // VAT = 2.5% of subtotal for Nigeria
  const tax = subtotal * 0.025
  const total = subtotal + shippingCost + tax

  // Override formatPrice to use Naira on this page
  const formatPrice = (amount: number) => formatNaira(amount)

  const handleShippingChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleBillingChange = (field: string, value: string) => {
    setBillingInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handlePaymentChange = (field: string, value: string) => {
    setPaymentInfo((prev) => ({ ...prev, [field]: value }))
  }

  // const validateStep = (stepNumber: number) => {
    
  //   switch (stepNumber) {
  //     case 1:
  //       return (
  //         shippingInfo.firstName &&
  //         shippingInfo.lastName &&
  //         shippingInfo.email &&
  //         shippingInfo.phone &&
  //         shippingInfo.address &&
  //         shippingInfo.city &&
  //         shippingInfo.postalCode
  //       )
  //     case 2:
  //       if (sameAsShipping) return true
  //       return (
  //         billingInfo.firstName &&
  //         billingInfo.lastName &&
  //         billingInfo.address &&
  //         billingInfo.city &&
  //         billingInfo.postalCode
  //       )
  //     case 4:
  //       if (paymentMethod === "card") {
  //         return paymentInfo.cardNumber && paymentInfo.expiryDate && paymentInfo.cvv && paymentInfo.nameOnCard
  //       }
  //       if (paymentMethod === "external") {
  //         // External payment method doesn't need validation
  //         return true
  //       }
  //       return true
  //     default:
  //       return false
  //   }
  // }

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
        return true // ✅ Always allow moving forward from Review
      case 4:
        if (paymentMethod === "card") {
          return (
            paymentInfo.cardNumber &&
            paymentInfo.expiryDate &&
            paymentInfo.cvv &&
            paymentInfo.nameOnCard
          )
        }
        if (paymentMethod === "external") {
          return true
        }
        return true
      default:
        return false
    }
  }

  const handlePlaceOrder = async (paymentRef?: string) => {
    setIsProcessing(true)

    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to place an order.",
          variant: "destructive",
        })
        navigate("/login?redirect=/checkout")
        return
      }

      const orderData = {
        userId: user.uid,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        subtotal,
        shipping: shippingCost,
        tax,
        total,
        currency: "NGN",
        status: "pending" as const,
        paymentStatus: paymentRef ? "paid" as const : "pending" as const,
        paymentMethod: "paystack",
        paymentId: paymentRef || null,
        shippingAddress: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          address1: shippingInfo.address, // This is required
          street: shippingInfo.address,   // This is required
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country,
          phone: shippingInfo.phone,
          email: shippingInfo.email, // This is required
        },
        billingAddress: sameAsShipping ? {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          address1: shippingInfo.address, // This is required
          street: shippingInfo.address,   // This is required
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country,
          phone: shippingInfo.phone,
          email: shippingInfo.email, // This is required
        } : {
          firstName: billingInfo.firstName,
          lastName: billingInfo.lastName,
          address1: billingInfo.address, // This is required
          street: billingInfo.address,   // This is required
          city: billingInfo.city,
          state: billingInfo.state,
          postalCode: billingInfo.postalCode,
          country: billingInfo.country,
          phone: shippingInfo.phone, // Use shipping phone for billing
          email: shippingInfo.email, // Use shipping email for billing
        },
        estimatedDelivery:
          deliveryType === "lagos"
            ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 1-2 days
            : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 3-5 days
      }

      const createdOrder = await createOrder(orderData)
      const orderId = createdOrder?.id || createdOrder

      clearCart()

      toast({
        title: "Payment successful",
        description: "Your order has been placed successfully.",
      })

      navigate(`/order-confirmation?orderId=${orderId}`)
    } catch (error: any) {
      console.error("Order error:", error)
      toast({
        title: "Order failed",
        description: error.message || "Something went wrong, please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }


  // const handlePlaceOrder = async () => {
  //   setIsProcessing(true)

  //   try {
  //     if (!user) {
  //       toast({
  //         title: "Authentication required",
  //         description: "Please log in to place an order.",
  //         variant: "destructive",
  //       })
  //       navigate("/login?redirect=/checkout")
  //       return
  //     }

  //     // Prepare the order data
  //     const orderData = {
  //       userId: user.uid,
  //       items: items.map(item => ({
  //         productId: item.productId,
  //         name: item.name,
  //         price: item.price,
  //         image: item.image,
  //         quantity: item.quantity,
  //         total: item.price * item.quantity
  //       })),
  //       subtotal,
  //       shipping: shippingCost,
  //       tax,
  //       total,
  //       currency: "NGN", // Nigerian Naira
  //       status: "pending" as const,
  //       paymentStatus: "pending" as const,
  //       paymentMethod: paymentMethod,
  //       shippingAddress: {
  //         firstName: shippingInfo.firstName,
  //         lastName: shippingInfo.lastName,
  //         address1: shippingInfo.address,
  //         street: shippingInfo.address,
  //         city: shippingInfo.city,
  //         state: shippingInfo.state,
  //         postalCode: shippingInfo.postalCode,
  //         country: shippingInfo.country,
  //         phone: shippingInfo.phone,
  //       },
  //       billingAddress: sameAsShipping
  //         ? {
  //             firstName: shippingInfo.firstName,
  //             lastName: shippingInfo.lastName,
  //             address1: shippingInfo.address,
  //             street: shippingInfo.address,
  //             city: shippingInfo.city,
  //             state: shippingInfo.state,
  //             postalCode: shippingInfo.postalCode,
  //             country: shippingInfo.country,
  //             phone: shippingInfo.phone,
  //           }
  //         : {
  //             firstName: billingInfo.firstName,
  //             lastName: billingInfo.lastName,
  //             address1: billingInfo.address,
  //             street: billingInfo.address,
  //             city: billingInfo.city,
  //             state: billingInfo.state,
  //             postalCode: billingInfo.postalCode,
  //             country: billingInfo.country,
  //             phone: shippingInfo.phone,
  //           },
  //       estimatedDelivery: deliveryType === "lagos"
  //         ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)  // 1-2 days for Lagos
  //         : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 3-5 days for Interstate
  //     }

  //     // Handle different payment methods
  //     if (paymentMethod === "external") {
  //       // For external payment, create the order first as pending
  //       const createdOrder = await createOrder(orderData)
  //       const orderId = createdOrder?.id || createdOrder

  //       // For testing, redirect to payment successful page
  //       // This will be replaced with actual external payment link
  //       navigate(`/payment-successful?orderId=${orderId}&amount=${total.toFixed(2)}&items=${items.length}&email=${encodeURIComponent(shippingInfo.email)}`)
        
  //       // Don't clear cart yet - this will be done after successful payment
        
  //     } else {
  //       // Standard card payment processing
  //       const paymentResult = await simulatePaymentProcessing()
        
  //       if (paymentResult.success) {
  //         // Update order with payment info
  //         const updatedOrderData = {
  //           ...orderData,
  //           paymentStatus: "paid" as const,
  //           paymentId: paymentResult.paymentId
  //         }

  //         // Create the order in Firebase
  //         const createdOrder = await createOrder(updatedOrderData)
  //         const orderId = createdOrder?.id || createdOrder

  //         // Clear cart
  //         clearCart()
          
  //         // Show success message
  //         toast({
  //           title: "Order placed successfully",
  //           description: "Your order has been placed and is being processed.",
  //         })

  //         // Redirect to confirmation page
  //         navigate(`/order-confirmation?orderId=${orderId}`)
  //       } else {
  //         throw new Error("Payment processing failed")
  //       }
  //     }
  //   } catch (error: any) {
  //     console.error("Error placing order:", error);
  //     toast({
  //       title: "Order failed",
  //       description: error.message || "There was an error processing your order. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

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
            <Button onClick={() => navigate('/')}>Continue Shopping</Button>
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

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Secure checkout</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { number: 1, title: "Shipping" },
              { number: 2, title: "Billing" },
              { number: 3, title: "Review" },
              { number: 4, title: "Payment" },
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
                      <Label htmlFor="postalCode">Postal Code (6 digits) *</Label>
                      <Input
                        id="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={(e) => handleShippingChange("postalCode", e.target.value)}
                        placeholder="e.g. 100001"
                        maxLength={6}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select
                        value={shippingInfo.state}
                        onValueChange={(value) => handleShippingChange("state", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          {NIGERIA_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Delivery Type */}
                  <div className="mt-6">
                    <Label className="text-base font-semibold">Delivery Type</Label>
                    <RadioGroup value={deliveryType} onValueChange={setDeliveryType} className="mt-3">
                      <div className="flex items-center space-x-2 border p-3 rounded-lg">
                        <RadioGroupItem value="lagos" id="lagos" />
                        <Label htmlFor="lagos" className="flex-1 cursor-pointer">
                          <div className="flex justify-between">
                            <div>
                              <div className="font-medium">Lagos Delivery</div>
                              <div className="text-sm text-muted-foreground">Various options within Lagos</div>
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border p-3 rounded-lg">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="flex-1 cursor-pointer">
                          <div className="flex justify-between">
                            <div>
                              <div className="font-medium">Other Locations</div>
                              <div className="text-sm text-muted-foreground">Outside Lagos or International</div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Lagos Shipping Options */}
                  {deliveryType === 'lagos' && (
                    <div className="mt-4">
                      <Label className="text-base font-semibold">Lagos Shipping Options</Label>
                      <RadioGroup value={lagosShippingOptionId} onValueChange={setLagosShippingOptionId} className="mt-3">
                        {lagosShippingOptions.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2 border p-3 rounded-lg">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                              <div className="flex justify-between">
                                <div>
                                  <div className="font-medium">{option.name}</div>
                                  {option.description && (
                                    <div className="text-sm text-muted-foreground">{option.description}</div>
                                  )}
                                </div>
                                <div className="font-medium">{formatPrice(option.price)}</div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {/* Other Shipping Options */}
                  {deliveryType === 'other' && (
                    <div className="mt-4">
                      <Label className="text-base font-semibold">Shipping Options</Label>
                      <RadioGroup value={otherShippingOptionId} onValueChange={setOtherShippingOptionId} className="mt-3">
                        {otherShippingOptions.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2 border p-3 rounded-lg">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                              <div className="flex justify-between">
                                <div>
                                  <div className="font-medium">{option.name}</div>
                                  {option.description && (
                                    <div className="text-sm text-muted-foreground">{option.description}</div>
                                  )}
                                </div>
                                <div className="font-medium">{formatPrice(option.price)}</div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}
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
                          <Label htmlFor="billingPostalCode">Postal Code (6 digits) *</Label>
                          <Input
                            id="billingPostalCode"
                            value={billingInfo.postalCode}
                            onChange={(e) => handleBillingChange("postalCode", e.target.value)}
                            placeholder="e.g. 100001"
                            maxLength={6}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingState">State *</Label>
                          <Select
                            value={billingInfo.state}
                            onValueChange={(value) => handleBillingChange("state", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a state" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 shadow-lg">
                              {NIGERIA_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-12 h-12 rounded overflow-hidden">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-cover"
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
                  {/* <div>
                    <h3 className="font-semibold mb-2">Payment Method</h3>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Credit Card ending in {paymentInfo.cardNumber.slice(-4)}</span>
                      </div>
                    </div>
                  </div> */}
                </CardContent>
              </Card>
            )}
            {/* Step 4: Payment Information */}
            {/* // -------------------- STEP 4: PAYMENT -------------------- */}
            {step === 4 && (
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
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="mt-3"
                    >
                      <div className="flex items-center space-x-2 border p-3 rounded-lg">
                        <RadioGroupItem value="paystack" id="paystack" />
                        <Label htmlFor="paystack" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span>Pay with Paystack</span>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {paymentMethod === "paystack" && (
                    <div className="mt-6">
                      <PaystackButton
                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition"
                        email={shippingInfo.email}
                        amount={total * 100} // kobo
                        publicKey={import.meta.env.VITE_PAYSTACK_PUBLIC_KEY}
                        text={isProcessing ? "Processing..." : `Pay ${formatPrice(total)}`}
                        metadata={{
                          custom_fields: [
                            {
                              display_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                              variable_name: "phone",
                              value: shippingInfo.phone,
                            },
                          ],
                        }}
                        onSuccess={async (ref) => {
                          // Fix: Extract the reference string instead of passing the entire event object
                          await handlePlaceOrder(ref.reference);
                        }}
                        onClose={() => {
                          setIsProcessing(false)
                          toast({
                            title: "Payment cancelled",
                            description: "You cancelled the transaction.",
                            variant: "destructive",
                          })
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}



            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => (step > 1 ? setStep(step - 1) : navigate("/cart"))}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {step > 1 ? "Previous" : "Back to Cart"}
              </Button>

              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!validateStep(step)}>
                  Continue
                </Button>
              ) : (
                // Fix: Prevent direct calling with event parameter by using an arrow function
                <Button 
                  onClick={() => handlePlaceOrder()} 
                  disabled={isProcessing ? false : true} 
                  className="bg-green-600 hover:bg-green-700"
                >
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
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
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
