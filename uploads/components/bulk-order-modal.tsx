"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkPricingTiers } from "@/components/bulk-pricing-tiers"
import { useCurrency } from "@/components/currency-provider"
import { useToast } from "@/hooks/use-toast"
import { Package2, Building2, Truck } from "lucide-react"

interface BulkOrderModalProps {
  isOpen: boolean
  onClose: () => void
  productId: number
  productName: string
  basePrice: number
  country: string
}

export function BulkOrderModal({ isOpen, onClose, productId, productName, basePrice, country }: BulkOrderModalProps) {
  const [quantity, setQuantity] = useState(10)
  const [businessType, setBusinessType] = useState("retailer")
  const [deliveryOption, setDeliveryOption] = useState("standard")
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    taxId: "",
    additionalInfo: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const { formatPrice } = useCurrency()
  const { toast } = useToast()

  // Get discount percentage based on quantity
  const getDiscountPercentage = (qty: number) => {
    if (qty >= 100) return 25
    if (qty >= 50) return 20
    if (qty >= 25) return 15
    if (qty >= 10) return 10
    return 0
  }

  // Calculate discounted price
  const getDiscountedPrice = (qty: number) => {
    const discount = getDiscountPercentage(qty)
    return basePrice * (1 - discount / 100)
  }

  // Calculate total price
  const getTotalPrice = () => {
    return getDiscountedPrice(quantity) * quantity
  }

  // Calculate savings
  const getSavings = () => {
    return basePrice * quantity - getTotalPrice()
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Bulk Order Request Submitted",
      description: "Our team will contact you within 24 hours to confirm your order.",
    })

    setIsSubmitting(false)
    onClose()

    // Reset form
    setQuantity(10)
    setBusinessType("retailer")
    setDeliveryOption("standard")
    setFormData({
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      taxId: "",
      additionalInfo: "",
    })
    setStep(1)
  }

  // Get delivery time estimate
  const getDeliveryEstimate = () => {
    switch (deliveryOption) {
      case "express":
        return "3-5 business days"
      case "standard":
        return "7-10 business days"
      case "economy":
        return "14-21 business days"
      default:
        return "7-10 business days"
    }
  }

  // Get delivery cost
  const getDeliveryCost = () => {
    switch (deliveryOption) {
      case "express":
        return quantity >= 50 ? 0 : 25
      case "standard":
        return quantity >= 25 ? 0 : 15
      case "economy":
        return quantity >= 10 ? 0 : 10
      default:
        return 15
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package2 className="h-5 w-5 text-green-600" />
            Bulk Order Request
          </DialogTitle>
          <DialogDescription>Special pricing for business customers and large orders</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Product Information</h3>
              <p className="text-sm text-muted-foreground mb-1">
                Product: <span className="font-medium text-foreground">{productName}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Base Price: <span className="font-medium text-foreground">{formatPrice(basePrice)}</span>
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-4">Bulk Pricing Tiers</h3>
              <BulkPricingTiers basePrice={basePrice} selectedQuantity={quantity} onQuantitySelect={setQuantity} />
            </div>

            <div>
              <Label htmlFor="custom-quantity">Custom Quantity</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="custom-quantity"
                  type="number"
                  min="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 10)}
                />
                <span className="text-sm text-muted-foreground">units</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Minimum order quantity: 10 units</p>
            </div>

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-medium mb-2 text-green-700 dark:text-green-300">Your Bulk Order Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span className="font-medium">{quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span>Unit Price:</span>
                  <span className="font-medium">{formatPrice(getDiscountedPrice(quantity))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="font-medium text-green-600">{getDiscountPercentage(quantity)}% off</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Savings:</span>
                  <span className="font-medium text-green-600">{formatPrice(getSavings())}</span>
                </div>
                <div className="border-t pt-1 mt-1 border-green-200 dark:border-green-800 flex justify-between">
                  <span className="font-medium">Total Price:</span>
                  <span className="font-bold">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep(2)}>Continue</Button>
            </DialogFooter>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-green-600" />
                Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retailer">Retailer</SelectItem>
                      <SelectItem value="wholesaler">Wholesaler</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="caterer">Caterer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name *</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                  <Input id="taxId" name="taxId" value={formData.taxId} onChange={handleInputChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Business Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Truck className="h-4 w-4 text-green-600" />
                Delivery Options
              </h3>
              <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption} className="space-y-3">
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="express" id="express" />
                  <Label htmlFor="express" className="flex-1 cursor-pointer">
                    <div className="font-medium">Express Delivery</div>
                    <div className="text-sm text-muted-foreground">3-5 business days</div>
                  </Label>
                  <div className="text-right">
                    {quantity >= 50 ? (
                      <span className="text-green-600 text-sm font-medium">Free</span>
                    ) : (
                      <span className="font-medium">{formatPrice(25)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard" className="flex-1 cursor-pointer">
                    <div className="font-medium">Standard Delivery</div>
                    <div className="text-sm text-muted-foreground">7-10 business days</div>
                  </Label>
                  <div className="text-right">
                    {quantity >= 25 ? (
                      <span className="text-green-600 text-sm font-medium">Free</span>
                    ) : (
                      <span className="font-medium">{formatPrice(15)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="economy" id="economy" />
                  <Label htmlFor="economy" className="flex-1 cursor-pointer">
                    <div className="font-medium">Economy Delivery</div>
                    <div className="text-sm text-muted-foreground">14-21 business days</div>
                  </Label>
                  <div className="text-right">
                    {quantity >= 10 ? (
                      <span className="text-green-600 text-sm font-medium">Free</span>
                    ) : (
                      <span className="font-medium">{formatPrice(10)}</span>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                placeholder="Any special requirements or instructions for your order"
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" required />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <a href="/terms" className="text-green-600 hover:underline">
                  terms and conditions
                </a>{" "}
                for bulk orders
              </Label>
            </div>

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-medium mb-2 text-green-700 dark:text-green-300">Order Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Product:</span>
                  <span className="font-medium">{productName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span className="font-medium">{quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span>Unit Price:</span>
                  <span className="font-medium">{formatPrice(getDiscountedPrice(quantity))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span className="font-medium">
                    {getDeliveryCost() === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(getDeliveryCost())
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span className="font-medium">{getDeliveryEstimate()}</span>
                </div>
                <div className="border-t pt-1 mt-1 border-green-200 dark:border-green-800 flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">{formatPrice(getTotalPrice() + getDeliveryCost())}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Bulk Order Request"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
