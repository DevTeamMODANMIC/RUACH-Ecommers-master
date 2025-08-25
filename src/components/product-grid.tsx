

import { useState, useEffect } from "react"

import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "../../src/components/ui/card"
import { Button } from "../../src/components/ui/button"
import { Badge } from "../../src/components/ui/badge"
import { Star, Eye, ShoppingCart, Heart, X, Store, User } from "lucide-react"
import { useCart } from "../../src/components/cart-provider"
import { formatCurrency } from "../../src/lib/utils"
import { useWishlist, type WishlistItem } from "../../src/hooks/use-wishlist"
import ProductDetailModal from "../../src/components/product-detail-modal"
import { getVendor, type Vendor } from "../../src/lib/firebase-vendors"

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
}

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
}

export default function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendors, setVendors] = useState<Record<string, Vendor>>({});
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

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
    setSelectedProduct(product);
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
      inStock: product.inStock !== false && !product.outOfStock // Default to true if not specified
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
            className="group relative overflow-hidden hover:shadow-lg transition-all duration-300"
            onMouseEnter={() => setHoveredProductId(product.id)}
            onMouseLeave={() => setHoveredProductId(null)}
          >
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              <div 
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={(e) => handleProductClick(product, e)}
              >
                {product.outOfStock && (
                  <div className="absolute top-4 left-0 z-20 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-r-lg shadow-md">
                    Out of Stock
                  </div>
                )}
                
                {product.discount && (
                  <div className="absolute top-12 left-0 z-20 bg-red-500 text-white text-xs font-bold px-3 py-0.5 rounded-r-lg shadow-md">
                    -{product.discount}% OFF
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
                  className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-100 text-gray-500 hover:text-rose-500 shadow-sm"
                  onClick={(e) => handleToggleWishlist(product, e)}
                >
                  <Heart 
                    className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                  <span className="sr-only">Toggle wishlist</span>
                </Button>
              </div>
              
              {/* Hover actions */}
              <div className={`absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center gap-2 transition-opacity duration-300 ${hoveredProductId === product.id ? 'opacity-100' : 'opacity-0'}`}>
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
            </div>
            
            <CardContent className="p-4">
              <div 
                className="cursor-pointer"
                onClick={(e) => handleProductClick(product, e)}
              >
                <h3 className="font-medium text-lg hover:text-green-600 transition-colors">
                  {product.name}
                </h3>
              </div>
              <p className="text-sm text-gray-500 mt-1">{product.displayCategory || product.category}</p>
              
              {/* Vendor Information */}
              {product.vendorId && vendors[product.vendorId] && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {vendors[product.vendorId].logoUrl ? (
                      <Image
                        src={vendors[product.vendorId].logoUrl}
                        alt={vendors[product.vendorId].shopName}
                        width={16}
                        height={16}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <Store className="h-4 w-4 text-gray-400" />
                    )}
                    <Link 
                      href={`/vendor/${product.vendorId}`}
                      className="text-xs text-gray-600 hover:text-green-600 transition-colors font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {vendors[product.vendorId].shopName}
                    </Link>
                  </div>
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
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
                          i < Math.floor(product.rating) 
                            ? "text-amber-400 fill-amber-400" 
                            : i < product.rating 
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
              
              <div className="mt-2">
                {product.discount ? (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-600">
                      {formatCurrency(product.price * (1 - product.discount / 100))}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-0">
              <Button 
                className="w-full" 
                size="sm"
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
