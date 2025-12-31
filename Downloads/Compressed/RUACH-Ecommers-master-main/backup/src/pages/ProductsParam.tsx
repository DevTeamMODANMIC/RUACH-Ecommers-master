import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getProduct } from "@/lib/firebase-products"
import { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight, Star, AlertCircle } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"
import { useWishlist } from "@/hooks/use-wishlist"
import CloudinaryImage from "@/components/cloudinary-image"
import { ProductReviews } from "@/components/product-reviews"
import { ReviewForm } from "@/components/review-form"
import { getVendor } from "@/lib/firebase-vendors"
import { Link } from "react-router-dom"

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [vendor, setVendor] = useState<any>(null)
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError("No product ID provided")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const productData = await getProduct(id)
        if (!productData) {
          setError("Product not found")
          return
        }
        
        // Fix the type mismatch by ensuring proper assignment
        setProduct(productData as unknown as Product)
        
        // Load vendor data if product has vendorId
        if (productData.vendorId) {
          try {
            const vendorData = await getVendor(productData.vendorId)
            setVendor(vendorData)
          } catch (vendorError) {
            console.error("Error loading vendor:", vendorError)
          }
        }
      } catch (err: any) {
        console.error("Error loading product:", err)
        setError(err.message || "Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  // Calculate discounted price if applicable
  const discountedPrice = product?.discount && product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : null

  // Get all available images (cloudinaryImages takes precedence over images)
  const allImages = product?.cloudinaryImages && product.cloudinaryImages.length > 0 
    ? product.cloudinaryImages 
    : product?.images 
      ? product.images.map((url: string, index: number) => ({ url, publicId: `image-${index}`, alt: product.name }))
      : []

  const handleAddToCart = () => {
    if (!product) return
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: discountedPrice || product.price,
      image:
        product.cloudinaryImages?.[selectedImage]?.url ||
        product.images?.[selectedImage] ||
        product.images?.[0] ||
        "/placeholder.jpg",
      quantity,
      options: {},
    })
  }

  const handleToggleWishlist = () => {
    if (!product) return
    
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: discountedPrice || product.price,
      originalPrice: discountedPrice ? product.price : undefined,
      image:
        product.cloudinaryImages?.[0]?.url ||
        product.images?.[0] ||
        "/placeholder.jpg",
      category: product.category || product.displayCategory,
      inStock: product.inStock !== false
    })
  }

  const incrementQuantity = () => setQuantity((prev) => prev + 1)
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))

  // Navigate to next image
  const nextImage = () => {
    if (allImages.length > 1) {
      setSelectedImage((prev) => (prev + 1) % allImages.length)
    }
  }

  // Navigate to previous image
  const prevImage = () => {
    if (allImages.length > 1) {
      setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length)
    }
  }

  // Select specific image
  const selectImage = (index: number) => {
    setSelectedImage(index)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Product Details</h3>
          <p className="text-gray-600">Please wait while we fetch the product information...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Product</h3>
            <p className="text-gray-600">{error}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button onClick={() => navigate(-1)} variant="outline">
              Go Back
            </Button>
            <Button onClick={() => navigate('/shop')}>
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show not found state
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Product Not Found</h3>
            <p className="text-gray-600">The requested product could not be found or is no longer available.</p>
          </div>
          <Button onClick={() => navigate('/shop')} className="mt-6">
            Browse Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Product Details</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                {product.cloudinaryImages && product.cloudinaryImages.length > 0 && allImages[selectedImage]?.publicId ? (
                  <CloudinaryImage
                    publicId={allImages[selectedImage].publicId}
                    alt={allImages[selectedImage].alt || product.name}
                    size="large"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={
                      allImages[selectedImage]?.url ||
                      "/placeholder.jpg"
                    }
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder.jpg";
                    }}
                  />
                )}

                {/* Use inStock property instead of outOfStock */}
                {product.inStock === false && (
                  <div className="absolute top-4 left-0 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-r-lg shadow-md">
                    Out of Stock
                  </div>
                )}

                {product.discount && product.discount > 0 && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-red-500 hover:bg-red-600 text-white">
                      -{product.discount}% OFF
                    </Badge>
                  </div>
                )}
              </div>

              {/* Thumbnails for multiple images */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((image: any, index: number) => (
                    <button
                      key={image.publicId || index}
                      onClick={() => selectImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                        selectedImage === index 
                          ? 'border-green-500 ring-2 ring-green-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      {image.publicId ? (
                        <CloudinaryImage
                          publicId={image.publicId}
                          alt={image.alt || product.name}
                          size="thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={image.url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder.jpg";
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                    <p className="text-gray-600 mb-4">{product.displayCategory || product.category}</p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleWishlist}
                    className="h-10 w-10"
                  >
                    <Heart 
                      className={`h-5 w-5 ${
                        isInWishlist(product.id) 
                          ? 'fill-rose-500 text-rose-500' 
                          : 'text-gray-400'
                      }`}
                    />
                  </Button>
                </div>

                {/* Vendor Info */}
                {vendor && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Sold by:</span>
                      <Link 
                        to={`/vendor/${vendor.id}`}
                        className="font-medium text-green-600 hover:text-green-700"
                      >
                        {vendor.shopName}
                      </Link>
                      <Badge variant="outline" className="text-xs">
                        Vendor
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating || 0)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      {product.rating} ({product.reviews?.count || 0} reviews)
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="mb-6">
                  {discountedPrice ? (
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-green-600">
                        {formatCurrency(discountedPrice)}
                      </span>
                      <span className="text-xl text-gray-500 line-through">
                        {formatCurrency(product.price)}
                      </span>
                      <Badge className="bg-red-500">-{product.discount}%</Badge>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-700">{product.description}</p>
                  </div>
                )}

                {/* Origin */}
                {product.origin && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Origin</h3>
                    <p className="text-gray-700">{product.origin}</p>
                  </div>
                )}
              </div>

              {/* Quantity and Add to Cart */}
              <div className="border-t pt-6">
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1 || product.inStock === false}
                      className="h-10 w-10 rounded-r-none"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="h-10 px-4 flex items-center justify-center border-y border-gray-200 bg-white text-lg font-medium">
                      {quantity}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={product.inStock === false}
                      className="h-10 w-10 rounded-l-none"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 h-12 text-base"
                    disabled={product.inStock === false}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {product.inStock === false ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ProductReviews 
                  productId={product.id} 
                  productName={product.name} 
                  availableCountries={product.availableCountries || ["nigeria", "india", "ghana", "jamaica", "uk"]} 
                />
              </div>
              <div>
                {/* We'll handle the review form differently since it's a modal */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}