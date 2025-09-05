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
  limit,
  onSnapshot,
  FirestoreError,
} from "firebase/firestore";
import { db } from "./firebase";
import { updateProduct } from "./firebase-products";

export interface OrderItem {
  productId: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  total: number;
  options?: Record<string, string>;
  vendorId?: string; // Add vendorId to track which vendor the item belongs to
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  paymentId?: string;
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Create Order
export const createOrder = async (
  orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">
) => {
  try {
    const orderNumber = `AYO-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Enhance order items with vendor information
    const enhancedItems = await Promise.all(
      orderData.items.map(async (item) => {
        // Get product to retrieve vendorId
        try {
          const productDoc = await getDoc(doc(db, "products", item.productId));
          if (productDoc.exists()) {
            const productData = productDoc.data();
            return {
              ...item,
              vendorId: productData.vendorId || undefined
            };
          }
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
        }
        return item;
      })
    );

    const order: Omit<Order, "id"> = {
      ...orderData,
      items: enhancedItems,
      orderNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, "orders"), order);

    // Decrement product stock
    for (const item of orderData.items) {
      try {
        const productDoc = await getDoc(doc(db, "products", item.productId));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          const currentStock = productData.stockQuantity || 0;
          const newStock = Math.max(0, currentStock - item.quantity);

          await updateProduct(item.productId, {
            stockQuantity: newStock,
            inStock: newStock > 0,
          });

          console.log(
            `Decremented stock for ${item.name}: ${currentStock} -> ${newStock}`
          );
        }
      } catch (stockError) {
        console.error("Error updating stock levels:", stockError);
      }
    }

    return { id: docRef.id, ...order };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ✅ Get single order
export const getOrder = async (id: string): Promise<Order | null> => {
  try {
    const orderDoc = await getDoc(doc(db, "orders", id));
    if (orderDoc.exists()) {
      const data = orderDoc.data();
      return {
        id: orderDoc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        estimatedDelivery: data.estimatedDelivery?.toDate(),
      } as Order;
    }
    return null;
  } catch (error: any) {
    console.error("Error getting order:", error);
    return null;
  }
};

// ✅ Get all orders for a user
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc") // ⚠️ Needs composite index
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
          estimatedDelivery: doc.data().estimatedDelivery?.toDate(),
        } as Order)
    );
  } catch (error: any) {
    console.error("Error getting user orders:", error);
    return [];
  }
};

// ✅ Update order status
export const updateOrderStatus = async (
  id: string,
  status: Order["status"],
  trackingNumber?: string
) => {
  try {
    const updates: any = { status, updatedAt: new Date() };

    if (trackingNumber) updates.trackingNumber = trackingNumber;

    if (status === "shipped" && !trackingNumber) {
      updates.estimatedDelivery = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      );
    }

    await updateDoc(doc(db, "orders", id), updates);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ✅ Update payment status
export const updatePaymentStatus = async (
  id: string,
  paymentStatus: Order["paymentStatus"]
) => {
  try {
    await updateDoc(doc(db, "orders", id), {
      paymentStatus,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ✅ Get all orders (admin)
export const getAllOrders = async (maxOrders: number = 100): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      limit(maxOrders)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
          estimatedDelivery: doc.data().estimatedDelivery?.toDate(),
        } as Order)
    );
  } catch (error: any) {
    console.error("Error getting all orders:", error);
    return [];
  }
};

export const getAllOrdersNoMax = async (): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      // limit(maxOrders)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
          estimatedDelivery: doc.data().estimatedDelivery?.toDate(),
        } as Order)
    );
  } catch (error: any) {
    console.error("Error getting all orders:", error);
    return [];
  }
};

// ✅ Live listener for all orders
export const listenToAllOrders = (
  callback: (orders: Order[]) => void,
  maxOrders: number = 100
) => {
  try {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      limit(maxOrders)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt.toDate(),
              updatedAt: doc.data().updatedAt.toDate(),
              estimatedDelivery: doc.data().estimatedDelivery?.toDate(),
            } as Order)
        );
        callback(orders);
      },
      (error: FirestoreError) => {
        console.error("Error listening to orders:", error.message);
        callback([]);
      }
    );
  } catch (error: any) {
    console.error("Error setting up orders listener:", error);
    throw new Error(error.message);
  }
};

// ✅ Live listener for a user's orders
export const listenToUserOrders = (
  callback: (orders: Order[]) => void,
  userId?: string
) => {
  try {
    if (!userId) {
      console.error("No userId provided to listenToUserOrders");
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc") // ⚠️ Needs composite index
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt.toDate(),
              updatedAt: doc.data().updatedAt.toDate(),
              estimatedDelivery: doc.data().estimatedDelivery?.toDate(),
            } as Order)
        );
        callback(orders);
      },
      (error: FirestoreError) => {
        console.error("Error listening to user orders:", error.message);
        callback([]);
      }
    );
  } catch (error: any) {
    console.error("Error setting up user orders listener:", error);
    throw new Error(error.message);
  }
};

// ✅ Live listener for single order
export const listenToOrder = (
  orderId: string,
  callback: (orderData: Order | null) => void
) => {
  try {
    if (!orderId) {
      console.error("No orderId provided to listenToOrder");
      callback(null);
      return () => {};
    }

    const orderRef = doc(db, "orders", orderId);

    return onSnapshot(
      orderRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          callback({
            id: docSnapshot.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            estimatedDelivery: data.estimatedDelivery?.toDate(),
          } as Order);
        } else {
          callback(null);
        }
      },
      (error: FirestoreError) => {
        console.error("Error listening to order:", error.message);
        callback(null);
      }
    );
  } catch (error: any) {
    console.error("Error setting up order listener:", error);
    throw new Error(error.message);
  }
};

// ✅ Update an order
export const updateOrder = async (id: string, updates: Partial<Order>) => {
  try {
    await updateDoc(doc(db, "orders", id), {
      ...updates,
      updatedAt: new Date(),
    });
    return true;
  } catch (error: any) {
    console.error("Error updating order:", error);
    throw new Error(error.message);
  }
};

// ✅ Get order by ID or number for guest tracking
export const getOrderByIdAndEmail = async (
  orderIdOrNumber: string,
  email: string
): Promise<Order | null> => {
  try {
    // Try exact ID first
    const orderById = await getOrder(orderIdOrNumber);
    if (orderById) {
      if (
        orderById.billingAddress &&
        (orderById.billingAddress.email.toLowerCase() === email.toLowerCase() ||
          orderById.shippingAddress.email?.toLowerCase() === email.toLowerCase())
      ) {
        return orderById;
      }
    }

    // Then search by order number
    const q = query(
      collection(db, "orders"),
      where("orderNumber", "==", orderIdOrNumber)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (
        (data.billingAddress &&
          data.billingAddress.email.toLowerCase() === email.toLowerCase()) ||
        (data.shippingAddress &&
          data.shippingAddress.email.toLowerCase() === email.toLowerCase())
      ) {
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          estimatedDelivery: data.estimatedDelivery?.toDate(),
        } as Order;
      }
    }
    return null;
  } catch (error: any) {
    console.error("Error getting order by ID and email:", error);
    return null;
  }
};
