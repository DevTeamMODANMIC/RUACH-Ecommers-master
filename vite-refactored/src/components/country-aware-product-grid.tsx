

import { useState, useEffect } from "react"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Star, Eye, MapPin, AlertCircle } from "lucide-react"
import { useCurrency } from "@/components/currency-provider"
import { useCountry } from "@/components/country-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { BulkOrderButton } from "@/components/bulk-order-button"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Enhanced product data with country availability
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
      availableCountries: ["nigeria", "uk", "ghana"],
      shippingRestrictions: [],
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
      availableCountries: ["nigeria"],
      shippingRestrictions: ["Temperature sensitive"],
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
      availableCountries: ["nigeria", "uk"],
      shippingRestrictions: ["Perishable"],
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
      availableCountries: ["india", "uk"],
      shippingRestrictions: [],
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
      availableCountries: ["india", "uk"],
      shippingRestrictions: [],
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
      availableCountries: ["india"],
      shippingRestrictions: [],
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
      availableCountries: ["ghana"],
      shippingRestrictions: [],
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
      availableCountries: ["jamaica", "uk"],
      shippingRestrictions: ["Liquid restrictions may apply"],
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
      availableCountries: ["uk"],
      shippingRestrictions: [],
    },
  ],
}

interface CountryAwareProductGridProps {
  category?: string
  priceRange?: number[]
  sortBy?: string
  showCountryFilter?: boolean
}

export function CountryAwareProductGrid({
  category = "all",
  priceRange = [0, 1000],
  sortBy = "popularity",
  showCountryFilter = true,
}: CountryAwareProductGridProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState<number[]>([])
  const { formatPrice } = useCurrency()
  const { selectedCountry } = useCountry()

  useEffect(() => {
    // Simulate loading
    setLoading(true)
    setTimeout(() => {
      let countryProducts = productData[selectedCountry.id as keyof typeof productData] || []

      // Add products available in multiple countries
      Object.values(productData).forEach((countryProductList) => {
        countryProductList.forEach((product) => {
          if (
            product.availableCountries.includes(selectedCountry.id) &&
            !countryProducts.find((p) => p.id === product.id)
          ) {
            countryProducts.push(product)
          }
        })
      })

      // Filter by category
      if (category !== "all") {
        countryProducts = countryProducts.filter((product) =>
          product.category.toLowerCase().includes(category.toLowerCase()),
        )
      }

      // Filter by price range
      countryProducts = countryProducts.filter(
        (product) => product.price >= priceRange[0] && product.price <= priceRange[1],
      )

      // Sort products
      countryProducts.sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name)
          case "name-desc":
            return b.name.localeCompare(a.name)
          case "price":
            return a.price - b.price
          case "price-desc":
            return b.price - a.price
          case "popularity":
            return b.reviews - a.reviews
          case "newest":
            return b.id - a.id
          default:
            return 0
        }
      })

      setProducts(countryProducts)
      setLoading(false)
    }, 800)
  }, [selectedCountry.id, category, priceRange, sortBy])

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Country-specific info */}
      {showCountryFilter && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Showing products available in <strong>{selectedCountry.name}</strong>. Prices displayed in{" "}
            <strong>{selectedCountry.currency}</strong>. Free shipping on orders over{" "}
            <strong>
              {formatPrice(selectedCountry.shippingInfo.freeShippingThreshold / selectedCountry.exchangeRate)}
            </strong>
            .
          </AlertDescription>
        </Alert>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {products.length} products available in {selectedCountry.name}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <Button variant="outline" size="sm">
            Grid
          </Button>
          <Button variant="ghost" size="sm">
            List
          </Button>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            No products found for {selectedCountry.name} matching your criteria
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Try selecting a different country or adjusting your filters
          </p>
          <Button variant="outline">Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.discount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        -{product.discount}%
                      </Badge>
                    )}
                    {product.isOrganic && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Organic
                      </Badge>
                    )}
                    {product.isHalal && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        Halal
                      </Badge>
                    )}
                    {!product.availableCountries.includes(selectedCountry.id) && (
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                        Import
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => toggleWishlist(product.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${wishlist.includes(product.id) ? "fill-red-500 text-red-500" : ""}`}
                      />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8" asChild>
                      <Link href={`/products/${product.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Stock Status */}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary" className="bg-gray-800 text-white">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Brand & Origin */}
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {product.brand}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {product.origin}
                    </div>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                    <Link href={`/products/${product.id}`}>{product.name}</Link>
                  </h3>

                  {/* Local Name */}
                  {product.localName !== product.name && (
                    <p className="text-sm text-muted-foreground mb-2 italic">{product.localName}</p>
                  )}

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  {/* Shipping Restrictions */}
                  {product.shippingRestrictions.length > 0 && (
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                        {product.shippingRestrictions[0]}
                      </Badge>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-green-600">{formatPrice(product.price)}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    className="w-full mb-2"
                    disabled={!product.inStock}
                    variant={product.inStock ? "default" : "secondary"}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                  </Button>

                  <BulkOrderButton
                    productId={product.id}
                    productName={product.name}
                    basePrice={product.price}
                    country={selectedCountry.id}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {products.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Products
          </Button>
        </div>
      )}
    </div>
  )
}
