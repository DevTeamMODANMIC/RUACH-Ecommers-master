"use client"

import { ProductRecommendations } from "@/components/product-recommendations"

interface CartRecommendationsProps {
  cartItems: Array<{ id: number; country: string }>
}

export function CartRecommendations({ cartItems }: CartRecommendationsProps) {
  // If no items in cart, don't show recommendations
  if (cartItems.length === 0) {
    return null
  }

  // Get the most common country in the cart
  const countryCount: Record<string, number> = {}
  cartItems.forEach((item) => {
    countryCount[item.country] = (countryCount[item.country] || 0) + 1
  })

  const topCountry = Object.entries(countryCount).sort((a, b) => b[1] - a[1])[0][0]

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold">Complete Your Order</h3>
      <ProductRecommendations
        productId={cartItems[0].id}
        country={topCountry}
        type="frequently-bought-together"
        title="Frequently Bought Together"
        limit={4}
      />
    </div>
  )
}
