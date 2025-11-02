"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { 
  Send, 
  User, 
  Clock, 
  CheckCircle,
  X,
  MessageCircle
} from "lucide-react"
import type { Message } from "../lib/firebase-messages"
import { sendMessage, getMessagesBetweenUsers, markMessageAsRead } from "../lib/firebase-messages"

interface CustomerServiceChatProps {
  providerId: string
  providerName: string
  customerId: string
  onClose: () => void
}

export default function CustomerServiceChat({
  providerId,
  providerName,
  customerId,
  onClose
}: CustomerServiceChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // In a real implementation, this would fetch actual messages
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true)
      try {
        // This would be replaced with actual Firebase call
        // const fetchedMessages = await getMessagesBetweenUsers(customerId, providerId)
        const mockMessages: Message[] = [
          {
            id: "1",
            senderId: providerId,
            receiverId: customerId,
            content: "Hello! Thank you for your interest in our services. How can I help you today?",
            timestamp: new Date(Date.now() - 3600000) as any,
            read: true
          },
          {
            id: "2",
            senderId: customerId,
            receiverId: providerId,
            content: "Hi there! I'm interested in your plumbing services. Can you provide more details?",
            timestamp: new Date(Date.now() - 3500000) as any,
            read: true
          },
          {
            id: "3",
            senderId: providerId,
            receiverId: customerId,
            content: "Of course! We offer a full range of plumbing services including repairs, installations, and maintenance. What specific service do you need?",
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
  }, [providerId, customerId])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      // This would be replaced with actual Firebase call
      // await sendMessage(customerId, providerId, newMessage)
      
      // Add to local state for immediate feedback
      const message: Message = {
        id: Date.now().toString(),
        senderId: customerId,
        receiverId: providerId,
        content: newMessage,
        timestamp: new Date() as any,
        read: false
      }
      
      setMessages(prev => [...prev, message])
      setNewMessage("")
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[500px] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Chat Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{providerName}</h3>
              <p className="text-sm text-blue-100">Service Provider</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="h-6 w-6 border-2 border-t-blue-500 border-l-blue-600 border-r-blue-600 border-b-blue-700 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading messages...</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.senderId === customerId ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.senderId === customerId
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.senderId === customerId ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {msg.timestamp
                      ? (msg.timestamp as any).toDate 
                        ? (msg.timestamp as any).toDate().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : new Date(
                            'seconds' in msg.timestamp 
                              ? msg.timestamp.seconds * 1000 
                              : Date.now()
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                      : 'Just now'}
                  </p>
                </div>
              </div>
            ))
          )}
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t rounded-b-2xl">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Messages will be sent to {providerName}
          </p>
        </div>
      </div>
    </div>
  )
}