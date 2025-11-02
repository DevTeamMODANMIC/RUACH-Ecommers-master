// Firestore Slider Management Utilities
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, where, getDoc } from "firebase/firestore";
import { db } from "./firebase";
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
export const getSliderItemsFromLocalStorage = (): any[] => {
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
export const saveSliderItemsToLocalStorage = (items: any[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error("Error saving to local storage:", error);
    return false;
  }
};

/**
 * Get all slider items from Firestore
 */
export const getAllSliderItems = async () => {
  try {
    // Check if user has permission
    if (!isAdminUser()) {
      throw new Error("Permission denied: User not authenticated or not authorized");
    }
    
    const q = query(collection(db, "slider"));
    const snapshot = await getDocs(q);
    
    const items: any[] = [];
    snapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return items;
  } catch (error: any) {
    console.error("Error getting slider items from Firestore:", error);
    
    // Fallback to local storage
    const items = getSliderItemsFromLocalStorage();
    console.warn("Using local storage as fallback for getAllSliderItems");
    return items;
  }
};

/**
 * Create a new slider item in Firestore
 */
export const createSliderItem = async (id: string, data: any) => {
  try {
    // Check if user has permission
    if (!isAdminUser()) {
      throw new Error("Permission denied: User not authenticated or not authorized");
    }
    
    const docRef = doc(collection(db, "slider"), id);
    await setDoc(docRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return { id, ...data };
  } catch (error: any) {
    console.error("Error creating slider item in Firestore:", error);
    
    // Fallback to local storage
    const items = getSliderItemsFromLocalStorage();
    const newItem = { id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    items.push(newItem);
    saveSliderItemsToLocalStorage(items);
    console.warn("Using local storage as fallback for createSliderItem");
    return newItem;
  }
};

/**
 * Create a new slider item with auto-generated ID in Firestore
 */
export const createSliderItemWithAutoId = async (data: any) => {
  try {
    // Check if user has permission
    if (!isAdminUser()) {
      throw new Error("Permission denied: User not authenticated or not authorized");
    }
    
    const docRef = doc(collection(db, "slider"));
    await setDoc(docRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return { id: docRef.id, ...data };
  } catch (error: any) {
    console.error("Error creating slider item with auto ID in Firestore:", error);
    
    // Fallback to local storage
    const items = getSliderItemsFromLocalStorage();
    const id = `local_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const newItem = { id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    items.push(newItem);
    saveSliderItemsToLocalStorage(items);
    console.warn("Using local storage as fallback for createSliderItemWithAutoId");
    return newItem;
  }
};

/**
 * Update an existing slider item in Firestore
 */
export const updateSliderItem = async (id: string, data: any) => {
  try {
    // Check if user has permission
    if (!isAdminUser()) {
      throw new Error("Permission denied: User not authenticated or not authorized");
    }
    
    const docRef = doc(db, "slider", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
    
    return { id, ...data };
  } catch (error: any) {
    console.error("Error updating slider item in Firestore:", error);
    
    // Fallback to local storage
    const items = getSliderItemsFromLocalStorage();
    const index = items.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
      saveSliderItemsToLocalStorage(items);
      console.warn("Using local storage as fallback for updateSliderItem");
      return items[index];
    }
    return null;
  }
};

/**
 * Delete a slider item from Firestore
 */
export const deleteSliderItem = async (id: string) => {
  try {
    // Check if user has permission
    if (!isAdminUser()) {
      throw new Error("Permission denied: User not authenticated or not authorized");
    }
    
    const docRef = doc(db, "slider", id);
    await deleteDoc(docRef);
    
    return true;
  } catch (error: any) {
    console.error("Error deleting slider item from Firestore:", error);
    
    // Fallback to local storage
    const items = getSliderItemsFromLocalStorage();
    const filteredItems = items.filter((item: any) => item.id !== id);
    saveSliderItemsToLocalStorage(filteredItems);
    console.warn("Using local storage as fallback for deleteSliderItem");
    return true;
  }
};

/**
 * Initialize the slider collection with default slides
 */
export const initializeDefaultSliderItems = async () => {
  try {
    // Check if user has permission
    if (!isAdminUser()) {
      throw new Error("Permission denied: User not authenticated or not authorized");
    }
    
    // Check if there are already items in the collection
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

      // Create each default slide in the collection
      for (const slide of defaultSlides) {
        await createSliderItemWithAutoId(slide);
      }

      console.log("Default slider items initialized successfully");
      return true;
    } else {
      console.log("Slider items already exist in collection, skipping initialization");
      return false;
    }
  } catch (error: any) {
    console.error("Error initializing default slider items:", error);
    
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "local_2",
          title: "Shop Local, Support Your Community",
          subtitle: "Discover unique products from independent vendors in your area.",
          description: "Quench your thirst with our wide range of international product and services",
          image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80",
          cta: "View Collection",
          ctaLink: "/shop",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "local_3",
          title: "Start Your Vendor Journey Today",
          subtitle: "Join our community of vendors and reach customers worldwide",
          description: "Manage up to 3 independent stores with our comprehensive vendor platform",
          image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80",
          cta: "Become a Vendor",
          ctaLink: "/vendor/register",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "local_4",
          title: "Back to School",
          subtitle: "Complete, Cheap, and Stylish!",
          description: "Get ready for the new school year with our selection of backpacks, notebooks, and more.",
          image: "/WhatsApp Image 2025-09-07 at 14.54.17_aea152e2.jpg",
          cta: "Shop Now",
          ctaLink: "/shop",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      saveSliderItemsToLocalStorage(defaultSlides);
      console.warn("Using local storage as fallback for initializeDefaultSliderItems");
      return true;
    }
    return false;
  }
};