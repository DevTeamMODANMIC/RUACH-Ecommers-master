import { Suspense, lazy } from "react"
import Hero from "@/components/hero"
import Newsletter from "@/components/newsletter"
import { BulkOrderCTA } from "@/components/bulk-order-cta"

// Lazy load components that are below the fold
const FeaturedProducts = lazy(() => import("@/components/featured-products"))
const TrendingProducts = lazy(() => import("@/components/trending-products"))
const FeaturedStores = lazy(() => import("@/components/featured-stores"))
const PersonalizedRecommendations = lazy(async () => {
  const mod = await import("@/components/personalized-recommendations")
  return { default: mod.PersonalizedRecommendations }
})

export default function HomePage() {
  return (
    <main className="flex flex-col bg-white text-gray-800">
      <div className="relative">
        <Hero />
      </div>
      <div className="container mx-auto px-4">
        <Suspense fallback={<div className="py-16 text-center text-gray-600">Loading featured products...</div>}>
          <FeaturedProducts />
        </Suspense>
        <Suspense fallback={<div className="py-16 text-center text-gray-600">Loading trending products...</div>}>
          <TrendingProducts />
        </Suspense>
        <Suspense fallback={<div className="py-16 text-center text-gray-600">Loading featured stores...</div>}>
          <FeaturedStores />
        </Suspense>
        <Suspense fallback={<div className="py-16 text-center text-gray-600">Loading recommendations...</div>}>
          <PersonalizedRecommendations />
        </Suspense>
        <div className="mb-20">
        <BulkOrderCTA />
        </div>
        <div id="newsletter-section">
          <Newsletter />
        </div>
      </div>
    </main>
  )
}