import { Order } from "../types"

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  // In a real implementation, this would fetch from Firebase Firestore
  // For now, return mock data for demonstration
  return [
    {
      id: `ORD-${Date.now()}-001`,
      userId,
      items: [
        {
          productId: "prod-1",
          name: "Premium Wireless Headphones",
          price: 89.99,
          image: "/placeholder.svg",
          quantity: 1,
          options: {}
        },
        {
          productId: "prod-2",
          name: "Smartphone Case",
          price: 24.99,
          image: "/placeholder.svg",
          quantity: 2,
          options: {}
        }
      ],
      subtotal: 139.97,
      shipping: 10.00,
      tax: 15.00,
      total: 164.97,
      status: "delivered",
      paymentStatus: "paid",
      paymentMethod: "card",
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        address1: "123 Main Street",
        city: "London",
        state: "England",
        postalCode: "SW1A 1AA",
        country: "United Kingdom",
        phone: "+44 20 7123 4567"
      },
      billingAddress: {
        firstName: "John",
        lastName: "Doe",
        address1: "123 Main Street",
        city: "London",
        state: "England",
        postalCode: "SW1A 1AA",
        country: "United Kingdom",
        phone: "+44 20 7123 4567"
      },
      trackingNumber: "GB123456789",
      estimatedDelivery: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      orderNumber: "ORD-2024-001"
    },
    {
      id: `ORD-${Date.now()}-002`,
      userId,
      items: [
        {
          productId: "prod-3",
          name: "Laptop Backpack",
          price: 45.50,
          image: "/placeholder.svg",
          quantity: 1,
          options: {}
        }
      ],
      subtotal: 45.50,
      shipping: 5.00,
      tax: 5.05,
      total: 55.55,
      status: "processing",
      paymentStatus: "paid",
      paymentMethod: "card",
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        address1: "123 Main Street",
        city: "London",
        state: "England",
        postalCode: "SW1A 1AA",
        country: "United Kingdom",
        phone: "+44 20 7123 4567"
      },
      billingAddress: {
        firstName: "John",
        lastName: "Doe",
        address1: "123 Main Street",
        city: "London",
        state: "England",
        postalCode: "SW1A 1AA",
        country: "United Kingdom",
        phone: "+44 20 7123 4567"
      },
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      orderNumber: "ORD-2024-002"
    }
  ]
}

export const listenToUserOrders = (
  callback: (orders: Order[]) => void,
  userId: string
): (() => void) => {
  // In a real implementation, this would set up a Firestore listener
  // For now, just call the callback once with initial data
  getUserOrders(userId).then(callback)

  // Return unsubscribe function
  return () => {
    // Clean up listener
  }
}

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  // In a real implementation, this would fetch a specific order from Firebase
  // For now, return null if not found
  return null
}

// ✅ Get single order
export const getOrder = async (id: string): Promise<Order | null> => {
  // In a real implementation, this would fetch a specific order from Firebase
  // For now, return null if not found
  return null
}

// ✅ Live listener for single order
export const listenToOrder = (
  orderId: string,
  callback: (orderData: Order | null) => void
) => {
  // In a real implementation, this would set up a Firestore listener for a specific order
  // For now, just call the callback once with null and return a mock unsubscribe function
  callback(null)
  
  // Return unsubscribe function
  return () => {
    // Clean up listener
  }
}

// ✅ Get order by ID or number for guest tracking
export const getOrderByIdAndEmail = async (
  orderIdOrNumber: string,
  email: string
): Promise<Order | null> => {
  // In a real implementation, this would fetch a specific order by ID or number and verify with email
  // For now, return null if not found
  return null
}

export const getAllOrders = async (): Promise<Order[]> => {
  // In a real implementation, this would fetch all orders from Firebase
  // For admin purposes, return a comprehensive list of mock orders
  return [
    {
      id: "ORD-001",
      userId: "user-1",
      items: [
        {
          productId: "prod-1",
          name: "Premium Wireless Headphones",
          price: 299.99,
          image: "/placeholder.svg",
          quantity: 1,
          options: {}
        }
      ],
      subtotal: 299.99,
      shipping: 15.00,
      tax: 30.00,
      total: 344.99,
      status: "pending",
      paymentStatus: "paid",
      paymentMethod: "card",
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        address1: "123 Main Street",
        city: "London",
        state: "England",
        postalCode: "SW1A 1AA",
        country: "United Kingdom",
        phone: "+44 20 7123 4567"
      },
      billingAddress: {
        firstName: "John",
        lastName: "Doe",
        address1: "123 Main Street",
        city: "London",
        state: "England",
        postalCode: "SW1A 1AA",
        country: "United Kingdom",
        phone: "+44 20 7123 4567"
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      orderNumber: "ORD-2024-001"
    },
    {
      id: "ORD-002",
      userId: "user-2",
      items: [
        {
          productId: "prod-2",
          name: "Smartphone Case",
          price: 89.99,
          image: "/placeholder.svg",
          quantity: 2,
          options: {}
        }
      ],
      subtotal: 179.98,
      shipping: 10.00,
      tax: 19.00,
      total: 208.98,
      status: "delivered",
      paymentStatus: "paid",
      paymentMethod: "card",
      shippingAddress: {
        firstName: "Jane",
        lastName: "Smith",
        address1: "456 Oak Avenue",
        city: "Manchester",
        state: "England",
        postalCode: "M1 1AA",
        country: "United Kingdom",
        phone: "+44 20 7456 7890"
      },
      billingAddress: {
        firstName: "Jane",
        lastName: "Smith",
        address1: "456 Oak Avenue",
        city: "Manchester",
        state: "England",
        postalCode: "M1 1AA",
        country: "United Kingdom",
        phone: "+44 20 7456 7890"
      },
      trackingNumber: "GB987654321",
      estimatedDelivery: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      orderNumber: "ORD-2024-002"
    },
    {
      id: "ORD-003",
      userId: "user-3",
      items: [
        {
          productId: "prod-3",
          name: "Laptop Backpack",
          price: 159.99,
          image: "/placeholder.svg",
          quantity: 1,
          options: {}
        }
      ],
      subtotal: 159.99,
      shipping: 12.00,
      tax: 17.20,
      total: 189.19,
      status: "shipped",
      paymentStatus: "paid",
      paymentMethod: "paypal",
      shippingAddress: {
        firstName: "Bob",
        lastName: "Johnson",
        address1: "789 Pine Road",
        city: "Birmingham",
        state: "England",
        postalCode: "B1 1AA",
        country: "United Kingdom",
        phone: "+44 20 7987 6543"
      },
      billingAddress: {
        firstName: "Bob",
        lastName: "Johnson",
        address1: "789 Pine Road",
        city: "Birmingham",
        state: "England",
        postalCode: "B1 1AA",
        country: "United Kingdom",
        phone: "+44 20 7987 6543"
      },
      trackingNumber: "GB456789123",
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      orderNumber: "ORD-2024-003"
    }
  ]
}

export const getAllOrdersNoMax = async (): Promise<Order[]> => {
  // In a real implementation, this would fetch all orders from Firebase without a limit
  // For now, return an empty array
  return []
}

export const listenToAllOrders = (
  callback: (orders: Order[]) => void
): (() => void) => {
  // In a real implementation, this would set up a Firestore listener for all orders
  // For now, just call the callback once with initial data
  getAllOrders().then(callback)

  // Return unsubscribe function
  return () => {
    // Clean up listener
  }
}

export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<Order> => {
  // In a real implementation, this would update the order in Firebase
  // For now, return a mock updated order
  const allOrders = await getAllOrders()
  const orderToUpdate = allOrders.find(order => order.id === orderId)

  if (!orderToUpdate) {
    throw new Error("Order not found")
  }

  const updatedOrder: Order = {
    ...orderToUpdate,
    ...updates,
    updatedAt: new Date().toISOString()
  }

  return updatedOrder
}

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
  // In a real implementation, this would create the order in Firebase
  // For now, return a mock created order
  const newOrder: Order = {
    ...orderData,
    id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  return newOrder
}

// ✅ Get vendor orders
export const getVendorOrders = async (vendorId: string): Promise<Order[]> => {
  // In a real implementation, this would fetch vendor orders from Firebase
  // For now, filter mock orders by vendor ID
  const allOrders = await getAllOrders()
  
  // Filter orders that contain items from this vendor
  return allOrders.filter(order => 
    order.items.some(item => item.vendorId === vendorId)
  )
}

// ✅ Live listener for vendor orders
export const listenToVendorOrders = (
  vendorId: string,
  callback: (orders: Order[]) => void
): (() => void) => {
  // In a real implementation, this would set up a Firestore listener for vendor orders
  // For now, just call the callback once with initial data
  getVendorOrders(vendorId).then(callback)

  // Return unsubscribe function
  return () => {
    // Clean up listener
  }
}

// ✅ Update order status
export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
  // In a real implementation, this would update the order status in Firebase
  // For now, use the existing updateOrder function
  return updateOrder(orderId, { status })
}
