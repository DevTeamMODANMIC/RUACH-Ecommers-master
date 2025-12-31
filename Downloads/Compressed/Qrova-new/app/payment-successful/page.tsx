"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, ArrowLeft, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function PaymentSuccessfulPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState({
    id: searchParams.get("orderId") || "N/A",
    amount: searchParams.get("amount") || "0.00",
    items: searchParams.get("items") || "0",
    email: searchParams.get("email") || "customer@example.com"
  })
  
  // Animate the success icon and send confirmation email
  const [scale, setScale] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setScale(1), 100)
    return () => clearTimeout(timer)
  }, [])

  // Send payment confirmation email
  useEffect(() => {
    const sendPaymentConfirmation = async () => {
      if (orderDetails.email && orderDetails.email !== 'customer@example.com') {
        try {
          await fetch('/api/payment/confirmation-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: orderDetails.email,
              orderId: orderDetails.id,
              amount: orderDetails.amount,
              items: orderDetails.items
            })
          })
        } catch (error) {
          console.error('Failed to send payment confirmation email:', error)
        }
      }
    }

    sendPaymentConfirmation()
  }, [orderDetails])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div 
          className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-green-100 transition-transform duration-700 ease-out transform"
          style={{ transform: `scale(${scale})` }}
        >
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
        
        <Card className="mt-6 border border-gray-200 shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Payment Successful!</CardTitle>
            <CardDescription className="text-green-600">
              Your order has been confirmed and is now being processed
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">ORDER SUMMARY</h3>
              
              <dl className="mt-3 space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Order ID</dt>
                  <dd className="text-sm font-medium text-gray-900">{orderDetails.id}</dd>
                </div>
                
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Amount Paid</dt>
                  <dd className="text-sm font-medium text-gray-900">£{orderDetails.amount}</dd>
                </div>
                
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Items</dt>
                  <dd className="text-sm font-medium text-gray-900">{orderDetails.items}</dd>
                </div>
                
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Email</dt>
                  <dd className="text-sm font-medium text-gray-900">{orderDetails.email}</dd>
                </div>
              </dl>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>We've sent a confirmation email to your inbox with all the details of your purchase.</p>
            </div>
          </CardContent>
          
          <Separator />
          
          <CardFooter className="flex flex-col space-y-3 pt-4">
            <Link href="/profile/orders" className="w-full">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                View Order Details
              </Button>
            </Link>
            
            <Link href="/shop" className="w-full">
              <Button className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help with your order? <Link href="/contact" className="text-green-600 hover:text-green-700 font-medium">Contact support</Link>
          </p>
        </div>
      </div>
    </div>
  )
} 