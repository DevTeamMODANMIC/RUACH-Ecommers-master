"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Minus, Plus, Star, Share2, ChevronLeft, ChevronRight, Package, Truck, Shield, Award } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { useWishlist, type WishlistItem } from "@/hooks/use-wishlist"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Product } from "@/types"
import CloudinaryImage from "@/components/cloudinary-image"

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  // Reset selected image and quantity when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(0)
      setQuantity(1)
    }
  }, [product?.id])

  if (!product) return null

  // Calculate discounted price if applicable
  const discountedPrice = product.discount && product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : null

  // Mock data for enhanced features
  const stockQuantity = Math.floor(Math.random() * 50) + 5
  const maxStockQuantity = 100
  const stockPercentage = (stockQuantity / maxStockQuantity) * 100
  const isOutOfStock = !product.inStock

  const mockReviews = [
    { id: 1, name: "Sarah M.", rating: 5, comment: "Excellent quality and fast delivery!", date: "2024-01-15" },
    { id: 2, name: "John D.", rating: 4, comment: "Good product, exactly as described.", date: "2024-01-10" },
    { id: 3, name: "Emma L.", rating: 5, comment: "Love this! Will definitely order again.", date: "2024-01-08" }
  ]

  const averageRating = product.rating || 4.5
  const totalReviews = (product.reviews && product.reviews.length) || mockReviews.length

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: discountedPrice || product.price,
      image: product.cloudinaryImages?.[selectedImage]?.url ||
             product.images?.[selectedImage] ||
             product.images?.[0] ||
             "/placeholder.jpg",
      quantity
    })
  }

  const handleToggleWishlist = () => {
    const wishlistItem: WishlistItem = {
      id: product.id,
      name: product.name,
      price: discountedPrice || product.price,
      originalPrice: discountedPrice ? product.price : undefined,
      image: product.cloudinaryImages?.[0]?.url ||
             product.images?.[0] ||
             "/placeholder.jpg",
      category: product.category || product.displayCategory,
      inStock: product.inStock
    }

    toggleWishlist(wishlistItem)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || `Check out ${product.name}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, stockQuantity))
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1)

  const nextImage = () => {
    const images = product.cloudinaryImages || product.images || []
    if (images.length > 1) {
      setSelectedImage((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    const images = product.cloudinaryImages || product.images || []
    if (images.length > 1) {
      setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[360px] max-h-[520px] w-[340px] h-[500px] overflow-hidden p-0 flex flex-col shadow-2xl border-0">
        <div className="flex flex-col h-full bg-white rounded-lg">
          {/* Clean Header */}
          <DialogHeader className="p-3 pb-2 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight truncate pr-2">
                  {product.name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-600">{product.displayCategory || product.category}</span>
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(averageRating)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">({totalReviews})</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  className="h-7 w-7 text-gray-400 hover:text-gray-600"
                >
                  <Share2 className="h-3 w-3" />
                </Button>
                <DialogClose className="h-7 w-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50" />
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-3 space-y-3">
              {/* Image Section */}
              <div className="space-y-3">
                <div className="relative h-40 overflow-hidden rounded-lg bg-gray-50">
                  {product.cloudinaryImages && product.cloudinaryImages.length > 0 ? (
                    <CloudinaryImage
                      publicId={product.cloudinaryImages[selectedImage].publicId}
                      alt={product.cloudinaryImages[selectedImage].alt || product.name}
                      size="medium"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Image
                      src={product.images?.[selectedImage] || "/product_images/unknown-product.jpg"}
                      alt={product.name}
                      fill
                      className="object-contain p-3"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/product_images/unknown-product.jpg";
                      }}
                    />
                  )}

                  {/* Badges */}
                  {!product.inStock && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Out of Stock
                    </div>
                  )}

                  {product.discount && product.discount > 0 && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      -{product.discount}%
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {(product.cloudinaryImages || product.images || []).length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {product.cloudinaryImages?.map((img, index) => (
                      <button
                        key={img.publicId}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-12 h-12 rounded border-2 transition-all ${
                          selectedImage === index ? 'border-emerald-500' : 'border-gray-200'
                        }`}
                      >
                        <CloudinaryImage
                          publicId={img.publicId}
                          alt={img.alt || `${product.name} ${index + 1}`}
                          size="small"
                          className="w-full h-full object-cover rounded"
                        />
                      </button>
                    )) || product.images?.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-12 h-12 rounded border-2 transition-all ${
                          selectedImage === index ? 'border-emerald-500' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover rounded"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                {/* Price */}
                <div className="space-y-2">
                  {discountedPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(discountedPrice)}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(product.price)}
                    </span>
                  )}

                  {/* Stock Status */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Stock:</span>
                    <span className={product.inStock ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                      {product.inStock ? `${stockQuantity} available` : 'Out of stock'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Key Features */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Truck className="h-3 w-3 text-emerald-500" />
                    <span>Free delivery</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-emerald-500" />
                    <span>Quality guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Bottom Actions */}
          <div className="p-5 pt-4 border-t border-gray-100 flex-shrink-0 bg-gray-50">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-8 w-8 rounded-l-md rounded-r-none"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="h-8 px-3 flex items-center justify-center bg-white text-sm font-medium min-w-[2rem]">
                  {quantity}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={quantity >= stockQuantity}
                  className="h-8 w-8 rounded-r-md rounded-l-none"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>

              <Button
                variant="outline"
                onClick={handleToggleWishlist}
                className="h-10 px-4 border-gray-200 hover:bg-gray-50"
              >
                <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}