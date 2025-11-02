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
  Store,
  Package,
  Wallet,
  Settings,
  BarChart,
  UserCircle
} from "lucide-react"
import { chatbotService, type ChatMessage, type ChatContext } from "../services/chatbot-service"

interface VendorDashboardAIChatbotProps {
  userId?: string
}

export default function VendorDashboardAIChatbot({ userId }: VendorDashboardAIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Hello! I'm your RUACH E-STORE Vendor Dashboard Assistant. I can help you manage your store, products, orders, and more. How can I assist you today?",
      sender: "bot",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const context: ChatContext = {
    page: "vendor-dashboard",
    userId: userId,
    userType: "vendor"
  }

  const handleSend = async () => {
    if (inputValue.trim() === "") return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
      pageContext: "vendor-dashboard"
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    try {
      // Get bot response
      const botResponse = await generateBotResponse(inputValue, context)
      
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
        pageContext: "vendor-dashboard"
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error("Error generating bot response:", error)
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: "Sorry, I'm having trouble responding right now. Please try again or contact our vendor support team directly.",
        sender: "bot",
        timestamp: new Date(),
        pageContext: "vendor-dashboard"
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const generateBotResponse = async (userInput: string, context: ChatContext): Promise<string> => {
    const lowerInput = userInput.toLowerCase()
    
    // Special responses for specific inputs
    if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
      return "Hello! How can I assist you with your vendor dashboard today?"
    } else if (lowerInput.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with regarding your store management?"
    } else if (lowerInput.includes("bye") || lowerInput.includes("goodbye")) {
      return "Goodbye! Feel free to reach out if you have any more questions about managing your store."
    }

    // Check knowledge base for relevant answers
    const relevantAnswers = await chatbotService.findRelevantAnswers(userInput, context)
    
    if (relevantAnswers.length > 0) {
      return relevantAnswers[0]
    }

    // Get dynamic information
    if (lowerInput.includes("product") || lowerInput.includes("add item")) {
      return "To add products to your store, go to Vendor Dashboard > Products > Add New Product. You can upload images, set prices, and manage inventory."
    }
    
    if (lowerInput.includes("order") || lowerInput.includes("sale")) {
      return "You can view and manage your orders in the Vendor Dashboard under the Orders section. You'll receive notifications for new orders."
    }
    
    if (lowerInput.includes("payment") || lowerInput.includes("payout")) {
      return "Payments for your sales are processed weekly. You can view your payment history and wallet balance in the Vendor Dashboard under the Payouts section."
    }
    
    if (lowerInput.includes("analytics") || lowerInput.includes("report")) {
      return "You can view your store analytics in the Vendor Dashboard under the Analytics section. Track sales, visitors, and product performance."
    }

    // Default response
    return "I can help you with store management, product listings, order processing, and more. What would you like to know about managing your vendor dashboard?"
  }

  const handleConnectToAgent = () => {
    const agentMessage: ChatMessage = {
      id: Date.now().toString(),
      text: "Connecting you to a vendor support agent. Please use one of our direct contact methods:",
      sender: "bot",
      timestamp: new Date(),
      pageContext: "vendor-dashboard"
    }

    setMessages(prev => [...prev, agentMessage])
    
    // Add contact options after a short delay
    setTimeout(() => {
      const contactOptions: ChatMessage = {
        id: Date.now().toString(),
        text: "📧 Vendor Support Email: vendors@ruachestore.com.ng\n📞 Vendor Support Phone: +2347054915173\n💬 WhatsApp: Click to chat",
        sender: "bot",
        timestamp: new Date(),
        pageContext: "vendor-dashboard"
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
        {isOpen ? <X className="h-6 w-6" /> : <Store className="h-6 w-6" />}
      </Button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-md h-[500px] bg-white rounded-lg shadow-xl z-50 flex flex-col border border-gray-200">
          {/* Chat Header */}
          <div className="bg-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="h-5 w-5" />
              <h3 className="font-semibold">Vendor Dashboard Assistant</h3>
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
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Looking up information...</p>
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
                placeholder="Ask about products, orders, payouts, analytics..."
                className="flex-1 text-sm resize-none"
                rows={2}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={inputValue.trim() === "" || isLoading}
                className="self-end h-10 bg-purple-600 hover:bg-purple-700"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              RUACH Vendor Dashboard Assistant
            </p>
          </div>
        </div>
      )}
    </>
  )
}