import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Award, TrendingUp, ChevronRight, Heart, Sparkles, Eye, X, Store } from "lucide-react";
import { getProducts, type Product } from "@/lib/firebase-products";
import { getVendor, type Vendor } from "@/lib/firebase-vendors";
import { useCart } from "@/components/cart-provider";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useWishlist, type WishlistItem } from "@/hooks/use-wishlist";

export default function FeaturedProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [vendors, setVendors] = useState<Record<string, Vendor>>({});
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        const { products: allProducts } = await getProducts({}, 20);
        const featured = allProducts.filter((p) => p.inStock).slice(0, 8);
        setProducts(featured);
      } catch (error: unknown) {
        console.error("Error loading featured products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  useEffect(() => {
    const fetchVendors = async () => {
      const vendorIds = [...new Set(products.filter((p) => p.vendorId).map((p) => p.vendorId!))];
      const vendorPromises = vendorIds.map(async (vendorId) => {
        try {
          const vendor = await getVendor(vendorId);
          return { vendorId, vendor };
        } catch (error: unknown) {
          console.error(`Error fetching vendor ${vendorId}:`, error);
          return { vendorId, vendor: null };
        }
      });

      const vendorResults = await Promise.all(vendorPromises);
      const vendorMap: Record<string, Vendor> = {};

      vendorResults.forEach(({ vendorId, vendor }) => {
        if (vendor) vendorMap[vendorId] = vendor;
      });

      setVendors(vendorMap);
    };

    if (products.length > 0) {
      fetchVendors();
    }
  }, [products]);

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discount ? product.price * (1 - product.discount / 100) : product.price,
      image: product.images?.[0] || "/placeholder.jpg",
      quantity: 1,
      options: {},
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
      inStock: product.inStock !== false,
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
    );
  }

  return (
    <>
      <section className="py-16 bg-white text-gray-800">
        <div className="flex flex-col items-center mb-12">
          <div className="inline-flex items-center bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-green-100">
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Handpicked Selection</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">Featured Products</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-6"></div>
          <p className="text-gray-600 text-center max-w-2xl mb-8">
            From our hands to yours. Discover the best of products and craftsmanship in our featured collection.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group relative overflow-hidden border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all duration-200 rounded-xl bg-white flex flex-col h-full"
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => setHoveredProductId(null)}
              >
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

                <div 
                  className="block cursor-pointer"
                  onClick={() => navigate(`/products/${encodeURIComponent(product.id)}`)}
                >
                  <div className="relative h-60 bg-white overflow-hidden">
                    <img
                      src={product.images?.[0] || "/placeholder.jpg"}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                    />

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
                    onClick={() => navigate(`/products/${encodeURIComponent(product.id)}`)}
                  >
                    <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem] group-hover:text-green-600 transition-colors">{product.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2 h-10">{product.description}</p>
                </CardContent>

                <CardFooter className="flex items-center justify-between pt-0 mt-auto">
                  <div className="flex flex-col">
                    {product.discount ? (
                      <>
                        <span className="font-bold text-green-600 text-lg">
                          {formatCurrency(product.price * (1 - product.discount / 100))}
                        </span>
                        <span className="text-sm text-gray-500 line-through">{formatCurrency(product.price)}</span>
                      </>
                    ) : (
                      <span className="font-bold text-gray-900 text-lg">{formatCurrency(product.price)}</span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">No featured products available at the moment.</div>
        )}

        <div className="flex justify-center mt-12">
          <Button
            onClick={() => navigate("/shop")}
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Browse All Products
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

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
                <p className="text-gray-600">{quickViewProduct.description}</p>
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
    </>
  );
}
