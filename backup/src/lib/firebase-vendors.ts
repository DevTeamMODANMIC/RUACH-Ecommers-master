import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  where,
  Timestamp,
  serverTimestamp,
  addDoc,
  writeBatch,
  deleteDoc,
  FirestoreError,
} from "firebase/firestore";
import { db } from "./firebase";

/** Firestore collection names */
const VENDORS_COLLECTION = "vendors";
const VENDOR_OWNERS_COLLECTION = "vendorOwners";
const PRODUCTS_COLLECTION = "products";
const ORDERS_COLLECTION = "orders";

/** Vendor model */
export interface Vendor {
  id: string; // Firestore document ID
  ownerId: string; // Firebase UID of the owner
  shopName: string;
  bio: string;
  logoUrl: string;
  approved: boolean;
  createdAt: Timestamp;
  isActive: boolean;
  status?: "pending" | "approved" | "rejected";
  rejected?: boolean;
}

/** Vendor owner model */
export interface VendorOwner {
  uid: string; // Firebase UID
  stores: string[]; // Array of store IDs
  activeStoreId: string | null;
  maxStores: number;
}

/**
 * Create a new vendor store for a user.
 */
export const createVendorStore = async (
  ownerId: string,
  data: Omit<Vendor, "id" | "ownerId" | "approved" | "createdAt" | "isActive" | "status">
): Promise<string> => {
  try {
    const ownerStores = await getUserStores(ownerId);
    if (ownerStores.length >= 3) {
      throw new Error("Maximum of 3 stores allowed per user");
    }

    const vendorRef = await addDoc(collection(db, VENDORS_COLLECTION), {
      ownerId,
      ...data,
      approved: false,
      isActive: true,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    const ownerRef = doc(db, VENDOR_OWNERS_COLLECTION, ownerId);
    const ownerSnap = await getDoc(ownerRef);

    if (ownerSnap.exists()) {
      const ownerData = ownerSnap.data() as VendorOwner;
      await updateDoc(ownerRef, {
        stores: [...ownerData.stores, vendorRef.id],
        activeStoreId: ownerData.activeStoreId || vendorRef.id,
      });
    } else {
      await setDoc(ownerRef, {
        uid: ownerId,
        stores: [vendorRef.id],
        activeStoreId: vendorRef.id,
        maxStores: 3,
      });
    }

    return vendorRef.id;
  } catch (error) {
    console.error("Error creating vendor store:", error);
    throw error;
  }
};

/**
 * Get all stores owned by a user.
 */
export const getUserStores = async (ownerId: string): Promise<Vendor[]> => {
  try {
    const q = query(collection(db, VENDORS_COLLECTION), where("ownerId", "==", ownerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Vendor));
  } catch (error) {
    console.error("Error fetching user stores:", error);
    throw error;
  }
};

/**
 * Get vendor owner document.
 */
export const getVendorOwner = async (ownerId: string): Promise<VendorOwner | null> => {
  try {
    const snapshot = await getDoc(doc(db, VENDOR_OWNERS_COLLECTION, ownerId));
    return snapshot.exists() ? (snapshot.data() as VendorOwner) : null;
  } catch (error) {
    console.error("Error fetching vendor owner:", error);
    throw error;
  }
};

/**
 * Switch active store for a user.
 */
export const switchActiveStore = async (ownerId: string, storeId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, VENDOR_OWNERS_COLLECTION, ownerId), { activeStoreId: storeId });
  } catch (error) {
    console.error("Error switching active store:", error);
    throw error;
  }
};

/**
 * Get the active store for a user.
 */
export const getActiveStore = async (ownerId: string): Promise<Vendor | null> => {
  try {
    const owner = await getVendorOwner(ownerId);
    if (!owner || !owner.activeStoreId) return null;

    const storeSnap = await getDoc(doc(db, VENDORS_COLLECTION, owner.activeStoreId));
    return storeSnap.exists() ? ({ id: storeSnap.id, ...storeSnap.data() } as Vendor) : null;
  } catch (error) {
    console.error("Error fetching active store:", error);
    throw error;
  }
};

/**
 * Approve a vendor store.
 */
export const approveVendor = async (storeId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, VENDORS_COLLECTION, storeId), {
      approved: true,
      isActive: true,
      rejected: false,
      status: "approved",
    });
  } catch (error) {
    console.error("Error approving vendor:", error);
    throw error;
  }
};

/**
 * Reject a vendor store.
 */
export const rejectVendor = async (storeId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, VENDORS_COLLECTION, storeId), {
      approved: false,
      isActive: false,
      rejected: true,
      status: "rejected",
    });
  } catch (error) {
    console.error("Error rejecting vendor:", error);
    throw error;
  }
};

/**
 * Get vendor store by ID.
 */
export const getVendor = async (storeId: string): Promise<Vendor | null> => {
  try {
    const snapshot = await getDoc(doc(db, VENDORS_COLLECTION, storeId));
    return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Vendor) : null;
  } catch (error) {
    console.error("Error fetching vendor:", error);
    throw error;
  }
};

/**
 * Get all approved vendors.
 */
export const getApprovedVendors = async (): Promise<Vendor[]> => {
  try {
    const q = query(collection(db, VENDORS_COLLECTION), where("approved", "==", true));
    const sn = await getDocs(q);
    return sn.docs.map((d) => ({ id: d.id, ...d.data() } as Vendor));
  } catch (error) {
    console.error("Error fetching approved vendors:", error);
    throw error;
  }
};

/**
 * Get all vendors.
 */
export const getAllVendors = async (): Promise<Vendor[]> => {
  try {
    const sn = await getDocs(collection(db, VENDORS_COLLECTION));
    return sn.docs.map((d) => ({ id: d.id, ...d.data() } as Vendor));
  } catch (error) {
    console.error("Error fetching all vendors:", error);
    throw error;
  }
};

/**
 * Get products for a specific vendor.
 */
export const getVendorProducts = async (storeId: string) => {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), where("vendorId", "==", storeId));
    const sn = await getDocs(q);
    return sn.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    throw error;
  }
};

/**
 * Update vendor store information.
 */
export const updateVendorStore = async (storeId: string, data: Partial<Vendor>) => {
  try {
    await updateDoc(doc(db, VENDORS_COLLECTION, storeId), data);
  } catch (error) {
    console.error("Error updating vendor store:", error);
    throw error;
  }
};

/**
 * Permanently delete a vendor store and its related data.
 */
export const deleteVendorStore = async (ownerId: string, storeId: string) => {
  try {
    const batch = writeBatch(db);

    // Update vendor owner record
    const owner = await getVendorOwner(ownerId);
    if (owner) {
      const updatedStores = owner.stores.filter((id) => id !== storeId);
      const newActiveStore =
        owner.activeStoreId === storeId ? (updatedStores[0] || null) : owner.activeStoreId;

      batch.update(doc(db, VENDOR_OWNERS_COLLECTION, ownerId), {
        stores: updatedStores,
        activeStoreId: newActiveStore,
      });
    }

    // Delete related products
    const productsQ = query(collection(db, PRODUCTS_COLLECTION), where("vendorId", "==", storeId));
    const productsSn = await getDocs(productsQ);
    productsSn.docs.forEach((d) => batch.delete(doc(db, PRODUCTS_COLLECTION, d.id)));

    // Update related orders (retain history)
    const ordersQ = query(collection(db, ORDERS_COLLECTION), where("vendorId", "==", storeId));
    const ordersSn = await getDocs(ordersQ);
    ordersSn.docs.forEach((d) =>
      batch.update(doc(db, ORDERS_COLLECTION, d.id), { vendorId: null })
    );

    // Delete the vendor store
    batch.delete(doc(db, VENDORS_COLLECTION, storeId));

    await batch.commit();
  } catch (error) {
    console.error("Error deleting vendor store:", error);
    throw error;
  }
};

export const deactivateVendorStore = async (vendorId: string) => {
  // your logic here
};

/**
 * Delete a vendor (admin function)
 */
export const deleteVendor = async (vendorId: string): Promise<void> => {
  try {
    // First get the vendor to get the owner ID
    const vendor = await getVendor(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }
    
    // Use the existing deleteVendorStore function
    await deleteVendorStore(vendor.ownerId, vendorId);
  } catch (error) {
    console.error('Error deleting vendor:', error);
    throw error;
  }
};