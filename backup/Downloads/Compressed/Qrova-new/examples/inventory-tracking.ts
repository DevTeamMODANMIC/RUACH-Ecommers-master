import { 
  createNode, 
  updateNode, 
  getNode,
  listenToNode 
} from "../lib/firebase-realtime";

// Define inventory item type
interface InventoryItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  lowStockThreshold: number;
  lastUpdated?: number;
  inStock?: boolean;
}

/**
 * Initialize inventory tracking for a product
 * @param productId - The product ID
 * @param productData - The product inventory data
 */
export async function initializeInventory(productId: string, productData: Omit<InventoryItem, "inStock" | "lastUpdated">) {
  try {
    // Calculate if the product is in stock
    const inStock = productData.quantity > 0;
    
    // Prepare the inventory data
    const inventoryData: InventoryItem = {
      ...productData,
      inStock,
      lastUpdated: Date.now()
    };
    
    // Create an inventory node in the "inventory" path with ID equal to productId
    const result = await createNode("inventory", productId, inventoryData);
    console.log(`Initialized inventory for product ${productId}:`, result);
    return result;
  } catch (error) {
    console.error(`Error initializing inventory for product ${productId}:`, error);
    throw error;
  }
}

/**
 * Update inventory quantity for a product
 * @param productId - The product ID
 * @param quantity - The new quantity value
 */
export async function updateInventoryQuantity(productId: string, quantity: number) {
  try {
    // Get the current inventory data
    const currentInventory = await getNode("inventory", productId) as InventoryItem | null;
    
    if (!currentInventory) {
      throw new Error(`Inventory not found for product ${productId}`);
    }
    
    // Calculate if the product is in stock with the new quantity
    const inStock = quantity > 0;
    
    // Check if stock status has changed
    const stockStatusChanged = currentInventory.inStock !== inStock;
    
    // Update the inventory data
    const updateData = {
      quantity,
      inStock,
      lastUpdated: Date.now()
    };
    
    const result = await updateNode("inventory", productId, updateData);
    console.log(`Updated inventory for product ${productId}:`, result);
    
    // Return information about the update
    return {
      ...result,
      stockStatusChanged,
      previousQuantity: currentInventory.quantity,
      newQuantity: quantity,
      lowStock: quantity <= currentInventory.lowStockThreshold
    };
  } catch (error) {
    console.error(`Error updating inventory for product ${productId}:`, error);
    throw error;
  }
}

/**
 * Decrease inventory quantity (e.g., when a product is ordered)
 * @param productId - The product ID
 * @param quantity - The quantity to decrease
 */
export async function decreaseInventory(productId: string, quantity: number) {
  try {
    // Get the current inventory data
    const currentInventory = await getNode("inventory", productId) as InventoryItem | null;
    
    if (!currentInventory) {
      throw new Error(`Inventory not found for product ${productId}`);
    }
    
    // Calculate the new quantity
    const newQuantity = Math.max(0, currentInventory.quantity - quantity);
    
    // Update the inventory with the new quantity
    return await updateInventoryQuantity(productId, newQuantity);
  } catch (error) {
    console.error(`Error decreasing inventory for product ${productId}:`, error);
    throw error;
  }
}

/**
 * Increase inventory quantity (e.g., when restocking)
 * @param productId - The product ID
 * @param quantity - The quantity to increase
 */
export async function increaseInventory(productId: string, quantity: number) {
  try {
    // Get the current inventory data
    const currentInventory = await getNode("inventory", productId) as InventoryItem | null;
    
    if (!currentInventory) {
      throw new Error(`Inventory not found for product ${productId}`);
    }
    
    // Calculate the new quantity
    const newQuantity = currentInventory.quantity + quantity;
    
    // Update the inventory with the new quantity
    return await updateInventoryQuantity(productId, newQuantity);
  } catch (error) {
    console.error(`Error increasing inventory for product ${productId}:`, error);
    throw error;
  }
}

/**
 * Set up a real-time listener for inventory changes
 * @param productId - The product ID to listen to
 * @param callback - Callback function that will be called when inventory changes
 */
export function listenToInventory(productId: string, callback: (data: InventoryItem | null) => void) {
  try {
    // Set up a listener for real-time updates to inventory
    const unsubscribe = listenToNode("inventory", productId, (data) => {
      callback(data as InventoryItem | null);
    });
    
    // Return the unsubscribe function to be called when you want to stop listening
    return unsubscribe;
  } catch (error) {
    console.error(`Error setting up inventory listener for product ${productId}:`, error);
    throw error;
  }
}

/**
 * Example usage
 */
async function inventoryExample() {
  // Product ID
  const productId = "prod-123";
  
  // Initialize inventory
  await initializeInventory(productId, {
    productId,
    productName: "Coca-Cola 50cl Pack",
    sku: "COKE-50CL-PACK",
    quantity: 100,
    lowStockThreshold: 20
  });
  
  // Set up real-time listener
  const unsubscribe = listenToInventory(productId, (inventory) => {
    if (inventory) {
      console.log(`Real-time inventory update for ${inventory.productName}:`);
      console.log(`- Quantity: ${inventory.quantity}`);
      console.log(`- In stock: ${inventory.inStock ? 'Yes' : 'No'}`);
      console.log(`- Low stock: ${inventory.quantity <= inventory.lowStockThreshold ? 'Yes' : 'No'}`);
      console.log(`- Last updated: ${new Date(inventory.lastUpdated || 0).toLocaleString()}`);
      console.log("---");
    }
  });
  
  // Simulate customer ordering 5 items
  console.log("Customer ordered 5 items");
  await decreaseInventory(productId, 5);
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate restocking with 10 items
  console.log("Restocked with 10 items");
  await increaseInventory(productId, 10);
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate large order that would put the product below threshold
  console.log("Customer ordered 90 items");
  await decreaseInventory(productId, 90);
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Clean up listener
  unsubscribe();
}

// Uncomment the line below to run the inventory example
// inventoryExample(); 