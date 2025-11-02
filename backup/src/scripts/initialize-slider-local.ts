#!/usr/bin/env ts-node
/**
 * Script to initialize local storage with default slider data
 * This is a temporary workaround for Firebase permission issues
 */

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

function initializeLocalStorageSlider() {
  try {
    // Save to local storage
    localStorage.setItem("ruach_slider_items", JSON.stringify(defaultSlides));
    console.log("Slider data initialized in local storage successfully!");
    console.log(`Added ${defaultSlides.length} slides to local storage.`);
    return true;
  } catch (error: any) {
    console.error("Error initializing slider data in local storage:", error.message);
    return false;
  }
}

// Since we're running in Node.js environment, we need to simulate localStorage
// In a browser environment, you would just run:
// localStorage.setItem("ruach_slider_items", JSON.stringify(defaultSlides));

console.log("To initialize slider data in your browser:");
console.log("1. Open your browser's developer console");
console.log("2. Run this command:");
console.log("```javascript");
console.log(`localStorage.setItem("ruach_slider_items", '${JSON.stringify(defaultSlides)}')`);
console.log("```");
console.log("3. Refresh the slider management page");

// For Node.js environment, we'll just output the command that should be run in browser
console.log("\n--- Browser Command ---");
console.log("Run this in your browser console:");
console.log(`localStorage.setItem("ruach_slider_items", '${JSON.stringify(defaultSlides).replace(/'/g, "\\'")}');`);