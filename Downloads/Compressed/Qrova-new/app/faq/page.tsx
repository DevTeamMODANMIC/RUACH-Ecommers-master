"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Search, HelpCircle, Truck, CreditCard, Package, Shield, Phone, Mail } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    id: "shipping-1",
    category: "Shipping & Delivery",
    question: "How long does delivery take?",
    answer: "Standard delivery takes 5-7 business days within the UK. Express delivery is available for 2-3 business days at an additional cost. All orders are processed within 1-2 business days."
  },
  {
    id: "shipping-2",
    category: "Shipping & Delivery",
    question: "Do you offer free shipping?",
    answer: "Yes! We offer free standard shipping on all orders over £50. Orders under £50 have a £4.99 shipping fee. Express shipping is £9.99 regardless of order value."
  },
  {
    id: "shipping-3",
    category: "Shipping & Delivery",
    question: "Can I track my order?",
    answer: "Absolutely! Once your order is shipped, you'll receive a tracking number via email. You can use this to track your package on our website or the carrier's website."
  },
  {
    id: "returns-1",
    category: "Returns & Exchanges",
    question: "What's your return policy?",
    answer: "We offer a 30-day return policy for all items in their original condition with tags attached. Simply contact our customer service team to initiate a return. Return shipping is free for defective items."
  },
  {
    id: "returns-2",
    category: "Returns & Exchanges",
    question: "How do I return an item?",
    answer: "Contact our customer service team within 30 days of delivery. We'll provide you with a return label and instructions. Pack the item securely in its original packaging and drop it off at any post office."
  },
  {
    id: "returns-3",
    category: "Returns & Exchanges",
    question: "When will I receive my refund?",
    answer: "Refunds are processed within 3-5 business days after we receive your returned item. You'll receive an email confirmation once the refund is issued. Please allow 5-10 business days for the refund to appear on your original payment method."
  },
  {
    id: "payment-1",
    category: "Payment & Pricing",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and secure payment methods. All payments are processed securely through encrypted connections."
  },
  {
    id: "payment-2",
    category: "Payment & Pricing",
    question: "Are my payment details secure?",
    answer: "Yes, we use industry-standard SSL encryption to protect your payment information. We never store your credit card details on our servers. All transactions are processed through secure payment gateways."
  },
  {
    id: "payment-3",
    category: "Payment & Pricing",
    question: "Do you offer price matching?",
    answer: "We strive to offer competitive prices, but we don't currently offer price matching. However, we frequently run promotions and offer discounts to our loyal customers."
  },
  {
    id: "products-1",
    category: "Products & Quality",
    question: "Are your products authentic?",
    answer: "Yes, we source all our products directly from authorized distributors and manufacturers. We guarantee the authenticity of every item we sell and stand behind our products with our quality guarantee."
  },
  {
    id: "products-2",
    category: "Products & Quality",
    question: "Do you offer warranties?",
    answer: "Most of our products come with manufacturer warranties. Additionally, we offer our own quality guarantee. If you're not satisfied with your purchase within 30 days, we'll make it right."
  },
  {
    id: "products-3",
    category: "Products & Quality",
    question: "Are the product images and descriptions accurate?",
    answer: "We strive for accuracy in all our product listings. However, please note that colors may appear slightly different due to monitor settings and lighting conditions. If you have questions about specific products, please contact our customer service team."
  },
  {
    id: "account-1",
    category: "Account & Support",
    question: "How do I create an account?",
    answer: "You can create an account during the checkout process or by clicking 'Sign Up' on our website. Having an account allows you to track orders, save payment methods, and enjoy faster checkout."
  },
  {
    id: "account-2",
    category: "Account & Support",
    question: "How do I contact customer service?",
    answer: "You can reach our customer service team through our contact page, by email at support@qrova.co.uk, or by phone at 020 1234 5678. Our team is available Monday-Friday 9 AM - 6 PM GMT."
  },
  {
    id: "account-3",
    category: "Account & Support",
    question: "Can I change or cancel my order?",
    answer: "Orders can be modified or cancelled within 2 hours of placement if they haven't been processed yet. Once processing has begun, orders cannot be changed, but you can return items according to our return policy."
  }
]

const categories = [
  { id: "all", name: "All Questions", icon: HelpCircle },
  { id: "shipping", name: "Shipping & Delivery", icon: Truck },
  { id: "returns", name: "Returns & Exchanges", icon: Package },
  { id: "payment", name: "Payment & Pricing", icon: CreditCard },
  { id: "products", name: "Products & Quality", icon: Shield },
  { id: "account", name: "Account & Support", icon: Phone }
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category.toLowerCase().includes(selectedCategory)
    return matchesSearch && matchesCategory
  })

  const groupedFAQs = categories.reduce((acc, category) => {
    if (category.id === "all") {
      acc[category.id] = filteredFAQs
    } else {
      acc[category.id] = filteredFAQs.filter(faq =>
        faq.category.toLowerCase().includes(category.id)
      )
    }
    return acc
  }, {} as Record<string, FAQItem[]>)

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
              <BreadcrumbPage>FAQ</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-600">Find answers to common questions about our products and services</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => {
            const Icon = category.icon
            const count = groupedFAQs[category.id]?.length || 0
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              </Button>
            )
          })}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {Object.entries(groupedFAQs).map(([categoryId, faqs]) => {
            if (faqs.length === 0) return null

            const category = categories.find(cat => cat.id === categoryId)
            if (!category) return null

            return (
              <div key={categoryId}>
                {selectedCategory === "all" && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <category.icon className="h-5 w-5 text-emerald-600" />
                      <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <Card key={faq.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-0 h-auto text-left"
                          onClick={() => toggleItem(faq.id)}
                        >
                          <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                          {openItems.has(faq.id) ? (
                            <ChevronUp className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 flex-shrink-0" />
                          )}
                        </Button>
                      </CardHeader>
                      {openItems.has(faq.id) && (
                        <CardContent className="pt-0">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Still need help?</h3>
          <p className="text-gray-600 mb-4">Our customer service team is here to assist you</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Support
            </Button>
            <Button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Phone className="h-4 w-4" />
              Call Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}