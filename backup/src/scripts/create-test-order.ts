import { createOrder } from "../lib/firebase-orders";
import { Order } from "../types";

async function createTestOrder() {
  try {
    const testOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: "test-user-123",
      items: [
        {
          productId: "test-product-1",
          name: "Test Product 1",
          price: 29.99,
          image: "https://via.placeholder.com/150",
          quantity: 2,
          options: {}
        },
        {
          productId: "test-product-2",
          name: "Test Product 2",
          price: 19.99,
          image: "https://via.placeholder.com/150",
          quantity: 1,
          options: {}
        }
      ],
      subtotal: 79.97,
      shipping: 5.99,
      tax: 6.40,
      total: 92.36,
      status: "pending",
      paymentStatus: "paid",
      paymentMethod: "card",
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        address1: "123 Main St",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "USA",
        phone: "555-123-4567",
        email: "john.doe@example.com"
      },
      billingAddress: {
        firstName: "John",
        lastName: "Doe",
        address1: "123 Main St",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "USA",
        phone: "555-123-4567",
        email: "john.doe@example.com"
      },
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      orderNumber: "ORD-TEST-001"
    };

    console.log("Creating test order...");
    const order = await createOrder(testOrder);
    console.log("Test order created successfully:", order);
  } catch (error) {
    console.error("Error creating test order:", error);
  }
}

createTestOrder();