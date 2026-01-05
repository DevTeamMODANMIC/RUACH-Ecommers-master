/**
 * Script to initialize slider data in local storage
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

// Function to initialize slider data
function initializeSliderData() {
  try {
    // Save to local storage
    localStorage.setItem("ruach_slider_items", JSON.stringify(defaultSlides));
    console.log("Slider data initialized in local storage successfully!");
    alert("Slider data initialized successfully! You can now access the Slider Management page.");
    return true;
  } catch (error) {
    console.error("Error initializing slider data in local storage:", error);
    alert("Error initializing slider data. Please check the console for details.");
    return false;
  }
}

// Function to clear slider data
function clearSliderData() {
  try {
    localStorage.removeItem("ruach_slider_items");
    console.log("Slider data cleared from local storage successfully!");
    alert("Slider data cleared successfully!");
    return true;
  } catch (error) {
    console.error("Error clearing slider data from local storage:", error);
    alert("Error clearing slider data. Please check the console for details.");
    return false;
  }
}

// Auto-initialize if requested
if (window.location.hash === '#init-slider') {
  initializeSliderData();
}

// Add to window object for easy access
window.SliderManager = {
  initialize: initializeSliderData,
  clear: clearSliderData
};

console.log("Slider Manager loaded. Use window.SliderManager.initialize() to initialize slider data.");