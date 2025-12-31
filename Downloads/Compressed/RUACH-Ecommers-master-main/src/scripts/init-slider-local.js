/**
 * Script to initialize slider data in local storage for development/testing
 * This creates a localStorage.json file that can be used to simulate localStorage in browser
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default slider data
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

function initializeLocalStorageFile() {
  try {
    // Create the data object that simulates localStorage
    const localStorageData = {
      "ruach_slider_items": JSON.stringify(defaultSlides)
    };
    
    // Write to a file that can be used for development
    const filePath = path.join(__dirname, '..', '..', 'localStorage.json');
    fs.writeFileSync(filePath, JSON.stringify(localStorageData, null, 2));
    
    console.log("Slider data initialized successfully!");
    console.log(`Created file: ${filePath}`);
    console.log(`Added ${defaultSlides.length} slides to local storage simulation.`);
    
    // Also output the browser command for easy copy/paste
    console.log("\n--- Browser Developer Console Command ---");
    console.log("To initialize in your browser, run this in the developer console:");
    console.log("```javascript");
    console.log(`localStorage.setItem("ruach_slider_items", '${JSON.stringify(defaultSlides).replace(/'/g, "\\'")}');`);
    console.log("```");
    
    return true;
  } catch (error) {
    console.error("Error initializing slider data:", error.message);
    return false;
  }
}

// Run the initialization
initializeLocalStorageFile();