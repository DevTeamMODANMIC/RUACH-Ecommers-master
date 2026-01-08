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
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

export interface BulkOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  basePrice: number;
  discountedPrice: number;
  discountPercentage: number;
  total: number;
}

export interface BulkOrderBusinessInfo {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
  taxId?: string;
  address: string;
}

export interface BulkOrder {
  id: string;
  orderNumber: string;
  userId?: string; // If user is logged in
  businessInfo: BulkOrderBusinessInfo;
  items: BulkOrderItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  currency: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  deliveryOption: string;
  deliveryEstimate: string;
  additionalInfo?: string;
  vendorId?: string; // Vendor associated with the products
  productId?: string; // Specific product if single product bulk order
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Create Bulk Order
export const createBulkOrder = async (
  orderData: Omit<BulkOrder, "id" | "orderNumber" | "createdAt" | "updatedAt">
): Promise<BulkOrder> => {
  try {
    const orderNumber = `BULK-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    const order: Omit<BulkOrder, "id"> = {
      ...orderData,
      orderNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, "bulkOrders"), order);
    
    return { id: docRef.id, ...order };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ✅ Get single bulk order
export const getBulkOrder = async (id: string): Promise<BulkOrder | null> => {
  try {
    const orderDoc = await getDoc(doc(db, "bulkOrders", id));
    if (orderDoc.exists()) {
      const data = orderDoc.data();
      return {
        id: orderDoc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as BulkOrder;
    }
    return null;
  } catch (error: any) {
    console.error("Error getting bulk order:", error);
    return null;
  }
};

// ✅ Get all bulk orders for a user
export const getUserBulkOrders = async (userId: string): Promise<BulkOrder[]> => {
  try {
    const q = query(
      collection(db, "bulkOrders"),
      where("userId", "==", userId)
      // Removed orderBy to avoid composite index requirement
    );

    const snapshot = await getDocs(q);
    // Sort the results manually
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        } as BulkOrder)
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by createdAt descending
  } catch (error: any) {
    console.error("Error getting user bulk orders:", error);
    return [];
  }
};

// ✅ Get all bulk orders for a vendor
export const getVendorBulkOrders = async (vendorId: string): Promise<BulkOrder[]> => {
  try {
    // Query without orderBy to avoid needing composite index
    const q = query(
      collection(db, "bulkOrders"),
      where("vendorId", "==", vendorId)
      // Removed orderBy to avoid composite index requirement
    );

    const snapshot = await getDocs(q);
    // Sort the results manually
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        } as BulkOrder)
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by createdAt descending
  } catch (error: any) {
    console.error("Error getting vendor bulk orders:", error);
    return [];
  }
};

// ✅ Get all bulk orders (for admin)
export const getAllBulkOrders = async (): Promise<BulkOrder[]> => {
  try {
    // Query without orderBy to avoid needing composite index
    const q = query(
      collection(db, "bulkOrders")
      // No filters for admin - get all orders
      // Removed orderBy to avoid composite index requirement
    );

    const snapshot = await getDocs(q);
    // Sort the results manually
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        } as BulkOrder)
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by createdAt descending
  } catch (error: any) {
    console.error("Error getting all bulk orders:", error);
    return [];
  }
};

// ✅ Update bulk order status
export const updateBulkOrderStatus = async (
  id: string,
  status: BulkOrder["status"]
) => {
  try {
    const updates = { status, updatedAt: new Date() };
    await updateDoc(doc(db, "bulkOrders", id), updates);
    return true;
  } catch (error: any) {
    console.error("Error updating bulk order status:", error);
    return false;
  }
};

// ✅ Listen to real-time bulk orders for a vendor
export const onVendorBulkOrdersUpdate = (
  vendorId: string,
  callback: (orders: BulkOrder[]) => void
) => {
  // Query without orderBy to avoid needing composite index
  const q = query(
    collection(db, "bulkOrders"),
    where("vendorId", "==", vendorId)
    // Removed orderBy to avoid composite index requirement
  );

  return onSnapshot(q, (snapshot) => {
    // Sort the results manually
    const orders = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        } as BulkOrder)
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by createdAt descending
    
    callback(orders);
  });
};

// ✅ Listen to real-time bulk orders (for admin)
export const onAllBulkOrdersUpdate = (
  callback: (orders: BulkOrder[]) => void
) => {
  // Query without orderBy to avoid needing composite index
  const q = query(
    collection(db, "bulkOrders")
    // No filters for admin - get all orders
    // Removed orderBy to avoid composite index requirement
  );

  return onSnapshot(q, (snapshot) => {
    // Sort the results manually
    const orders = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        } as BulkOrder)
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by createdAt descending
    
    callback(orders);
  });
};