"use client"

import ChatbotWidget from "@/components/chatbot-widget"
import type { ChatbotIntent, QuickReply, ContactConfig } from "@/hooks/use-chatbot"
import type { ChatContext } from "@/services/chatbot-service"
import { Calendar, Headphones } from "lucide-react"

interface ServiceProviderDashboardAIChatbotProps {
  userId?: string
}

const serviceProviderDashboardIntents: ChatbotIntent[] = [
  {
    keywords: ["hello", "hi", "hey"],
    response: "Hello! How can I assist you with your service provider dashboard today?"
  },
  {
    keywords: ["thank"],
    response: "You're welcome! Is there anything else I can help you with regarding your service management?"
  },
  {
    keywords: ["bye", "goodbye"],
    response: "Goodbye! Feel free to reach out if you have any more questions about managing your services."
  },
  {
    keywords: ["service", "add service", "listing"],
    match: "any",
    response:
      "To add or edit your services, go to Service Provider Dashboard > Services. You can update pricing, descriptions, and availability."
  },
  {
    keywords: ["booking", "appointment"],
    match: "any",
    response:
      "You can view and manage your bookings in the Service Provider Dashboard under the Bookings section. You'll receive notifications for new bookings."
  },
  {
    keywords: ["schedule", "availability", "calendar"],
    match: "any",
    response:
      "To update your availability, go to Service Provider Dashboard > Settings > Availability. You can set your working hours and days off."
  },
  {
    keywords: ["payment", "payout", "wallet"],
    match: "any",
    response:
      "Payments for your services are processed weekly. Track everything under Service Provider Dashboard > Payouts. Your wallet shows pending and cleared balances."
  },
  {
    keywords: ["analytics", "performance"],
    match: "any",
    response:
      "Use Service Provider Dashboard > Analytics to monitor bookings, revenue, customer feedback, and repeat clients."
  },
  {
    keywords: ["review", "rating"],
    match: "any",
    response:
      "Customer reviews live under Service Provider Dashboard > Reviews. You can respond directly and track satisfaction scores."
  },
  {
    keywords: ["support", "agent", "human"],
    match: "any",
    response:
      "Need a specialist? Tap the 'Contact Service Provider Support' button below and we'll bring in a human agent."
  },
  {
    keywords: ["stats", "overview", "insight"],
    match: "any",
    dynamic: true,
    response: ""
  }
]

const serviceProviderDashboardQuickReplies: QuickReply[] = [
  { label: "Manage bookings", prompt: "Where do I manage my bookings?" },
  { label: "Update availability", prompt: "How can I change my availability?" },
  { label: "Check payouts", prompt: "When are my payouts processed?" },
  { label: "View analytics", prompt: "Show me my service analytics." }
]

const serviceProviderDashboardContact: ContactConfig = {
  intro: "Connecting you to a service provider support agent. Please use one of our direct contact methods:",
  details: [
    "📧 Service Provider Support Email: services@ruachestore.com.ng",
    "📞 Service Provider Support Phone: +2347054915173",
    "💬 WhatsApp: Click to chat with service provider support"
  ]
}

export default function ServiceProviderDashboardAIChatbot({
  userId
}: ServiceProviderDashboardAIChatbotProps) {
  const context: ChatContext = {
    page: "service-provider-dashboard",
    userId,
    userType: "service-provider"
  }

  return (
    <ChatbotWidget
      storageKey="ruach-chat-service-provider-dashboard"
      context={context}
      greeting="Hello! I'm your RUACH E-STORE Service Provider Dashboard Assistant. I can help you manage your services, bookings, schedule, and more. How can I assist you today?"
      headerTitle="Service Provider Dashboard Assistant"
      defaultResponse="I can help you with service management, booking processing, schedule updates, and more. What would you like to know about managing your service provider dashboard?"
      intents={serviceProviderDashboardIntents}
      quickReplies={serviceProviderDashboardQuickReplies}
      contact={serviceProviderDashboardContact}
      theme="teal"
      toggleIcon={Calendar}
      headerIcon={Calendar}
      contactIcon={Headphones}
      contactButtonLabel="Contact Service Provider Support"
      textareaPlaceholder="Ask about bookings, schedules, payouts, or analytics..."
      footerNote="RUACH Service Provider Assistant"
    />
  )
}

