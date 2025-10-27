// Centralized category configuration for the whole site
export type MainCategoryId =
  | "all"
  | "appliances"
  | "phones-tablets"
  | "electronics"
  | "fashion"
  | "computing"
  | "gaming"
  | "health-beauty"
  | "home-office"
  | "supermarket"
  | "others";

// Service Categories for service providers
export type ServiceCategoryId = 
  | "plumbing" 
  | "electrical" 
  | "cleaning" 
  | "event-planning" 
  | "catering" 
  | "beauty" 
  | "fitness" 
  | "tutoring" 
  | "photography" 
  | "repairs" 
  | "landscaping" 
  | "other";

export interface ServiceCategoryItem {
  value: ServiceCategoryId;
  label: string;
  description?: string;
  icon?: string;
}

// Service categories for the service provider functionality
export const serviceCategories: ServiceCategoryItem[] = [
  { value: "plumbing", label: "Plumbing", description: "Pipe repair, installation, and maintenance" },
  { value: "electrical", label: "Electrical", description: "Wiring, repairs, and electrical installations" },
  { value: "cleaning", label: "Cleaning", description: "Home and office cleaning services" },
  { value: "event-planning", label: "Event Planning", description: "Wedding, party, and corporate event planning" },
  { value: "catering", label: "Catering", description: "Food catering for events and occasions" },
  { value: "beauty", label: "Beauty & Wellness", description: "Hair, makeup, skincare, and spa services" },
  { value: "fitness", label: "Fitness & Training", description: "Personal training and fitness coaching" },
  { value: "tutoring", label: "Tutoring & Education", description: "Academic tutoring and skill training" },
  { value: "photography", label: "Photography & Video", description: "Event photography and videography" },
  { value: "repairs", label: "Repairs & Maintenance", description: "General repairs and home maintenance" },
  { value: "landscaping", label: "Landscaping & Gardening", description: "Garden design and maintenance" },
  { value: "other", label: "Other Services", description: "Miscellaneous professional services" }
];

export interface SubcategoryItem {
  id: string;
  name: string;
  items?: string[]; // Optional sub-items for deeper nesting
}

export interface CategoryItem {
  id: MainCategoryId;
  name: string;
  subcategories?: SubcategoryItem[];
}

// Main categories used across the site with subcategories
export const MAIN_CATEGORIES: CategoryItem[] = [
  { id: "all", name: "All Products" },
  { 
    id: "appliances", 
    name: "Appliances",
    subcategories: [
      { id: "kitchen-appliances", name: "Kitchen Appliances", items: ["Blenders", "Microwaves", "Rice Cookers", "Food Processors"] },
      { id: "home-appliances", name: "Home Appliances", items: ["Washing Machines", "Refrigerators", "Air Conditioners", "Vacuum Cleaners"] },
      { id: "small-appliances", name: "Small Appliances", items: ["Toasters", "Coffee Makers", "Electric Kettles", "Irons"] }
    ]
  },
  { 
    id: "phones-tablets", 
    name: "Phones & Tablets",
    subcategories: [
      { id: "smartphones", name: "Smartphones", items: ["Android Phones", "iPhones", "Feature Phones"] },
      { id: "tablets", name: "Tablets", items: ["Android Tablets", "iPads", "Windows Tablets"] },
      { id: "accessories", name: "Accessories", items: ["Cases & Covers", "Screen Protectors", "Chargers", "Power Banks"] }
    ]
  },
  { 
    id: "electronics", 
    name: "Electronics",
    subcategories: [
      { id: "audio-video", name: "Audio & Video", items: ["Headphones", "Speakers", "Cameras", "TVs"] },
      { id: "wearables", name: "Wearables", items: ["Smart Watches", "Fitness Trackers", "Smart Glasses"] },
      { id: "car-electronics", name: "Car Electronics", items: ["Car Audio", "Dash Cams", "GPS Navigation"] }
    ]
  },
  { 
    id: "fashion", 
    name: "Fashion",
    subcategories: [
      { id: "mens-fashion", name: "Men's Fashion", items: ["Shirts", "Trousers", "Accessories"] },
      { id: "womens-fashion", name: "Women's Fashion", items: ["Dresses", "Tops", "Bags"] },
      { id: "kids-fashion", name: "Kids' Fashion", items: ["Boys Clothing", "Girls Clothing", "Baby Clothes"] },
      { id: "shoes", name: "Shoes", items: ["Men's Shoes", "Women's Shoes", "Kids Shoes", "Sports Shoes", "Casual Shoes", "Formal Shoes"] }
    ]
  },
  { 
    id: "computing", 
    name: "Computing",
    subcategories: [
      { id: "laptops", name: "Laptops", items: ["Gaming Laptops", "Business Laptops", "Ultrabooks"] },
      { id: "desktops", name: "Desktops", items: ["All-in-One PCs", "Gaming PCs", "Workstations"] },
      { id: "computer-accessories", name: "Accessories", items: ["Keyboards", "Mice", "Monitors", "Storage"] }
    ]
  },
  { 
    id: "gaming", 
    name: "Gaming",
    subcategories: [
      { id: "consoles", name: "Consoles", items: ["PlayStation", "Xbox", "Nintendo"] },
      { id: "games", name: "Games", items: ["Digital Games", "Physical Games"] },
      { id: "gaming-accessories", name: "Gaming Accessories", items: ["Controllers", "Headsets", "Gaming Chairs"] }
    ]
  },
  { 
    id: "health-beauty", 
    name: "Health & Beauty",
    subcategories: [
      { id: "skincare", name: "Skincare", items: ["Cleansers", "Moisturizers", "Sunscreen", "Serums"] },
      { id: "haircare", name: "Haircare", items: ["Shampoos", "Conditioners", "Hair Styling", "Hair Tools"] },
      { id: "fragrances", name: "Fragrances", items: ["Perfumes", "Body Sprays", "Deodorants"] },
      { id: "personal-care", name: "Personal Care", items: ["Oral Care", "Body Care", "Health Devices"] }
    ]
  },
  { 
    id: "home-office", 
    name: "Home & Office",
    subcategories: [
      { id: "furniture", name: "Furniture", items: ["Chairs", "Desks", "Storage", "Decor"] },
      { id: "lighting", name: "Lighting", items: ["LED Lights", "Lamps", "Smart Lighting"] },
      { id: "office-supplies", name: "Office Supplies", items: ["Stationery", "Printers", "Paper", "Organization"] }
    ]
  },
  { 
    id: "supermarket", 
    name: "Supermarket",
    subcategories: [
      { id: "food-beverages", name: "Food & Beverages", items: ["Drinks", "Snacks", "Canned Foods", "Spices"] },
      { id: "fresh-produce", name: "Fresh Produce", items: ["Fruits", "Vegetables", "Meat", "Fish"] },
      { id: "household", name: "Household", items: ["Cleaning Supplies", "Baby Products", "Pet Supplies"] },
      { id: "grains-staples", name: "Grains & Staples", items: ["Rice", "Flour", "Oil", "Sugar"] }
    ]
  },
  { 
    id: "others", 
    name: "Others",
    subcategories: [
      { id: "miscellaneous", name: "Miscellaneous", items: ["Various Items", "Unique Products"] },
      { id: "specialty", name: "Specialty Items", items: ["Custom Products", "Handmade Items"] }
    ]
  }
];

console.log("MAIN_CATEGORIES loaded:", MAIN_CATEGORIES.map(c => c.id));

// Simplified category mapping for drinks/beverages
export const DRINKS_CATEGORIES: Record<string, MainCategoryId> = {
  "drinks": "supermarket",
  "beverages": "supermarket"
};

// Utility to normalize a category id coming from URL/search/vendor input
export function normalizeCategoryId(input?: string | null): MainCategoryId {
  const id = (input || "all").toLowerCase().trim();
  
  // Direct match to main categories
  if (MAIN_CATEGORIES.some((c) => c.id === (id as MainCategoryId))) {
    return id as MainCategoryId;
  }
  
  // Special handling for drinks/beverages
  if (id in DRINKS_CATEGORIES) {
    return DRINKS_CATEGORIES[id];
  }
  
  return "others"; // Anything unknown falls under Others
}

// Given a product's raw category/displayCategory, decide which main category bucket it belongs to
export function bucketProductToMainCategory(product: { category?: string; displayCategory?: string }): MainCategoryId {
  const cat = (product.category || "").toLowerCase().trim();
  const disp = (product.displayCategory || "").toLowerCase().trim();
  
  // If no category info, return others
  if (!cat && !disp) {
    return "others";
  }
  
  // First check if the category is a direct match to main categories
  if (MAIN_CATEGORIES.some((c) => c.id === (cat as MainCategoryId))) {
    return cat as MainCategoryId;
  }
  
  // If not a direct match, it's likely a subcategory ID
  // Try to find which main category this subcategory belongs to
  for (const mainCategory of MAIN_CATEGORIES) {
    if (mainCategory.subcategories) {
      for (const subcategory of mainCategory.subcategories) {
        // Check if the product's category matches a subcategory ID
        if (subcategory.id === cat) {
          return mainCategory.id;
        }
        
        // Check if the product's displayCategory matches a subcategory name (case insensitive)
        if (subcategory.name.toLowerCase() === disp) {
          return mainCategory.id;
        }
      }
    }
  }
  
  // Special handling for drinks/beverages
  if (cat in DRINKS_CATEGORIES) {
    return DRINKS_CATEGORIES[cat];
  }
  
  if (disp in DRINKS_CATEGORIES) {
    return DRINKS_CATEGORIES[disp];
  }

  // Check if it's a drink/beverage by content
  const drinkKeywords = ['drink', 'beverage', 'soda', 'juice', 'water', 'tea', 'coffee'];
  if (drinkKeywords.some(keyword => cat.includes(keyword) || disp.includes(keyword))) {
    return "supermarket";
  }

  // Check if it's a phone/tablet by content
  const phoneKeywords = ['phone', 'tablet', 'mobile', 'smartphone', 'iphone', 'android'];
  if (phoneKeywords.some(keyword => cat.includes(keyword) || disp.includes(keyword))) {
    return "phones-tablets";
  }

  // Check if it's an electronic device
  const electronicKeywords = ['electronic', 'laptop', 'computer', 'desktop', 'monitor', 'keyboard', 'mouse'];
  if (electronicKeywords.some(keyword => cat.includes(keyword) || disp.includes(keyword))) {
    return "computing";
  }

  // Default to others
  return "others";
}
