import { 
  createNode, 
  updateNode, 
  deleteNode,
  getNode,
  listenToNode,
  listenToNodes 
} from "../lib/firebase-realtime";

// Define user presence type
interface UserPresence {
  userId: string;
  displayName?: string;
  isOnline: boolean;
  lastActive: number;
  currentPage?: string;
  deviceInfo?: {
    browser?: string;
    os?: string;
    isMobile?: boolean;
  };
}

// Define user cart activity type
interface UserCartActivity {
  userId: string;
  displayName?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    addedAt: number;
  }[];
  lastUpdated: number;
}

/**
 * Update user's online presence status
 * @param userId - The user ID
 * @param displayName - Optional display name
 * @param isOnline - Whether the user is online
 * @param currentPage - The current page the user is viewing
 * @param deviceInfo - Information about the user's device
 */
export async function updateUserPresence(
  userId: string, 
  displayName?: string,
  isOnline: boolean = true, 
  currentPage?: string,
  deviceInfo?: UserPresence['deviceInfo']
) {
  try {
    const presenceData: UserPresence = {
      userId,
      displayName,
      isOnline,
      lastActive: Date.now(),
      currentPage,
      deviceInfo
    };
    
    // Create/update the user presence node
    const result = await createNode("presence", userId, presenceData);
    console.log(`Updated presence for user ${userId}:`, result);
    return result;
  } catch (error) {
    console.error(`Error updating presence for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Set up automatic presence tracking when user connects/disconnects
 * @param userId - The user ID
 * @param displayName - Optional display name
 */
export function setupPresenceTracking(userId: string, displayName?: string) {
  try {
    // Set initial online status
    updateUserPresence(userId, displayName, true);
    
    // Create a function to handle page visibility changes
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      updateUserPresence(userId, displayName, isVisible);
    };
    
    // Create a function to handle page unload/close
    const handleUnload = () => {
      // This might not always work due to how browsers handle beforeunload
      // For more reliable offline detection, you should use Firebase's .info/connected approach
      updateUserPresence(userId, displayName, false);
    };
    
    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleUnload);
    
    // Return a cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleUnload);
      updateUserPresence(userId, displayName, false);
    };
  } catch (error) {
    console.error(`Error setting up presence tracking for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Update user's shopping cart activity
 * @param userId - The user ID
 * @param displayName - Optional display name
 * @param items - The items in the user's cart
 */
export async function updateCartActivity(
  userId: string,
  displayName?: string,
  items: UserCartActivity['items'] = []
) {
  try {
    const cartData: UserCartActivity = {
      userId,
      displayName,
      items,
      lastUpdated: Date.now()
    };
    
    // Create/update the user cart activity node
    const result = await createNode("cart-activity", userId, cartData);
    console.log(`Updated cart activity for user ${userId}:`, result);
    return result;
  } catch (error) {
    console.error(`Error updating cart activity for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Add a product to the user's cart activity
 * @param userId - The user ID
 * @param productId - The product ID
 * @param productName - The product name
 * @param quantity - The quantity to add
 */
export async function addToCartActivity(
  userId: string,
  productId: string,
  productName: string,
  quantity: number = 1
) {
  try {
    // Get current cart activity
    const currentActivity = await getNode("cart-activity", userId) as UserCartActivity | null;
    
    // Initialize items array if it doesn't exist
    const items = currentActivity?.items || [];
    
    // Check if product already exists in cart
    const existingItemIndex = items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      items.push({
        productId,
        productName,
        quantity,
        addedAt: Date.now()
      });
    }
    
    // Update cart activity
    return await updateCartActivity(userId, currentActivity?.displayName, items);
  } catch (error) {
    console.error(`Error adding to cart activity for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Remove a product from the user's cart activity
 * @param userId - The user ID
 * @param productId - The product ID to remove
 */
export async function removeFromCartActivity(userId: string, productId: string) {
  try {
    // Get current cart activity
    const currentActivity = await getNode("cart-activity", userId) as UserCartActivity | null;
    
    if (!currentActivity) {
      throw new Error(`Cart activity not found for user ${userId}`);
    }
    
    // Filter out the product
    const updatedItems = currentActivity.items.filter(item => item.productId !== productId);
    
    // Update cart activity
    return await updateCartActivity(userId, currentActivity.displayName, updatedItems);
  } catch (error) {
    console.error(`Error removing from cart activity for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Clear all items from the user's cart activity
 * @param userId - The user ID
 */
export async function clearCartActivity(userId: string) {
  try {
    // Get current cart activity to preserve displayName
    const currentActivity = await getNode("cart-activity", userId) as UserCartActivity | null;
    
    // Update cart activity with empty items array
    return await updateCartActivity(userId, currentActivity?.displayName, []);
  } catch (error) {
    console.error(`Error clearing cart activity for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Listen to user presence changes
 * @param userId - The user ID to listen to
 * @param callback - Function to call when presence changes
 */
export function listenToUserPresence(userId: string, callback: (data: UserPresence | null) => void) {
  try {
    // Set up a listener for real-time updates to user presence
    const unsubscribe = listenToNode("presence", userId, (data) => {
      callback(data as UserPresence | null);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error(`Error listening to presence for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Listen to all online users
 * @param callback - Function to call when online users change
 */
export function listenToOnlineUsers(callback: (users: UserPresence[]) => void) {
  try {
    // Set up a listener for real-time updates to all user presence
    const unsubscribe = listenToNodes("presence", (data) => {
      // Filter only online users
      const onlineUsers = data.filter(user => (user as UserPresence).isOnline);
      callback(onlineUsers as UserPresence[]);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error("Error listening to online users:", error);
    throw error;
  }
}

/**
 * Listen to user cart activity
 * @param userId - The user ID to listen to
 * @param callback - Function to call when cart activity changes
 */
export function listenToCartActivity(userId: string, callback: (data: UserCartActivity | null) => void) {
  try {
    // Set up a listener for real-time updates to user cart activity
    const unsubscribe = listenToNode("cart-activity", userId, (data) => {
      callback(data as UserCartActivity | null);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error(`Error listening to cart activity for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Example usage
 */
async function userActivityExample() {
  // User IDs
  const user1Id = "user-123";
  const user2Id = "user-456";
  
  // Set up presence for user 1
  await updateUserPresence(user1Id, "John Doe", true, "/shop", {
    browser: "Chrome",
    os: "Windows",
    isMobile: false
  });
  
  // Set up presence for user 2
  await updateUserPresence(user2Id, "Jane Smith", true, "/products/123", {
    browser: "Safari",
    os: "iOS",
    isMobile: true
  });
  
  // Listen to online users
  const unsubscribeOnlineUsers = listenToOnlineUsers((users) => {
    console.log(`There are ${users.length} users online:`);
    users.forEach(user => {
      console.log(`- ${user.displayName || user.userId} (viewing: ${user.currentPage || 'unknown'})`);
    });
    console.log("---");
  });
  
  // Update user 1's cart activity
  await addToCartActivity(user1Id, "prod-123", "Coca-Cola 50cl Pack", 2);
  await addToCartActivity(user1Id, "prod-456", "Fanta 50cl Pack", 1);
  
  // Listen to user 1's cart activity
  const unsubscribeCartActivity = listenToCartActivity(user1Id, (activity) => {
    if (activity) {
      console.log(`${activity.displayName || activity.userId}'s cart updated:`);
      console.log(`- ${activity.items.length} products in cart`);
      console.log(`- Last updated: ${new Date(activity.lastUpdated).toLocaleString()}`);
      activity.items.forEach(item => {
        console.log(`  * ${item.productName} (${item.quantity})`);
      });
      console.log("---");
    }
  });
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Update user 1's cart activity - add more quantity
  await addToCartActivity(user1Id, "prod-123", "Coca-Cola 50cl Pack", 3);
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Remove a product from user 1's cart
  await removeFromCartActivity(user1Id, "prod-456");
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Set user 2 to offline
  await updateUserPresence(user2Id, "Jane Smith", false);
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Clear user 1's cart
  await clearCartActivity(user1Id);
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Clean up listeners
  unsubscribeOnlineUsers();
  unsubscribeCartActivity();
}

// Uncomment the line below to run the user activity example
// userActivityExample(); 