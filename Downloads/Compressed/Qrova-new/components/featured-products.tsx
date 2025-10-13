"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star, Award, TrendingUp, ChevronRight, Heart, Sparkles, Eye, X } from "lucide-react"
import { getProducts, type Product } from "@/lib/firebase-products"
import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { useWishlist, type WishlistItem } from "@/hooks/use-wishlist"

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  // Hardcoded featured products with images from /a directory
  const featuredProducts = [
    {
      id: "coca-cola-50cl",
      name: "Coca-Cola 50cl",
      description: "Refreshing Coca-Cola soft drink in a 50cl bottle. Perfect for quenching your thirst.",
      price: 1.20,
      images: ["/product_images/beverages/coke-50cl-250x250.jpg"],
      rating: 4.8,
      reviewCount: 245,
      bestseller: true,
      category: "Beverages"
    },
    {
      id: "fanta-50cl",
      name: "Fanta Orange 50cl",
      description: "Vibrant orange-flavored Fanta soft drink in a 50cl bottle. Sweet, fizzy, and refreshing.",
      price: 1.20,
      images: ["/product_images/beverages/Fanta-PET-Bottles-50cl.jpg"],
      rating: 4.6,
      reviewCount: 189,
      new: true,
      category: "Beverages",
      discount: 10
    },
    {
      id: "aani-basmati-rice",
      name: "Aani Basmati Rice",
      description: "Premium Aani Basmati Rice - 10kg. Aromatic long grain rice perfect for special meals.",
      price: 19.99,
      images: ["/product_images/rice/Aani-Basmatic-rice-10kg-4-250x250.jpg"],
      rating: 4.9,
      reviewCount: 31,
      category: "Rice & Grains"
    },
    {
      id: "ayoola-pounded-yam",
      name: "Ayoola Pounded Yam Flour",
      description: "Authentic Ayoola Pounded Yam Flour. Easy to prepare, smooth texture with authentic taste.",
      price: 8.99,
      images: ["/product_images/flour/Ayoola-pounded-yam-250x250.jpg"],
      rating: 4.8,
      reviewCount: 26,
      popular: true,
      category: "Flour"
    },
    {
      id: "cat-fish",
      name: "Cat Fish",
      description: "Fresh Cat Fish. Perfect for traditional Nigerian fish stews and soups.",
      price: 9.99,
      images: ["/product_images/meat/Cat-fish-250x250.jpg"],
      rating: 4.8,
      reviewCount: 17,
      category: "Meat & Fish"
    },
    {
      id: "everyday-seasoning",
      name: "Everyday Seasoning",
      description: "All-purpose Everyday Seasoning blend. Perfect for enhancing the flavor of any dish.",
      price: 4.50,
      images: ["/product_images/spices/Everyday-seasoning-250x250.jpg"],
      rating: 4.8,
      reviewCount: 28,
      bestseller: true,
      category: "Spices & Seasonings"
    },
    {
      id: "cerelac-honey-wheat",
      name: "Cerelac Honey and Wheat",
      description: "Cerelac Honey and Wheat baby food - 1kg. Nutritious baby cereal with honey and wheat.",
      price: 8.99,
      images: ["/product_images/food/Cerelac-Honey-and-wheat-1kg-1-250x250.jpg"],
      rating: 4.8,
      reviewCount: 24,
      category: "Food"
    },
    {
      id: "bitter-leaf",
      name: "Bitter Leaf",
      description: "Fresh Bitter Leaf. Essential ingredient for traditional Nigerian soups and stews.",
      price: 3.50,
      images: ["/product_images/vegetables/Bitter-leaf-250x250.jpg"],
      rating: 4.6,
      reviewCount: 12,
      new: true,
      category: "Vegetables & Fruits"
    }
  ]
  
  useEffect(() => {
    // Use hardcoded products instead of fetching
    setProducts(featuredProducts as unknown as Product[])
    setLoading(false)
    console.log("Featured products loaded from /a directory")
  }, [])
  
  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discount ? 
        product.price * (1 - product.discount / 100) : 
        product.price,
      image: product.images?.[0] || "/placeholder.jpg",
      quantity: 1
    });
  };

  const handleQuickView = (product: Product, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setQuickViewProduct(product);
  };

  const handleToggleWishlist = (product: Product, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    const wishlistItem: WishlistItem = {
      id: product.id,
      name: product.name,
      price: product.discount ? product.price * (1 - product.discount / 100) : product.price,
      originalPrice: product.discount ? product.price : undefined,
      image: product.images?.[0] || "/placeholder.jpg",
      category: product.category,
      inStock: product.inStock !== false // Default to true if not specified
    };
    
    toggleWishlist(wishlistItem);
  };
  
  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse border border-gray-200 rounded-xl overflow-hidden bg-white">
                <div className="h-60 bg-gray-100" />
                <CardContent className="pt-4">
                  <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-5/6" />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="h-5 bg-gray-100 rounded w-1/4" />
                  <div className="h-9 bg-gray-100 rounded w-1/3" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-16 bg-white text-gray-900">
        <div className="flex flex-col items-center mb-12 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Handpicked Selection</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">Featured Products</h2>
          <p className="text-gray-600 text-center max-w-2xl leading-relaxed">
            Discover our curated selection of premium African and international products, from beverages and food to spices and fresh produce.
          </p>
        </div>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group relative overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-xl bg-white"
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => setHoveredProductId(null)}
              >
                <div className="absolute right-3 top-3 z-20">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full bg-white/95 hover:bg-rose-50 text-gray-500 hover:text-rose-500 backdrop-blur-sm shadow-soft hover:shadow-soft-lg transition-all hover:scale-110"
                    onClick={(e) => handleToggleWishlist(product, e)}
                  >
                    <Heart 
                      className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : ''}`} 
                    />
                    <span className="sr-only">Add to wishlist</span>
                  </Button>
                </div>

                <Link href={`/products/${encodeURIComponent(product.id)}`} className="block">
                  <div className="relative h-60 bg-gradient-to-br from-gray-50 to-white overflow-hidden rounded-t-2xl">
                    {product.category && (
                      <div className="absolute top-3 left-3 z-10">
                        <Badge variant="secondary" className="bg-white/95 text-gray-700 hover:bg-gray-100 font-medium rounded-full shadow-soft backdrop-blur-sm">
                          {product.category}
                        </Badge>
                      </div>
                    )}
                    
                    {product.discount && (
                      <div className="absolute top-12 left-0 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-r-full shadow-soft-lg">
                        -{product.discount}% OFF
                      </div>
                    )}

                    {product.originalPrice && (
                      <div className="absolute top-12 left-0 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-r-full shadow-soft-lg">
                        SAVE £{(product.originalPrice - product.price).toFixed(2)}
                      </div>
                    )}
                    
                    {product.bestseller && (
                      <div className="absolute bottom-3 left-3 z-10">
                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-soft-lg rounded-full flex items-center gap-1.5 px-3 py-1.5">
                          <TrendingUp className="h-3 w-3" />
                          Bestseller
                        </Badge>
                      </div>
                    )}
                    
                    {product.new && (
                      <div className="absolute bottom-3 left-3 z-10">
                        <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-soft-lg rounded-full px-3 py-1.5">
                          New Arrival
                        </Badge>
                      </div>
                    )}
                    
                    {product.popular && (
                      <div className="absolute bottom-3 left-3 z-10">
                        <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-soft-lg rounded-full flex items-center gap-1.5 px-3 py-1.5">
                          <Award className="h-3 w-3" />
                          Top Rated
                        </Badge>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-0" />
                    
                    <Image
                      src={product.images?.[0] || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-contain p-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      onError={(e) => {
                        console.error(`Failed to load image: ${product.images?.[0]}`);
                        const imgElement = e.currentTarget as HTMLImageElement;
                        imgElement.src = "/placeholder.jpg";
                        imgElement.onerror = null;
                      }}
                    />
                    
                    {/* Hover action buttons */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-center justify-center gap-3 transition-opacity duration-300 ${hoveredProductId === product.id ? 'opacity-100' : 'opacity-0'}`}>
                      <button 
                        onClick={(e) => handleQuickView(product, e)}
                        className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-soft-lg hover:scale-110"
                        aria-label="Quick view"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={(e) => handleAddToCart(product, e)}
                        className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-soft-lg hover:scale-110"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </Link>
                
                <CardContent className="pt-5 px-5 pb-4">
                  <Link href={`/products/${encodeURIComponent(product.id)}`} className="block">
                    <h3 className="font-semibold text-base leading-relaxed line-clamp-2 min-h-[3rem] group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  
                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center mt-3 bg-gray-50 rounded-full px-3 py-1.5 w-fit">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3.5 w-3.5 ${
                              i < Math.floor(product.rating ?? 0) 
                                ? "text-amber-400 fill-amber-400" 
                                : i < (product.rating ?? 0)
                                  ? "text-amber-400 fill-amber-400" 
                                  : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 ml-2 font-medium">
                        ({product.reviewCount})
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex items-center justify-between px-5 pb-5 pt-0">
                  <div className="flex flex-col">
                    {product.discount ? (
                      <>
                        <span className="font-bold text-green-600 text-xl">
                          {formatCurrency(product.price * (1 - product.discount / 100))}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {formatCurrency(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-green-600 text-xl">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            No featured products available at the moment.
          </div>
        )}
        
        <div className="flex justify-center mt-12">
          <Link 
            href="/shop" 
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-4 rounded-full transition-all shadow-soft-lg hover:shadow-soft-xl hover:-translate-y-1 text-lg"
          >
            Browse All Products
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Quick View Modal */}
      <Dialog open={quickViewProduct !== null} onOpenChange={(isOpen) => !isOpen && setQuickViewProduct(null)}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{quickViewProduct?.name}</DialogTitle>
            <DialogClose className="absolute right-4 top-4">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>

          {quickViewProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={quickViewProduct.images?.[0] || "/placeholder.jpg"}
                  alt={quickViewProduct.name}
                  fill
                  className="object-contain p-4"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.jpg";
                  }}
                />
                
                {/* Product tags */}
                <div className="absolute top-3 left-3 z-10">
                  {quickViewProduct.category && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 mb-2 block w-fit">
                      {quickViewProduct.category}
                    </Badge>
                  )}
                  
                  {quickViewProduct.bestseller && (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm flex items-center gap-1 mb-2 block w-fit">
                      <TrendingUp className="h-3 w-3" />
                      Bestseller
                    </Badge>
                  )}
                  
                  {quickViewProduct.new && (
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm mb-2 block w-fit">
                      New Arrival
                    </Badge>
                  )}
                  
                  {quickViewProduct.popular && (
                    <Badge className="bg-purple-500 hover:bg-purple-600 text-white border-0 shadow-sm flex items-center gap-1 mb-2 block w-fit">
                      <Award className="h-3 w-3" />
                      Top Rated
                    </Badge>
                  )}
                </div>
                
                {quickViewProduct.discount && (
                  <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md">
                    -{quickViewProduct.discount}% OFF
                  </div>
                )}
              </div>
              
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold">{quickViewProduct.name}</h2>
                
                {/* Rating */}
                {quickViewProduct.rating && (
                  <div className="flex items-center mt-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < Math.floor(quickViewProduct.rating ?? 0) 
                              ? "text-amber-400 fill-amber-400" 
                              : i < (quickViewProduct.rating ?? 0)
                                ? "text-amber-400 fill-amber-400" 
                                : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      {quickViewProduct.rating} ({quickViewProduct.reviewCount} reviews)
                    </span>
                  </div>
                )}
                
                <div className="mb-4">
                  {quickViewProduct.discount ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(quickViewProduct.price * (1 - quickViewProduct.discount / 100))}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        {formatCurrency(quickViewProduct.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold">
                      {formatCurrency(quickViewProduct.price)}
                    </span>
                  )}
                </div>
                
                {quickViewProduct.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Description</h3>
                    <p className="text-gray-600">{quickViewProduct.description}</p>
                  </div>
                )}
                
                <div className="mt-auto flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => handleAddToCart(quickViewProduct)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                  
                  <button
                    onClick={() => handleToggleWishlist(quickViewProduct)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 border rounded-lg 
                    ${isInWishlist(quickViewProduct.id) 
                      ? 'border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100' 
                      : 'border-gray-300 hover:bg-gray-50'}`}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(quickViewProduct.id) ? 'fill-rose-500' : ''}`} />
                    {isInWishlist(quickViewProduct.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </button>
                  
                  <Link
                    href={`/products/${encodeURIComponent(quickViewProduct.id)}`}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
