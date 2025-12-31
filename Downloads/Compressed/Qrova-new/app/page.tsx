import { Suspense, lazy } from "react"
import Hero from "@/components/hero"
import Newsletter from "@/components/newsletter"
import { BulkOrderCTA } from "@/components/bulk-order-cta"
import TrustSignals from "@/components/trust-signals"

// Import ProductSlider directly to ensure it loads
import ProductSlider from "@/components/product-slider"

// Lazy load other components that are below the fold
const FeaturedProducts = lazy(() => import("@/components/featured-products"))
const ProductShowcase = lazy(() => import("@/components/product-showcase"))
const PersonalizedRecommendations = lazy(() => import("@/components/personalized-recommendations").then(mod => ({ default: mod.PersonalizedRecommendations })))

// Compact loading skeleton component
const ProductSkeleton = () => (
  <div className="py-8">
    <div className="container mx-auto px-4">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gray-100"></div>
              <div className="p-3">
                <div className="h-3 bg-gray-100 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-100 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen text-gray-900">
      <div className="relative">
        <Hero />
      </div>
      <div className="container mx-auto px-4 max-w-7xl space-y-16 py-12">
        <Suspense fallback={<ProductSkeleton />}>
          <FeaturedProducts />
        </Suspense>
        {/* Product Slider - Not lazy loaded to ensure visibility */}
        <ProductSlider />
        <Suspense fallback={<ProductSkeleton />}>
          <ProductShowcase 
            category="Beverages" 
            title="Popular Beverages" 
            subtitle="Authentic drinks from around the world" 
          />
        </Suspense>
        <Suspense fallback={<ProductSkeleton />}>
          <ProductShowcase 
            category="Food" 
            title="Traditional Foods" 
            subtitle="Authentic African culinary delights" 
          />
        </Suspense>
        <Suspense fallback={<ProductSkeleton />}>
          <ProductShowcase 
            category="Spices" 
            title="Premium Spices" 
            subtitle="Enhance your dishes with authentic flavors" 
          />
        </Suspense>
        <Suspense fallback={<ProductSkeleton />}>
          <PersonalizedRecommendations />
        </Suspense>
        
        {/* Trust signals and social proof */}
        <TrustSignals />
        
        <div className="mb-12">
          <BulkOrderCTA />
        </div>
        <div id="newsletter-section">
          <Newsletter />
        </div>
      </div>
    </main>
  )
}
