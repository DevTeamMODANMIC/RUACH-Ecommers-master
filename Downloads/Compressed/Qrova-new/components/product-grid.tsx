"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Eye, ShoppingCart, Heart } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"
import { useWishlist, type WishlistItem } from "@/hooks/use-wishlist"
import ProductDetailModal from "@/components/product-detail-modal"
import { Product as ProductType } from "@/types" // Import the Product type from types with an alias

interface Product {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  discount?: number
  images?: string[]
  category?: string
  displayCategory?: string
  rating?: number
  reviewCount?: number
  bestseller?: boolean
  new?: boolean
  popular?: boolean
  outOfStock?: boolean
  inStock?: boolean
  origin?: string
}

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
}

export default function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discount 
        ? product.price * (1 - product.discount / 100) 
        : product.price,
      image: product.images?.[0] || "/placeholder.jpg",
      quantity: 1
    });
  };

  const handleProductClick = (product: Product, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    // Create a properly typed product for the modal
    const productForModal: any = {
      id: product.id,
      name: product.name,
      description: product.description || "No description available",
      price: product.price,
      category: product.category || "General",
      origin: product.origin || "Unknown",
      inStock: product.inStock !== false && !product.outOfStock,
      images: product.images || [],
    };
    
    // Add optional properties if they exist
    if (product.discount !== undefined) productForModal.discount = product.discount;
    if (product.rating !== undefined) productForModal.rating = product.rating;
    
    setSelectedProduct(productForModal);
    setIsModalOpen(true);
  };

  const handleToggleWishlist = (product: Product, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    const wishlistItem: WishlistItem = {
      id: product.id,
      name: product.name,
      price: product.discount ? product.price * (1 - product.discount / 100) : product.price,
      originalPrice: product.discount ? product.price : undefined,
      image: product.images?.[0] || "/placeholder.jpg",
      category: product.category || product.displayCategory,
      inStock: product.inStock !== false && !product.outOfStock
    };
    
    toggleWishlist(wishlistItem);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden border border-gray-200">
            <div className="aspect-square bg-gray-100 relative">
              <div className="absolute inset-0 animate-pulse bg-gray-200" />
            </div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse mb-4 w-1/2" />
              <div className="h-5 bg-gray-200 rounded animate-pulse w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">No products found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <Card
            key={product.id}
            className="group relative overflow-hidden border-gray-200 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2 bg-white rounded-2xl"
            onMouseEnter={() => setHoveredProductId(product.id)}
            onMouseLeave={() => setHoveredProductId(null)}
          >
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-2xl">
              <div
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={(e) => handleProductClick(product, e)}
              >
                {product.outOfStock && (
                  <div className="absolute top-4 left-0 z-20 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-4 py-2 rounded-r-xl shadow-lg">
                    Out of Stock
                  </div>
                )}

                {product.discount && (
                  <div className="absolute top-4 right-4 z-20 bg-gradient-to-br from-red-500 to-rose-600 text-white text-sm font-bold px-3 py-2 rounded-xl shadow-lg">
                    -{product.discount}%
                  </div>
                )}

                {product.bestseller && (
                  <div className="absolute top-4 left-4 z-20">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg px-3 py-1 text-xs font-bold">Bestseller</Badge>
                  </div>
                )}

                {product.new && (
                  <div className="absolute top-4 left-4 z-20">
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-lg px-3 py-1 text-xs font-bold">New</Badge>
                  </div>
                )}
              </div>
            
              <Image
                src={product.images?.[0] || "/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-contain p-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.jpg";
                }}
              />
              
              {/* Wishlist button */}
              <div className="absolute top-3 right-3 z-20">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-gray-500 hover:text-rose-500 shadow-lg hover:shadow-xl transition-all hover:scale-110"
                  onClick={(e) => handleToggleWishlist(product, e)}
                >
                  <Heart
                    className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                  <span className="sr-only">Toggle wishlist</span>
                </Button>
              </div>

              {/* Hover actions */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent flex items-center justify-center gap-3 transition-opacity duration-300 ${hoveredProductId === product.id ? 'opacity-100' : 'opacity-0'}`}>
                <button
                  onClick={(e) => handleProductClick(product, e)}
                  className="w-12 h-12 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-lg hover:shadow-xl hover:scale-110"
                  aria-label="View product details"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className="w-12 h-12 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-lg hover:shadow-xl hover:scale-110"
                  aria-label="Add to cart"
                  disabled={product.outOfStock}
                >
                  <ShoppingCart className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <CardContent className="p-5">
              <div
                className="cursor-pointer"
                onClick={(e) => handleProductClick(product, e)}
              >
                <h3 className="font-semibold text-base hover:text-emerald-600 transition-colors line-clamp-2 min-h-[3rem]">
                  {product.name}
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-wide">{product.displayCategory || product.category}</p>

              {product.rating !== undefined && product.rating > 0 && (
                <div className="flex items-center mt-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < Math.floor(product.rating!)
                            ? "text-amber-400 fill-amber-400"
                            : i < product.rating!
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {product.reviewCount && (
                    <span className="text-xs text-gray-500 ml-2 font-medium">
                      ({product.reviewCount})
                    </span>
                  )}
                </div>
              )}

              <div className="mt-4">
                {product.discount ? (
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-xl text-emerald-600">
                      {formatCurrency(product.price * (1 - product.discount / 100))}
                    </span>
                    <span className="text-sm text-gray-400 line-through font-medium">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="font-bold text-xl text-gray-900">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
            </CardContent>

            <CardFooter className="p-5 pt-0">
              <Button
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all rounded-xl"
                size="default"
                onClick={(e) => handleAddToCart(product, e)}
                disabled={product.outOfStock}
              >
                {product.outOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}