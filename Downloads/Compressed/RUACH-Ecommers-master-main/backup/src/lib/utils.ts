import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { addProduct, type Product } from "./firebase-products"
import fs from "fs"
import path from "path"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'NGN', locale: string = 'en-NG') {
  // During SSR, return a placeholder value
  if (typeof window === 'undefined') {
    return `₦${amount.toFixed(2)}`;
  }
  
  // In the browser, use Intl.NumberFormat
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// Function to import products from a scraped JSON file
export async function importScrapedProducts(jsonPath: string, imagesDir: string) {
  try {
    // Note: This has to run on server-side or needs a server API endpoint
    // For this demo we'll use pre-configured product data
    const predefinedProducts = [
      {
        name: "Aani Basmati Rice",
        description: "Premium Aani Basmati Rice - 10kg. Long grain aromatic rice, perfect for all your rice dishes.",
        price: 17.00,
        category: "Grains & Rice",
        images: ["/product_images/Unnamed_Product_c4e3aaee.jpg"],
        inStock: true,
        stockQuantity: 25,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["rice", "basmati", "grains"],
        reviews: { average: 4.5, count: 12 }
      },
      {
        name: "Aani Parboiled Rice",
        description: "Aani Parboiled Rice - 10kg. High-quality parboiled rice with perfect texture.",
        price: 17.99,
        category: "Grains & Rice",
        images: ["/product_images/Unnamed_Product_4dc20d04.png"],
        inStock: true,
        stockQuantity: 18,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["rice", "parboiled", "grains"],
        reviews: { average: 4.2, count: 8 }
      },
      {
        name: "Abacha",
        description: "Traditional African Abacha (Cassava flakes). Ready to eat or prepare in traditional dishes.",
        price: 3.80,
        category: "Grains & Rice",
        images: ["/product_images/Unnamed_Product_1d1b7510.jpg"],
        inStock: true,
        stockQuantity: 30,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["cassava", "traditional", "abacha"],
        reviews: { average: 4.7, count: 15 }
      },
      {
        name: "Aboniki Balm",
        description: "Traditional Aboniki Balm for muscle relief. Fast-acting and soothing.",
        price: 4.50,
        category: "Other",
        images: ["/product_images/Unnamed_Product_d2a59c43.jpg"],
        inStock: true,
        stockQuantity: 40,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["balm", "relief", "traditional"],
        reviews: { average: 4.9, count: 22 }
      },
      {
        name: "Powdered Garri",
        description: "Premium quality Powdered Garri. Perfect for making eba or soaking with cold water.",
        price: 5.99,
        category: "Grains & Rice",
        images: ["/product_images/Unnamed_Product_16c166b0.png"],
        inStock: true,
        stockQuantity: 35,
        origin: "Nigeria", 
        availableCountries: ["United Kingdom", "Ghana"],
        tags: ["garri", "cassava", "traditional"],
        reviews: { average: 4.6, count: 18 }
      },
      {
        name: "Yam Flour",
        description: "Yam Flour - 4kg. Perfect for making pounded yam and other traditional dishes.",
        price: 9.99,
        category: "Flour",
        images: ["/product_images/Unnamed_Product_5fce0726.png"],
        inStock: true,
        stockQuantity: 12,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["flour", "yam", "traditional"],
        reviews: { average: 4.4, count: 9 }
      },
      {
        name: "Agbalumo",
        description: "Fresh Agbalumo (African Star Apple). Sweet and tangy tropical fruit.",
        price: 6.50,
        category: "Fresh Produce",
        images: ["/product_images/Unnamed_Product_4b728af9.jpg"],
        inStock: true,
        stockQuantity: 20,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["fruit", "fresh", "tropical"],
        reviews: { average: 4.8, count: 14 }
      },
      {
        name: "Amstel Malta",
        description: "Amstel Malta - Non-alcoholic malt drink. Rich in vitamins and nutrients.",
        price: 1.99,
        category: "Beverages",
        images: ["/product_images/Unnamed_Product_c7e3f676.jpg"],
        inStock: true,
        stockQuantity: 48,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria", "Ghana"],
        tags: ["beverage", "malt", "non-alcoholic"],
        reviews: { average: 4.5, count: 25 }
      },
      {
        name: "Asiko Plantain Chips",
        description: "Asiko Salted Plantain Chips. Crunchy and delicious snack made from ripe plantains.",
        price: 2.50,
        category: "Snacks & Sweets",
        images: ["/product_images/Unnamed_Product_9fcb89f4.jpg"],
        inStock: true,
        stockQuantity: 30,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["snack", "plantain", "chips"],
        reviews: { average: 4.3, count: 11 }
      },
      {
        name: "Ayoola Plantain Flour",
        description: "Ayoola Plantain Flour. Made from 100% natural plantains.",
        price: 7.99,
        category: "Flour",
        images: ["/product_images/Unnamed_Product_dc861668.jpg"],
        inStock: true,
        stockQuantity: 15,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["flour", "plantain", "baking"],
        reviews: { average: 4.2, count: 7 }
      },
      {
        name: "Ayoola Pounded Yam",
        description: "Ayoola Pounded Yam. Easy to prepare traditional pounded yam.",
        price: 8.99,
        category: "Flour",
        images: ["/product_images/Unnamed_Product_0d768790.jpg"],
        inStock: true,
        stockQuantity: 22,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["pounded yam", "flour", "traditional"],
        reviews: { average: 4.7, count: 19 }
      },
      // New beverage products with updated image paths
      {
        name: "Coca-Cola 50cl",
        description: "Refreshing Coca-Cola soft drink in a 50cl bottle. Perfect for quenching your thirst.",
        price: 1.20,
        category: "Beverages",
        images: ["/product_images/beverages/coke-50cl-250x250.jpg", "/product_images/beverages/coke_50cl_(PAck).png"],
        inStock: true,
        stockQuantity: 120,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria", "Ghana"],
        tags: ["soft drink", "cola", "beverage"],
        reviews: { average: 4.8, count: 32 }
      },
      {
        name: "Fanta Orange 50cl",
        description: "Vibrant orange-flavored Fanta soft drink in a 50cl bottle. Sweet, fizzy, and refreshing.",
        price: 1.20,
        category: "Beverages",
        images: ["/product_images/beverages/Fanta-PET-Bottles-50cl.jpg", "/product_images/beverages/Fanta-50cl-pack-150x150.png"],
        inStock: true,
        stockQuantity: 95,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["soft drink", "orange", "beverage"],
        reviews: { average: 4.6, count: 28 }
      },
      {
        name: "Amstel Malta",
        description: "Non-alcoholic malt drink rich in vitamins and nutrients. A premium African malt beverage.",
        price: 1.50,
        category: "Beverages",
        images: ["/product_images/beverages/Amstel-malta-150x150.jpg"],
        inStock: true,
        stockQuantity: 75,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria", "Ghana"],
        tags: ["malt", "non-alcoholic", "beverage"],
        reviews: { average: 4.7, count: 42 }
      },
      {
        name: "Malta Guinness (Pack of 24)",
        description: "Case of 24 Malta Guinness non-alcoholic malt drinks. Rich, nourishing malt flavor with vitamins and minerals.",
        price: 28.99,
        category: "Beverages",
        images: ["/product_images/beverages/malta_guinness_can_(pack_of_24).png", "/product_images/beverages/malt_guiness_bottle(Pack_of_24).png"],
        inStock: true,
        stockQuantity: 18,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["malt", "non-alcoholic", "beverage", "bulk"],
        reviews: { average: 4.9, count: 36 }
      },
      {
        name: "Lacasara Drink",
        description: "Traditional Nigerian Lacasara soft drink. Sweet and refreshing citrus flavor.",
        price: 1.35,
        category: "Beverages",
        images: ["/product_images/beverages/Lacasara-150x150.jpg", "/product_images/beverages/Lacasara_pack.png"],
        inStock: true,
        stockQuantity: 62,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["soft drink", "citrus", "beverage", "traditional"],
        reviews: { average: 4.5, count: 22 }
      },
      {
        name: "Teem Soda (Pack)",
        description: "Pack of refreshing Teem lemon-lime soda. A popular Nigerian soft drink with a crisp, citrus taste.",
        price: 15.99,
        category: "Beverages",
        images: ["/product_images/beverages/teem_(Pack).png"],
        inStock: true,
        stockQuantity: 25,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["soft drink", "lemon-lime", "beverage", "bulk"],
        reviews: { average: 4.4, count: 18 }
      },
      {
        name: "Team Drink",
        description: "Team soft drink with a unique fruity flavor. Refreshing and sweet.",
        price: 1.25,
        category: "Beverages",
        images: ["/product_images/beverages/Team-drink-250x250.jpg"],
        inStock: true,
        stockQuantity: 48,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["soft drink", "fruit", "beverage"],
        reviews: { average: 4.2, count: 15 }
      },
      {
        name: "Vamino Soy Milk",
        description: "Nutritious Vamino soy milk. Plant-based, dairy-free alternative rich in protein.",
        price: 2.99,
        category: "Beverages",
        images: ["/product_images/beverages/Vamino-soy-milk-1-250x250.jpg"],
        inStock: true,
        stockQuantity: 35,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["soy milk", "plant-based", "dairy-free", "beverage"],
        reviews: { average: 4.6, count: 27 }
      },
      {
        name: "Schweppes Chapman (Pack of 24)",
        description: "Refreshing Chapman-flavored drink in a pack of 24 cans. A popular Nigerian cocktail flavor.",
        price: 38.99,
        category: "Beverages",
        images: ["/product_images/beverages/swhwappes_chapman_pack_of_24.png", "/product_images/beverages/Schweppes-can-250x250.jpg"],
        inStock: true,
        stockQuantity: 15,
        origin: "International",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["soft drink", "chapman", "beverage", "bulk"],
        reviews: { average: 4.7, count: 19 }
      },
      {
        name: "Sprite (Pack)",
        description: "Refreshing lemon-lime Sprite soft drink in a convenient pack. Crisp and refreshing.",
        price: 16.99,
        category: "Beverages",
        images: ["/product_images/beverages/sprite_pack.png", "/product_images/beverages/Sprite-50cl-1-250x250.jpg"],
        inStock: true,
        stockQuantity: 22,
        origin: "International",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["soft drink", "lemon-lime", "beverage", "bulk"],
        reviews: { average: 4.3, count: 16 }
      },
      // New food products
      {
        name: "Abacha (African Salad)",
        description: "Traditional Nigerian Abacha (cassava flakes). Perfect for making African salad.",
        price: 5.99,
        category: "Food",
        images: ["/product_images/food/Abacha-250x250.jpg"],
        inStock: true,
        stockQuantity: 28,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["traditional", "cassava", "food"],
        reviews: { average: 4.6, count: 18 }
      },
      {
        name: "Nigerian Bread",
        description: "Traditional Nigerian bread, soft and slightly sweet. Perfect for breakfast or snacks.",
        price: 3.50,
        category: "Food",
        images: ["/product_images/food/bread-250x250.png"],
        inStock: true,
        stockQuantity: 15,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["bread", "breakfast", "food"],
        reviews: { average: 4.4, count: 12 }
      },
      {
        name: "Butter Mint Sweets",
        description: "Classic butter mint sweets. Refreshing, creamy mints perfect for after dinner.",
        price: 2.25,
        category: "Snacks & Sweets",
        images: ["/product_images/food/Butter-mint-sweets-1-250x250.jpg"],
        inStock: true,
        stockQuantity: 50,
        origin: "International",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["sweets", "mint", "snacks"],
        reviews: { average: 4.3, count: 9 }
      },
      {
        name: "Cerelac Honey and Wheat",
        description: "Cerelac Honey and Wheat baby food - 1kg. Nutritious baby cereal with honey and wheat.",
        price: 8.99,
        category: "Food",
        images: ["/product_images/food/Cerelac-Honey-and-wheat-1kg-1-250x250.jpg"],
        inStock: true,
        stockQuantity: 20,
        origin: "International",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["baby food", "cereal", "honey", "wheat"],
        reviews: { average: 4.8, count: 24 }
      },
      // New spices products
      {
        name: "Bawa Pepper",
        description: "Traditional Bawa Pepper. Adds a rich, spicy flavor to your dishes.",
        price: 3.99,
        category: "Spices",
        images: ["/product_images/spices/Bawa-pepper-250x250.jpg"],
        inStock: true,
        stockQuantity: 40,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["pepper", "spice", "seasoning"],
        reviews: { average: 4.7, count: 21 }
      },
      {
        name: "Ducros Thyme",
        description: "Premium Ducros Thyme. Essential herb for soups, stews, and meat dishes.",
        price: 2.99,
        category: "Spices",
        images: ["/product_images/spices/Ducros-thyme-250x250.jpg"],
        inStock: true,
        stockQuantity: 35,
        origin: "International",
        availableCountries: ["United Kingdom"],
        tags: ["thyme", "herb", "seasoning"],
        reviews: { average: 4.5, count: 16 }
      },
      {
        name: "Everyday Seasoning",
        description: "All-purpose Everyday Seasoning blend. Perfect for enhancing the flavor of any dish.",
        price: 4.50,
        category: "Spices",
        images: ["/product_images/spices/Everyday-seasoning-250x250.jpg"],
        inStock: true,
        stockQuantity: 25,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["seasoning", "spice blend", "all-purpose"],
        reviews: { average: 4.8, count: 28 }
      },
      // New flour products
      {
        name: "Ayoola Plantain Flour",
        description: "Premium Ayoola Plantain Flour. Made from 100% natural plantains, perfect for traditional dishes.",
        price: 7.50,
        category: "Flour",
        images: ["/product_images/flour/Ayoola-Plantain-flour-250x250.jpg"],
        inStock: true,
        stockQuantity: 18,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["flour", "plantain", "baking"],
        reviews: { average: 4.6, count: 14 }
      },
      {
        name: "Ayoola Pounded Yam Flour",
        description: "Authentic Ayoola Pounded Yam Flour. Easy to prepare, smooth texture with authentic taste.",
        price: 8.99,
        category: "Flour",
        images: ["/product_images/flour/Ayoola-pounded-yam-250x250.jpg"],
        inStock: true,
        stockQuantity: 22,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["flour", "pounded yam", "traditional"],
        reviews: { average: 4.8, count: 26 }
      },
      {
        name: "Yam Flour",
        description: "Traditional Yam Flour - 4kg. High-quality yam flour for making traditional dishes.",
        price: 12.99,
        category: "Flour",
        images: ["/product_images/flour/yam-flour-4kg-250x250.png"],
        inStock: true,
        stockQuantity: 15,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["flour", "yam", "traditional"],
        reviews: { average: 4.7, count: 19 }
      },
      // New rice products
      {
        name: "Aani Rice",
        description: "Premium Aani Rice - 10kg. High-quality long grain rice perfect for everyday cooking.",
        price: 15.99,
        category: "Rice",
        images: ["/product_images/rice/aani-10kg-250x250.png"],
        inStock: true,
        stockQuantity: 30,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["rice", "grains", "long grain"],
        reviews: { average: 4.5, count: 22 }
      },
      {
        name: "Aani Basmati Rice",
        description: "Premium Aani Basmati Rice - 10kg. Aromatic long grain rice perfect for special meals.",
        price: 19.99,
        category: "Rice",
        images: ["/product_images/rice/Aani-Basmatic-rice-10kg-4-250x250.jpg"],
        inStock: true,
        stockQuantity: 25,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["rice", "basmati", "aromatic"],
        reviews: { average: 4.9, count: 31 }
      },
      // New vegetable products
      {
        name: "Agbalumo (African Star Apple)",
        description: "Fresh Agbalumo, also known as African Star Apple. Sweet and tangy tropical fruit.",
        price: 5.99,
        category: "Vegetables & Fruits",
        images: ["/product_images/vegetables/Agbalumo-250x250.jpg"],
        inStock: true,
        stockQuantity: 20,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["fruit", "tropical", "fresh produce"],
        reviews: { average: 4.7, count: 14 }
      },
      {
        name: "Bitter Leaf",
        description: "Fresh Bitter Leaf. Essential ingredient for traditional Nigerian soups and stews.",
        price: 3.50,
        category: "Vegetables & Fruits",
        images: ["/product_images/vegetables/Bitter-leaf-250x250.jpg"],
        inStock: true,
        stockQuantity: 15,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["vegetable", "leaf", "soup ingredient"],
        reviews: { average: 4.6, count: 12 }
      },
      {
        name: "Dried Bitter Leaves",
        description: "Dried Bitter Leaves. Long-lasting alternative to fresh bitter leaves for traditional soups.",
        price: 4.25,
        category: "Vegetables & Fruits",
        images: ["/product_images/vegetables/Dried-Bitter-leaves-250x250.jpg"],
        inStock: true,
        stockQuantity: 25,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["vegetable", "dried", "soup ingredient"],
        reviews: { average: 4.4, count: 18 }
      },
      {
        name: "Ewedu Leaf",
        description: "Fresh Ewedu Leaf. Essential ingredient for making traditional Ewedu soup.",
        price: 3.99,
        category: "Vegetables & Fruits",
        images: ["/product_images/vegetables/Ewedu-leaf--250x250.jpg"],
        inStock: true,
        stockQuantity: 18,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["vegetable", "leaf", "soup ingredient"],
        reviews: { average: 4.8, count: 16 }
      },
      {
        name: "Green Bell Pepper",
        description: "Fresh Green Bell Peppers. Crisp and flavorful, perfect for salads and cooking.",
        price: 2.50,
        category: "Vegetables & Fruits",
        images: ["/product_images/vegetables/Green-bell-pepper-150x150.jpg"],
        inStock: true,
        stockQuantity: 30,
        origin: "Nigeria",
        availableCountries: ["United Kingdom", "Nigeria"],
        tags: ["vegetable", "pepper", "fresh produce"],
        reviews: { average: 4.5, count: 20 }
      },
      {
        name: "Hot Pepper",
        description: "Fresh Hot Peppers. Adds spice and flavor to your dishes.",
        price: 2.99,
        category: "Vegetables & Fruits",
        images: ["/product_images/vegetables/hot-pepper-250x250.png"],
        inStock: true,
        stockQuantity: 40,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["vegetable", "pepper", "spicy"],
        reviews: { average: 4.7, count: 25 }
      },
      // New meat products
      {
        name: "Cat Fish",
        description: "Fresh Cat Fish. Perfect for traditional Nigerian fish stews and soups.",
        price: 9.99,
        category: "Meat & Fish",
        images: ["/product_images/meat/Cat-fish-250x250.jpg"],
        inStock: true,
        stockQuantity: 15,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["fish", "seafood", "fresh"],
        reviews: { average: 4.8, count: 17 }
      },
      {
        name: "Catfish (Whole)",
        description: "Whole Fresh Catfish. Perfect for grilling or making traditional pepper soup.",
        price: 12.99,
        category: "Meat & Fish",
        images: ["/product_images/meat/catfish-250x228.png"],
        inStock: true,
        stockQuantity: 10,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["fish", "seafood", "whole fish"],
        reviews: { average: 4.9, count: 14 }
      },
      {
        name: "Chicken Drumsticks",
        description: "Chicken Drumsticks - 20kg bulk pack. Perfect for parties and large gatherings.",
        price: 45.99,
        category: "Meat & Fish",
        images: ["/product_images/meat/Chicken-drumsticks-20kg-250x250.jpg"],
        inStock: true,
        stockQuantity: 8,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["chicken", "poultry", "bulk"],
        reviews: { average: 4.7, count: 12 }
      },
      {
        name: "Cow Leg",
        description: "Fresh Cow Leg. Perfect for making traditional pepper soup and stews.",
        price: 15.99,
        category: "Meat & Fish",
        images: ["/product_images/meat/Cow-leg-250x250.jpg"],
        inStock: true,
        stockQuantity: 12,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["beef", "cow", "meat"],
        reviews: { average: 4.6, count: 9 }
      },
      {
        name: "Cow Shin",
        description: "Fresh Cow Shin. Ideal for slow-cooked stews and soups.",
        price: 14.50,
        category: "Meat & Fish",
        images: ["/product_images/meat/Cow-shin-250x250.jpg"],
        inStock: true,
        stockQuantity: 14,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["beef", "cow", "meat"],
        reviews: { average: 4.5, count: 11 }
      },
      {
        name: "Cow Tongue",
        description: "Fresh Cow Tongue. Delicacy for special dishes and traditional recipes.",
        price: 18.99,
        category: "Meat & Fish",
        images: ["/product_images/meat/Cow-tongue-250x250.jpg"],
        inStock: true,
        stockQuantity: 8,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["beef", "cow", "meat", "delicacy"],
        reviews: { average: 4.4, count: 7 }
      },
      {
        name: "Fresh Cow Skin (Ponmo)",
        description: "Fresh Cow Skin, also known as Ponmo. Traditional ingredient in Nigerian soups and stews.",
        price: 10.99,
        category: "Meat & Fish",
        images: ["/product_images/meat/Fresh-cow-skin-250x250.jpg"],
        inStock: true,
        stockQuantity: 20,
        origin: "Nigeria",
        availableCountries: ["United Kingdom"],
        tags: ["beef", "cow skin", "ponmo", "traditional"],
        reviews: { average: 4.8, count: 22 }
      }
    ];
    
    const results = {
      success: 0,
      failed: 0,
      products: [] as Array<{name: string, status: string}>
    }

    // Process each product
    for (const product of predefinedProducts) {
      try {
        // Add to Firestore
        await addProduct(product)
        results.success++
        results.products.push({ name: product.name, status: 'success' })
      } catch (error) {
        console.error(`Failed to import product: ${product.name}`, error)
        results.failed++
        results.products.push({ name: product.name, status: 'failed' })
      }
    }
    
    return results
  } catch (error) {
    console.error("Error importing scraped products:", error)
    throw error
  }
}

// Helper to extract product name from image URL - used for reference with the scraped data
function extractProductNameFromUrl(url: string): string {
  const filename = url.split('/').pop() || ""
  const nameMatch = filename.match(/([a-zA-Z0-9-]+)/)
  if (nameMatch) {
    // Clean up the name and capitalize words
    return nameMatch[1]
      .replace(/-/g, ' ')
      .replace(/(\b\w)/g, (char) => char.toUpperCase())
  }
  return "Product"
}

// Detect category based on image URL or other factors - used for reference with the scraped data
function detectCategory(imageUrl: string): string {
  const lowerUrl = imageUrl.toLowerCase()
  
  if (lowerUrl.includes("rice")) return "Grains & Rice"
  if (lowerUrl.includes("malta") || lowerUrl.includes("amstel")) return "Beverages"
  if (lowerUrl.includes("flour")) return "Flour"
  if (lowerUrl.includes("plantain") || lowerUrl.includes("chip")) return "Snacks & Sweets"
  if (lowerUrl.includes("yam")) return "Vegetables & Fruits"
  if (lowerUrl.includes("garri")) return "Grains & Rice"
  if (lowerUrl.includes("agbalumo")) return "Fresh Produce"
  
  // Default category
  return "Other"
}

// Function to ensure product images are available in the public directory
export async function ensureProductImages() {
  try {
    // In a real implementation, this would copy files from one location to another
    // For this demo, we'll just log that the function was called
    console.log("Ensuring product images are available in the public directory");
    
    // This would be the actual implementation in a Node.js environment:
    /*
    const fs = require('fs');
    const path = require('path');
    
    const sourceDir = path.join(process.cwd(), 'product_images');
    const targetDir = path.join(process.cwd(), 'public', 'product_images');
    
    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Read all files from source directory
    const files = fs.readdirSync(sourceDir);
    
    // Copy each file to target directory
    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied ${file} to public directory`);
    }
    */
    
    return { success: true, message: "Product images are ready" };
  } catch (error) {
    console.error("Error ensuring product images:", error);
    return { success: false, message: "Failed to ensure product images" };
  }
}

/**
 * Maps image URLs from the dataset to product categories
 * @returns A mapping of product categories to arrays of image URLs
 */
export function getDatasetImages() {
  const beverageImages = [
    "/public/product_images/beverages/Amstel-malta-150x150.jpg",
    "/public/product_images/beverages/coke_50cl_(PAck).png",
    "/public/product_images/beverages/coke-50cl-250x250.jpg",
    "/public/product_images/beverages/Fanta-50cl-pack-150x150.png",
    "/public/product_images/beverages/Fanta-PET-Bottles-50cl.jpg",
    "/public/product_images/beverages/Lacasara_pack.png",
    "/public/product_images/beverages/Lacasara-150x150.jpg",
    "/public/product_images/beverages/malt_guiness_bottle(Pack_of_24).png",
    "/public/product_images/beverages/malta_guinness_can_(pack_of_24).png",
    "/public/product_images/beverages/maltina_can-500x500-removebg-preview-250x250.png",
    "/public/product_images/beverages/Maltina-can-150x150.jpg",
    "/public/product_images/beverages/Schweppes-can-250x250.jpg",
    "/public/product_images/beverages/sprite_pack.png",
    "/public/product_images/beverages/Sprite-50cl-1-250x250.jpg",
    "/public/product_images/beverages/swhwappes_chapman_pack_of_24.png",
    "/public/product_images/beverages/Team-drink-250x250.jpg",
    "/public/product_images/beverages/teem_(Pack).png",
    "/public/product_images/beverages/Vamino-soy-milk-1-250x250.jpg"
  ];

  const foodImages = [
    "/public/product_images/food/Abacha-250x250.jpg",
    "/public/product_images/food/bread-250x250.png",
    "/public/product_images/food/Butter-mint-sweets-1-250x250.jpg",
    "/public/product_images/food/Cerelac-Honey-and-wheat-1kg-1-250x250.jpg"
  ];

  const spicesImages = [
    "/public/product_images/spices/Bawa-pepper-250x250.jpg",
    "/public/product_images/spices/Ducros-thyme-250x250.jpg",
    "/public/product_images/spices/Everyday-seasoning-250x250.jpg"
  ];

  const flourImages = [
    "/public/product_images/flour/Ayoola-Plantain-flour-250x250.jpg",
    "/public/product_images/flour/Ayoola-pounded-yam-250x250.jpg",
    "/public/product_images/flour/yam-flour-4kg-250x250.png"
  ];

  const riceImages = [
    "/public/product_images/rice/aani-10kg-250x250.png",
    "/public/product_images/rice/Aani-Basmatic-rice-10kg-4-250x250.jpg"
  ];

  const vegetableImages = [
    "/public/product_images/vegetables/Agbalumo-250x250.jpg",
    "/public/product_images/vegetables/Bitter-leaf-250x250.jpg",
    "/public/product_images/vegetables/Dried-Bitter-leaves-250x250.jpg",
    "/public/product_images/vegetables/Ewedu-leaf--250x250.jpg",
    "/public/product_images/vegetables/Green-bell-pepper-150x150.jpg",
    "/public/product_images/vegetables/hot-pepper-250x250.png"
  ];

  const meatImages = [
    "/public/product_images/meat/Cat-fish-250x250.jpg",
    "/public/product_images/meat/catfish-250x228.png",
    "/public/product_images/meat/Chicken-drumsticks-20kg-250x250.jpg",
    "/public/product_images/meat/Cow-leg-250x250.jpg",
    "/public/product_images/meat/Cow-shin-250x250.jpg",
    "/public/product_images/meat/Cow-tongue-250x250.jpg",
    "/public/product_images/meat/Fresh-cow-skin-250x250.jpg"
  ];

  // Format the paths correctly for Next.js public directory
  const formatImagePath = (path: string) => {
    // Remove "/public" prefix as Next.js public directory is the root for static assets
    return path.replace("/public", "");
  };

  return {
    beverages: beverageImages.map(formatImagePath),
    food: foodImages.map(formatImagePath),
    spices: spicesImages.map(formatImagePath),
    flour: flourImages.map(formatImagePath),
    rice: riceImages.map(formatImagePath),
    vegetables: vegetableImages.map(formatImagePath),
    meat: meatImages.map(formatImagePath)
  };
}

/**
 * Gets a random image from a category
 * @param category The product category
 * @returns A random image URL from the category or a placeholder
 */
export function getRandomCategoryImage(category: string): string {
  const imageMap = getDatasetImages();
  let categoryKey: string;
  
  // Map category names to keys in our imageMap
  switch(category.toLowerCase()) {
    case 'beverages':
    case 'beverage':
      categoryKey = 'beverages';
      break;
    case 'food':
    case 'foods':
    case 'snacks & sweets':
    case 'snacks':
      categoryKey = 'food';
      break;
    case 'spices':
    case 'seasonings':
    case 'spice':
      categoryKey = 'spices';
      break;
    case 'flour':
    case 'flours':
      categoryKey = 'flour';
      break;
    case 'rice':
    case 'grains & rice':
    case 'grains':
      categoryKey = 'rice';
      break;
    case 'vegetables':
    case 'vegetables & fruits':
    case 'fresh produce':
    case 'produce':
    case 'fruits':
      categoryKey = 'vegetables';
      break;
    case 'meat':
    case 'meats':
    case 'fish':
    case 'seafood':
      categoryKey = 'meat';
      break;
    default:
      categoryKey = 'beverages'; // Default to beverages if no match
  }
  
  if (imageMap[categoryKey as keyof typeof imageMap] && (imageMap[categoryKey as keyof typeof imageMap] as string[]).length > 0) {
    const images = imageMap[categoryKey as keyof typeof imageMap] as string[];
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  }
  
  // Fallback to placeholder
  return "/placeholder.jpg";
}
