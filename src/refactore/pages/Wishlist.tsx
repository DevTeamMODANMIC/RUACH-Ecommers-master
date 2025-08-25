import { useState, useEffect } from "react"

import Link from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Trash2, ShoppingCart, Heart, ArrowLeft } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import { Skeleton } from "../components/ui/skeleton"
import { useCurrency } from "../components/currency-provider"
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb"
import { useCart } from "../components/cart-provider"
import { useWishlist } from "../hooks/use-wishlist"

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist()
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

  const handleAddToCart = (product: typeof wishlistItems[0]) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      options: {}
    })
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    })
  }

  return (
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
          {wishlistItems.length > 0 && (
            <Button 
              variant="outline" 
              onClick={clearWishlist}
            >
              Clear Wishlist
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to="/shop" className="flex items-center">
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
      ) : wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative aspect-square w-full bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <CardContent className="p-6">
                <Link to={`/products/${product.id}`} className="block">
                  <h3 className="font-semibold text-lg mb-1 hover:text-green-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground mb-4">{product.category}</p>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-green-600">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.inStock === false}
                    className="flex-1"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => removeFromWishlist(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12">
          <Alert className="max-w-lg mx-auto">
            <div className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-muted-foreground" />
              <AlertTitle>Your wishlist is empty</AlertTitle>
            </div>
            <AlertDescription className="mt-3">
              Browse our products and click the heart icon to add items to your wishlist.
            </AlertDescription>
            <div className="mt-6">
              <Button asChild>
                <Link to="/shop">Browse Products</Link>
              </Button>
            </div>
          </Alert>
        </div>
      )}
    </div>
  )
} 