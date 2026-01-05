"use client"

import ChatbotWidget from "@/components/chatbot-widget"
import type { ChatbotIntent, QuickReply, ContactConfig } from "@/hooks/use-chatbot"
import type { ChatContext } from "@/services/chatbot-service"
import { Headphones, Store } from "lucide-react"

interface VendorDashboardAIChatbotProps {
  userId?: string
}

const vendorDashboardIntents: ChatbotIntent[] = [
  {
    keywords: ["hello", "hi", "hey"],
    response: "Hello! How can I assist you with your vendor dashboard today?"
  },
  {
    keywords: ["thank"],
    response: "You're welcome! Is there anything else I can help you with regarding your store management?"
  },
  {
    keywords: ["bye", "goodbye"],
    response: "Goodbye! Feel free to reach out if you have any more questions about managing your store."
  },
  {
    keywords: ["product", "add item", "listings"],
    match: "any",
    response:
      "To add products to your store, go to Vendor Dashboard > Products > Add New Product. You can upload images, set prices, and manage inventory."
  },
  {
    keywords: ["order", "sale", "fulfill"],
    match: "any",
    response:
      "You can view and manage your orders in the Vendor Dashboard under the Orders section. You'll receive notifications for new orders."
  },
  {
    keywords: ["payment", "payout", "wallet"],
    match: "any",
    response:
      "Payments for your sales are processed weekly. Track the details under Vendor Dashboard > Payouts. Your wallet shows pending and available balances."
  },
  {
    keywords: ["analytics", "report", "insight"],
    match: "any",
    response:
      "Head to Vendor Dashboard > Analytics to track sales, visitors, top products, and conversion trends in real time."
  },
  {
    keywords: ["settings", "profile", "store info"],
    match: "any",
    response:
      "Update your store information, branding, and policies via Vendor Dashboard > Settings. Profile updates live under Vendor Dashboard > Profile."
  },
  {
    keywords: ["kyc", "verification"],
    response:
      "KYC verification is required for payouts. Complete it from Vendor Dashboard > Compliance & KYC. We'll notify you once it's approved."
  },
  {
    keywords: ["support", "agent", "human"],
    match: "any",
    response:
      "Need a hand from our vendor success team? Tap the 'Contact Vendor Support' button and we'll connect you right away."
  },
  {
    keywords: ["stats", "performance", "overview"],
    match: "any",
    dynamic: true,
    response: ""
  }
]

const vendorDashboardQuickReplies: QuickReply[] = [
  { label: "Add a product", prompt: "How do I add a new product to my store?" },
  { label: "Check my orders", prompt: "Where do I manage orders?" },
  { label: "View analytics", prompt: "Show me my store analytics." },
  { label: "Update payouts", prompt: "How do I update my payout details?" }
]

const vendorDashboardContact: ContactConfig = {
  intro: "Connecting you to a vendor support agent. Please use one of our direct contact methods:",
  details: [
    "📧 Vendor Support Email: vendors@ruachestore.com.ng",
    "📞 Vendor Support Phone: +2347054915173",
    "💬 WhatsApp: Click to chat with vendor support"
  ]
}

export default function VendorDashboardAIChatbot({ userId }: VendorDashboardAIChatbotProps) {
  const context: ChatContext = {
    page: "vendor-dashboard",
    userId,
    userType: "vendor"
  }

  return (
    <ChatbotWidget
      storageKey="ruach-chat-vendor-dashboard"
      context={context}
      greeting="Hello! I'm your RUACH E-STORE Vendor Dashboard Assistant. I can help you manage your store, products, orders, and more. How can I assist you today?"
      headerTitle="Vendor Dashboard Assistant"
      defaultResponse="I can help you with store management, product listings, order processing, and more. What would you like to know about managing your vendor dashboard?"
      intents={vendorDashboardIntents}
      quickReplies={vendorDashboardQuickReplies}
      contact={vendorDashboardContact}
      theme="purple"
      toggleIcon={Store}
      headerIcon={Store}
      contactIcon={Headphones}
      contactButtonLabel="Contact Vendor Support"
      textareaPlaceholder="Ask about store management, analytics, payouts..."
      footerNote="RUACH Vendor Dashboard Assistant"
    />
  )
}

