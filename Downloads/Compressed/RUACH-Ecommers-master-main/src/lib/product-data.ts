import { Product } from "@/types";

// This is temporary mock data until we implement Firebase

export const products: Product[] = [
  {
    id: "1",
    name: "Coca-Cola Original 50cl",
    description: "Classic Coca-Cola soft drink in 50cl bottle. Refreshing taste with the perfect balance of sweetness and fizz.",
    price: 250,
    category: "beverages",
    displayCategory: "Beverages",
    origin: "Nigeria",
    inStock: true,
    images: ["/assets/coke-50cl-250x250.jpg"],
    discount: 0,
    rating: 4.5,
    reviews: {
      average: 4.5,
      count: 128
    },
    stockQuantity: 50,
    availableCountries: ["Nigeria"],
    tags: ["soft drink", "coca-cola", "refreshing", "classic"],
    bestseller: true,
    popular: true,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  {
    id: "2",
    name: "Fanta Orange 50cl",
    description: "Orange-flavored carbonated soft drink. Sweet and tangy taste perfect for all occasions.",
    price: 250,
    category: "beverages",
    displayCategory: "Beverages",
    origin: "Nigeria",
    inStock: true,
    images: ["/assets/Fanta-PET-Bottles-50cl.jpg"],
    discount: 5,
    rating: 4.3,
    reviews: {
      average: 4.3,
      count: 95
    },
    stockQuantity: 45,
    availableCountries: ["Nigeria"],
    tags: ["orange", "fanta", "citrus", "refreshing"],
    popular: true,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  {
    id: "3",
    name: "Sprite Lemon Lime 50cl",
    description: "Clear lemon-lime flavored soft drink. Crisp, clean taste with no caffeine.",
    price: 250,
    category: "beverages",
    displayCategory: "Beverages",
    origin: "Nigeria",
    inStock: true,
    images: ["/assets/Sprite-50cl-1-250x250.jpg"],
    discount: 0,
    rating: 4.4,
    reviews: {
      average: 4.4,
      count: 112
    },
    stockQuantity: 38,
    availableCountries: ["Nigeria"],
    tags: ["sprite", "lemon", "lime", "clear", "refreshing"],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  {
    id: "4",
    name: "Maltina Malt Drink 50cl",
    description: "Nutritious malt drink with vitamins and minerals. Great taste with health benefits.",
    price: 300,
    category: "beverages",
    displayCategory: "Beverages",
    origin: "Nigeria",
    inStock: true,
    images: ["/assets/Maltina-can-150x150.jpg"],
    discount: 10,
    rating: 4.6,
    reviews: {
      average: 4.6,
      count: 156
    },
    stockQuantity: 42,
    availableCountries: ["Nigeria"],
    tags: ["malt", "maltina", "nutritious", "vitamins"],
    bestseller: true,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  {
    id: "5",
    name: "Golden Penny Rice 5kg",
    description: "Premium quality Nigerian rice. Long grain, aromatic, and perfect for all rice dishes.",
    price: 8500,
    category: "rice",
    displayCategory: "Rice",
    origin: "Nigeria",
    inStock: true,
    images: ["/assets/rice-bag.jpg"],
    discount: 0,
    rating: 4.7,
    reviews: {
      average: 4.7,
      count: 203
    },
    stockQuantity: 25,
    availableCountries: ["Nigeria"],
    tags: ["rice", "golden penny", "long grain", "premium"],
    bestseller: true,
    popular: true,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  {
    id: "6",
    name: "Dangote Flour 2kg",
    description: "High-quality wheat flour perfect for baking and cooking. Fine texture for excellent results.",
    price: 1200,
    category: "flour",
    displayCategory: "Flour",
    origin: "Nigeria",
    inStock: true,
    images: ["/assets/flour-bag.jpg"],
    discount: 0,
    rating: 4.5,
    reviews: {
      average: 4.5,
      count: 89
    },
    stockQuantity: 35,
    availableCountries: ["Nigeria"],
    tags: ["flour", "dangote", "wheat", "baking"],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  {
    id: "7",
    name: "Peak Milk Powder 400g",
    description: "Full cream milk powder. Rich and creamy taste, perfect for tea, coffee, and cooking.",
    price: 2800,
    category: "provisions",
    displayCategory: "Provisions",
    origin: "Nigeria",
    inStock: true,
    images: ["/assets/milk-powder.jpg"],
    discount: 0,
    rating: 4.8,
    reviews: {
      average: 4.8,
      count: 167
    },
    stockQuantity: 28,
    availableCountries: ["Nigeria"],
    tags: ["milk", "peak", "powder", "creamy"],
    bestseller: true,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  {
    id: "8",
    name: "Indomie Noodles Chicken 70g",
    description: "Instant noodles with chicken flavor. Quick and delicious meal ready in minutes.",
    price: 350,
    category: "provisions",
    displayCategory: "Provisions",
    origin: "Nigeria",
    inStock: true,
    images: ["/assets/indomie.jpg"],
    discount: 15,
    rating: 4.4,
    reviews: {
      average: 4.4,
      count: 234
    },
    stockQuantity: 60,
    availableCountries: ["Nigeria"],
    tags: ["noodles", "indomie", "instant", "chicken"],
    popular: true,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  {
    id: "9",
    name: "Amstel Malta Malt Drink 33cl",
    description: "Non-alcoholic malt beverage. Refreshing taste with natural sweetness.",
    price: 200,
    category: "beverages",
    displayCategory: "Beverages",
    origin: "Nigeria",
    inStock: true,
    images: ["/assets/Amstel-malta-150x150.jpg"],
    discount: 0,
    rating: 4.3,
    reviews: {
      average: 4.3,
      count: 78
    },
    stockQuantity: 55,
    availableCountries: ["Nigeria"],
    tags: ["malt", "amstel", "non-alcoholic", "refreshing"],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  {
    id: "10",
    name: "Guinness Malt Drink 33cl",
    description: "Rich and creamy malt drink. Full-bodied taste with nutritional benefits.",
    price: 220,
    category: "beverages",
    displayCategory: "Beverages",
    origin: "Nigeria",
    inStock: true,
    images: ["/assets/malt-guinness.jpg"],
    discount: 0,
    rating: 4.6,
    reviews: {
      average: 4.6,
      count: 145
    },
    stockQuantity: 40,
    availableCountries: ["Nigeria"],
    tags: ["guinness", "malt", "creamy", "nutritious"],
    bestseller: true,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  {
    id: "11",
    name: "Lacasera Apple Drink 50cl",
    description: "Apple-flavored fruit drink. Natural taste with refreshing qualities.",
    price: 180,
    category: "beverages",
    displayCategory: "Beverages",
    origin: "Nigeria",
    inStock: true,
    images: ["/assets/Lacasara-150x150.jpg"],
    discount: 0,
    rating: 4.2,
    reviews: {
      average: 4.2,
      count: 67
    },
    stockQuantity: 48,
    availableCountries: ["Nigeria"],
    tags: ["apple", "lacasera", "fruit", "refreshing"],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  {
    id: "12",
    name: "Five Alive Citrus Burst 1L",
    description: "Citrus fruit juice blend. Refreshing mix of orange, lemon, and lime flavors.",
    price: 650,
    category: "beverages",
    displayCategory: "Beverages",
    origin: "Nigeria",
    inStock: true,
    images: ["/assets/five-alive.jpg"],
    discount: 8,
    rating: 4.5,
    reviews: {
      average: 4.5,
      count: 123
    },
    stockQuantity: 32,
    availableCountries: ["Nigeria"],
    tags: ["citrus", "five alive", "juice", "refreshing"],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  }
];
