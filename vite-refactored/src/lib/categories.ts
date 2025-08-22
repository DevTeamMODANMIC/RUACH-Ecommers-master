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

export interface CategoryItem {
  id: MainCategoryId;
  name: string;
}

// Main categories used across the site (Shop filters, Vendor, etc.)
export const MAIN_CATEGORIES: CategoryItem[] = [
  { id: "all", name: "All Products" },
  { id: "appliances", name: "Appliances" },
  { id: "phones-tablets", name: "Phones & Tablets" },
  { id: "electronics", name: "Electronics" },
  { id: "fashion", name: "Fashion" },
  { id: "computing", name: "Computing" },
  { id: "gaming", name: "Gaming" },
  { id: "health-beauty", name: "Health & Beauty" },
  { id: "home-office", name: "Home & Office" },
  { id: "supermarket", name: "Supermarket" },
  { id: "others", name: "Others" }
];

// Legacy subcategory mappings (food-focused). These map to the new structure.
export const LEGACY_TO_MAIN_CATEGORY: Record<string, MainCategoryId> = {
  drinks: "supermarket",
  beverages: "supermarket",
  flour: "supermarket",
  rice: "supermarket",
  "pap-custard": "supermarket",
  spices: "supermarket",
  "dried-spices": "supermarket",
  oil: "supermarket",
  provisions: "supermarket",
  "fresh-produce": "supermarket",
  "fresh-vegetables": "supermarket",
  vegetables: "supermarket",
  meat: "supermarket",
  food: "supermarket",
};

// Reverse mapping for convenience when we want to build URLs or handle display
export const PRODUCT_CATEGORY_TO_URL_PARAM: Record<string, string> = {
  drinks: "drinks",
  beverages: "drinks",
  flour: "flour",
  rice: "rice",
  food: "food",
  spices: "spices",
  vegetables: "vegetables",
  meat: "meat",
};

// Utility to normalize a category id coming from URL/search/vendor input
export function normalizeCategoryId(input?: string | null): MainCategoryId {
  const id = (input || "all").toLowerCase().trim();
  if (MAIN_CATEGORIES.some((c) => c.id === (id as MainCategoryId))) {
    return id as MainCategoryId;
  }
  // Try legacy map
  if (id in LEGACY_TO_MAIN_CATEGORY) return LEGACY_TO_MAIN_CATEGORY[id as keyof typeof LEGACY_TO_MAIN_CATEGORY];
  return "others"; // Anything unknown falls under Others
}

// Given a product's raw category/displayCategory, decide which main category bucket it belongs to
export function bucketProductToMainCategory(product: { category?: string; displayCategory?: string }): MainCategoryId {
  const cat = (product.category || "").toLowerCase().trim();
  const disp = (product.displayCategory || "").toLowerCase().trim();

  // Exact match to main categories
  const direct = normalizeCategoryId(cat);
  if (direct !== "others" || MAIN_CATEGORIES.some((c) => c.id === (cat as MainCategoryId))) {
    return direct;
  }

  // Legacy mapping
  if (cat in LEGACY_TO_MAIN_CATEGORY) return LEGACY_TO_MAIN_CATEGORY[cat];
  if (disp in LEGACY_TO_MAIN_CATEGORY) return LEGACY_TO_MAIN_CATEGORY[disp as keyof typeof LEGACY_TO_MAIN_CATEGORY];

  return "others";
}
