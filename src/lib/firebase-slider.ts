// Firebase Slider Management Utilities
import { ref, set, push, update, remove, get } from "firebase/database";
import { rtdb } from "./firebase";
import { getAuth } from "firebase/auth";

// Local storage key for temporary slider data
const LOCAL_STORAGE_KEY = "ruach_slider_items";

/**
 * Check if user is authenticated and has admin privileges
 */
const isAdminUser = () => {
  const user = getAuth().currentUser;
  // In a real app, you would check for admin role here
  // For now, we'll just check if user is authenticated
  return !!user;
};

/**
 * Get slider items from local storage (fallback method)
 */
const getSliderItemsFromLocalStorage = (): any[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading from local storage:", error);
    return [];
  }
};

/**
 * Save slider items to local storage (fallback method)
 */
const saveSliderItemsToLocalStorage = (items: any[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error("Error saving to local storage:", error);
    return false;
  }
};

/**
 * Create a new slider item with a specific ID
 * @param id - The ID for the new slider item
 * @param data - The slider data to store
 */
export const createSliderItem = async (id: string, data: any) => {
  try {
    // Check if user has permission
    if (!isAdminUser()) {
      throw new Error("Permission denied: User not authenticated or not authorized");
    }
    
    const sliderRef = ref(rtdb, `slider/${id}`);
    await set(sliderRef, {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { id, ...data };
  } catch (error: any) {
    console.error(`Error creating slider item at slider/${id}:`, error);
    // Check for permission denied error (different ways Firebase might report it)
    if (error.code === 'PERMISSION_DENIED' || 
        error.message?.includes('PERMISSION_DENIED') ||
        error.message?.includes('Permission denied')) {
      // Fallback to local storage
      const items = getSliderItemsFromLocalStorage();
      const newItem = { id, ...data, createdAt: Date.now(), updatedAt: Date.now() };
      items.push(newItem);
      saveSliderItemsToLocalStorage(items);
      console.warn("Using local storage as fallback for createSliderItem");
      return newItem;
    }
    throw new Error(error.message || "Unknown error occurred");
  }
};

/**
 * Create a new slider item with auto-generated ID
 * @param data - The slider data to store
 * @returns The created data with the auto-generated ID
 */
export const createSliderItemWithAutoId = async (data: any) => {
  try {
    // Check if user has permission
    if (!isAdminUser()) {
      throw new Error("Permission denied: User not authenticated or not authorized");
    }
    
    const newNodeRef = push(ref(rtdb, "slider"));
    const id = newNodeRef.key;
    
    if (!id) {
      throw new Error("Failed to generate slider item ID");
    }
    
    await set(newNodeRef, {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return { id, ...data };
  } catch (error: any) {
    console.error(`Error creating slider item:`, error);
    // Check for permission denied error (different ways Firebase might report it)
    if (error.code === 'PERMISSION_DENIED' || 
        error.message?.includes('PERMISSION_DENIED') ||
        error.message?.includes('Permission denied')) {
      // Fallback to local storage
      const items = getSliderItemsFromLocalStorage();
      const id = `local_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const newItem = { id, ...data, createdAt: Date.now(), updatedAt: Date.now() };
      items.push(newItem);
      saveSliderItemsToLocalStorage(items);
      console.warn("Using local storage as fallback for createSliderItemWithAutoId");
      return newItem;
    }
    throw new Error(error.message || "Unknown error occurred");
  }
};

/**
 * Update an existing slider item
 * @param id - The ID of the slider item to update
 * @param data - The data to update in the slider item
 */
export const updateSliderItem = async (id: string, data: any) => {
  try {
    // Check if user has permission
    if (!isAdminUser()) {
      throw new Error("Permission denied: User not authenticated or not authorized");
    }
    
    const sliderRef = ref(rtdb, `slider/${id}`);
    await update(sliderRef, {
      ...data,
      updatedAt: Date.now(),
    });
    return { id, ...data };
  } catch (error: any) {
    console.error(`Error updating slider item at slider/${id}:`, error);
    // Check for permission denied error (different ways Firebase might report it)
    if (error.code === 'PERMISSION_DENIED' || 
        error.message?.includes('PERMISSION_DENIED') ||
        error.message?.includes('Permission denied')) {
      // Fallback to local storage
      const items = getSliderItemsFromLocalStorage();
      const index = items.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...data, updatedAt: Date.now() };
        saveSliderItemsToLocalStorage(items);
        console.warn("Using local storage as fallback for updateSliderItem");
        return items[index];
      }
    }
    throw new Error(error.message || "Unknown error occurred");
  }
};

/**
 * Delete a slider item
 * @param id - The ID of the slider item to delete
 */
export const deleteSliderItem = async (id: string) => {
  try {
    // Check if user has permission
    if (!isAdminUser()) {
      throw new Error("Permission denied: User not authenticated or not authorized");
    }
    
    const sliderRef = ref(rtdb, `slider/${id}`);
    await remove(sliderRef);
    return true;
  } catch (error: any) {
    console.error(`Error deleting slider item at slider/${id}:`, error);
    // Check for permission denied error (different ways Firebase might report it)
    if (error.code === 'PERMISSION_DENIED' || 
        error.message?.includes('PERMISSION_DENIED') ||
        error.message?.includes('Permission denied')) {
      // Fallback to local storage
      const items = getSliderItemsFromLocalStorage();
      const filteredItems = items.filter((item: any) => item.id !== id);
      saveSliderItemsToLocalStorage(filteredItems);
      console.warn("Using local storage as fallback for deleteSliderItem");
      return true;
    }
    throw new Error(error.message || "Unknown error occurred");
  }
};

/**
 * Get a slider item by ID
 * @param id - The ID of the slider item to get
 */
export const getSliderItem = async (id: string) => {
  try {
    const sliderRef = ref(rtdb, `slider/${id}`);
    const snapshot = await get(sliderRef);
    
    if (snapshot.exists()) {
      return { id, ...snapshot.val() };
    } else {
      return null;
    }
  } catch (error: any) {
    console.error(`Error getting slider item at slider/${id}:`, error);
    // Check for permission denied error (different ways Firebase might report it)
    if (error.code === 'PERMISSION_DENIED' || 
        error.message?.includes('PERMISSION_DENIED') ||
        error.message?.includes('Permission denied')) {
      // Fallback to local storage
      const items = getSliderItemsFromLocalStorage();
      const item = items.find((item: any) => item.id === id);
      console.warn("Using local storage as fallback for getSliderItem");
      return item || null;
    }
    throw new Error(error.message || "Unknown error occurred");
  }
};

/**
 * Get all slider items
 */
export const getAllSliderItems = async () => {
  try {
    const sliderRef = ref(rtdb, "slider");
    const snapshot = await get(sliderRef);
    
    if (snapshot.exists()) {
      const items: any[] = [];
      snapshot.forEach((childSnapshot) => {
        items.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      return items;
    } else {
      return [];
    }
  } catch (error: any) {
    console.error(`Error getting slider items:`, error);
    // Check for permission denied error (different ways Firebase might report it)
    if (error.code === 'PERMISSION_DENIED' || 
        error.message?.includes('PERMISSION_DENIED') ||
        error.message?.includes('Permission denied')) {
      // Fallback to local storage
      const items = getSliderItemsFromLocalStorage();
      console.warn("Using local storage as fallback for getAllSliderItems");
      return items;
    }
    throw new Error(error.message || "Unknown error occurred");
  }
};

/**
 * Delete all slider items
 */
export const deleteAllSliderItems = async () => {
  try {
    // Check if user has permission
    if (!isAdminUser()) {
      throw new Error("Permission denied: User not authenticated or not authorized");
    }
    
    const sliderRef = ref(rtdb, "slider");
    await remove(sliderRef);
    return true;
  } catch (error: any) {
    console.error(`Error deleting all slider items:`, error);
    // Check for permission denied error (different ways Firebase might report it)
    if (error.code === 'PERMISSION_DENIED' || 
        error.message?.includes('PERMISSION_DENIED') ||
        error.message?.includes('Permission denied')) {
      // Fallback to local storage
      saveSliderItemsToLocalStorage([]);
      console.warn("Using local storage as fallback for deleteAllSliderItems");
      return true;
    }
    throw new Error(error.message || "Unknown error occurred");
  }
};

/**
 * Initialize the slider database with default slides
 */
export const initializeDefaultSliderItems = async () => {
  try {
    // Check if user has permission
    if (!isAdminUser()) {
      throw new Error("Permission denied: User not authenticated or not authorized");
    }
    
    // Check if there are already items in the database
    const existingItems = await getAllSliderItems();
    
    // If there are no items, initialize with default slides
    if (existingItems.length === 0) {
      const defaultSlides = [
        {
          title: "Discover a World of Products",
          subtitle: "From fashion and electronics to handmade crafts, find it all on Ruach E-Store.",
          description: "Experience the tastes of home with our carefully curated selection of international Products.",
          image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
          cta: "Shop Now",
          ctaLink: "/shop"
        },
        {
          title: "Shop Local, Support Your Community",
          subtitle: "Discover unique products from independent vendors in your area.",
          description: "Quench your thirst with our wide range of international product and services",
          image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80",
          cta: "View Collection",
          ctaLink: "/shop"
        },
        {
          title: "Start Your Vendor Journey Today",
          subtitle: "Join our community of vendors and reach customers worldwide",
          description: "Manage up to 3 independent stores with our comprehensive vendor platform",
          image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80",
          cta: "Become a Vendor",
          ctaLink: "/vendor/register"
        },
        {
          title: "Back to School",
          subtitle: "Complete, Cheap, and Stylish!",
          description: "Get ready for the new school year with our selection of backpacks, notebooks, and more.",
          image: "/WhatsApp Image 2025-09-07 at 14.54.17_aea152e2.jpg",
          cta: "Shop Now",
          ctaLink: "/shop"
        }
      ];

      // Create each default slide in the database
      for (const slide of defaultSlides) {
        await createSliderItemWithAutoId(slide);
      }

      console.log("Default slider items initialized successfully");
      return true;
    } else {
      console.log("Slider items already exist in database, skipping initialization");
      return false;
    }
  } catch (error: any) {
    console.error("Error initializing default slider items:", error);
    // Check for permission denied error (different ways Firebase might report it)
    if (error.code === 'PERMISSION_DENIED' || 
        error.message?.includes('PERMISSION_DENIED') ||
        error.message?.includes('Permission denied')) {
      // Fallback to local storage
      const items = getSliderItemsFromLocalStorage();
      if (items.length === 0) {
        const defaultSlides = [
          {
            id: "local_1",
            title: "Discover a World of Products",
            subtitle: "From fashion and electronics to handmade crafts, find it all on Ruach E-Store.",
            description: "Experience the tastes of home with our carefully curated selection of international Products.",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
            cta: "Shop Now",
            ctaLink: "/shop",
            createdAt: Date.now(),
            updatedAt: Date.now()
          },
          {
            id: "local_2",
            title: "Shop Local, Support Your Community",
            subtitle: "Discover unique products from independent vendors in your area.",
            description: "Quench your thirst with our wide range of international product and services",
            image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80",
            cta: "View Collection",
            ctaLink: "/shop",
            createdAt: Date.now(),
            updatedAt: Date.now()
          },
          {
            id: "local_3",
            title: "Start Your Vendor Journey Today",
            subtitle: "Join our community of vendors and reach customers worldwide",
            description: "Manage up to 3 independent stores with our comprehensive vendor platform",
            image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80",
            cta: "Become a Vendor",
            ctaLink: "/vendor/register",
            createdAt: Date.now(),
            updatedAt: Date.now()
          },
          {
            id: "local_4",
            title: "Back to School",
            subtitle: "Complete, Cheap, and Stylish!",
            description: "Get ready for the new school year with our selection of backpacks, notebooks, and more.",
            image: "/WhatsApp Image 2025-09-07 at 14.54.17_aea152e2.jpg",
            cta: "Shop Now",
            ctaLink: "/shop",
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        ];
        
        saveSliderItemsToLocalStorage(defaultSlides);
        console.warn("Using local storage as fallback for initializeDefaultSliderItems");
        return true;
      }
      return false;
    }
    throw new Error(error.message || "Unknown error occurred");
  }
};