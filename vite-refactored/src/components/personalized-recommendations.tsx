

import { useState, useEffect } from "react"
import { ProductRecommendations } from "@/components/product-recommendations"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function PersonalizedRecommendations() {
  const [userCountry, setUserCountry] = useState("nigeria")
  const [recentlyViewed] = useLocalStorage<number[]>("recently-viewed", [])
  const [userPreferences] = useLocalStorage<{
    countries: Record<string, number>
  }>("user-preferences", {
    categories: {},
    tags: {},
    countries: {},
  })

  useEffect(() => {
    // Determine the user's most viewed country
    if (Object.keys(userPreferences.countries).length > 0) {
      const topCountry = Object.entries(userPreferences.countries).sort((a, b) => b[1] - a[1])[0][0]
      setUserCountry(topCountry)
    }
  }, [userPreferences])

  // Don't show if user hasn't viewed any products
  if (recentlyViewed.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Personalized For You</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Based on your browsing history and preferences
          </p>
        </div>

        <div className="space-y-12">
          <ProductRecommendations country={userCountry} type="recently-viewed" title="Recently Viewed" limit={4} />
          <ProductRecommendations country={userCountry} type="you-might-like" title="You Might Like" limit={4} />
        </div>
      </div>
    </section>
  )
}
