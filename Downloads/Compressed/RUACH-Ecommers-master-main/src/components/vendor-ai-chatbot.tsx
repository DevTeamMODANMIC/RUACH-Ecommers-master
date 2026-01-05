"use client"

import ChatbotWidget from "@/components/chatbot-widget"
import type { ChatbotIntent, QuickReply, ContactConfig } from "@/hooks/use-chatbot"
import type { ChatContext } from "@/services/chatbot-service"
import { Headphones, Store } from "lucide-react"

const vendorFaqResponses: Record<string, string> = {
  product:
    "To add products to your store, go to your Vendor Dashboard > Products > Add New Product. You can upload images, set prices, and manage inventory.",
  order:
    "You can view and manage your orders in the Vendor Dashboard under the Orders section. You'll receive notifications for new orders.",
  payment:
    "Payments for your sales are processed weekly. You can view your payment history and wallet balance in the Vendor Dashboard under the Payouts section.",
  payout:
    "Payments for your sales are processed weekly. You can view your payment history and wallet balance in the Vendor Dashboard under the Payouts section.",
  wallet:
    "Your wallet balance shows your available funds. You can view detailed transaction history in the Vendor Dashboard under the Wallet section.",
  store:
    "To customize your store, go to Vendor Dashboard > Settings. You can update your store name, description, logo, and other details.",
  profile:
    "To update your vendor profile, go to Vendor Dashboard > Profile. You can edit your business information, contact details, and banking information.",
  kyc:
    "KYC verification is required for all vendors. Please complete the KYC process in your Vendor Dashboard under the KYC section.",
  customer:
    "You can communicate with customers through the order messaging system in your Vendor Dashboard. Check the order details for message options.",
  review:
    "Customer reviews for your products are visible in the Vendor Dashboard under the Reviews section. You can respond to reviews there.",
  return:
    "Return requests are managed through the order system. You'll receive notifications for any return requests and can approve or reject them.",
  inventory:
    "You can manage your product inventory in the Products section of your Vendor Dashboard. Update stock levels as needed.",
  shipping:
    "You are responsible for shipping your products to customers. You can set shipping costs and delivery times in your product settings.",
  commission:
    "Our commission rate is 15% per sale. This is automatically deducted from your earnings before payout.",
  support:
    "For vendor-specific support, you can contact our vendor support team at vendors@ruachestore.com.ng or call +2347054915173.",
  bulk:
    "For bulk orders, you'll receive special notifications in your dashboard. Bulk orders typically have different pricing and shipping arrangements.",
  analytics:
    "You can view your store analytics in the Vendor Dashboard under the Analytics section. Track sales, visitors, and product performance.",
  shopping:
    "Our platform connects customers with vendors like you. Customers browse products, place orders, and you fulfill them.",
  marketplace:
    "As a vendor, you're part of our marketplace that connects you with customers looking for authentic products.",
  service:
    "We also have a service provider section of our platform. While you sell products, service providers offer services.",
  booking:
    "While you handle product orders, service providers manage bookings through their own dashboard.",
  account:
    "Manage your vendor account through the Vendor Dashboard. Access your profile, store settings, and business information.",
  password:
    "To reset your vendor account password, use the main login page and follow the password reset process.",
  register:
    "You've already registered as a vendor. If you need additional help, contact vendor support.",
  privacy:
    "Our vendor privacy policy is part of our overall privacy policy. You can find it in the footer of our website.",
  terms:
    "Vendor terms are included in our overall terms and conditions. All vendors must comply with our policies.",
  hello: "Hello! How can I assist you with your vendor store today?",
  hi: "Hello! How can I assist you with your vendor store today?",
  hey: "Hello! How can I assist you with your vendor store today?",
  thank: "You're welcome! Is there anything else I can help you with regarding your store?",
  bye: "Goodbye! Feel free to reach out if you have any more questions about managing your store.",
  goodbye: "Goodbye! Feel free to reach out if you have any more questions about managing your store.",
  agent:
    "Happy to help. Tap the 'Contact Vendor Support' button below and we'll loop in a vendor success specialist."
}

const vendorIntents: ChatbotIntent[] = Object.entries(vendorFaqResponses).map(([keyword, response]) => ({
  keywords: [keyword],
  response
}))

const vendorQuickReplies: QuickReply[] = [
  { label: "Add a product", prompt: "How do I add a new product?" },
  { label: "View my orders", prompt: "Where can I see my recent orders?" },
  { label: "Payment schedule", prompt: "When will I receive my payouts?" },
  { label: "Update store", prompt: "How do I update my store settings?" }
]

const vendorContact: ContactConfig = {
  intro: "Connecting you to a vendor support agent. Please use one of our direct contact methods:",
  details: [
    "📧 Vendor Support Email: vendors@ruachestore.com.ng",
    "📞 Vendor Support Phone: +2347054915173",
    "💬 WhatsApp: Click to chat with vendor support"
  ]
}

const context: ChatContext = {
  page: "vendor",
  userType: "vendor"
}

export default function VendorAIChatbot() {
  return (
    <ChatbotWidget
      storageKey="ruach-chat-vendor"
      context={context}
      greeting="Hello! I'm your RUACH E-STORE Vendor Assistant. I can help you with your store, products, orders, and more. How can I assist you today?"
      headerTitle="Vendor Assistant"
      defaultResponse="I'm not sure about that. For vendor-specific questions, you can contact our vendor support team at vendors@ruachestore.com.ng."
      intents={vendorIntents}
      quickReplies={vendorQuickReplies}
      contact={vendorContact}
      theme="purple"
      toggleIcon={Store}
      headerIcon={Store}
      contactIcon={Headphones}
      contactButtonLabel="Contact Vendor Support"
      textareaPlaceholder="Ask about store setup, orders, payouts, or analytics..."
      footerNote="RUACH Vendor Assistant v2.0"
    />
  )
}

