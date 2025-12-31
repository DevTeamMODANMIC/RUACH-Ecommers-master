"use client"

import { useCallback } from "react"
import { useLocalStorage } from "./use-local-storage"

// Mock product data with country-specific information
const productData = {
  nigeria: [
    {
      id: 1,
      name: "Premium Jollof Rice Mix",
      description: "Authentic Nigerian jollof rice seasoning blend with traditional spices",
      price: 8.99,
      originalPrice: 12.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Rice & Grains",
      brand: "Mama Gold",
      rating: 4.8,
      reviews: 124,
      inStock: true,
      origin: "Lagos, Nigeria",
      localName: "Jollof Rice Spice",
      discount: 31,
      isOrganic: false,
      isHalal: true,
      tags: ["Traditional", "Spicy", "Family Pack"],
      popularity: 95,
      relatedProducts: [2, 10, 15],
      frequentlyBoughtWith: [2, 3],
    },
    {
      id: 2,
      name: "Red Palm Oil (500ml)",
      description: "Pure red palm oil from sustainable Nigerian palm plantations",
      price: 15.99,
      originalPrice: 18.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Palm Oil & Oils",
      brand: "Golden Penny",
      rating: 4.6,
      reviews: 89,
      inStock: true,
      origin: "Cross River, Nigeria",
      localName: "Mmanu Nkwu",
      discount: 16,
      isOrganic: true,
      isHalal: true,
      tags: ["Organic", "Pure", "Traditional"],
      popularity: 87,
      relatedProducts: [1, 3],
      frequentlyBoughtWith: [1, 15],
    },
    {
      id: 3,
      name: "Dried Stockfish (Large)",
      description: "Premium quality dried stockfish, perfect for Nigerian soups",
      price: 45.99,
      originalPrice: 52.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Dried Fish",
      brand: "Ocean Fresh",
      rating: 4.9,
      reviews: 67,
      inStock: false,
      origin: "Norwegian Waters",
      localName: "Okporoko",
      discount: 13,
      isOrganic: false,
      isHalal: true,
      tags: ["Premium", "Large Size", "Protein Rich"],
      popularity: 78,
      relatedProducts: [15, 16],
      frequentlyBoughtWith: [2, 15],
    },
    {
      id: 10,
      name: "Nigerian Curry Powder (100g)",
      description: "Authentic Nigerian curry blend with rich flavors",
      price: 4.99,
      originalPrice: 5.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Spices & Seasonings",
      brand: "Mama Gold",
      rating: 4.7,
      reviews: 56,
      inStock: true,
      origin: "Lagos, Nigeria",
      localName: "Curry Powder",
      discount: 17,
      isOrganic: false,
      isHalal: true,
      tags: ["Spicy", "Traditional"],
      popularity: 82,
      relatedProducts: [1, 15],
      frequentlyBoughtWith: [1, 15],
    },
    {
      id: 15,
      name: "Egusi Seeds (500g)",
      description: "Premium ground melon seeds for Nigerian egusi soup",
      price: 9.99,
      originalPrice: 11.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Spices & Seasonings",
      brand: "Golden Penny",
      rating: 4.8,
      reviews: 112,
      inStock: true,
      origin: "Nigeria",
      localName: "Egusi",
      discount: 17,
      isOrganic: true,
      isHalal: true,
      tags: ["Soup", "Traditional"],
      popularity: 90,
      relatedProducts: [1, 2, 3],
      frequentlyBoughtWith: [2, 3],
    },
    {
      id: 16,
      name: "Dried Crayfish (250g)",
      description: "Sun-dried crayfish for authentic Nigerian soups and stews",
      price: 12.99,
      originalPrice: 14.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Dried Fish",
      brand: "Ocean Fresh",
      rating: 4.7,
      reviews: 78,
      inStock: true,
      origin: "Nigeria",
      localName: "Crayfish",
      discount: 13,
      isOrganic: false,
      isHalal: true,
      tags: ["Soup", "Protein"],
      popularity: 85,
      relatedProducts: [3, 15],
      frequentlyBoughtWith: [3, 15],
    },
  ],
  india: [
    {
      id: 4,
      name: "Basmati Rice Premium (5kg)",
      description: "Aged basmati rice with long grains and aromatic fragrance",
      price: 24.99,
      originalPrice: 29.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Basmati Rice",
      brand: "India Gate",
      rating: 4.7,
      reviews: 203,
      inStock: true,
      origin: "Punjab, India",
      localName: "बासमती चावल",
      discount: 17,
      isOrganic: false,
      isHalal: true,
      tags: ["Aged", "Aromatic", "Long Grain"],
      popularity: 94,
      relatedProducts: [5, 6, 11],
      frequentlyBoughtWith: [5, 11],
    },
    {
      id: 5,
      name: "Garam Masala Powder (100g)",
      description: "Traditional blend of roasted spices for authentic Indian cuisine",
      price: 6.99,
      originalPrice: 8.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Spices & Masalas",
      brand: "MDH",
      rating: 4.8,
      reviews: 156,
      inStock: true,
      origin: "Delhi, India",
      localName: "गरम मसाला",
      discount: 22,
      isOrganic: true,
      isHalal: true,
      tags: ["Traditional", "Aromatic", "Organic"],
      popularity: 91,
      relatedProducts: [4, 6, 11],
      frequentlyBoughtWith: [4, 11],
    },
    {
      id: 6,
      name: "Toor Dal (Split Pigeon Peas) 1kg",
      description: "High-quality split pigeon peas, essential for Indian cooking",
      price: 4.99,
      originalPrice: 6.49,
      image: "/placeholder.svg?height=300&width=300",
      category: "Lentils & Dals",
      brand: "Tata",
      rating: 4.5,
      reviews: 98,
      inStock: true,
      origin: "Maharashtra, India",
      localName: "तूर दाल",
      discount: 23,
      isOrganic: false,
      isHalal: true,
      tags: ["Protein Rich", "Traditional", "Bulk Pack"],
      popularity: 88,
      relatedProducts: [4, 5, 11],
      frequentlyBoughtWith: [4, 5],
    },
    {
      id: 11,
      name: "Turmeric Powder (100g)",
      description: "Pure ground turmeric with intense color and flavor",
      price: 3.99,
      originalPrice: 4.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Spices & Masalas",
      brand: "MDH",
      rating: 4.9,
      reviews: 187,
      inStock: true,
      origin: "India",
      localName: "हल्दी",
      discount: 20,
      isOrganic: true,
      isHalal: true,
      tags: ["Organic", "Essential"],
      popularity: 96,
      relatedProducts: [4, 5, 6],
      frequentlyBoughtWith: [5, 6],
    },
  ],
  ghana: [
    {
      id: 7,
      name: "Plantain Flour (1kg)",
      description: "Ground plantain flour for traditional Ghanaian dishes",
      price: 12.99,
      originalPrice: 15.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Plantain Products",
      brand: "Nkulenu",
      rating: 4.6,
      reviews: 78,
      inStock: true,
      origin: "Ashanti Region, Ghana",
      localName: "Plantain Flour",
      discount: 19,
      isOrganic: true,
      isHalal: true,
      tags: ["Gluten Free", "Traditional", "Organic"],
      popularity: 83,
      relatedProducts: [12, 13],
      frequentlyBoughtWith: [12, 13],
    },
    {
      id: 12,
      name: "Palm Nut Soup Base (400g)",
      description: "Ready-to-use palm nut soup base for authentic Ghanaian soups",
      price: 8.99,
      originalPrice: 10.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Soups & Sauces",
      brand: "Nkulenu",
      rating: 4.7,
      reviews: 65,
      inStock: true,
      origin: "Ghana",
      localName: "Palm Nut Soup",
      discount: 18,
      isOrganic: false,
      isHalal: true,
      tags: ["Ready-to-use", "Traditional"],
      popularity: 80,
      relatedProducts: [7, 13],
      frequentlyBoughtWith: [7, 13],
    },
    {
      id: 13,
      name: "Gari (Fine) 1kg",
      description: "Fine cassava flour, a staple in Ghanaian cuisine",
      price: 6.99,
      originalPrice: 8.49,
      image: "/placeholder.svg?height=300&width=300",
      category: "Cassava Products",
      brand: "Ayoola",
      rating: 4.5,
      reviews: 92,
      inStock: true,
      origin: "Ghana",
      localName: "Gari",
      discount: 18,
      isOrganic: true,
      isHalal: true,
      tags: ["Staple", "Traditional"],
      popularity: 89,
      relatedProducts: [7, 12],
      frequentlyBoughtWith: [7, 12],
    },
  ],
  jamaica: [
    {
      id: 8,
      name: "Scotch Bonnet Pepper Sauce",
      description: "Authentic Jamaican hot sauce made with scotch bonnet peppers",
      price: 7.99,
      originalPrice: 9.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Hot Sauces",
      brand: "Walkerswood",
      rating: 4.9,
      reviews: 145,
      inStock: true,
      origin: "St. Ann, Jamaica",
      localName: "Scotch Bonnet Sauce",
      discount: 20,
      isOrganic: false,
      isHalal: true,
      tags: ["Spicy", "Authentic", "Traditional"],
      popularity: 92,
      relatedProducts: [14],
      frequentlyBoughtWith: [14],
    },
    {
      id: 14,
      name: "Jamaican Jerk Seasoning (100g)",
      description: "Authentic blend of Jamaican spices for perfect jerk dishes",
      price: 9.99,
      originalPrice: 11.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Spices & Seasonings",
      brand: "Walkerswood",
      rating: 4.8,
      reviews: 132,
      inStock: true,
      origin: "Jamaica",
      localName: "Jerk Seasoning",
      discount: 17,
      isOrganic: false,
      isHalal: true,
      tags: ["Spicy", "BBQ", "Traditional"],
      popularity: 93,
      relatedProducts: [8],
      frequentlyBoughtWith: [8],
    },
  ],
  uk: [
    {
      id: 9,
      name: "International Spice Collection",
      description: "Curated collection of spices from around the world",
      price: 34.99,
      originalPrice: 44.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "International Mix",
      brand: "Tesco Finest",
      rating: 4.4,
      reviews: 67,
      inStock: true,
      origin: "Various Countries",
      localName: "World Spice Mix",
      discount: 22,
      isOrganic: true,
      isHalal: true,
      tags: ["Premium", "Collection", "International"],
      popularity: 86,
      relatedProducts: [5, 10, 11, 14],
      frequentlyBoughtWith: [5, 11],
    },
  ],
}

// Flatten all products into a single array
const allProducts = Object.values(productData).flat()

interface RecommendationOptions {
  productId?: number
  country: string
  category?: string
  type: "related" | "popular" | "recently-viewed" | "frequently-bought-together" | "you-might-like"
  limit?: number
}

export function useRecommendations() {
  const [recentlyViewed, setRecentlyViewed] = useLocalStorage<number[]>("recently-viewed", [])
  const [userPreferences, setUserPreferences] = useLocalStorage<{
    categories: Record<string, number>
    tags: Record<string, number>
    countries: Record<string, number>
  }>("user-preferences", {
    categories: {},
    tags: {},
    countries: {},
  })

  // Track product view
  const trackProductView = useCallback(
    (productId: number) => {
      const product = allProducts.find((p) => p.id === productId)
      if (!product) return

      // Update recently viewed
      setRecentlyViewed((prev) => {
        const newViewed = prev.filter((id) => id !== productId)
        return [productId, ...newViewed].slice(0, 20) // Keep last 20 viewed products
      })

      // Update preferences
      setUserPreferences((prev) => {
        const newPrefs = { ...prev }

        // Increment category preference
        if (product.category) {
          newPrefs.categories = {
            ...newPrefs.categories,
            [product.category]: (newPrefs.categories[product.category] || 0) + 1,
          }
        }

        // Increment tag preferences
        if (product.tags) {
          product.tags.forEach((tag) => {
            newPrefs.tags = {
              ...newPrefs.tags,
              [tag]: (newPrefs.tags[tag] || 0) + 1,
            }
          })
        }

        // Find country for this product
        const productCountry = Object.entries(productData).find(([_, products]) =>
          products.some((p) => p.id === productId),
        )?.[0]

        if (productCountry) {
          newPrefs.countries = {
            ...newPrefs.countries,
            [productCountry]: (newPrefs.countries[productCountry] || 0) + 1,
          }
        }

        return newPrefs
      })
    },
    [setRecentlyViewed, setUserPreferences],
  )

  // Get recommendations based on options
  const getRecommendations = useCallback(
    async ({ productId, country, category, type, limit = 4 }: RecommendationOptions) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Get country products
      const countryProducts = productData[country as keyof typeof productData] || []
      let recommendations: any[] = []

      switch (type) {
        case "related":
          if (productId) {
            const product = allProducts.find((p) => p.id === productId)
            if (product?.relatedProducts) {
              // Get products by IDs from relatedProducts array
              recommendations = product.relatedProducts
                .map((id) => allProducts.find((p) => p.id === id))
                .filter(Boolean)
            } else {
              // Fallback to same category products
              recommendations = countryProducts.filter(
                (p) => p.id !== productId && p.category === category && p.inStock,
              )
            }
          }
          break

        case "popular":
          // Sort by popularity and get top products
          recommendations = [...countryProducts]
            .filter((p) => p.inStock)
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          break

        case "recently-viewed":
          // Get products from recently viewed IDs
          recommendations = recentlyViewed
            .map((id) => allProducts.find((p) => p.id === id))
            .filter(Boolean)
            .filter((p) => p.inStock)
          break

        case "frequently-bought-together":
          if (productId) {
            const product = allProducts.find((p) => p.id === productId)
            if (product?.frequentlyBoughtWith) {
              // Get products by IDs from frequentlyBoughtWith array
              recommendations = product.frequentlyBoughtWith
                .map((id) => allProducts.find((p) => p.id === id))
                .filter(Boolean)
            }
          }
          break

        case "you-might-like":
          // Get top categories and tags from user preferences
          const topCategories = Object.entries(userPreferences.categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category]) => category)

          const topTags = Object.entries(userPreferences.tags)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tag]) => tag)

          // Score products based on matching categories and tags
          const scoredProducts = allProducts
            .filter((p) => p.inStock)
            .map((product) => {
              let score = 0
              // Score by category match
              if (topCategories.includes(product.category)) {
                score += 5
              }
              // Score by tag matches
              if (product.tags) {
                product.tags.forEach((tag) => {
                  if (topTags.includes(tag)) {
                    score += 2
                  }
                })
              }
              // Boost products from preferred countries
              const productCountry = Object.entries(productData).find(([_, products]) =>
                products.some((p) => p.id === product.id),
              )?.[0]
              if (productCountry && userPreferences.countries[productCountry]) {
                score += userPreferences.countries[productCountry]
              }
              return { ...product, score }
            })

          // Sort by score and get top products
          recommendations = scoredProducts.sort((a, b) => b.score - a.score)
          break

        default:
          recommendations = countryProducts.filter((p) => p.inStock)
      }

      // Filter out current product if provided
      if (productId) {
        recommendations = recommendations.filter((p) => p.id !== productId)
      }

      // Limit results
      return recommendations.slice(0, limit)
    },
    [recentlyViewed, userPreferences],
  )

  return {
    trackProductView,
    getRecommendations,
    recentlyViewed,
  }
}
