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
  Store,
  Package,
  Wallet,
  Settings,
  ShoppingCart,
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
    text: "Hello! I'm your RUACH E-STORE Vendor Assistant. I can help you with your store, products, orders, and more. How can I assist you today?",
    sender: "bot",
    timestamp: new Date()
  }
]

const vendorFaqResponses: { [key: string]: string } = {
  // Vendor Dashboard and Store Management
  "product": "To add products to your store, go to your Vendor Dashboard > Products > Add New Product. You can upload images, set prices, and manage inventory.",
  "order": "You can view and manage your orders in the Vendor Dashboard under the Orders section. You'll receive notifications for new orders.",
  "payment": "Payments for your sales are processed weekly. You can view your payment history and wallet balance in the Vendor Dashboard under the Payouts section.",
  "payout": "Payments for your sales are processed weekly. You can view your payment history and wallet balance in the Vendor Dashboard under the Payouts section.",
  "wallet": "Your wallet balance shows your available funds. You can view detailed transaction history in the Vendor Dashboard under the Wallet section.",
  "store": "To customize your store, go to Vendor Dashboard > Settings. You can update your store name, description, logo, and other details.",
  "profile": "To update your vendor profile, go to Vendor Dashboard > Profile. You can edit your business information, contact details, and banking information.",
  "kyc": "KYC verification is required for all vendors. Please complete the KYC process in your Vendor Dashboard under the KYC section.",
  "customer": "You can communicate with customers through the order messaging system in your Vendor Dashboard. Check the order details for message options.",
  "review": "Customer reviews for your products are visible in the Vendor Dashboard under the Reviews section. You can respond to reviews there.",
  "return": "Return requests are managed through the order system. You'll receive notifications for any return requests and can approve or reject them.",
  "inventory": "You can manage your product inventory in the Products section of your Vendor Dashboard. Update stock levels as needed.",
  "shipping": "You are responsible for shipping your products to customers. You can set shipping costs and delivery times in your product settings.",
  "commission": "Our commission rate is 15% per sale. This is automatically deducted from your earnings before payout.",
  "support": "For vendor-specific support, you can contact our vendor support team at vendors@ruachestore.com.ng or call +2347054915173.",
  "bulk": "For bulk orders, you'll receive special notifications in your dashboard. Bulk orders typically have different pricing and shipping arrangements.",
  "analytics": "You can view your store analytics in the Vendor Dashboard under the Analytics section. Track sales, visitors, and product performance.",
  
  // General Website Features
  "shopping": "Our platform connects customers with vendors like you. Customers browse products, place orders, and you fulfill them.",
  "marketplace": "As a vendor, you're part of our marketplace that connects you with customers looking for authentic products.",
  "service": "We also have a service provider section of our platform. While you sell products, service providers offer services.",
  "booking": "While you handle product orders, service providers manage bookings through their own dashboard.",
  
  // Account and Profile
  "account": "Manage your vendor account through the Vendor Dashboard. Access your profile, store settings, and business information.",
  "password": "To reset your vendor account password, use the main login page and follow the password reset process.",
  "register": "You've already registered as a vendor. If you need additional help, contact vendor support.",
  
  // Policies
  "privacy": "Our vendor privacy policy is part of our overall privacy policy. You can find it in the footer of our website.",
  "terms": "Vendor terms are included in our overall terms and conditions. All vendors must comply with our policies.",
  
  // Special responses
  "hello": "Hello! How can I assist you with your vendor store today?",
  "hi": "Hello! How can I assist you with your vendor store today?",
  "hey": "Hello! How can I assist you with your vendor store today?",
  "thank": "You're welcome! Is there anything else I can help you with regarding your store?",
  "bye": "Goodbye! Feel free to reach out if you have any more questions about managing your store.",
  "goodbye": "Goodbye! Feel free to reach out if you have any more questions about managing your store."
}

export default function VendorAIChatbot() {
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
    let response = "I'm not sure about that. For vendor-specific questions, you can contact our vendor support team at vendors@ruachestore.com.ng."

    // Check for FAQ keywords
    for (const [key, value] of Object.entries(vendorFaqResponses)) {
      if (lowerInput.includes(key)) {
        response = value
        break
      }
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
      text: "Connecting you to a vendor support agent. Please use one of our direct contact methods:",
      sender: "bot",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, agentMessage])
    
    // Add contact options after a short delay
    setTimeout(() => {
      const contactOptions: Message = {
        id: Date.now().toString(),
        text: "📧 Vendor Support Email: vendors@ruachestore.com.ng\n📞 Vendor Support Phone: +2347054915173\n💬 WhatsApp: Click to chat",
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
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-40 bg-purple-600 hover:bg-purple-700"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-md h-[500px] bg-white rounded-lg shadow-xl z-50 flex flex-col border border-gray-200">
          {/* Chat Header */}
          <div className="bg-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="h-5 w-5" />
              <h3 className="font-semibold">Vendor Assistant</h3>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-purple-700"
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
                      ? "bg-purple-600 text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === "bot" && (
                      <Bot className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    )}
                    {message.sender === "user" && (
                      <User className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <p className={`text-xs mt-1 ${message.sender === "user" ? "text-purple-100" : "text-gray-500"}`}>
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
              Connect to Vendor Support
            </Button>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about your store, products, orders, payouts..."
                className="flex-1 text-sm resize-none"
                rows={2}
              />
              <Button
                onClick={handleSend}
                disabled={inputValue.trim() === ""}
                className="self-end h-10 bg-purple-600 hover:bg-purple-700"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              RUACH Vendor Assistant v1.0
            </p>
          </div>
        </div>
      )}
    </>
  )
}