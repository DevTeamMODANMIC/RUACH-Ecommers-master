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
  Calendar,
  Clock,
  Star,
  Wallet,
  Settings,
  ShoppingCart,
  Store,
  Package,
  UserCircle,
  Truck,
  CreditCard,
  Shield,
  Heart
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
    text: "Hello! I'm your RUACH E-STORE Service Provider Assistant. I can help you with your services, bookings, schedule, and more. How can I assist you today?",
    sender: "bot",
    timestamp: new Date()
  }
]

const serviceProviderFaqResponses: { [key: string]: string } = {
  // Service Provider Dashboard and Service Management
  "booking": "You can view and manage your bookings in the Service Provider Dashboard under the Bookings section. You'll receive notifications for new bookings.",
  "schedule": "To update your availability, go to Service Provider Dashboard > Settings > Availability. You can set your working hours and days off.",
  "service": "To add or edit your services, go to Service Provider Dashboard > Services. You can update pricing, descriptions, and availability.",
  "payment": "Payments for your services are processed weekly. You can view your payment history and wallet balance in the Service Provider Dashboard under the Payouts section.",
  "payout": "Payments for your services are processed weekly. You can view your payment history and wallet balance in the Service Provider Dashboard under the Payouts section.",
  "wallet": "Your wallet balance shows your available funds. You can view detailed transaction history in the Service Provider Dashboard under the Wallet section.",
  "profile": "To update your service provider profile, go to Service Provider Dashboard > Profile. You can edit your business information, contact details, and banking information.",
  "kyc": "KYC verification is required for all service providers. Please complete the KYC process in your Service Provider Dashboard under the KYC section.",
  "customer": "You can communicate with customers through the booking messaging system. Check the booking details for message options.",
  "review": "Customer reviews for your services are visible in the Service Provider Dashboard under the Reviews section. You can respond to reviews there.",
  "cancel": "Booking cancellation requests are managed through the booking system. You'll receive notifications for any cancellation requests and can approve or reject them.",
  "availability": "To update your availability, go to Service Provider Dashboard > Settings > Availability. You can set your working hours and days off.",
  "support": "For service provider-specific support, you can contact our service provider support team at services@ruachestore.com.ng or call +2347054915173.",
  "commission": "Our commission rate is 20% per service booking. This is automatically deducted from your earnings before payout.",
  "analytics": "You can view your service analytics in the Service Provider Dashboard under the Analytics section. Track bookings, revenue, and customer satisfaction.",
  
  // General Website Features
  "shopping": "Our platform also has a shopping section where vendors sell products. As a service provider, you offer services rather than products.",
  "marketplace": "As a service provider, you're part of our marketplace that connects you with customers looking for services.",
  "product": "While vendors sell products, you provide services. Customers browse services, book appointments, and you fulfill them.",
  "order": "While vendors handle product orders, you manage service bookings through your own dashboard.",
  
  // Account and Profile
  "account": "Manage your service provider account through the Service Provider Dashboard. Access your profile, service settings, and business information.",
  "password": "To reset your service provider account password, use the main login page and follow the password reset process.",
  "register": "You've already registered as a service provider. If you need additional help, contact service provider support.",
  
  // Policies
  "privacy": "Our service provider privacy policy is part of our overall privacy policy. You can find it in the footer of our website.",
  "terms": "Service provider terms are included in our overall terms and conditions. All service providers must comply with our policies.",
  
  // Special responses
  "hello": "Hello! How can I assist you with your service provider account today?",
  "hi": "Hello! How can I assist you with your service provider account today?",
  "hey": "Hello! How can I assist you with your service provider account today?",
  "thank": "You're welcome! Is there anything else I can help you with regarding your services?",
  "bye": "Goodbye! Feel free to reach out if you have any more questions about managing your services.",
  "goodbye": "Goodbye! Feel free to reach out if you have any more questions about managing your services."
}

export default function ServiceProviderAIChatbot() {
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
    let response = "I'm not sure about that. For service provider-specific questions, you can contact our service provider support team at services@ruachestore.com.ng."

    // Check for FAQ keywords
    for (const [key, value] of Object.entries(serviceProviderFaqResponses)) {
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
      text: "Connecting you to a service provider support agent. Please use one of our direct contact methods:",
      sender: "bot",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, agentMessage])
    
    // Add contact options after a short delay
    setTimeout(() => {
      const contactOptions: Message = {
        id: Date.now().toString(),
        text: "📧 Service Provider Support Email: services@ruachestore.com.ng\n📞 Service Provider Support Phone: +2347054915173\n💬 WhatsApp: Click to chat",
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
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-40 bg-green-600 hover:bg-green-700"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-md h-[500px] bg-white rounded-lg shadow-xl z-50 flex flex-col border border-gray-200">
          {/* Chat Header */}
          <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <h3 className="font-semibold">Service Provider Assistant</h3>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-green-700"
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
                      ? "bg-green-600 text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === "bot" && (
                      <Bot className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    )}
                    {message.sender === "user" && (
                      <User className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <p className={`text-xs mt-1 ${message.sender === "user" ? "text-green-100" : "text-gray-500"}`}>
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
              Connect to SP Support
            </Button>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about your services, bookings, schedule..."
                className="flex-1 text-sm resize-none"
                rows={2}
              />
              <Button
                onClick={handleSend}
                disabled={inputValue.trim() === ""}
                className="self-end h-10 bg-green-600 hover:bg-green-700"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              RUACH SP Assistant v1.0
            </p>
          </div>
        </div>
      )}
    </>
  )
}