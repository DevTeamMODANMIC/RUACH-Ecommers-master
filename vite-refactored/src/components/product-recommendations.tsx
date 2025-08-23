

import { useState, useEffect } from "react"

// import Link from "next/link"
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Star } from "lucide-react"
import { useCurrency } from "@/components/currency-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { useRecommendations } from "@/hooks/use-recommendations"

interface ProductRecommendationsProps {
  productId?: number
  country: string
  category?: string
  type: "related" | "popular" | "recently-viewed" | "frequently-bought-together" | "you-might-like"
  title?: string
  limit?: number
}

export function ProductRecommendations({
  productId,
  country,
  category,
  type,
  title,
  limit = 4,
}: ProductRecommendationsProps) {
  const [loading, setLoading] = useState(true)
  const { formatPrice } = useCurrency()
  const { getRecommendations } = useRecommendations()
  const [products, setProducts] = useState<any[]>([])

  // Generate title if not provided
  const getDefaultTitle = () => {
    switch (type) {
      case "related":
        return "Related Products"
      case "popular":
        return "Popular in " + country.charAt(0).toUpperCase() + country.slice(1)
      case "recently-viewed":
        return "Recently Viewed"
      case "frequently-bought-together":
        return "Frequently Bought Together"
      case "you-might-like":
        return "You Might Also Like"
      default:
        return "Recommended Products"
    }
  }

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)
      try {
        // Get recommendations based on type, product, country, etc.
        const recommendedProducts = await getRecommendations({
          productId,
          country,
          category,
          type,
          limit,
        })
        setProducts(recommendedProducts)
      } catch (error) {
        console.error("Error fetching recommendations:", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [productId, country, category, type, limit, getRecommendations])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-2">
                <Skeleton className="h-40 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{title || getDefaultTitle()}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="group hover:shadow-md transition-all">
            <CardContent className="p-3">
              <Link href={`/products/${product.id}`} className="block">
                <div className="relative aspect-square overflow-hidden rounded-md mb-3">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.discount > 0 && (
                    <Badge variant="destructive" className="absolute top-2 left-2 text-xs">
                      -{product.discount}%
                    </Badge>
                  )}
                </div>
                <h4 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-green-600 transition-colors">
                  {product.name}
                </h4>
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-green-600">{formatPrice(product.price)}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
