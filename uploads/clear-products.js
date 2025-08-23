// clear-products.js - Script to clear all products from Firebase
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, deleteDoc, doc } = require("firebase/firestore");
require('dotenv').config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearAllProducts() {
  try {
    console.log("Starting to clear all products from Firebase...");
    
    // Get all products
    const productsRef = collection(db, "products");
    const productsSnapshot = await getDocs(productsRef);
    const totalProducts = productsSnapshot.size;
    
    console.log(`Found ${totalProducts} products to delete.`);
    
    // Delete each product
    let deletedCount = 0;
    for (const productDoc of productsSnapshot.docs) {
      await deleteDoc(doc(db, "products", productDoc.id));
      deletedCount++;
      console.log(`Deleted product ${deletedCount}/${totalProducts}: ${productDoc.id}`);
    }
    
    console.log("All products have been deleted successfully.");
  } catch (error) {
    console.error("Error clearing products:", error);
  }
}

// Run the function
clearAllProducts(); 