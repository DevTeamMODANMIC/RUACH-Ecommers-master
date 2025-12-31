"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Plus, ChevronRight, Eye, X, Heart } from "lucide-react"
import { getRandomCategoryImage } from "@/lib/utils"
import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { useWishlist, type WishlistItem } from "@/hooks/use-wishlist"

interface ProductShowcaseProps {
  category?: string;
  title?: string;
  subtitle?: string;
}

export default function ProductShowcase({ 
  category = "Beverages", 
  title = "Popular Products", 
  subtitle = "Authentic products from around the world" 
}: ProductShowcaseProps) {
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Product data by category
  const productData = {
    "Beverages": [
      {
        id: "coca-cola-50cl",
        name: "Coca-Cola",
        subtitle: "50cl Bottle",
        price: 1.20,
        image: "/product_images/beverages/coke-50cl-250x250.jpg",
        slug: "/products/coca-cola-50cl",
        rating: 4.9,
        reviews: 124,
        isBestSeller: true
      },
      {
        id: "fanta-50cl",
        name: "Fanta Orange",
        subtitle: "50cl Bottle",
        price: 1.20,
        image: "/product_images/beverages/Fanta-PET-Bottles-50cl.jpg",
        slug: "/products/fanta-50cl",
        rating: 4.7,
        reviews: 86
      },
      {
        id: "sprite-50cl",
        name: "Sprite",
        subtitle: "50cl Bottle",
        price: 1.20,
        image: "/product_images/beverages/Sprite-50cl-1-250x250.jpg",
        slug: "/products/sprite-50cl",
        rating: 4.8,
        reviews: 92
      },
      {
        id: "amstel-malta",
        name: "Amstel Malta",
        subtitle: "Non-Alcoholic Malt Drink",
        price: 1.50,
        image: "/product_images/beverages/Amstel-malta-150x150.jpg",
        slug: "/products/amstel-malta",
        rating: 4.6,
        reviews: 58
      },
      {
        id: "malta-guinness-pack",
        name: "Malta Guinness",
        subtitle: "Pack of 24 Cans",
        price: 28.99,
        image: "/product_images/beverages/malta_guinness_can_(pack_of_24).png",
        slug: "/products/malta-guinness-pack",
        rating: 4.9,
        reviews: 73,
        isBulk: true
      },
      {
        id: "schweppes-chapman",
        name: "Schweppes Chapman",
        subtitle: "Pack of 24",
        price: 26.99,
        image: "/product_images/beverages/swhwappes_chapman_pack_of_24.png",
        slug: "/products/schweppes-chapman",
        rating: 4.8,
        reviews: 42,
        isBulk: true,
        isNew: true
      },
      {
        id: "lacasera",
        name: "LaCasera",
        subtitle: "Sparkling Apple Drink",
        price: 1.35,
        image: "/product_images/beverages/Lacasara-150x150.jpg",
        slug: "/products/lacasera",
        rating: 4.7,
        reviews: 36,
        isNew: true
      },
      {
        id: "maltina-can",
        name: "Maltina",
        subtitle: "Premium Malt Drink (Can)",
        price: 1.40,
        image: "/product_images/beverages/Maltina-can-150x150.jpg",
        slug: "/products/maltina-can",
        rating: 4.8,
        reviews: 64
      }
    ],
    "Food": [
      {
        id: "abacha-african-salad",
        name: "Abacha",
        subtitle: "African Salad",
        price: 5.99,
        image: "/product_images/food/Abacha-250x250.jpg",
        slug: "/products/abacha-african-salad",
        rating: 4.6,
        reviews: 18
      },
      {
        id: "nigerian-bread",
        name: "Nigerian Bread",
        subtitle: "Traditional Soft Bread",
        price: 3.50,
        image: "/product_images/food/bread-250x250.png",
        slug: "/products/nigerian-bread",
        rating: 4.4,
        reviews: 12,
        isBestSeller: true
      },
      {
        id: "butter-mint-sweets",
        name: "Butter Mint Sweets",
        subtitle: "Classic Creamy Mints",
        price: 2.25,
        image: "/product_images/food/Butter-mint-sweets-1-250x250.jpg",
        slug: "/products/butter-mint-sweets",
        rating: 4.3,
        reviews: 9
      },
      {
        id: "cerelac-honey-wheat",
        name: "Cerelac",
        subtitle: "Honey and Wheat Baby Food",
        price: 8.99,
        image: "/product_images/food/Cerelac-Honey-and-wheat-1kg-1-250x250.jpg",
        slug: "/products/cerelac-honey-wheat",
        rating: 4.8,
        reviews: 24,
        isNew: true
      }
    ],
    "Spices": [
      {
        id: "bawa-pepper",
        name: "Bawa Pepper",
        subtitle: "Traditional Spice",
        price: 3.99,
        image: "/product_images/spices/Bawa-pepper-250x250.jpg",
        slug: "/products/bawa-pepper",
        rating: 4.7,
        reviews: 21,
        isBestSeller: true
      },
      {
        id: "ducros-thyme",
        name: "Ducros Thyme",
        subtitle: "Premium Herb",
        price: 2.99,
        image: "/product_images/spices/Ducros-thyme-250x250.jpg",
        slug: "/products/ducros-thyme",
        rating: 4.5,
        reviews: 16
      },
      {
        id: "everyday-seasoning",
        name: "Everyday Seasoning",
        subtitle: "All-Purpose Blend",
        price: 4.50,
        image: "/product_images/spices/Everyday-seasoning-250x250.jpg",
        slug: "/products/everyday-seasoning",
        rating: 4.8,
        reviews: 28
      }
    ],
    "Flour": [
      {
        id: "ayoola-plantain-flour",
        name: "Ayoola Plantain Flour",
        subtitle: "100% Natural Plantains",
        price: 7.50,
        image: "/product_images/flour/Ayoola-Plantain-flour-250x250.jpg",
        slug: "/products/ayoola-plantain-flour",
        rating: 4.6,
        reviews: 14
      },
      {
        id: "ayoola-pounded-yam",
        name: "Ayoola Pounded Yam",
        subtitle: "Authentic Taste",
        price: 8.99,
        image: "/product_images/flour/Ayoola-pounded-yam-250x250.jpg",
        slug: "/products/ayoola-pounded-yam",
        rating: 4.8,
        reviews: 26,
        isBestSeller: true
      },
      {
        id: "yam-flour",
        name: "Yam Flour",
        subtitle: "Traditional - 4kg",
        price: 12.99,
        image: "/product_images/flour/yam-flour-4kg-250x250.png",
        slug: "/products/yam-flour",
        rating: 4.7,
        reviews: 19
      }
    ],
    "Vegetables & Fruits": [
      {
        id: "agbalumo",
        name: "Agbalumo",
        subtitle: "African Star Apple",
        price: 5.99,
        image: "/product_images/vegetables/Agbalumo-250x250.jpg",
        slug: "/products/agbalumo",
        rating: 4.7,
        reviews: 14,
        isNew: true
      },
      {
        id: "bitter-leaf",
        name: "Bitter Leaf",
        subtitle: "Fresh Soup Ingredient",
        price: 3.50,
        image: "/product_images/vegetables/Bitter-leaf-250x250.jpg",
        slug: "/products/bitter-leaf",
        rating: 4.6,
        reviews: 12
      },
      {
        id: "dried-bitter-leaves",
        name: "Dried Bitter Leaves",
        subtitle: "Long-Lasting Alternative",
        price: 4.25,
        image: "/product_images/vegetables/Dried-Bitter-leaves-250x250.jpg",
        slug: "/products/dried-bitter-leaves",
        rating: 4.4,
        reviews: 18
      },
      {
        id: "ewedu-leaf",
        name: "Ewedu Leaf",
        subtitle: "Traditional Soup Ingredient",
        price: 3.99,
        image: "/product_images/vegetables/Ewedu-leaf--250x250.jpg",
        slug: "/products/ewedu-leaf",
        rating: 4.8,
        reviews: 16,
        isBestSeller: true
      }
    ],
    "Meat & Fish": [
      {
        id: "cat-fish",
        name: "Cat Fish",
        subtitle: "Fresh Fish",
        price: 9.99,
        image: "/product_images/meat/Cat-fish-250x250.jpg",
        slug: "/products/cat-fish",
        rating: 4.8,
        reviews: 17
      },
      {
        id: "catfish-whole",
        name: "Catfish (Whole)",
        subtitle: "Perfect for Grilling",
        price: 12.99,
        image: "/product_images/meat/catfish-250x228.png",
        slug: "/products/catfish-whole",
        rating: 4.9,
        reviews: 14,
        isBestSeller: true
      },
      {
        id: "chicken-drumsticks",
        name: "Chicken Drumsticks",
        subtitle: "20kg Bulk Pack",
        price: 45.99,
        image: "/product_images/meat/Chicken-drumsticks-20kg-250x250.jpg",
        slug: "/products/chicken-drumsticks",
        rating: 4.7,
        reviews: 12,
        isBulk: true
      },
      {
        id: "cow-leg",
        name: "Cow Leg",
        subtitle: "Traditional Soup Meat",
        price: 15.99,
        image: "/product_images/meat/Cow-leg-250x250.jpg",
        slug: "/products/cow-leg",
        rating: 4.6,
        reviews: 9
      }
    ]
  };

  // Get products for the selected category, or default to empty array
  const products = productData[category as keyof typeof productData] || [];

  // Get a URL-friendly category name for the "View All" link
  const mapCategoryToShopCategory = (showcaseCategory: string): string => {
    const categoryMap: Record<string, string> = {
      "Beverages": "drinks",
      "Food": "food",
      "Spices": "spices",
      "Flour": "flour",
      "Vegetables & Fruits": "vegetables",
      "Meat & Fish": "meat"
    };
    return categoryMap[showcaseCategory] || "all";
  };

  const handleAddToCart = (product: any, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  const handleQuickView = (product: any, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setQuickViewProduct(product);
  };

  const handleToggleWishlist = (product: any, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    const wishlistItem: WishlistItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.subtitle || category
    };
    
    toggleWishlist(wishlistItem);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = "/product_images/unknown-product.jpg";
  };

  return (
    <section className="my-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
          <p className="mt-1 text-gray-600">{subtitle}</p>
        </div>
        <Link 
          href={`/shop?category=${mapCategoryToShopCategory(category)}`} 
          className="mt-2 md:mt-0 flex items-center text-green-600 hover:text-green-700 font-medium"
        >
          View all <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <Card 
            key={product.id}
            className="overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 group"
            onMouseEnter={() => setHoveredProductId(product.id)}
            onMouseLeave={() => setHoveredProductId(null)}
          >
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              {/* Product tags */}
              <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
                {product.isBestSeller && (
                  <Badge className="bg-amber-500 hover:bg-amber-600">Best Seller</Badge>
                )}
                {product.isNew && (
                  <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>
                )}
                {product.isBulk && (
                  <Badge className="bg-purple-500 hover:bg-purple-600">Bulk</Badge>
                )}
              </div>

              {/* Wishlist button */}
              <div className="absolute top-2 right-2 z-10">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-100 text-gray-500 hover:text-rose-500"
                  onClick={(e) => handleToggleWishlist(product, e)}
                >
                  <Heart 
                    className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : ''}`} 
                  />
                  <span className="sr-only">Toggle wishlist</span>
                </Button>
              </div>

              {/* Product image with link */}
              <Link href={product.slug || `/products/${product.id}`} className="block">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={handleImageError}
                />
              </Link>
              
              {/* Hover action overlay */}
              <div className={`absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center gap-2 transition-opacity duration-300 ${hoveredProductId === product.id ? 'opacity-100' : 'opacity-0'}`}>
                <button 
                  onClick={(e) => handleQuickView(product, e)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                  aria-label="Quick view"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button 
                  onClick={(e) => handleAddToCart(product, e)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                  aria-label="Add to cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                </button>
              </div>
            </div>

            <CardContent className="p-4">
              {/* Rating */}
              <div className="flex items-center mb-1">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="ml-1 text-sm font-medium">{product.rating}</span>
                </div>
                <span className="mx-1 text-gray-400">•</span>
                <span className="text-sm text-gray-500">{product.reviews} reviews</span>
              </div>
              
              {/* Product info */}
              <Link href={product.slug || `/products/${product.id}`} className="block group-hover:text-green-600 transition-colors">
                <h3 className="font-medium text-gray-900">{product.name}</h3>
              </Link>
              <p className="text-sm text-gray-500">{product.subtitle}</p>
              
              {/* Price and add button */}
              <div className="flex items-center justify-between mt-4">
                <span className="font-bold text-gray-900">{formatCurrency(product.price)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  fill
                  className="object-cover object-center"
                  onError={handleImageError}
                />
                
                {/* Product tags */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
                  {quickViewProduct.isBestSeller && (
                    <Badge className="bg-amber-500 hover:bg-amber-600">Best Seller</Badge>
                  )}
                  {quickViewProduct.isNew && (
                    <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>
                  )}
                  {quickViewProduct.isBulk && (
                    <Badge className="bg-purple-500 hover:bg-purple-600">Bulk</Badge>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col">
                <div className="mb-2">
                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="ml-1 text-sm font-medium">{quickViewProduct.rating}</span>
                    </div>
                    <span className="mx-1 text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{quickViewProduct.reviews} reviews</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold">{quickViewProduct.name}</h2>
                  <p className="text-gray-600">{quickViewProduct.subtitle}</p>
                </div>
                
                <div className="mb-4">
                  <span className="text-2xl font-bold">
                    {formatCurrency(quickViewProduct.price)}
                  </span>
                </div>
                
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
                    href={quickViewProduct.slug || `/products/${quickViewProduct.id}`}
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
    </section>
  )
}

