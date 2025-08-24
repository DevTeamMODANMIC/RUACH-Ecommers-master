

import { useState } from "react"
import Link from "next/link"

import { Button } from "../../src/components/ui/button"
import { Card, CardContent } from "../../src/components/ui/card"
import { Badge } from "../../src/components/ui/badge"
import { Star, ShoppingCart, Plus, ChevronRight } from "lucide-react"
import { getRandomCategoryImage } from "../../src/lib/utils"

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
  const [showDebug, setShowDebug] = useState(false)
  
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

  // Get products for the selected category
  const products = productData[category as keyof typeof productData] || productData.Beverages;

  // Function to handle image error and try fallback images
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Failed to load image: ${(e.target as HTMLImageElement).src}`);
    const imgElement = e.currentTarget;
      imgElement.src = "/placeholder.jpg";
    imgElement.onerror = null; // Prevent infinite loops
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-green-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
            <p className="text-gray-600 mt-2">{subtitle}</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center">
            <Link href={`/shop?category=${encodeURIComponent(category)}`} className="flex items-center text-green-600 hover:text-green-700 font-medium">
              View All Products
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
            
            {process.env.NODE_ENV === 'development' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDebug(!showDebug)}
                className="ml-4"
              >
                {showDebug ? "Hide Debug" : "Show Debug"}
              </Button>
            )}
          </div>
        </div>
        
        {showDebug && (
          <div className="bg-gray-100 p-4 rounded mb-6">
            <h3 className="font-bold mb-2">Image Paths:</h3>
            <pre className="text-xs overflow-auto">{JSON.stringify(products.map(p => ({ name: p.name, image: p.image })), null, 2)}</pre>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden transition-all hover:shadow-lg border border-gray-200 hover:border-green-200 group">
              <Link href={`/products/${encodeURIComponent(product.id)}`}>
                <div className="relative h-48 bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {(product.isBestSeller || product.isNew || product.isBulk) && (
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
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
                  )}
                  
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-2 transform group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    onError={handleImageError}
                    priority
                  />
                </div>
                
                <CardContent className="p-4 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-lg text-gray-800 group-hover:text-green-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">{product.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium ml-1 text-gray-700">{product.rating}</span>
                    </div>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-xs text-gray-500">{product.reviews} reviews</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-green-600 font-bold text-lg">£{product.price.toFixed(2)}</p>
                    <Button size="sm" variant="ghost" className="rounded-full hover:bg-green-50 hover:text-green-600">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="sr-only">Add to cart</span>
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-center">
          <Link href={`/shop?category=${encodeURIComponent(category)}`}>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 py-6 text-base font-medium shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center gap-2 group mx-auto"
            >
              View All {category}
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
          <p className="text-gray-500 text-sm mt-3">Discover our full range of authentic {category.toLowerCase()}</p>
        </div>
      </div>
    </section>
  )
} 