// IndexedDB Slider Management Utilities (JavaScript version for testing)

// Database configuration
const DB_NAME = "RuachEstore";
const DB_VERSION = 1;
const SLIDER_STORE_NAME = "sliderItems";

/**
 * Open IndexedDB connection
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create slider items store if it doesn't exist
      if (!db.objectStoreNames.contains(SLIDER_STORE_NAME)) {
        const store = db.createObjectStore(SLIDER_STORE_NAME, { keyPath: "id", autoIncrement: true });
        store.createIndex("title", "title", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
};

/**
 * Get all slider items from IndexedDB
 */
export const getAllSliderItems = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(SLIDER_STORE_NAME, "readonly");
    const store = transaction.objectStore(SLIDER_STORE_NAME);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error getting slider items from IndexedDB:", error);
    throw error;
  }
};

/**
 * Create a new slider item in IndexedDB
 */
export const createSliderItem = async (data) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(SLIDER_STORE_NAME, "readwrite");
    const store = transaction.objectStore(SLIDER_STORE_NAME);
    
    const item = {
      ...data,
      id: Date.now().toString(), // Simple ID generation
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const request = store.add(item);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error creating slider item in IndexedDB:", error);
    throw error;
  }
};

/**
 * Update an existing slider item in IndexedDB
 */
export const updateSliderItem = async (id, data) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(SLIDER_STORE_NAME, "readwrite");
    const store = transaction.objectStore(SLIDER_STORE_NAME);
    
    // Get the existing item
    const getRequest = store.get(id);
    
    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        if (getRequest.result) {
          const updatedItem = {
            ...getRequest.result,
            ...data,
            updatedAt: new Date().toISOString(),
          };
          
          const putRequest = store.put(updatedItem);
          putRequest.onsuccess = () => resolve(updatedItem);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(null);
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error("Error updating slider item in IndexedDB:", error);
    throw error;
  }
};

/**
 * Delete a slider item from IndexedDB
 */
export const deleteSliderItem = async (id) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(SLIDER_STORE_NAME, "readwrite");
    const store = transaction.objectStore(SLIDER_STORE_NAME);
    const request = store.delete(id);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error deleting slider item from IndexedDB:", error);
    throw error;
  }
};

/**
 * Initialize the slider store with default slides
 */
export const initializeDefaultSliderItems = async () => {
  try {
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

      // Create each default slide in the store
      for (const slide of defaultSlides) {
        await createSliderItem(slide);
      }

      console.log("Default slider items initialized successfully in IndexedDB");
      return true;
    } else {
      console.log("Slider items already exist in IndexedDB, skipping initialization");
      return false;
    }
  } catch (error) {
    console.error("Error initializing default slider items in IndexedDB:", error);
    throw error;
  }
};

/**
 * Migrate data from localStorage to IndexedDB
 */
export const migrateFromLocalStorage = async () => {
  try {
    // Check if there's data in localStorage
    const localStorageData = localStorage.getItem("ruach_slider_items");
    
    if (localStorageData) {
      const sliderItems = JSON.parse(localStorageData);
      
      // Clear existing data in IndexedDB
      const db = await openDB();
      const transaction = db.transaction(SLIDER_STORE_NAME, "readwrite");
      const store = transaction.objectStore(SLIDER_STORE_NAME);
      await store.clear();
      
      // Add all items to IndexedDB
      for (const item of sliderItems) {
        await createSliderItem(item);
      }
      
      console.log(`Migrated ${sliderItems.length} slider items from localStorage to IndexedDB`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error migrating data from localStorage to IndexedDB:", error);
    throw error;
  }
};