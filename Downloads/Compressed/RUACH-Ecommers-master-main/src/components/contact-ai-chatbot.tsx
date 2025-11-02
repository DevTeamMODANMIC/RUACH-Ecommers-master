"use client"

import ChatbotWidget from "@/components/chatbot-widget"
import type { ChatbotIntent, QuickReply, ContactConfig } from "@/hooks/use-chatbot"
import type { ChatContext } from "@/services/chatbot-service"
import { Headphones, MessageCircle } from "lucide-react"

interface ContactAIChatbotProps {
  userId?: string
}

const contactIntents: ChatbotIntent[] = [
  {
    keywords: ["hello", "hi", "hey"],
    response: "Hello! How can I assist you with your contact inquiry today?"
  },
  {
    keywords: ["thank"],
    response: "You're welcome! Is there anything else I can help you with regarding our contact options?"
  },
  {
    keywords: ["bye", "goodbye"],
    response: "Goodbye! Feel free to reach out if you have any more questions about contacting us."
  },
  {
    keywords: ["hours", "business", "open", "close"],
    match: "any",
    response:
      "Our business hours are:\nMonday - Friday: 8:00 AM - 8:00 PM\nSaturday: 9:00 AM - 6:00 PM\nSunday: Closed\n\nWhatsApp Support: Available 24/7"
  },
  {
    keywords: ["contact", "reach", "support", "phone", "email"],
    match: "any",
    response:
      "You can reach us through:\n\n📞 Phone: +2347054915173\n💬 WhatsApp: Available 24/7\n📧 Email: support@ruachestore.com.ng\n📍 Office: Plot 123, Victoria Island, Lagos, Nigeria"
  },
  {
    keywords: ["address", "location", "office"],
    response:
      "Our physical office is located at Plot 123, Victoria Island, Lagos, Nigeria. Visits are by appointment only."
  },
  {
    keywords: ["human", "agent", "person"],
    match: "any",
    response:
      "Sure thing. Tap the 'Connect to Human Agent' button and we'll hand you over to a live representative."
  }
]

const contactQuickReplies: QuickReply[] = [
  { label: "Business hours", prompt: "What are your business hours?" },
  { label: "Support options", prompt: "How do I reach customer support?" },
  { label: "Office address", prompt: "Where is your office located?" }
]

const contactConfig: ContactConfig = {
  intro: "Connecting you to a human agent. Please use one of our direct contact methods:",
  details: [
    "📞 Phone: +2347054915173",
    "💬 WhatsApp: Click to chat",
    "📧 Email: support@ruachestore.com.ng",
    "📍 Office: Plot 123, Victoria Island, Lagos, Nigeria"
  ]
}

export default function ContactAIChatbot({ userId }: ContactAIChatbotProps) {
  const context: ChatContext = {
    page: "contact",
    userId,
    userType: "customer"
  }

  return (
    <ChatbotWidget
      storageKey="ruach-chat-contact"
      context={context}
      greeting="Hello! I'm your RUACH E-STORE Contact Assistant. I can help you with support inquiries, business hours, and contact methods. How can I assist you today?"
      headerTitle="Contact Assistant"
      defaultResponse="I can help you with contact information, business hours, and support options. What specific information do you need about contacting us?"
      intents={contactIntents}
      quickReplies={contactQuickReplies}
      contact={contactConfig}
      theme="blue"
      toggleIcon={MessageCircle}
      headerIcon={Headphones}
      contactIcon={Headphones}
      contactButtonLabel="Connect to Human Agent"
      textareaPlaceholder="Ask about support hours, phone numbers, email..."
      footerNote="RUACH Contact Assistant"
    />
  )
}

