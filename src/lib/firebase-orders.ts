import { Order as OrderType } from "../types";
export type Order = OrderType;
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { getVendorProducts } from "./firebase-vendors";
import {
  creditVendorWallet,
  confirmVendorEarnings,
} from "./firebase-vendor-wallet";
import { getProduct } from "./firebase-products";

// ✅ Get user orders
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          estimatedDelivery:
            doc.data().estimatedDelivery?.toDate?.() ||
            doc.data().estimatedDelivery,
        }) as Order,
    );

    return orders;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
};

// ✅ Live listener for user orders
export const listenToUserOrders = (
  callback: (orders: Order[]) => void,
  userId: string,
): (() => void) => {
  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              createdAt:
                doc.data().createdAt?.toDate?.() || doc.data().createdAt,
              updatedAt:
                doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
              estimatedDelivery:
                doc.data().estimatedDelivery?.toDate?.() ||
                doc.data().estimatedDelivery,
            }) as Order,
        );
        callback(orders);
      },
      (error) => {
        console.error("Error listening to user orders:", error);
        callback([]);
      },
    );
  } catch (error) {
    console.error("Error setting up user orders listener:", error);
    callback([]);
    return () => {};
  }
};

// ✅ Get single order
export const getOrder = async (id: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, "orders", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt:
          docSnap.data().createdAt?.toDate?.() || docSnap.data().createdAt,
        updatedAt:
          docSnap.data().updatedAt?.toDate?.() || docSnap.data().updatedAt,
        estimatedDelivery:
          docSnap.data().estimatedDelivery?.toDate?.() ||
          docSnap.data().estimatedDelivery,
      } as Order;
    }

    return null;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

// ✅ Live listener for single order
export const listenToOrder = (
  orderId: string,
  callback: (orderData: Order | null) => void,
): (() => void) => {
  try {
    const docRef = doc(db, "orders", orderId);

    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const order = {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt:
              docSnap.data().createdAt?.toDate?.() || docSnap.data().createdAt,
            updatedAt:
              docSnap.data().updatedAt?.toDate?.() || docSnap.data().updatedAt,
            estimatedDelivery:
              docSnap.data().estimatedDelivery?.toDate?.() ||
              docSnap.data().estimatedDelivery,
          } as Order;
          callback(order);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("Error listening to order:", error);
        callback(null);
      },
    );
  } catch (error) {
    console.error("Error setting up order listener:", error);
    callback(null);
    return () => {};
  }
};

// ✅ Get order by ID or number for guest tracking
export const getOrderByIdAndEmail = async (
  orderIdOrNumber: string,
  email: string,
): Promise<Order | null> => {
  try {
    // First try to find by order ID
    const docRef = doc(db, "orders", orderIdOrNumber);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const orderData = docSnap.data();
      // Verify email matches billing or shipping address
      if (
        orderData.billingAddress?.email === email ||
        orderData.shippingAddress?.email === email
      ) {
        return {
          id: docSnap.id,
          ...orderData,
          createdAt: orderData.createdAt?.toDate?.() || orderData.createdAt,
          updatedAt: orderData.updatedAt?.toDate?.() || orderData.updatedAt,
          estimatedDelivery:
            orderData.estimatedDelivery?.toDate?.() ||
            orderData.estimatedDelivery,
        } as Order;
      }
    }

    // If not found by ID, try to find by order number
    const q = query(
      collection(db, "orders"),
      where("orderNumber", "==", orderIdOrNumber),
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      const orderData = docSnap.data();
      // Verify email matches billing or shipping address
      if (
        orderData.billingAddress?.email === email ||
        orderData.shippingAddress?.email === email
      ) {
        return {
          id: docSnap.id,
          ...orderData,
          createdAt: orderData.createdAt?.toDate?.() || orderData.createdAt,
          updatedAt: orderData.updatedAt?.toDate?.() || orderData.updatedAt,
          estimatedDelivery:
            orderData.estimatedDelivery?.toDate?.() ||
            orderData.estimatedDelivery,
        } as Order;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching order by ID/number and email:", error);
    return null;
  }
};

// ✅ Get all orders (admin)
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          estimatedDelivery:
            doc.data().estimatedDelivery?.toDate?.() ||
            doc.data().estimatedDelivery,
        }) as Order,
    );

    return orders;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }
};

// ✅ Get all orders (for ML algorithms)
export const getAllOrdersNoMax = async (): Promise<Order[]> => {
  // Same as getAllOrders but without limits for ML processing
  return getAllOrders();
};

// ✅ Live listener for all orders (admin)
export const listenToAllOrders = (
  callback: (orders: Order[]) => void,
): (() => void) => {
  try {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              createdAt:
                doc.data().createdAt?.toDate?.() || doc.data().createdAt,
              updatedAt:
                doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
              estimatedDelivery:
                doc.data().estimatedDelivery?.toDate?.() ||
                doc.data().estimatedDelivery,
            }) as Order,
        );
        callback(orders);
      },
      (error) => {
        console.error("Error listening to all orders:", error);
        callback([]);
      },
    );
  } catch (error) {
    console.error("Error setting up all orders listener:", error);
    callback([]);
    return () => {};
  }
};

// ✅ Update order
export const updateOrder = async (
  orderId: string,
  updates: Partial<Order>,
): Promise<Order> => {
  try {
    const docRef = doc(db, "orders", orderId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });

    // Return the updated order
    const updatedOrder = await getOrder(orderId);
    if (!updatedOrder) {
      throw new Error("Failed to fetch updated order");
    }

    return updatedOrder;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

// ✅ Create order
export const createOrder = async (
  orderData: Omit<Order, "id" | "createdAt" | "updatedAt">,
): Promise<Order> => {
  try {
    const newOrder = {
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, "orders"), newOrder);

    // Return the created order with ID
    const createdOrder = await getOrder(docRef.id);
    if (!createdOrder) {
      throw new Error("Failed to fetch created order");
    }

    return createdOrder;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// ✅ Get vendor orders
export const getVendorOrders = async (vendorId: string): Promise<Order[]> => {
  try {
    // First, get all products for this vendor
    const vendorProducts = await getVendorProducts(vendorId);
    const vendorProductIds = vendorProducts.map((product) => product.id);

    if (vendorProductIds.length === 0) {
      return [];
    }

    // Get all orders
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);
    const allOrders = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          estimatedDelivery:
            doc.data().estimatedDelivery?.toDate?.() ||
            doc.data().estimatedDelivery,
        }) as Order,
    );

    // Filter orders that contain vendor's products
    const vendorOrders = allOrders.filter((order) =>
      order.items.some((item) => vendorProductIds.includes(item.productId)),
    );

    return vendorOrders;
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    return [];
  }
};

// ✅ Live listener for vendor orders
export const listenToVendorOrders = (
  vendorId: string,
  callback: (orders: Order[]) => void,
): (() => void) => {
  try {
    // Set up real-time listener for all orders
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      async (snapshot) => {
        try {
          // First, get all products for this vendor
          const vendorProducts = await getVendorProducts(vendorId);
          const vendorProductIds = vendorProducts.map((product) => product.id);

          if (vendorProductIds.length === 0) {
            callback([]);
            return;
          }

          // Process orders
          const orders = snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
                createdAt:
                  doc.data().createdAt?.toDate?.() || doc.data().createdAt,
                updatedAt:
                  doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
                estimatedDelivery:
                  doc.data().estimatedDelivery?.toDate?.() ||
                  doc.data().estimatedDelivery,
              }) as Order,
          );

          // Filter orders that contain vendor's products
          const vendorOrders = orders.filter((order) =>
            order.items.some((item) =>
              vendorProductIds.includes(item.productId),
            ),
          );

          callback(vendorOrders);
        } catch (error) {
          console.error("Error processing vendor orders:", error);
          callback([]);
        }
      },
      (error) => {
        console.error("Error listening to vendor orders:", error);
        callback([]);
      },
    );
  } catch (error) {
    console.error("Error setting up vendor orders listener:", error);
    callback([]);
    return () => {};
  }
};

// ✅ Update order status with automatic wallet crediting
export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"],
): Promise<Order> => {
  try {
    // Get the order first
    const order = await getOrder(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const previousStatus = order.status;

    // Update the order status
    const updatedOrder = await updateOrder(orderId, { status });

    // Credit vendor wallets based on status changes
    if (status === "delivered" && previousStatus !== "delivered") {
      // When order is delivered, move funds from pending to available balance
      await creditVendorsForOrder(order, true);
    } else if (
      status === "processing" &&
      previousStatus === "pending" &&
      order.paymentStatus === "paid"
    ) {
      // When order moves to processing and payment is confirmed, add to pending balance
      await creditVendorsForOrder(order, false);
    }

    return updatedOrder;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

/**
 * Credit vendor wallets for an order
 * @param order - The order to process
 * @param isDelivered - If true, confirms earnings (moves from pending to available)
 */
const creditVendorsForOrder = async (
  order: Order,
  isDelivered: boolean,
): Promise<void> => {
  try {
    // Group items by vendor
    const vendorItems = new Map<
      string,
      { items: typeof order.items; total: number; storeId?: string }
    >();

    for (const item of order.items) {
      // Get product to find vendorId if not in item
      let vendorId = item.vendorId;

      if (!vendorId) {
        try {
          const product = await getProduct(item.productId);
          vendorId = product?.vendorId;
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
          continue;
        }
      }

      if (!vendorId) {
        console.warn(`No vendor ID found for product ${item.productId}`);
        continue;
      }

      if (!vendorItems.has(vendorId)) {
        vendorItems.set(vendorId, { items: [], total: 0 });
      }

      const vendorData = vendorItems.get(vendorId)!;
      vendorData.items.push(item);
      vendorData.total += item.price * item.quantity;
    }

    // Credit each vendor
    for (const [vendorId, data] of vendorItems.entries()) {
      try {
        if (isDelivered) {
          // Move from pending to available balance
          await confirmVendorEarnings(
            vendorId,
            data.total,
            `Order #${order.id} delivered`,
            order.id,
            data.storeId,
          );
        } else {
          // Add to pending balance
          await creditVendorWallet(
            vendorId,
            data.total,
            `Order #${order.id} payment confirmed`,
            order.id,
            data.storeId,
            true, // isPending = true
          );
        }

        console.log(
          `Successfully credited vendor ${vendorId} for order ${order.id}`,
        );
      } catch (error) {
        console.error(
          `Error crediting vendor ${vendorId} for order ${order.id}:`,
          error,
        );
        // Continue processing other vendors even if one fails
      }
    }
  } catch (error) {
    console.error("Error crediting vendors for order:", error);
    // Don't throw - we don't want to fail the order status update if wallet crediting fails
  }
};

// ✅ Order Cancellation and Return Types
export interface OrderCancellation {
  id?: string;
  orderId: string;
  userId: string;
  reason: string;
  additionalNotes?: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: Date | any;
  processedAt?: Date | any;
  refundAmount?: number;
  refundStatus?: "pending" | "processing" | "completed" | "failed";
}

export interface OrderReturn {
  id?: string;
  orderId: string;
  userId: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    reason: string;
  }>;
  reason: string;
  additionalNotes?: string;
  images?: string[];
  status: "pending" | "approved" | "rejected" | "received" | "refunded";
  requestedAt: Date | any;
  processedAt?: Date | any;
  refundAmount?: number;
  refundStatus?: "pending" | "processing" | "completed" | "failed";
}

// ✅ Check if order can be cancelled
export const canCancelOrder = (
  order: Order,
): { canCancel: boolean; reason?: string } => {
  // Orders can only be cancelled if they are pending or confirmed
  if (order.status === "cancelled") {
    return { canCancel: false, reason: "Order is already cancelled" };
  }

  if (order.status === "delivered") {
    return { canCancel: false, reason: "Order has already been delivered" };
  }

  if (order.status === "shipped") {
    return {
      canCancel: false,
      reason:
        "Order has already been shipped. Please request a return instead.",
    };
  }

  return { canCancel: true };
};

// ✅ Request order cancellation
export const requestOrderCancellation = async (
  orderId: string,
  userId: string,
  reason: string,
  additionalNotes?: string,
): Promise<string> => {
  try {
    // Verify order exists and belongs to user
    const order = await getOrder(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.userId !== userId) {
      throw new Error("Unauthorized: Order does not belong to this user");
    }

    // Check if order can be cancelled
    const { canCancel, reason: cancelReason } = canCancelOrder(order);
    if (!canCancel) {
      throw new Error(cancelReason || "Order cannot be cancelled");
    }

    // Create cancellation request
    const cancellationData: OrderCancellation = {
      orderId,
      userId,
      reason,
      additionalNotes: additionalNotes || "",
      status: "pending",
      requestedAt: new Date(),
      refundAmount: order.total,
      refundStatus: "pending",
    };

    const cancellationRef = await addDoc(
      collection(db, "orderCancellations"),
      cancellationData,
    );

    // Update order status to cancelled if it's still pending
    if (order.status === "pending") {
      await updateOrder(orderId, {
        status: "cancelled",
        updatedAt: new Date(),
      });
    }

    return cancellationRef.id;
  } catch (error) {
    console.error("Error requesting order cancellation:", error);
    throw error;
  }
};

// ✅ Get order cancellation
export const getOrderCancellation = async (
  orderId: string,
): Promise<OrderCancellation | null> => {
  try {
    const q = query(
      collection(db, "orderCancellations"),
      where("orderId", "==", orderId),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as OrderCancellation;
  } catch (error) {
    console.error("Error getting order cancellation:", error);
    return null;
  }
};

// ✅ Check if order can be returned
export const canReturnOrder = (
  order: Order,
): { canReturn: boolean; reason?: string } => {
  if (order.status !== "delivered") {
    return {
      canReturn: false,
      reason: "Only delivered orders can be returned",
    };
  }

  // Check if order was delivered within return window (e.g., 30 days)
  const deliveryDate = order.updatedAt
    ? new Date(order.updatedAt)
    : new Date(order.createdAt);
  const daysSinceDelivery = Math.floor(
    (Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysSinceDelivery > 30) {
    return {
      canReturn: false,
      reason: "Return window has expired (30 days from delivery)",
    };
  }

  return { canReturn: true };
};

// ✅ Request order return
export const requestOrderReturn = async (
  orderId: string,
  userId: string,
  items: OrderReturn["items"],
  reason: string,
  additionalNotes?: string,
  images?: string[],
): Promise<string> => {
  try {
    // Verify order exists and belongs to user
    const order = await getOrder(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.userId !== userId) {
      throw new Error("Unauthorized: Order does not belong to this user");
    }

    // Check if order can be returned
    const { canReturn, reason: returnReason } = canReturnOrder(order);
    if (!canReturn) {
      throw new Error(returnReason || "Order cannot be returned");
    }

    // Validate items
    const validItems = items.filter((item) =>
      order.items.some((orderItem) => orderItem.productId === item.productId),
    );

    if (validItems.length === 0) {
      throw new Error("No valid items to return");
    }

    // Calculate refund amount based on returned items
    let refundAmount = 0;
    validItems.forEach((item) => {
      const orderItem = order.items.find(
        (oi) => oi.productId === item.productId,
      );
      if (orderItem) {
        refundAmount += orderItem.price * item.quantity;
      }
    });

    // Create return request
    const returnData: OrderReturn = {
      orderId,
      userId,
      items: validItems,
      reason,
      additionalNotes: additionalNotes || "",
      images: images || [],
      status: "pending",
      requestedAt: new Date(),
      refundAmount,
      refundStatus: "pending",
    };

    const returnRef = await addDoc(collection(db, "orderReturns"), returnData);

    return returnRef.id;
  } catch (error) {
    console.error("Error requesting order return:", error);
    throw error;
  }
};

// ✅ Get order return
export const getOrderReturn = async (
  orderId: string,
): Promise<OrderReturn | null> => {
  try {
    const q = query(
      collection(db, "orderReturns"),
      where("orderId", "==", orderId),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as OrderReturn;
  } catch (error) {
    console.error("Error getting order return:", error);
    return null;
  }
};

// ✅ Get user's cancellation requests
export const getUserCancellations = async (
  userId: string,
): Promise<OrderCancellation[]> => {
  try {
    const q = query(
      collection(db, "orderCancellations"),
      where("userId", "==", userId),
      orderBy("requestedAt", "desc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as OrderCancellation,
    );
  } catch (error) {
    console.error("Error getting user cancellations:", error);
    return [];
  }
};

// ✅ Get user's return requests
export const getUserReturns = async (
  userId: string,
): Promise<OrderReturn[]> => {
  try {
    const q = query(
      collection(db, "orderReturns"),
      where("userId", "==", userId),
      orderBy("requestedAt", "desc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as OrderReturn,
    );
  } catch (error) {
    console.error("Error getting user returns:", error);
    return [];
  }
};
