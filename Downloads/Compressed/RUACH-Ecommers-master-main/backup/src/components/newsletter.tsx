

import type React from "react"

import { useState } from "react"
import { Button } from "../../src/components/ui/button"
import { Input } from "../../src/components/ui/input"
import { useToast } from "../../src/hooks/use-toast"
import { Check, Loader2, Mail, Gift, Bell, Tag, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Successfully subscribed!",
        description: "Welcome to our community. You'll receive our next newsletter soon!",
      })
      setEmail("")
      setIsSubscribed(true)
      
      // Reset the success state after 5 seconds
      setTimeout(() => {
        setIsSubscribed(false)
      }, 5000)
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "We couldn't process your subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="newsletter-section" className="py-20 mb-20 bg-white text-gray-800 relative overflow-hidden border-t border-gray-200">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-green-200 animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-green-200 animate-pulse-slow" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-green-200 animate-pulse-slow" style={{ animationDelay: "1.5s" }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center bg-green-50 rounded-full px-3 py-1 text-sm border border-green-200 backdrop-blur-sm mb-4 text-green-700">
              <Mail className="h-4 w-4 mr-2" />
              <span>Join 5,000+ subscribers</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight max-w-3xl mx-auto text-gray-800">
              Get Fresh Updates from RUACH E-STORE
            </h2>
            <div className="w-24 h-1 bg-green-500 rounded mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay in the loop with exclusive updates on new products, special discounts, and latest arrivals from our trusted vendors.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-8 md:gap-12">
            {/* Left content */}
            <div className="md:w-5/12 text-center md:text-left">
              <div className="h-full flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Why Subscribe?</h3>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-4 bg-green-50 p-4 rounded-lg shadow-sm">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Gift className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Exclusive Offers</h4>
                      <p className="text-sm text-gray-600">Special discounts only for subscribers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-green-50 p-4 rounded-lg shadow-sm">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Bell className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">New Arrivals</h4>
                      <p className="text-sm text-gray-600">Be first to know about new products</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-green-50 p-4 rounded-lg shadow-sm">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Tag className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Seasonal Promotions</h4>
                      <p className="text-sm text-gray-600">Holiday specials and limited-time offers</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Right form */}
            <div className="md:w-7/12 w-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-md border border-gray-200"
              >
                <div className="text-center mb-6">
                  <div className="bg-green-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-7 w-7 text-green-600" />
                  </div>
                  <h3 className="text-gray-800 text-2xl font-bold">Get RUACH E-STORE Updates</h3>
                  <p className="text-gray-600 mt-2">Sign up for our newsletter and never miss out</p>
                </div>
                
                {isSubscribed ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 p-6 rounded-xl text-center"
                  >
                    <div className="bg-green-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="text-green-700 text-xl font-bold">Thank you for subscribing!</h4>
                    <p className="text-green-600 mt-2">Check your inbox for a confirmation email and get ready for exclusive updates.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm text-gray-700 font-medium block text-left">
                        Email Address <span className="text-red-500">*</span>
                      </label>
            <Input
                        id="email"
              type="email"
                        placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
                        className="bg-white border-gray-300 text-gray-800 h-12 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isLoading} 
                      className="bg-green-600 hover:bg-green-700 text-white w-full h-12 text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-200 mt-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Subscribe Now
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
            </Button>
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mt-3 inline-flex items-center">
                        <Check className="h-3 w-3 mr-1 text-green-500" />
                        We respect your privacy. Unsubscribe anytime.
                      </p>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          </div>

          <div className="mt-12 text-center text-sm text-gray-600">
            <p>Join thousands of satisfied customers who enjoy our premium products</p>
          </div>
        </div>
      </div>
    </section>
  )
}
