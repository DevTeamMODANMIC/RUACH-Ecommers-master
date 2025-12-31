"use client"

import ChatbotWidget from "@/components/chatbot-widget"
import type { ChatbotIntent, QuickReply, ContactConfig } from "@/hooks/use-chatbot"
import type { ChatContext } from "@/services/chatbot-service"
import { Headphones, ShoppingCart } from "lucide-react"
import { getProducts, type Product } from "../lib/firebase-products"
import { formatCurrency } from "@/lib/utils"

interface ShopAIChatbotProps {
  userId?: string
}

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "what",
  "your",
  "have",
  "any",
  "are",
  "you",
  "sell",
  "got",
  "need",
  "want",
  "looking",
  "do",
  "can",
  "please",
  "show",
  "me",
  "a",
  "an",
  "in",
  "to",
  "of",
  "is"
])

const PRODUCT_CACHE_TTL = 5 * 60 * 1000 // 5 minutes
let productCache: { products: Product[]; fetchedAt: number } | null = null

const loadProducts = async (): Promise<Product[]> => {
  if (productCache && Date.now() - productCache.fetchedAt < PRODUCT_CACHE_TTL) {
    return productCache.products
  }

  const { products } = await getProducts(undefined, 120)
  productCache = {
    products,
    fetchedAt: Date.now()
  }
  return products
}

const scoreProductMatch = (product: Product, keywords: string[]): number => {
  const name = product.name?.toLowerCase() ?? ""
  const description = product.description?.toLowerCase() ?? ""
  const category = product.category?.toLowerCase() ?? ""
  const tags = (product.tags ?? []).map(tag => tag.toLowerCase())

  return keywords.reduce((score, keyword) => {
    if (name.startsWith(keyword)) {
      score += 6
    } else if (name.includes(keyword)) {
      score += 4
    }

    if (description.includes(keyword)) {
      score += 2
    }

    if (category.includes(keyword)) {
      score += 3
    }

    if (tags.some(tag => tag.includes(keyword))) {
      score += 3
    }

    if (product.inStock) {
      score += 1
    }

    return score
  }, 0)
}

const findMatchingProducts = async (query: string, limit: number = 3): Promise<Product[]> => {
  const normalized = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ")
  const keywords = normalized
    .split(/\s+/)
    .filter(Boolean)
    .filter(word => !STOPWORDS.has(word))
    .filter(word => word.length > 2)

  if (keywords.length === 0) {
    return []
  }

  const products = await loadProducts()
  const scoredProducts = products
    .map(product => ({
      product,
      score: scoreProductMatch(product, keywords)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product)

  return scoredProducts
}

const formatProductMessage = (products: Product[], keywords: string[]): string => {
  const header =
    products.length === 1
      ? "I found one item that fits what you're looking for:"
      : "Here are the top items that match your request:"

  const lines = products.map((product, index) => {
    const price = product.price ? formatCurrency(product.price) : "Price available on product page"
    const availability = product.inStock ? "✅ In stock" : "⚠️ Currently unavailable"
    const tags = (product.tags ?? []).slice(0, 2).map(tag => `#${tag}`).join(" ")

    return `${index + 1}. ${product.name}\n   ${price} • ${availability}${tags ? ` • ${tags}` : ""}`
  })

  const keywordHint =
    keywords.length > 0
      ? `Try searching for "${keywords.join(" ")}" on the shop page to see more options or to add these to your cart.`
      : "You can search for these names on the shop page to view details and add to your cart."

  return [header, ...lines, keywordHint].join("\n")
}

const buildProductSearchIntent = (): ChatbotIntent => ({
  keywords: ["find", "search", "looking", "available", "sell", "buy", "product", "stock", "have", "need"],
  match: "any",
  response:
    "Use the search bar at the top to find products by name, category, or vendor. You can also use filters to narrow down results.",
  action: async (input: string) => {
    try {
      const matches = await findMatchingProducts(input)
      if (matches.length === 0) {
        return "I couldn't find an exact match in our catalogue right now. Try using a different name or browse the categories on the shop page."
      }

      const keywords = input
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .filter(word => !STOPWORDS.has(word))
        .filter(word => word.length > 2)

      return formatProductMessage(matches, keywords)
    } catch (error) {
      console.error("Shop chatbot product search failed:", error)
      return "I'm having trouble looking up products right now. Please try again in a moment or use the shop search bar."
    }
  }
})

const shopIntents: ChatbotIntent[] = [
  {
    keywords: ["hello", "hi", "hey"],
    response: "Hello! How can I assist you with your shopping today?"
  },
  buildProductSearchIntent(),
  {
    keywords: ["thank"],
    response: "You're welcome! Is there anything else I can help you with regarding your shopping experience?"
  },
  {
    keywords: ["bye", "goodbye"],
    response: "Happy shopping! Feel free to reach out if you have any more questions."
  },
  {
    keywords: ["filter", "category"],
    response: "You can filter products by category, price range, brand, and ratings using the filter options on the left side of the product grid."
  },
  {
    keywords: ["cart", "basket"],
    response: "Your shopping cart is accessible from the top navigation bar. Review items before checkout and apply discount codes if you have any."
  },
  {
    keywords: ["wishlist", "favorite"],
    response: "Add products to your wishlist by clicking the heart icon on any product. Access your wishlist from your account dashboard."
  },
  {
    keywords: ["shipping", "delivery"],
    response: "We offer fast delivery within 24-48 hours in major cities. Delivery times may vary based on your location."
  },
  {
    keywords: ["bulk", "wholesale"],
    response: "Yes! We offer competitive bulk pricing for orders over ₦100,000. Let me know the products you're interested in and I can connect you to our sales team."
  },
  {
    keywords: ["human", "agent", "support"],
    match: "any",
    response: "No problem. Tap the 'Connect to Shopping Assistant' button below and we'll bring a human agent in."
  }
]

const shopQuickReplies: QuickReply[] = [
  { label: "Find electronics", prompt: "I'm looking for a new smartphone." },
  { label: "Shipping times", prompt: "How long does delivery take?" },
  { label: "Apply filters", prompt: "How do I filter products by price?" },
  { label: "Manage cart", prompt: "How do I view my cart items?" }
]

const shopContact: ContactConfig = {
  intro: "Connecting you to a shopping assistant. Please use one of our direct contact methods:",
  details: [
    "📞 Phone: +2347054915173",
    "💬 WhatsApp: Click to chat",
    "📧 Email: support@ruachestore.com.ng"
  ]
}

export default function ShopAIChatbot({ userId }: ShopAIChatbotProps) {
  const context: ChatContext = {
    page: "shop",
    userId,
    userType: "customer"
  }

  return (
    <ChatbotWidget
      storageKey="ruach-chat-shop"
      context={context}
      greeting="Hello! I'm your RUACH E-STORE Shopping Assistant. I can help you find products, understand shipping options, and manage your cart. How can I assist you today?"
      headerTitle="Shopping Assistant"
      defaultResponse="I can help you with product searches, filtering, cart management, and more. What would you like to know about shopping on our platform?"
      intents={shopIntents}
      quickReplies={shopQuickReplies}
      contact={shopContact}
      theme="green"
      toggleIcon={ShoppingCart}
      headerIcon={ShoppingCart}
      contactIcon={Headphones}
      contactButtonLabel="Connect to Shopping Assistant"
      textareaPlaceholder="Ask about products, search, filters, cart..."
      footerNote="RUACH Shopping Assistant"
    />
  )
}
