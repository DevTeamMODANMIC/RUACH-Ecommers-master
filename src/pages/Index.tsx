import { Suspense, lazy, useEffect, useState } from "react"
import Hero from "../components/hero"
import Newsletter from "../components/newsletter"
import { BulkOrderCTA } from "../components/bulk-order-cta"
import ServicesShowcase from "../components/services-showcase"
import { useNavigate } from "react-router-dom"

// Lazy load components that are below the fold
const FeaturedProducts = lazy(() => import("../components/featured-products"))
const TrendingProducts = lazy(() => import("../components/trending-products"))
const FeaturedStores = lazy(() => import("../components/featured-stores"))
const PersonalizedRecommendations = lazy(async () => {
  const mod = await import("../components/personalized-recommendations")
  return { default: mod.PersonalizedRecommendations }
})

export default function HomePage() {
  const navigate = useNavigate()
  const [keySequence, setKeySequence] = useState<string[]>([])
  const [showSecretMessage, setShowSecretMessage] = useState(false)

  // Secret code: SERVICE (S-E-R-V-I-C-E)
  const secretCode = [
    'KeyS', 'KeyE', 'KeyR', 'KeyV', 'KeyI', 'KeyC', 'KeyE'
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Shift+G shortcut
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault()
        navigate('/service-provider/dashboard')
        setShowSecretMessage(true)
        setTimeout(() => setShowSecretMessage(false), 3000)
        return
      }

      // Add the pressed key to the sequence for the word-based secret
      setKeySequence(prev => {
        const newSequence = [...prev, e.code].slice(-secretCode.length)
        
        // Check if the sequence matches the secret code
        if (newSequence.length === secretCode.length && 
            newSequence.every((key, index) => key === secretCode[index])) {
          // Navigate to service provider dashboard
          navigate('/service-provider/dashboard')
          setShowSecretMessage(true)
          setTimeout(() => setShowSecretMessage(false), 3000)
        }
        
        return newSequence
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  return (
    <main className="flex flex-col bg-white text-gray-800">
      <div className="relative">
        <Hero />
      </div>
      <ServicesShowcase />
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
      
      {/* Secret message overlay */}
      {showSecretMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-2">Secret Unlocked!</h2>
            <p>Navigating to Service Provider Dashboard...</p>
          </div>
        </div>
      )}
    </main>
  )
}