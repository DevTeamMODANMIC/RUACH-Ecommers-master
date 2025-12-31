import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Eye, ShoppingCart, Heart, X, Store, User, Images } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"
import { useWishlist, type WishlistItem } from "@/hooks/use-wishlist"
import { getVendor, type Vendor } from "@/lib/firebase-vendors"

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
  vendorId?: string
  tags?: string[] // Add tags property to extract size information
}

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
}

export default function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Record<string, Vendor>>({});
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  // Fetch vendor information for products
  useEffect(() => {
    const fetchVendors = async () => {
      const vendorIds = [...new Set(products.filter(p => p.vendorId).map(p => p.vendorId!))]
      const vendorPromises = vendorIds.map(async (vendorId) => {
        try {
          const vendor = await getVendor(vendorId)
          return { vendorId, vendor }
        } catch (error) {
          console.error(`Error fetching vendor ${vendorId}:`, error)
          return { vendorId, vendor: null }
        }
      })
      
      const vendorResults = await Promise.all(vendorPromises)
      const vendorMap: Record<string, Vendor> = {}
      
      vendorResults.forEach(({ vendorId, vendor }) => {
        if (vendor) {
          vendorMap[vendorId] = vendor
        }
      })
      
      setVendors(vendorMap)
    }

    if (products.length > 0) {
      fetchVendors()
    }
  }, [products])

  // Function to extract size from product tags
  const extractSizeFromTags = (tags: string[] | undefined): string => {
    if (!tags || !Array.isArray(tags)) return "";
    
    const sizeTag = tags.find((tag: string) => tag.startsWith("size:"));
    return sizeTag ? sizeTag.replace("size:", "") : "";
  };

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    e?.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discount 
        ? product.price * (1 - product.discount / 100) 
        : product.price,
      image: product.images?.[0] || "/placeholder.jpg",
      quantity: 1,
      options: {}
    });
  };

  const handleProductClick = (product: Product, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    e?.stopPropagation();
    // Navigate to product detail page instead of opening modal
    navigate(`/products/${product.id}`);
  };

  const handleToggleWishlist = (product: Product, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    e?.stopPropagation();
    
    const wishlistItem: WishlistItem = {
      id: product.id,
      name: product.name,
      price: product.discount ? product.price * (1 - product.discount / 100) : product.price,
      originalPrice: product.discount ? product.price : undefined,
      image: product.images?.[0] || "/placeholder.jpg",
      category: product.category || product.displayCategory,
      inStock: product.inStock !== false && !product.outOfStock // Default to true if not specified
    };
    
    toggleWishlist(wishlistItem);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map(product => {
          // Extract size information from tags
          const size = extractSizeFromTags(product.tags);
          
          return (
            <Card 
              key={product.id} 
              className="group relative overflow-hidden border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all duration-200 rounded-xl bg-white flex flex-col h-full"
              onMouseEnter={() => setHoveredProductId(product.id)}
              onMouseLeave={() => setHoveredProductId(null)}
            >
              {/* Wishlist button */}
              <div className="absolute right-3 top-3 z-20">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-100 text-gray-500 hover:text-rose-500 backdrop-blur-sm shadow-sm"
                  onClick={(e) => handleToggleWishlist(product, e)}
                >
                  <Heart 
                    className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                  <span className="sr-only">Toggle wishlist</span>
                </Button>
              </div>

              <div 
                className="block cursor-pointer"
                onClick={(e) => handleProductClick(product, e)}
              >
                <div className="relative h-60 bg-white overflow-hidden">
                  {product.outOfStock && (
                    <div className="absolute top-4 left-0 z-20 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-r-lg shadow-md">
                      Out of Stock
                    </div>
                  )}
                  
                  {product.discount && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-red-500 hover:bg-red-600 text-white">
                        -{product.discount}% OFF
                      </Badge>
                    </div>
                  )}
                  
                  {product.bestseller && (
                    <div className="absolute bottom-4 left-4 z-20">
                      <Badge className="bg-amber-500 hover:bg-amber-600">Bestseller</Badge>
                    </div>
                  )}
                  
                  {product.new && (
                    <div className="absolute bottom-4 left-4 z-20">
                      <Badge className="bg-blue-500 hover:bg-blue-600">New Arrival</Badge>
                    </div>
                  )}
                  
                  {/* Multiple images indicator */}
                  {product.images && product.images.length > 1 && (
                    <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Images className="h-3 w-3" />
                      <span>{product.images.length}</span>
                    </div>
                  )}
              
                  <img
                    src={product.images?.[0] || "/placeholder.jpg"}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.jpg";
                    }}
                  />
                  
                  {/* Hover actions */}
                  {hoveredProductId === product.id && (
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center gap-2 transition-opacity duration-300">
                      <button 
                        onClick={(e) => handleProductClick(product, e)}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                        aria-label="View product details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={(e) => handleAddToCart(product, e)}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                        aria-label="Add to cart"
                        disabled={product.outOfStock}
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <CardContent className="pt-4 flex-grow">
                <div 
                  className="block cursor-pointer"
                  onClick={(e) => handleProductClick(product, e)}
                >
                  <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem] group-hover:text-green-600 transition-colors">
                    {product.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2 h-10">{product.description}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{product.displayCategory || product.category}</p>
                
                {/* Display size information if available */}
                {size && (
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">Size:</span> {size}
                  </p>
                )}
                
                {/* Vendor Information */}
                {product.vendorId && vendors[product.vendorId] && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      {vendors[product.vendorId].logoUrl ? (
                        <img
                          src={vendors[product.vendorId].logoUrl}
                          alt={vendors[product.vendorId].shopName}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      ) : (
                        <Store className="h-4 w-4 text-gray-400" />
                      )}
                      <Link 
                        to={`/vendor/${product.vendorId}`}
                        className="text-xs text-gray-600 hover:text-green-600 transition-colors font-medium line-clamp-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {vendors[product.vendorId].shopName}
                      </Link>
                    </div>
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 flex-shrink-0">
                      Vendor
                    </Badge>
                  </div>
                )}
                
                {product.rating && (
                  <div className="flex items-center mt-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
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
                      <span className="text-sm text-gray-600 ml-2">
                        ({product.reviewCount})
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex items-center justify-between pt-0 mt-auto">
                <div className="flex flex-col">
                  {product.discount ? (
                    <>
                      <span className="font-bold text-green-600 text-lg">
                        {formatCurrency(product.price * (1 - product.discount / 100))}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-gray-900 text-lg">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
}