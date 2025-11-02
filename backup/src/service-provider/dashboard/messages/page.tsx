"use client"

import { useState, useEffect } from "react"
import { useServiceProvider } from "../../../hooks/use-service-provider"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { 
  Send, 
  User, 
  Clock, 
  CheckCircle,
  AlertCircle
} from "lucide-react"
import type { Message } from "../../../lib/firebase-messages"
import { sendMessage, getMessagesBetweenUsers, markMessageAsRead } from "../../../lib/firebase-messages"

export default function MessagesPage() {
  const { serviceProvider, isServiceProvider, loading } = useServiceProvider()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [customers, setCustomers] = useState<any[]>([
    // This would be populated from bookings in a real implementation
    { id: "customer1", name: "John Doe", lastMessage: "Hello, I'm interested in your plumbing services" },
    { id: "customer2", name: "Jane Smith", lastMessage: "Can you provide a quote for bathroom renovation?" },
    { id: "customer3", name: "Robert Johnson", lastMessage: "When are you available for the repair?" },
  ])
  const [isLoading, setIsLoading] = useState(false)

  // In a real implementation, this would fetch actual messages
  useEffect(() => {
    if (selectedCustomer && serviceProvider) {
      // Simulate fetching messages
      const fetchMessages = async () => {
        setIsLoading(true)
        try {
          // This would be replaced with actual Firebase call
          // const fetchedMessages = await getMessagesBetweenUsers(serviceProvider.ownerId, selectedCustomer)
          const mockMessages: Message[] = [
            {
              id: "1",
              senderId: selectedCustomer,
              receiverId: serviceProvider.ownerId,
              content: "Hello, I'm interested in your plumbing services. Can you provide more details?",
              timestamp: new Date(Date.now() - 3600000) as any,
              read: true
            },
            {
              id: "2",
              senderId: serviceProvider.ownerId,
              receiverId: selectedCustomer,
              content: "Hi there! I'd be happy to help. What specific plumbing services do you need?",
              timestamp: new Date(Date.now() - 3500000) as any,
              read: true
            },
            {
              id: "3",
              senderId: selectedCustomer,
              receiverId: serviceProvider.ownerId,
              content: "I need help with a leaking pipe in my kitchen. When are you available?",
              timestamp: new Date(Date.now() - 1800000) as any,
              read: true
            }
          ]
          setMessages(mockMessages)
        } catch (error) {
          console.error("Error fetching messages:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchMessages()
    }
  }, [selectedCustomer, serviceProvider])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCustomer || !serviceProvider) return

    try {
      // This would be replaced with actual Firebase call
      // await sendMessage(serviceProvider.ownerId, selectedCustomer, newMessage)
      
      // Add to local state for immediate feedback
      const message: Message = {
        id: Date.now().toString(),
        senderId: serviceProvider.ownerId,
        receiverId: selectedCustomer,
        content: newMessage,
        timestamp: new Date() as any,
        read: false
      }
      
      setMessages(prev => [...prev, message])
      setNewMessage("")
      
      // Update the customer's last message
      setCustomers(prev => prev.map(customer => 
        customer.id === selectedCustomer 
          ? { ...customer, lastMessage: newMessage } 
          : customer
      ))
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-6 w-6 border-2 border-t-green-500 border-l-green-600 border-r-green-600 border-b-green-700 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (!isServiceProvider || !serviceProvider) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You must be a service provider to access messages.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Customer List */}
      <div className="w-1/3 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-140px)]">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedCustomer === customer.id ? "bg-blue-50" : ""
              }`}
              onClick={() => setSelectedCustomer(customer.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {customer.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      <Clock className="h-3 w-3 inline mr-1" />
                      2h ago
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {customer.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {selectedCustomer ? (
          <>
            {/* Message Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {customers.find(c => c.id === selectedCustomer)?.name}
                  </h3>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="h-6 w-6 border-2 border-t-green-500 border-l-green-600 border-r-green-600 border-b-green-700 rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading messages...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === serviceProvider.ownerId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === serviceProvider.ownerId
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-end mt-1">
                          <span className="text-xs opacity-70">
                            {message.timestamp
                              ? (message.timestamp as any).toDate 
                                ? (message.timestamp as any).toDate().toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : new Date(
                                    'seconds' in message.timestamp 
                                      ? message.timestamp.seconds * 1000 
                                      : Date.now()
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                              : "Just now"}
                          </span>
                          {message.senderId === serviceProvider.ownerId && (
                            <CheckCircle className="h-3 w-3 ml-1 opacity-70" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No conversation selected
              </h3>
              <p className="text-gray-600">
                Select a customer from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}