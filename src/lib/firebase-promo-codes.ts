import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  deleteDoc,
  Timestamp,
  FirestoreError,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { PromoCode } from "../types";
import { getProduct } from "./firebase-products";

// Helper function to convert Firestore Timestamp to Date
const toDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// ✅ Create Promo Code
export const createPromoCode = async (
  promoCodeData: Omit<PromoCode, "id" | "createdAt" | "updatedAt" | "usedCount">
): Promise<PromoCode> => {
  try {
    // Remove undefined fields to prevent Firestore errors
    const cleanPromoCodeData: any = Object.fromEntries(
      Object.entries(promoCodeData).filter(([_, value]) => value !== undefined)
    );

    const promoCode = {
      ...cleanPromoCodeData,
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, "promoCodes"), promoCode);
    
    return {
      id: docRef.id,
      ...promoCode,
    } as PromoCode;
  } catch (error: any) {
    console.error("Error creating promo code:", error);
    throw new Error(error.message);
  }
};

// ✅ Get Promo Code by ID
export const getPromoCode = async (id: string): Promise<PromoCode | null> => {
  try {
    const promoCodeDoc = await getDoc(doc(db, "promoCodes", id));
    if (promoCodeDoc.exists()) {
      const data = promoCodeDoc.data();
      return {
        id: promoCodeDoc.id,
        ...data,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
        expirationDate: data.expirationDate ? toDate(data.expirationDate) : undefined,
      } as PromoCode;
    }
    return null;
  } catch (error: any) {
    console.error("Error getting promo code:", error);
    return null;
  }
};

// ✅ Get Promo Code by Code (the actual promo string)
export const getPromoCodeByCode = async (code: string): Promise<PromoCode | null> => {
  try {
    const q = query(
      collection(db, "promoCodes"),
      where("code", "==", code)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
        expirationDate: data.expirationDate ? toDate(data.expirationDate) : undefined,
      } as PromoCode;
    }
    return null;
  } catch (error: any) {
    console.error("Error getting promo code by code:", error);
    return null;
  }
};

// ✅ Get all promo codes for a vendor
export const getVendorPromoCodes = async (vendorId: string): Promise<PromoCode[]> => {
  try {
    // Remove the orderBy clause to avoid needing composite index
    const q = query(
      collection(db, "promoCodes"),
      where("vendorId", "==", vendorId)
      // orderBy("createdAt", "desc") - Removed to avoid composite index requirement
    );

    const snapshot = await getDocs(q);
    // Sort client-side instead
    const promoCodes = snapshot.docs.map(
      (doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
          expirationDate: data.expirationDate ? toDate(data.expirationDate) : undefined,
        } as PromoCode;
      }
    );
    
    // Sort by createdAt descending (newest first)
    promoCodes.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return promoCodes;
  } catch (error: any) {
    console.error("Error getting vendor promo codes:", error);
    return [];
  }
};

// ✅ Update promo code
export const updatePromoCode = async (
  id: string,
  updates: Partial<PromoCode>
): Promise<boolean> => {
  try {
    // Remove undefined fields to prevent Firestore errors
    const cleanUpdates: any = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await updateDoc(doc(db, "promoCodes", id), {
      ...cleanUpdates,
      updatedAt: new Date(),
    });
    return true;
  } catch (error: any) {
    console.error("Error updating promo code:", error);
    throw new Error(error.message);
  }
};

// ✅ Delete promo code
export const deletePromoCode = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "promoCodes", id));
    return true;
  } catch (error: any) {
    console.error("Error deleting promo code:", error);
    throw new Error(error.message);
  }
};

// ✅ Validate promo code
export const validatePromoCode = async (
  code: string,
  orderTotal: number,
  cartProductIds: string[],
  customerId?: string
): Promise<{ isValid: boolean; promoCode?: PromoCode; error?: string }> => {
  try {
    const promoCode = await getPromoCodeByCode(code);
    
    if (!promoCode) {
      return { isValid: false, error: "Promo code not found" };
    }
    
    // Check if promo code is active
    if (!promoCode.isActive) {
      return { isValid: false, error: "Promo code is not active" };
    }
    
    // Check expiration date
    if (promoCode.expirationDate && new Date() > promoCode.expirationDate) {
      return { isValid: false, error: "Promo code has expired" };
    }
    
    // Check minimum order amount
    if (promoCode.minimumOrderAmount && orderTotal < promoCode.minimumOrderAmount) {
      return { 
        isValid: false, 
        error: `Minimum order amount is ${promoCode.minimumOrderAmount}` 
      };
    }
    
    // Check max uses
    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return { isValid: false, error: "Promo code has reached its maximum usage limit" };
    }
    
    // Check if it's for a specific customer
    if (promoCode.customerId && customerId && promoCode.customerId !== customerId) {
      return { isValid: false, error: "Promo code is not valid for this customer" };
    }
    
    // Check if promo code vendor matches products in cart
    if (cartProductIds && cartProductIds.length > 0) {
      // Get vendor IDs for all products in cart
      const productVendors = new Set<string>();
      for (const productId of cartProductIds) {
        const product = await getProduct(productId);
        if (product && product.vendorId) {
          productVendors.add(product.vendorId);
        }
      }
      
      // If no products have vendor IDs, skip vendor validation (backward compatibility)
      if (productVendors.size > 0) {
        // Check if promo code vendor matches any product vendor
        if (!productVendors.has(promoCode.vendorId)) {
          return { isValid: false, error: "Promo code is not valid for products in your cart" };
        }
      }
    }
    
    return { isValid: true, promoCode };
  } catch (error: any) {
    console.error("Error validating promo code:", error);
    return { isValid: false, error: "Error validating promo code" };
  }
};

// ✅ Apply promo code discount
export const applyPromoCodeDiscount = (
  orderTotal: number,
  promoCode: PromoCode
): number => {
  if (promoCode.discountType === "percentage") {
    return orderTotal * (promoCode.discountValue / 100);
  } else {
    // Fixed discount - can't exceed order total
    return Math.min(promoCode.discountValue, orderTotal);
  }
};

// ✅ Increment promo code usage count
export const incrementPromoCodeUsage = async (id: string): Promise<boolean> => {
  try {
    const promoCode = await getPromoCode(id);
    if (!promoCode) return false;
    
    await updateDoc(doc(db, "promoCodes", id), {
      usedCount: promoCode.usedCount + 1,
      updatedAt: new Date(),
    });
    
    return true;
  } catch (error: any) {
    console.error("Error incrementing promo code usage:", error);
    return false;
  }
};

// ✅ Listen to vendor promo codes
export const listenToVendorPromoCodes = (
  vendorId: string,
  callback: (promoCodes: PromoCode[]) => void
): (() => void) => {
  try {
    // Remove the orderBy clause to avoid needing composite index
    const q = query(
      collection(db, "promoCodes"),
      where("vendorId", "==", vendorId)
      // orderBy("createdAt", "desc") - Removed to avoid composite index requirement
    );

    return onSnapshot(
      q,
      (snapshot) => {
        // Sort client-side instead
        const promoCodes = snapshot.docs.map(
          (doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: toDate(data.createdAt),
              updatedAt: toDate(data.updatedAt),
              expirationDate: data.expirationDate ? toDate(data.expirationDate) : undefined,
            } as PromoCode;
          }
        );
        
        // Sort by createdAt descending (newest first)
        promoCodes.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        callback(promoCodes);
      },
      (error: FirestoreError) => {
        console.error("Error listening to vendor promo codes:", error);
        // Provide a more user-friendly error message
        if (error.message.includes("query requires an index")) {
          console.error("Firebase requires a composite index for this query. Please create it using the Firebase Console.");
        }
        // Fallback to fetching data once without real-time updates
        getVendorPromoCodes(vendorId).then(callback).catch(() => callback([]));
      }
    );
  } catch (error: any) {
    console.error("Error setting up promo codes listener:", error);
    // Fallback to fetching data once without real-time updates
    getVendorPromoCodes(vendorId).then(callback).catch(() => callback([]));
    return () => {};
  }
};