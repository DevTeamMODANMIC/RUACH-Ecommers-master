"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User,
  Headphones,
  Mail,
  Phone,
  ShoppingCart,
  Store,
  Package,
  Wallet,
  Settings,
  UserCircle,
  Truck,
  CreditCard,
  Shield,
  Heart,
  Calendar,
  Star
} from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hello! I'm your RUACH E-STORE assistant. I can help you with shopping, orders, vendor services, and more. How can I assist you today?",
    sender: "bot",
    timestamp: new Date()
  }
]

const faqResponses: { [key: string]: string } = {
  // Shopping and Customer Support
  "order": "You can track your order by logging into your account and checking 'My Orders', or using the tracking link sent to your email.",
  "track": "You can track your order by logging into your account and checking 'My Orders', or using the tracking link sent to your email.",
  "delivery": "We offer fast delivery within 24-48 hours in major cities. Delivery times may vary based on your location.",
  "shipping": "We offer fast delivery within 24-48 hours in major cities. Delivery times may vary based on your location.",
  "return": "We have a 7-day return policy for most items. Please visit our Returns & Refunds page for detailed information.",
  "refund": "Refunds are processed within 5-7 business days after we receive your returned item. Visit our Returns & Refunds page for more details.",
  "cancel": "You can cancel your order from your account dashboard under 'My Orders' if the order hasn't been shipped yet.",
  
  // Products and Shopping
  "product": "Browse thousands of authentic products from verified vendors in our marketplace. Use filters to find exactly what you need.",
  "search": "Use our smart search feature to find products by name, category, or vendor. You can also use filters to narrow down results.",
  "discount": "We regularly offer discounts and promotions. Subscribe to our newsletter to stay updated on the latest offers.",
  "bulk": "Yes! We offer competitive bulk pricing for orders over ₦100,000. Contact our sales team for a custom quote.",
  "wishlist": "Add products to your wishlist by clicking the heart icon on any product. Access your wishlist from your account dashboard.",
  "cart": "Your shopping cart is accessible from the top navigation bar. Review items before checkout and apply discount codes if you have any.",
  
  // Account and Profile
  "account": "Manage your account by clicking on your profile icon in the top right corner. You can update personal information, view order history, and manage wishlists.",
  "profile": "Manage your account by clicking on your profile icon in the top right corner. You can update personal information, view order history, and manage wishlists.",
  "password": "To reset your password, click 'Forgot Password' on the login page and follow the instructions sent to your email.",
  "register": "To create an account, click 'Register' in the top navigation bar and fill in your details. Verify your email to complete registration.",
  
  // Vendor Services
  "vendor": "To become a vendor, visit our vendor registration page, complete the application, and submit required documents for verification.",
  "sell": "To become a vendor, visit our vendor registration page, complete the application, and submit required documents for verification.",
  "store": "Vendors can manage their stores, products, orders, and payouts through the vendor dashboard after registration and approval.",
  "payout": "Vendor payouts are processed weekly. Check your vendor dashboard for detailed payment history and wallet balance.",
  
  // Service Provider Services
  "service": "Browse and book services from verified service providers in our marketplace. Filter by category, rating, and availability.",
  "booking": "Manage your bookings through your account dashboard. You can view upcoming appointments, past bookings, and communicate with service providers.",
  "provider": "Interested in becoming a service provider? Visit our service provider registration page to get started.",
  
  // Support and Contact
  "contact": "You can reach us via phone at +2347054915173, email at support@ruachestore.com.ng, or through WhatsApp chat.",
  "support": "Our customer support is available Mon-Fri: 8AM-8PM, Sat: 9AM-6PM. WhatsApp support is available 24/7.",
  "hours": "Our business hours are Mon-Fri: 8AM-8PM, Sat: 9AM-6PM. WhatsApp support is available 24/7.",
  "help": "Our customer support is available Mon-Fri: 8AM-8PM, Sat: 9AM-6PM. WhatsApp support is available 24/7.",
  
  // Technical and Payments
  "payment": "We accept various payment methods including Visa, Mastercard, PayPal, and bank transfers.",
  "card": "We accept various payment methods including Visa, Mastercard, PayPal, and bank transfers.",
  "paypal": "We accept various payment methods including Visa, Mastercard, PayPal, and bank transfers.",
  "bank": "We accept various payment methods including Visa, Mastercard, PayPal, and bank transfers.",
  
  // Policies
  "privacy": "Read our Privacy Policy to understand how we protect your personal information and data.",
  "terms": "Our Terms and Conditions outline your rights and responsibilities when using our platform.",
  "policy": "Read our Privacy Policy to understand how we protect your personal information and data.",
  
  // Features
  "feature": "RUACH E-STORE offers shopping, vendor marketplaces, service bookings, bulk ordering, and more in one platform.",
  "marketplace": "Our marketplace connects customers with verified vendors and service providers for authentic products and services.",
  
  // Special responses
  "hello": "Hello! How can I assist you today?",
  "hi": "Hello! How can I assist you today?",
  "hey": "Hello! How can I assist you today?",
  "thank": "You're welcome! Is there anything else I can help you with?",
  "bye": "Goodbye! Feel free to reach out if you have any more questions.",
  "goodbye": "Goodbye! Feel free to reach out if you have any more questions."
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (inputValue.trim() === "") return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate bot response after a delay
    setTimeout(() => {
      generateBotResponse(inputValue)
      setIsTyping(false)
    }, 1000)
  }

  const generateBotResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase()
    let response = "I'm not sure about that. You can contact our support team for more specific assistance. Would you like me to connect you to a human agent?"

    // Check for FAQ keywords
    for (const [key, value] of Object.entries(faqResponses)) {
      if (lowerInput.includes(key)) {
        response = value
        break
      }
    }

    // Special responses for specific inputs
    if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
      response = "Hello! How can I assist you today?"
    } else if (lowerInput.includes("thank")) {
      response = "You're welcome! Is there anything else I can help you with?"
    } else if (lowerInput.includes("bye") || lowerInput.includes("goodbye")) {
      response = "Goodbye! Feel free to reach out if you have any more questions."
    }

    const botMessage: Message = {
      id: Date.now().toString(),
      text: response,
      sender: "bot",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, botMessage])
  }

  const handleConnectToAgent = () => {
    const agentMessage: Message = {
      id: Date.now().toString(),
      text: "Connecting you to a human agent. Please use one of our direct contact methods:",
      sender: "bot",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, agentMessage])
    
    // Add contact options after a short delay
    setTimeout(() => {
      const contactOptions: Message = {
        id: Date.now().toString(),
        text: "📞 Phone: +2347054915173\n💬 WhatsApp: Click to chat\n📧 Email: support@ruachestore.com.ng",
        sender: "bot",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, contactOptions])
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Chatbot Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-40 bg-blue-600 hover:bg-blue-700"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-md h-[500px] bg-white rounded-lg shadow-xl z-50 flex flex-col border border-gray-200">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <h3 className="font-semibold">RUACH Assistant</h3>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === "bot" && (
                      <Bot className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    )}
                    {message.sender === "user" && (
                      <User className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <p className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Contact Agent Button */}
          <div className="px-4 py-2 border-t border-gray-200">
            <Button
              onClick={handleConnectToAgent}
              variant="outline"
              size="sm"
              className="w-full text-sm"
            >
              <Headphones className="h-4 w-4 mr-2" />
              Connect to Human Agent
            </Button>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about shopping, orders, services, vendors..."
                className="flex-1 text-sm resize-none"
                rows={2}
              />
              <Button
                onClick={handleSend}
                disabled={inputValue.trim() === ""}
                className="self-end h-10"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              RUACH Assistant v1.0
            </p>
          </div>
        </div>
      )}
    </>
  )
}