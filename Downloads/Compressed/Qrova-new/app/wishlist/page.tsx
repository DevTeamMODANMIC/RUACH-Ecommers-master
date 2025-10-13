"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, ShoppingCart, Heart, ArrowLeft, ShoppingBag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrency } from "@/components/currency-provider"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "@/hooks/use-wishlist"

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist()
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { formatPrice } = useCurrency()
  const { addToCart } = useCart()

  useEffect(() => {
    // Simulate loading wishlist from server or localStorage
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  const handleAddToCart = (product: typeof wishlist[0]) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    })
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/profile">My Account</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Wishlist</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">Items you've saved for later</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          {wishlist && wishlist.length > 0 && (
            <Button 
              variant="outline" 
              onClick={clearWishlist}
            >
              Clear Wishlist
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/shop" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <Skeleton className="h-full w-full" />
              </div>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-1/3" />
                  <Skeleton className="h-10 w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : wishlist && wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <Card key={product.id} className="overflow-hidden shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 bg-white rounded-2xl border-0">
              <div className="relative h-64 w-full bg-gradient-to-br from-gray-50 to-white rounded-t-2xl">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                />
              </div>
              <CardContent className="p-6">
                <Link href={`/products/${product.id}`} className="block">
                  <h3 className="font-semibold text-lg mb-1 hover:text-green-600 transition-colors text-gray-900">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 mb-4 font-medium">{product.category}</p>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-xl text-green-600">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <span className={`text-sm px-3 py-1 rounded-full font-semibold ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.inStock === false}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-soft hover:shadow-soft-lg font-semibold"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => removeFromWishlist(product.id)}
                    className="border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-soft-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Browse our products and click the heart icon to add items to your wishlist.
            </p>
            <Link href="/shop">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-full text-lg font-bold shadow-soft-lg hover:shadow-soft-xl hover:-translate-y-1 transition-all">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      )}
      </div>
    </div>
  )
} 