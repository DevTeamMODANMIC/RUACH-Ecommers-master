import { 
  createNode, 
  createNodeWithAutoId, 
  updateNode, 
  deleteNode, 
  getNode, 
  getNodes, 
  listenToNode, 
  listenToNodes 
} from "../lib/firebase-realtime";

/**
 * Example: Creating a node with a specific ID
 */
async function exampleCreateNode() {
  try {
    // Create a product in the "products" path with ID "prod-123"
    const productData = {
      name: "Sample Product",
      price: 29.99,
      category: "electronics",
      inStock: true,
      description: "This is a sample product description"
    };
    
    const result = await createNode("products", "prod-123", productData);
    console.log("Created node:", result);
  } catch (error) {
    console.error("Error creating node:", error);
  }
}

/**
 * Example: Creating a node with an auto-generated ID
 */
async function exampleCreateNodeWithAutoId() {
  try {
    // Create an order in the "orders" path with auto-generated ID
    const orderData = {
      userId: "user-456",
      items: [
        { productId: "prod-123", quantity: 2, price: 29.99 },
        { productId: "prod-456", quantity: 1, price: 49.99 }
      ],
      totalAmount: 109.97,
      status: "pending"
    };
    
    const result = await createNodeWithAutoId("orders", orderData);
    console.log("Created node with auto ID:", result);
    return result.id; // Return the auto-generated ID for use in other examples
  } catch (error) {
    console.error("Error creating node with auto ID:", error);
    return null;
  }
}

/**
 * Example: Updating a node
 */
async function exampleUpdateNode(nodeId: string) {
  try {
    // Update the order status
    const updateData = {
      status: "processing",
      processingDate: Date.now()
    };
    
    const result = await updateNode("orders", nodeId, updateData);
    console.log("Updated node:", result);
  } catch (error) {
    console.error("Error updating node:", error);
  }
}

/**
 * Example: Getting a node
 */
async function exampleGetNode(nodeId: string) {
  try {
    const result = await getNode("orders", nodeId);
    console.log("Retrieved node:", result);
  } catch (error) {
    console.error("Error getting node:", error);
  }
}

/**
 * Example: Getting all nodes in a path
 */
async function exampleGetNodes() {
  try {
    const result = await getNodes("orders");
    console.log("Retrieved nodes:", result);
  } catch (error) {
    console.error("Error getting nodes:", error);
  }
}

/**
 * Example: Listening to a node
 */
function exampleListenToNode(nodeId: string) {
  // Set up a listener for real-time updates
  const unsubscribe = listenToNode("orders", nodeId, (data) => {
    console.log("Real-time node update:", data);
  });
  
  // Return the unsubscribe function to be called when you want to stop listening
  return unsubscribe;
}

/**
 * Example: Listening to all nodes in a path
 */
function exampleListenToNodes() {
  // Set up a listener for real-time updates to all orders
  const unsubscribe = listenToNodes("orders", (data) => {
    console.log("Real-time nodes update:", data);
  });
  
  // Return the unsubscribe function to be called when you want to stop listening
  return unsubscribe;
}

/**
 * Example: Deleting a node
 */
async function exampleDeleteNode(nodeId: string) {
  try {
    const result = await deleteNode("orders", nodeId);
    console.log("Deleted node:", result);
  } catch (error) {
    console.error("Error deleting node:", error);
  }
}

/**
 * Run all examples in sequence
 */
async function runAllExamples() {
  // Create nodes
  await exampleCreateNode();
  const autoId = await exampleCreateNodeWithAutoId();
  
  if (autoId) {
    // Set up a real-time listener before making changes
    const unsubscribeNode = exampleListenToNode(autoId);
    const unsubscribeNodes = exampleListenToNodes();
    
    // Wait 2 seconds to ensure listeners are set up
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update, get and delete nodes
    await exampleUpdateNode(autoId);
    await exampleGetNode(autoId);
    await exampleGetNodes();
    
    // Wait 2 seconds to see real-time updates
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clean up listeners
    unsubscribeNode();
    unsubscribeNodes();
    
    // Delete the node
    await exampleDeleteNode(autoId);
  }
}

// Uncomment the line below to run all examples
// runAllExamples(); 