import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, ShoppingCart, Heart, Flame, Store, Eye, X } from "lucide-react";
import { getProducts, type Product } from "@/lib/firebase-products";
import { useCart } from "@/components/cart-provider";
import { getAllOrdersNoMax } from "@/lib/firebase-orders";
import { formatCurrency } from "@/lib/utils";
import { useWishlist, type WishlistItem } from "@/hooks/use-wishlist";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { recommendProducts } from "./ML-training-tranding";

export default function TrendingProducts() {
  const navigate = useNavigate();
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadTrendingProducts = async () => {
      setLoading(true);
      try {
        // Get trending products - just get recent products for now
        const { products: allProducts } = await getProducts({}, 12);
        // maching learning based trending logic can go here
        const getAllOrdersNoMaxs = await getAllOrdersNoMax();
        const recomendation = recommendProducts(allProducts, getAllOrdersNoMaxs);
        // console.log("recomendation", recomendation);
        // just show first 8 for now 
        const getRecommendation = recomendation.map(v=>v?.product).slice(0, 8) 
        setTrendingProducts(getRecommendation);
        // setTrendingProducts(allProducts.slice(0, 8));

      } catch (error: unknown) {
        console.error("Error loading trending products:", error);
        setTrendingProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadTrendingProducts();
  }, []);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discount ? product.price * (1 - product.discount / 100) : product.price,
      image: product.images?.[0] || "/placeholder.jpg",
      quantity: 1,
      options: {}
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
      inStock: product.inStock !== false
    };
    toggleWishlist(wishlistItem);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded-md w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-md w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
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
        </div>
      </section>
    );
  }

  if (trendingProducts.length === 0) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <Flame className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Trending Products Yet</h3>
            <p className="text-gray-600 mb-6">
              Trending products will appear here once vendors start adding products and customers begin shopping.
            </p>
            <div className="space-x-4">
              <Button 
                onClick={() => navigate("/vendor/register")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Store className="h-4 w-4 mr-2" />
                Become a Vendor
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/shop")}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="h-6 w-6 text-orange-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Trending Now
            </h2>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover what's popular right now - these products are flying off our shelves!
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-4 mb-12">
          {trendingProducts.map((product, index) => (
            <Card 
              key={product.id} 
              className="group relative overflow-hidden border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all duration-200 rounded-xl bg-white flex flex-col h-full"
              onMouseEnter={() => setHoveredProductId(product.id)}
              onMouseLeave={() => setHoveredProductId(null)}
            >
              {/* Trending Badge */}
              {index < 3 && (
                <div className="absolute top-2 left-2 z-20">
                  <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                    <Flame className="h-3 w-3 mr-1" />
                    #{index + 1} Trending
                  </Badge>
                </div>
              )}

              {/* Wishlist Button */}
              <div className="absolute right-3 top-3 z-20">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-100 text-gray-500 hover:text-rose-500 backdrop-blur-sm shadow-sm"
                  onClick={(e) => handleToggleWishlist(product, e)}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                </Button>
              </div>

              {/* Product Image */}
              <div 
                className="block cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="relative h-60 bg-white overflow-hidden">
                  <img 
                    src={product.images?.[0] || "/placeholder.jpg"} 
                    alt={product.name} 
                    className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.jpg";
                    }}
                  />

                  {product.discount && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-red-500 hover:bg-red-600 text-white">
                        -{product.discount}% OFF
                      </Badge>
                    </div>
                  )}

                  {/* Hover Actions */}
                  {hoveredProductId === product.id && (
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center gap-2 transition-opacity duration-300">
                      <button
                        onClick={(e) => handleQuickView(product, e)}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
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
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem] group-hover:text-green-600 transition-colors">
                    {product.name}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                  {product.category}
                </p>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({Math.floor(Math.random() * 50) + 10} reviews)
                    </span>
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
                
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {product.inStock !== false ? "In Stock" : "Out of Stock"}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* View All Buttons */}
        <div className="text-center space-x-4">
          <Button 
            size="lg" 
            onClick={() => navigate("/shop")}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            View All Trending Products
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate("/stores")}
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            <Store className="h-5 w-5 mr-2" />
            Browse All Stores
          </Button>
        </div>
      </div>

      {/* Quick View Modal */}
      <Dialog open={quickViewProduct !== null} onOpenChange={(isOpen) => !isOpen && setQuickViewProduct(null)}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{quickViewProduct?.name}</DialogTitle>
            <DialogDescription>
              Quick view of {quickViewProduct?.name}
            </DialogDescription>
            <DialogClose className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </DialogClose>
          </DialogHeader>
          {quickViewProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={quickViewProduct.images?.[0] || "/placeholder.jpg"}
                  alt={quickViewProduct.name}
                  className="absolute inset-0 w-full h-full object-contain p-4"
                  onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold">{quickViewProduct.name}</h2>
                <p className="text-gray-600 mt-2">{quickViewProduct.description}</p>
                <div className="mt-4">
                  {quickViewProduct.discount ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-600 text-2xl">
                        {formatCurrency(quickViewProduct.price * (1 - quickViewProduct.discount / 100))}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        {formatCurrency(quickViewProduct.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-gray-900 text-2xl">
                      {formatCurrency(quickViewProduct.price)}
                    </span>
                  )}
                </div>
                <div className="mt-auto flex gap-3">
                  <button
                    onClick={() => handleAddToCart(quickViewProduct)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}