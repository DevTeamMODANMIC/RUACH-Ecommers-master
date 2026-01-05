import { ref, set, push, update, remove, get, child, onValue, off } from "firebase/database";
import { rtdb } from "../lib/firebase";

/**
 * This file demonstrates direct Firebase Realtime Database operations
 * without using the helper functions from firebase-realtime.ts
 */

// Example: Create a node with a specific ID
async function createNodeDirectly() {
  try {
    // Create a reference to the node
    const nodeRef = ref(rtdb, "direct-examples/node1");
    
    // Data to store
    const data = {
      name: "Example Node",
      description: "This is a direct example",
      createdAt: Date.now(),
      active: true,
      priority: 1
    };
    
    // Set the data
    await set(nodeRef, data);
    
    console.log("Node created directly:", { id: "node1", ...data });
    return { id: "node1", ...data };
  } catch (error: any) {
    console.error("Error creating node directly:", error);
    throw error;
  }
}

// Example: Create a node with an auto-generated ID
async function createNodeWithAutoIdDirectly() {
  try {
    // Create a reference to the collection
    const collectionRef = ref(rtdb, "direct-examples");
    
    // Generate a new node reference with auto ID
    const newNodeRef = push(collectionRef);
    
    // Get the auto-generated ID
    const id = newNodeRef.key;
    
    if (!id) {
      throw new Error("Failed to generate node ID");
    }
    
    // Data to store
    const data = {
      name: "Auto ID Node",
      description: "This node has an auto-generated ID",
      createdAt: Date.now(),
      active: true,
      priority: 2
    };
    
    // Set the data
    await set(newNodeRef, data);
    
    console.log("Node created with auto ID directly:", { id, ...data });
    return { id, ...data };
  } catch (error: any) {
    console.error("Error creating node with auto ID directly:", error);
    throw error;
  }
}

// Example: Update a node
async function updateNodeDirectly(nodeId: string) {
  try {
    // Create a reference to the node
    const nodeRef = ref(rtdb, `direct-examples/${nodeId}`);
    
    // Data to update
    const updates = {
      description: "This description was updated",
      updatedAt: Date.now()
    };
    
    // Update the data
    await update(nodeRef, updates);
    
    console.log("Node updated directly:", { id: nodeId, ...updates });
    return { id: nodeId, ...updates };
  } catch (error: any) {
    console.error("Error updating node directly:", error);
    throw error;
  }
}

// Example: Read a node
async function readNodeDirectly(nodeId: string) {
  try {
    // Create a reference to the node
    const nodeRef = ref(rtdb, `direct-examples/${nodeId}`);
    
    // Get the data
    const snapshot = await get(nodeRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log("Node read directly:", { id: nodeId, ...data });
      return { id: nodeId, ...data };
    } else {
      console.log("No data available for node:", nodeId);
      return null;
    }
  } catch (error: any) {
    console.error("Error reading node directly:", error);
    throw error;
  }
}

// Example: Delete a node
async function deleteNodeDirectly(nodeId: string) {
  try {
    // Create a reference to the node
    const nodeRef = ref(rtdb, `direct-examples/${nodeId}`);
    
    // Remove the data
    await remove(nodeRef);
    
    console.log("Node deleted directly:", nodeId);
    return true;
  } catch (error: any) {
    console.error("Error deleting node directly:", error);
    throw error;
  }
}

// Example: Listen to a node
function listenToNodeDirectly(nodeId: string) {
  try {
    // Create a reference to the node
    const nodeRef = ref(rtdb, `direct-examples/${nodeId}`);
    
    // Set up a listener
    onValue(nodeRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("Real-time update for node:", { id: nodeId, ...data });
      } else {
        console.log("No data available for node:", nodeId);
      }
    }, (error) => {
      console.error("Error listening to node:", error);
    });
    
    // Return a function to remove the listener
    return () => off(nodeRef);
  } catch (error: any) {
    console.error("Error setting up listener directly:", error);
    throw error;
  }
}

// Example: Multi-path update (transaction)
async function multiPathUpdateDirectly() {
  try {
    // Get a reference to the root
    const rootRef = ref(rtdb);
    
    // Prepare multi-path updates
    const updates: Record<string, any> = {};
    updates['direct-examples/node1/lastAccessed'] = Date.now();
    updates['direct-examples/node1/accessCount'] = 1; // Set initial value
    updates['stats/nodeAccesses'] = 1; // Set initial value
    
    // Perform the multi-path update
    await update(rootRef, updates);
    
    console.log("Multi-path update completed directly");
    return true;
  } catch (error: any) {
    console.error("Error performing multi-path update directly:", error);
    throw error;
  }
}

// Example: Increment a counter (read-then-write pattern)
async function incrementCounterDirectly(nodeId: string) {
  try {
    // Create a reference to the node
    const nodeRef = ref(rtdb, `direct-examples/${nodeId}`);
    
    // Get the current data
    const snapshot = await get(nodeRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const currentCount = data.accessCount || 0;
      
      // Increment the counter
      await update(nodeRef, {
        accessCount: currentCount + 1,
        lastAccessed: Date.now()
      });
      
      console.log("Counter incremented directly:", { id: nodeId, newCount: currentCount + 1 });
      return { id: nodeId, newCount: currentCount + 1 };
    } else {
      console.log("No data available for node:", nodeId);
      return null;
    }
  } catch (error: any) {
    console.error("Error incrementing counter directly:", error);
    throw error;
  }
}

/**
 * Run all direct examples in sequence
 */
async function runDirectExamples() {
  // Create nodes
  await createNodeDirectly();
  const result = await createNodeWithAutoIdDirectly();
  
  if (result && result.id) {
    const autoId = result.id;
    
    // Set up a listener
    const unsubscribe = listenToNodeDirectly(autoId);
    
    // Wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Perform operations
    await updateNodeDirectly(autoId);
    await readNodeDirectly(autoId);
    await multiPathUpdateDirectly();
    await incrementCounterDirectly("node1");
    
    // Wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clean up listener
    unsubscribe();
    
    // Delete the auto-generated node
    await deleteNodeDirectly(autoId);
  }
}

// Uncomment to run the examples
// runDirectExamples(); 