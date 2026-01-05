#!/usr/bin/env ts-node
/**
 * Script to initialize Firebase Realtime Database with default slider data
 * Run this script to populate the slider collection with default slides
 */

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { initializeDefaultSliderItems } from "../lib/firebase-slider";

// Firebase configuration - you'll need to provide your actual config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.FIREBASE_APP_ID || "your-app-id",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "your-measurement-id",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://your-project-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const rtdb = getDatabase(app);

async function initializeSliderData() {
  console.log("Initializing slider data...");
  
  try {
    const result = await initializeDefaultSliderItems();
    if (result) {
      console.log("Slider data initialized successfully!");
    } else {
      console.log("Slider data already exists, no initialization needed.");
    }
  } catch (error: any) {
    console.error("Error initializing slider data:", error.message);
    process.exit(1);
  }
}

// Run the initialization
initializeSliderData();