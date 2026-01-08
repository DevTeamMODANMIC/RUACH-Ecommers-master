// Static File Slider Management Utilities
import { SliderItem } from "@/hooks/use-slider-management";

// Default slider data
const DEFAULT_SLIDER_DATA: SliderItem[] = [
  {
    id: "1",
    title: "Discover a World of Products",
    subtitle: "From fashion and electronics to handmade crafts, find it all on Ruach E-Store.",
    description: "Experience the tastes of home with our carefully curated selection of international Products.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
    cta: "Shop Now",
    ctaLink: "/shop"
  },
  {
    id: "2",
    title: "Shop Local, Support Your Community",
    subtitle: "Discover unique products from independent vendors in your area.",
    description: "Quench your thirst with our wide range of international product and services",
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80",
    cta: "View Collection",
    ctaLink: "/shop"
  },
  {
    id: "3",
    title: "Start Your Vendor Journey Today",
    subtitle: "Join our community of vendors and reach customers worldwide",
    description: "Manage up to 3 independent stores with our comprehensive vendor platform",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80",
    cta: "Become a Vendor",
    ctaLink: "/vendor/register"
  },
  {
    id: "4",
    title: "Back to School",
    subtitle: "Complete, Cheap, and Stylish!",
    description: "Get ready for the new school year with our selection of backpacks, notebooks, and more.",
    image: "/WhatsApp Image 2025-09-07 at 14.54.17_aea152e2.jpg",
    cta: "Shop Now",
    ctaLink: "/shop"
  }
];

/**
 * Get slider items from static data
 */
export const getAllSliderItems = async (): Promise<SliderItem[]> => {
  try {
    // In a real implementation, this would fetch from a static JSON file
    // For now, we'll return the default data
    return DEFAULT_SLIDER_DATA;
  } catch (error) {
    console.error("Error getting slider items from static data:", error);
    throw error;
  }
};

/**
 * Create a new slider item (not supported in static mode)
 */
export const createSliderItem = async (data: Omit<SliderItem, "id">): Promise<SliderItem> => {
  throw new Error("Creating slider items is not supported in static mode. Please update the static JSON file directly.");
};

/**
 * Update an existing slider item (not supported in static mode)
 */
export const updateSliderItem = async (id: string, data: Partial<SliderItem>): Promise<SliderItem | null> => {
  throw new Error("Updating slider items is not supported in static mode. Please update the static JSON file directly.");
};

/**
 * Delete a slider item (not supported in static mode)
 */
export const deleteSliderItem = async (id: string): Promise<boolean> => {
  throw new Error("Deleting slider items is not supported in static mode. Please update the static JSON file directly.");
};

/**
 * Initialize the slider with default slides (not supported in static mode)
 */
export const initializeDefaultSliderItems = async (): Promise<boolean> => {
  throw new Error("Initializing slider items is not supported in static mode. The static data is already provided.");
};

/**
 * Generate static slider data file content
 */
export const generateStaticSliderData = (items: SliderItem[]): string => {
  return JSON.stringify(items, null, 2);
};

/**
 * Validate slider data structure
 */
export const validateSliderData = (data: any): data is SliderItem[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  
  return data.every(item => 
    typeof item.title === "string" &&
    typeof item.subtitle === "string" &&
    typeof item.description === "string" &&
    typeof item.image === "string" &&
    typeof item.cta === "string" &&
    typeof item.ctaLink === "string"
  );
};