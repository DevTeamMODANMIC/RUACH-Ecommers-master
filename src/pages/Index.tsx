import { Suspense, lazy, useEffect, useState } from "react"
import Hero from "../components/hero"
import FeaturedProducts from "../components/featured-products"
import TrendingProducts from "../components/trending-products"
import Newsletter from "../components/newsletter"
import { recommendTrendingProducts } from "@/components/ML-AllProducts-modeul"
import AIChatbot from "../components/ai-chatbot"

export default function Index() {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedProducts />
      <TrendingProducts />
      <Newsletter />
      <AIChatbot />
    </div>
  )
}