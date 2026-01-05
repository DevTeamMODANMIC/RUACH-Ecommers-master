import { Order as OrderType } from "../types"
export type Order = OrderType
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
  addDoc
} from "firebase/firestore"
import { db } from "./firebase"
import { getVendorProducts } from "./firebase-vendors"

// ✅ Get user orders
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
    
    const snapshot = await getDocs(q)
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      estimatedDelivery: doc.data().estimatedDelivery?.toDate?.() || doc.data().estimatedDelivery,
    } as Order))
    
    return orders
  } catch (error) {
    console.error("Error fetching user orders:", error)
    return []
  }
}

// ✅ Live listener for user orders
export const listenToUserOrders = (
  callback: (orders: Order[]) => void,
  userId: string
): (() => void) => {
  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
    
    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          estimatedDelivery: doc.data().estimatedDelivery?.toDate?.() || doc.data().estimatedDelivery,
        } as Order))
        callback(orders)
      },
      (error) => {
        console.error("Error listening to user orders:", error)
        callback([])
      }
    )
  } catch (error) {
    console.error("Error setting up user orders listener:", error)
    callback([])
    return () => {}
  }
}

// ✅ Get single order
export const getOrder = async (id: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, "orders", id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.() || docSnap.data().createdAt,
        updatedAt: docSnap.data().updatedAt?.toDate?.() || docSnap.data().updatedAt,
        estimatedDelivery: docSnap.data().estimatedDelivery?.toDate?.() || docSnap.data().estimatedDelivery,
      } as Order
    }
    
    return null
  } catch (error) {
    console.error("Error fetching order:", error)
    return null
  }
}

// ✅ Live listener for single order
export const listenToOrder = (
  orderId: string,
  callback: (orderData: Order | null) => void
): (() => void) => {
  try {
    const docRef = doc(db, "orders", orderId)
    
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const order = {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate?.() || docSnap.data().createdAt,
            updatedAt: docSnap.data().updatedAt?.toDate?.() || docSnap.data().updatedAt,
            estimatedDelivery: docSnap.data().estimatedDelivery?.toDate?.() || docSnap.data().estimatedDelivery,
          } as Order
          callback(order)
        } else {
          callback(null)
        }
      },
      (error) => {
        console.error("Error listening to order:", error)
        callback(null)
      }
    )
  } catch (error) {
    console.error("Error setting up order listener:", error)
    callback(null)
    return () => {}
  }
}

// ✅ Get order by ID or number for guest tracking
export const getOrderByIdAndEmail = async (
  orderIdOrNumber: string,
  email: string
): Promise<Order | null> => {
  try {
    // First try to find by order ID
    const docRef = doc(db, "orders", orderIdOrNumber)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const orderData = docSnap.data()
      // Verify email matches billing or shipping address
      if (orderData.billingAddress?.email === email || orderData.shippingAddress?.email === email) {
        return {
          id: docSnap.id,
          ...orderData,
          createdAt: orderData.createdAt?.toDate?.() || orderData.createdAt,
          updatedAt: orderData.updatedAt?.toDate?.() || orderData.updatedAt,
          estimatedDelivery: orderData.estimatedDelivery?.toDate?.() || orderData.estimatedDelivery,
        } as Order
      }
    }
    
    // If not found by ID, try to find by order number
    const q = query(
      collection(db, "orders"),
      where("orderNumber", "==", orderIdOrNumber)
    )
    
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0]
      const orderData = docSnap.data()
      // Verify email matches billing or shipping address
      if (orderData.billingAddress?.email === email || orderData.shippingAddress?.email === email) {
        return {
          id: docSnap.id,
          ...orderData,
          createdAt: orderData.createdAt?.toDate?.() || orderData.createdAt,
          updatedAt: orderData.updatedAt?.toDate?.() || orderData.updatedAt,
          estimatedDelivery: orderData.estimatedDelivery?.toDate?.() || orderData.estimatedDelivery,
        } as Order
      }
    }
    
    return null
  } catch (error) {
    console.error("Error fetching order by ID/number and email:", error)
    return null
  }
}

// ✅ Get all orders (admin)
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    )
    
    const snapshot = await getDocs(q)
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      estimatedDelivery: doc.data().estimatedDelivery?.toDate?.() || doc.data().estimatedDelivery,
    } as Order))
    
    return orders
  } catch (error) {
    console.error("Error fetching all orders:", error)
    return []
  }
}

// ✅ Get all orders (for ML algorithms)
export const getAllOrdersNoMax = async (): Promise<Order[]> => {
  // Same as getAllOrders but without limits for ML processing
  return getAllOrders()
}

// ✅ Live listener for all orders (admin)
export const listenToAllOrders = (
  callback: (orders: Order[]) => void
): (() => void) => {
  try {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    )
    
    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          estimatedDelivery: doc.data().estimatedDelivery?.toDate?.() || doc.data().estimatedDelivery,
        } as Order))
        callback(orders)
      },
      (error) => {
        console.error("Error listening to all orders:", error)
        callback([])
      }
    )
  } catch (error) {
    console.error("Error setting up all orders listener:", error)
    callback([])
    return () => {}
  }
}

// ✅ Update order
export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<Order> => {
  try {
    const docRef = doc(db, "orders", orderId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    })
    
    // Return the updated order
    const updatedOrder = await getOrder(orderId)
    if (!updatedOrder) {
      throw new Error("Failed to fetch updated order")
    }
    
    return updatedOrder
  } catch (error) {
    console.error("Error updating order:", error)
    throw error
  }
}

// ✅ Create order
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
  try {
    const newOrder = {
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const docRef = await addDoc(collection(db, "orders"), newOrder)
    
    // Return the created order with ID
    const createdOrder = await getOrder(docRef.id)
    if (!createdOrder) {
      throw new Error("Failed to fetch created order")
    }
    
    return createdOrder
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

// ✅ Get vendor orders
export const getVendorOrders = async (vendorId: string): Promise<Order[]> => {
  try {
    // First, get all products for this vendor
    const vendorProducts = await getVendorProducts(vendorId)
    const vendorProductIds = vendorProducts.map(product => product.id)
    
    if (vendorProductIds.length === 0) {
      return []
    }
    
    // Get all orders
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    )
    
    const snapshot = await getDocs(q)
    const allOrders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      estimatedDelivery: doc.data().estimatedDelivery?.toDate?.() || doc.data().estimatedDelivery,
    } as Order))
    
    // Filter orders that contain vendor's products
    const vendorOrders = allOrders.filter(order => 
      order.items.some(item => vendorProductIds.includes(item.productId))
    )
    
    return vendorOrders
  } catch (error) {
    console.error("Error fetching vendor orders:", error)
    return []
  }
}

// ✅ Live listener for vendor orders
export const listenToVendorOrders = (
  vendorId: string,
  callback: (orders: Order[]) => void
): (() => void) => {
  try {
    // Set up real-time listener for all orders
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    )
    
    return onSnapshot(
      q,
      async (snapshot) => {
        try {
          // First, get all products for this vendor
          const vendorProducts = await getVendorProducts(vendorId)
          const vendorProductIds = vendorProducts.map(product => product.id)
          
          if (vendorProductIds.length === 0) {
            callback([])
            return
          }
          
          // Process orders
          const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
            estimatedDelivery: doc.data().estimatedDelivery?.toDate?.() || doc.data().estimatedDelivery,
          } as Order))
          
          // Filter orders that contain vendor's products
          const vendorOrders = orders.filter(order => 
            order.items.some(item => vendorProductIds.includes(item.productId))
          )
          
          callback(vendorOrders)
        } catch (error) {
          console.error("Error processing vendor orders:", error)
          callback([])
        }
      },
      (error) => {
        console.error("Error listening to vendor orders:", error)
        callback([])
      }
    )
  } catch (error) {
    console.error("Error setting up vendor orders listener:", error)
    callback([])
    return () => {}
  }
}

// ✅ Update order status
export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
  return updateOrder(orderId, { status })
}