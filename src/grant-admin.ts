import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";

// Load environment variables
config({ path: ".env" });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function grantAdminPrivilege(email: string) {
  try {
    console.log(`Looking for user with email: ${email}`);
    
    // Find the user by email
    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`User with email ${email} not found`);
      return;
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    console.log(`Found user: ${userData.name || 'N/A'} (${userData.email}) with current role: ${userData.role || 'user'}`);
    
    // Check if user is already an admin
    if (userData.role === 'admin') {
      console.log(`User ${email} is already an admin`);
      return;
    }
    
    // Grant admin role
    await updateDoc(doc(db, "users", userDoc.id), {
      role: 'admin',
      updatedAt: new Date(),
    });
    
    console.log(`Successfully granted admin privileges to ${email}`);
  } catch (error) {
    console.error('Error granting admin privilege:', error);
  }
}

// Get email from command line arguments
const args = process.argv.slice(2);
const email = args[0];

if (!email) {
  console.log('Please provide an email address as an argument');
  console.log('Usage: npm run grant-admin <email>');
  process.exit(1);
}

// Initialize Firebase
console.log('Initializing Firebase...');
grantAdminPrivilege(email);