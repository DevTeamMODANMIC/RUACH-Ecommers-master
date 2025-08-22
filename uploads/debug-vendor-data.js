// Debug script to check vendor data
// Run this in the browser console on the vendor dashboard page

console.log("=== VENDOR DEBUG INFO ===");

// Check if user is logged in
const user = window.__NEXT_DATA__ || "Check auth state in React DevTools";
console.log("1. User auth state:", user);

// Check localStorage for any cached data
console.log("2. LocalStorage keys:", Object.keys(localStorage));

// Check if Firebase is connected
console.log("3. Firebase app:", window.firebase || "Firebase not found in window");

// Manual check - you can run this in console
console.log(`
4. Manual Firebase Query:
Copy and paste this in the console to manually check your stores:

// First, get your user ID from the auth context
// Then run:
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './lib/firebase';

const checkStores = async (userId) => {
  const q = query(collection(db, "vendors"), where("ownerId", "==", userId));
  const snapshot = await getDocs(q);
  console.log("Manual store check:", snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
};

// Replace 'YOUR_USER_ID' with your actual Firebase UID
checkStores('YOUR_USER_ID');
`);

console.log("=== END DEBUG INFO ===");