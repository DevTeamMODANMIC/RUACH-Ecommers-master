"use client"

import ChatbotWidget from "@/components/chatbot-widget"
import type { ChatbotIntent, QuickReply, ContactConfig } from "@/hooks/use-chatbot"
import type { ChatContext } from "@/services/chatbot-service"
import { Calendar, Headphones } from "lucide-react"

const serviceProviderFaqResponses: Record<string, string> = {
  booking:
    "You can view and manage your bookings in the Service Provider Dashboard under the Bookings section. You'll receive notifications for new bookings.",
  schedule:
    "To update your availability, go to Service Provider Dashboard > Settings > Availability. You can set your working hours and days off.",
  service:
    "To add or edit your services, go to Service Provider Dashboard > Services. You can update pricing, descriptions, and availability.",
  payment:
    "Payments for your services are processed weekly. You can view your payment history and wallet balance in the Service Provider Dashboard under the Payouts section.",
  payout:
    "Payments for your services are processed weekly. You can view your payment history and wallet balance in the Service Provider Dashboard under the Payouts section.",
  wallet:
    "Your wallet balance shows your available funds. You can view detailed transaction history in the Service Provider Dashboard under the Wallet section.",
  profile:
    "To update your service provider profile, go to Service Provider Dashboard > Profile. You can edit your business information, contact details, and banking information.",
  kyc:
    "KYC verification is required for all service providers. Please complete the KYC process in your Service Provider Dashboard under the KYC section.",
  customer:
    "You can communicate with customers through the booking messaging system. Check the booking details for message options.",
  review:
    "Customer reviews for your services are visible in the Service Provider Dashboard under the Reviews section. You can respond to reviews there.",
  cancel:
    "Booking cancellation requests are managed through the booking system. You'll receive notifications for any cancellation requests and can approve or reject them.",
  availability:
    "To update your availability, go to Service Provider Dashboard > Settings > Availability. You can set your working hours and days off.",
  support:
    "For service provider-specific support, you can contact our service provider support team at services@ruachestore.com.ng or call +2347054915173.",
  commission:
    "Our commission rate is 20% per service booking. This is automatically deducted from your earnings before payout.",
  analytics:
    "You can view your service analytics in the Service Provider Dashboard under the Analytics section. Track bookings, revenue, and customer satisfaction.",
  shopping:
    "Our platform also has a shopping section where vendors sell products. As a service provider, you offer services rather than products.",
  marketplace:
    "As a service provider, you're part of our marketplace that connects you with customers looking for services.",
  product:
    "While vendors sell products, you provide services. Customers browse services, book appointments, and you fulfill them.",
  order:
    "While vendors handle product orders, you manage service bookings through your own dashboard.",
  account:
    "Manage your service provider account through the Service Provider Dashboard. Access your profile, service settings, and business information.",
  password:
    "To reset your service provider account password, use the main login page and follow the password reset process.",
  register:
    "You've already registered as a service provider. If you need additional help, contact service provider support.",
  privacy:
    "Our service provider privacy policy is part of our overall privacy policy. You can find it in the footer of our website.",
  terms:
    "Service provider terms are included in our overall terms and conditions. All service providers must comply with our policies.",
  hello:
    "Hello! How can I assist you with your service provider account today?",
  hi:
    "Hello! How can I assist you with your service provider account today?",
  hey:
    "Hello! How can I assist you with your service provider account today?",
  thank:
    "You're welcome! Is there anything else I can help you with regarding your services?",
  bye:
    "Goodbye! Feel free to reach out if you have any more questions about managing your services.",
  goodbye:
    "Goodbye! Feel free to reach out if you have any more questions about managing your services.",
  agent:
    "No problem. Tap the 'Contact Service Provider Support' button below and we'll connect you to a specialist."
}

const serviceProviderIntents: ChatbotIntent[] = Object.entries(serviceProviderFaqResponses).map(
  ([keyword, response]) => ({
    keywords: [keyword],
    response
  })
)

const serviceProviderQuickReplies: QuickReply[] = [
  { label: "Manage bookings", prompt: "How do I manage my bookings?" },
  { label: "Update availability", prompt: "How do I update my availability?" },
  { label: "Add a service", prompt: "How do I add a new service?" },
  { label: "Payout schedule", prompt: "When will I receive my payouts?" }
]

const serviceProviderContact: ContactConfig = {
  intro: "Connecting you to a service provider support agent. Please use one of our direct contact methods:",
  details: [
    "📧 Service Provider Support Email: services@ruachestore.com.ng",
    "📞 Service Provider Support Phone: +2347054915173",
    "💬 WhatsApp: Click to chat with service provider support"
  ]
}

const context: ChatContext = {
  page: "service-provider",
  userType: "service-provider"
}

export default function ServiceProviderAIChatbot() {
  return (
    <ChatbotWidget
      storageKey="ruach-chat-service-provider"
      context={context}
      greeting="Hello! I'm your RUACH E-STORE Service Provider Assistant. I can help you with your services, bookings, schedule, and more. How can I assist you today?"
      headerTitle="Service Provider Assistant"
      defaultResponse="I'm not sure about that. For service provider-specific questions, you can contact our service provider support team at services@ruachestore.com.ng."
      intents={serviceProviderIntents}
      quickReplies={serviceProviderQuickReplies}
      contact={serviceProviderContact}
      theme="teal"
      toggleIcon={Calendar}
      headerIcon={Calendar}
      contactIcon={Headphones}
      contactButtonLabel="Contact Service Provider Support"
      textareaPlaceholder="Ask about services, bookings, availability, or payouts..."
      footerNote="RUACH SP Assistant v2.0"
    />
  )
}

