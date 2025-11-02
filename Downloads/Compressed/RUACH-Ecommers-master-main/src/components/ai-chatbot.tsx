"use client"

import ChatbotWidget from "@/components/chatbot-widget"
import type { ChatbotIntent, QuickReply, ContactConfig } from "@/hooks/use-chatbot"
import type { ChatContext } from "@/services/chatbot-service"
import { Bot, Headphones, MessageCircle } from "lucide-react"

const faqResponses: Record<string, string> = {
  // Shopping and Customer Support
  order: "You can track your order by logging into your account and checking 'My Orders', or using the tracking link sent to your email.",
  track: "You can track your order by logging into your account and checking 'My Orders', or using the tracking link sent to your email.",
  delivery: "We offer fast delivery within 24-48 hours in major cities. Delivery times may vary based on your location.",
  shipping: "We offer fast delivery within 24-48 hours in major cities. Delivery times may vary based on your location.",
  return: "We have a 7-day return policy for most items. Please visit our Returns & Refunds page for detailed information.",
  refund: "Refunds are processed within 5-7 business days after we receive your returned item. Visit our Returns & Refunds page for more details.",
  cancel: "You can cancel your order from your account dashboard under 'My Orders' if the order hasn't been shipped yet.",

  // Products and Shopping
  product: "Browse thousands of authentic products from verified vendors in our marketplace. Use filters to find exactly what you need.",
  search: "Use our smart search feature to find products by name, category, or vendor. You can also use filters to narrow down results.",
  discount: "We regularly offer discounts and promotions. Subscribe to our newsletter to stay updated on the latest offers.",
  bulk: "Yes! We offer competitive bulk pricing for orders over ₦100,000. Contact our sales team for a custom quote.",
  wishlist: "Add products to your wishlist by clicking the heart icon on any product. Access your wishlist from your account dashboard.",
  cart: "Your shopping cart is accessible from the top navigation bar. Review items before checkout and apply discount codes if you have any.",

  // Account and Profile
  account: "Manage your account by clicking on your profile icon in the top right corner. You can update personal information, view order history, and manage wishlists.",
  profile: "Manage your account by clicking on your profile icon in the top right corner. You can update personal information, view order history, and manage wishlists.",
  password: "To reset your password, click 'Forgot Password' on the login page and follow the instructions sent to your email.",
  register: "To create an account, click 'Register' in the top navigation bar and fill in your details. Verify your email to complete registration.",

  // Vendor Services
  vendor: "To become a vendor, visit our vendor registration page, complete the application, and submit required documents for verification.",
  sell: "To become a vendor, visit our vendor registration page, complete the application, and submit required documents for verification.",
  store: "Vendors can manage their stores, products, orders, and payouts through the vendor dashboard after registration and approval.",
  payout: "Vendor payouts are processed weekly. Check your vendor dashboard for detailed payment history and wallet balance.",

  // Service Provider Services
  service: "Browse and book services from verified service providers in our marketplace. Filter by category, rating, and availability.",
  booking: "Manage your bookings through your account dashboard. You can view upcoming appointments, past bookings, and communicate with service providers.",
  provider: "Interested in becoming a service provider? Visit our service provider registration page to get started.",

  // Support and Contact
  contact: "You can reach us via phone at +2347054915173, email at support@ruachestore.com.ng, or through WhatsApp chat.",
  support: "Our customer support is available Mon-Fri: 8AM-8PM, Sat: 9AM-6PM. WhatsApp support is available 24/7.",
  hours: "Our business hours are Mon-Fri: 8AM-8PM, Sat: 9AM-6PM. WhatsApp support is available 24/7.",
  help: "Our customer support is available Mon-Fri: 8AM-8PM, Sat: 9AM-6PM. WhatsApp support is available 24/7.",

  // Technical and Payments
  payment: "We accept various payment methods including Visa, Mastercard, PayPal, and bank transfers.",
  card: "We accept various payment methods including Visa, Mastercard, PayPal, and bank transfers.",
  paypal: "We accept various payment methods including Visa, Mastercard, PayPal, and bank transfers.",
  bank: "We accept various payment methods including Visa, Mastercard, PayPal, and bank transfers.",

  // Policies
  privacy: "Read our Privacy Policy to understand how we protect your personal information and data.",
  terms: "Our Terms and Conditions outline your rights and responsibilities when using our platform.",
  policy: "Read our Privacy Policy to understand how we protect your personal information and data.",

  // Features
  feature: "RUACH E-STORE offers shopping, vendor marketplaces, service bookings, bulk ordering, and more in one platform.",
  marketplace: "Our marketplace connects customers with verified vendors and service providers for authentic products and services.",

  // Special responses
  hello: "Hello! How can I assist you today?",
  hi: "Hello! How can I assist you today?",
  hey: "Hello! How can I assist you today?",
  thank: "You're welcome! Is there anything else I can help you with?",
  bye: "Goodbye! Feel free to reach out if you have any more questions.",
  goodbye: "Goodbye! Feel free to reach out if you have any more questions.",
  agent: "I can link you with a human agent. Tap the 'Connect to Human Agent' button below and we'll hand you over right away."
}

const baseIntents: ChatbotIntent[] = Object.entries(faqResponses).map(([keyword, response]) => ({
  keywords: [keyword],
  response
}))

const currencyIntent: ChatbotIntent = {
  keywords: ["exchange rate", "convert", "rate", "currency"],
  match: "any",
  response:
    "I can convert amounts when you ask things like \"convert 50 usd to ngn\" or \"USD to GBP\". Please include the currencies you want.",
  action: async (input: string) => {
    const lower = input.toLowerCase()
    const cleaned = lower.replace(/[^a-z0-9.\s]/g, " ")
    const normalized = cleaned.replace(/\s+/g, " ").trim()

    const regex = /(?:convert|exchange|rate)?\s*(\d+(?:\.\d+)?)?\s*([a-z]{3})\s+(?:to|in)\s+([a-z]{3})/
    const match = normalized.match(regex)

    if (!match) {
      return "Please specify the currencies like \"convert 75 usd to ngn\" or \"eur to gbp\" so I know what to convert."
    }

    const amount = match[1] ? Number(match[1].replace(/,/g, "")) : 1
    const from = match[2]?.toUpperCase()
    const to = match[3]?.toUpperCase()

    if (!from || !to || Number.isNaN(amount) || amount <= 0) {
      return "I couldn't understand that amount or currency. Please try something like \"convert 150 usd to ngn\"."
    }

    if (typeof fetch !== "function") {
      return "Live exchange lookups are unavailable in this environment. Please try again later."
    }

    try {
      const response = await fetch(
        `https://api.exchangerate.host/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(
          to
        )}&amount=${encodeURIComponent(amount)}`
      )

      if (!response.ok) {
        throw new Error(`Exchange rate API failed with status ${response.status}`)
      }

      const data = (await response.json()) as {
        result?: number
        info?: { rate?: number }
        date?: string
      }

      if (typeof data.result !== "number" || !Number.isFinite(data.result)) {
        throw new Error("Invalid exchange rate response")
      }

      const rate = data.info?.rate
      const formattedAmount = amount.toLocaleString(undefined, {
        maximumFractionDigits: 2
      })
      const convertedAmount = data.result.toLocaleString(undefined, {
        maximumFractionDigits: 2
      })

      const parts = [
        `${formattedAmount} ${from} ≈ ${convertedAmount} ${to}`,
        rate
          ? `Rate: 1 ${from} = ${rate.toLocaleString(undefined, {
              maximumFractionDigits: 4
            })} ${to}`
          : undefined,
        data.date ? `As of ${data.date}` : undefined
      ].filter(Boolean)

      return parts.join(" • ")
    } catch (error) {
      console.error("Currency conversion lookup failed:", error)
      return "I couldn't retrieve live exchange rates right now. Please try again in a moment."
    }
  }
}

const intents: ChatbotIntent[] = [...baseIntents, currencyIntent]

const quickReplies: QuickReply[] = [
  { label: "Track my order", prompt: "How do I track my order?" },
  { label: "Delivery options", prompt: "What delivery options do you offer?" },
  { label: "Return policy", prompt: "Tell me about the return policy." },
  { label: "Become a vendor", prompt: "How do I register as a vendor?" },
  { label: "Contact support", prompt: "How can I contact support?" },
  { label: "USD to NGN", prompt: "Convert 100 usd to ngn." }
]

const contact: ContactConfig = {
  intro: "Connecting you to a human agent. Please use one of our direct contact methods:",
  details: [
    "📞 Phone: +2347054915173",
    "💬 WhatsApp: Click to chat",
    "📧 Email: support@ruachestore.com.ng"
  ]
}

const context: ChatContext = {
  page: "general",
  userType: "customer"
}

export default function AIChatbot() {
  return (
    <ChatbotWidget
      storageKey="ruach-chat-general"
      context={context}
      greeting="Hello! I'm your RUACH E-STORE assistant. I can help you with shopping, orders, vendor services, and more. How can I assist you today?"
      headerTitle="RUACH Assistant"
      defaultResponse="I'm not sure about that. You can contact our support team for more specific assistance. Would you like me to connect you to a human agent?"
      intents={intents}
      quickReplies={quickReplies}
      contact={contact}
      theme="blue"
      toggleIcon={MessageCircle}
      headerIcon={Bot}
      contactIcon={Headphones}
      contactButtonLabel="Connect to Human Agent"
      textareaPlaceholder="Ask about shopping, orders, services, vendors..."
      footerNote="RUACH Assistant v2.0"
    />
  )
}
