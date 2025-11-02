import { ref, set, push, update, remove, get, child, onValue, off } from "firebase/database";
import { rtdb } from "./firebase";

/**
 * Create a new node with a specific ID
 * @param path - The database path where to create the node
 * @param id - The ID for the new node
 * @param data - The data to store in the node
 */
export const createNode = async (path: string, id: string, data: any) => {
  try {
    const nodeRef = ref(rtdb, `${path}/${id}`);
    await set(nodeRef, {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { id, ...data };
  } catch (error: any) {
    console.error(`Error creating node at ${path}/${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Create a new node with auto-generated ID
 * @param path - The database path where to create the node
 * @param data - The data to store in the node
 * @returns The created data with the auto-generated ID
 */
export const createNodeWithAutoId = async (path: string, data: any) => {
  try {
    const newNodeRef = push(ref(rtdb, path));
    const id = newNodeRef.key;
    
    if (!id) {
      throw new Error("Failed to generate node ID");
    }
    
    await set(newNodeRef, {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return { id, ...data };
  } catch (error: any) {
    console.error(`Error creating node at ${path}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Update an existing node
 * @param path - The database path to the node
 * @param id - The ID of the node to update
 * @param data - The data to update in the node
 */
export const updateNode = async (path: string, id: string, data: any) => {
  try {
    const nodeRef = ref(rtdb, `${path}/${id}`);
    await update(nodeRef, {
      ...data,
      updatedAt: Date.now(),
    });
    return { id, ...data };
  } catch (error: any) {
    console.error(`Error updating node at ${path}/${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Delete a node
 * @param path - The database path to the node
 * @param id - The ID of the node to delete
 */
export const deleteNode = async (path: string, id: string) => {
  try {
    const nodeRef = ref(rtdb, `${path}/${id}`);
    await remove(nodeRef);
    return true;
  } catch (error: any) {
    console.error(`Error deleting node at ${path}/${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Get a node by ID
 * @param path - The database path to the node
 * @param id - The ID of the node to get
 */
export const getNode = async (path: string, id: string) => {
  try {
    const nodeRef = ref(rtdb, `${path}/${id}`);
    const snapshot = await get(nodeRef);
    
    if (snapshot.exists()) {
      return { id, ...snapshot.val() };
    } else {
      return null;
    }
  } catch (error: any) {
    console.error(`Error getting node at ${path}/${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Get all nodes under a path
 * @param path - The database path to get nodes from
 */
export const getNodes = async (path: string) => {
  try {
    const nodesRef = ref(rtdb, path);
    const snapshot = await get(nodesRef);
    
    if (snapshot.exists()) {
      const nodes: any[] = [];
      snapshot.forEach((childSnapshot) => {
        nodes.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      return nodes;
    } else {
      return [];
    }
  } catch (error: any) {
    console.error(`Error getting nodes at ${path}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Listen to a specific node
 * @param path - The database path to the node
 * @param id - The ID of the node to listen to
 * @param callback - Function to call when the node changes
 */
export const listenToNode = (path: string, id: string, callback: (data: any | null) => void) => {
  const nodeRef = ref(rtdb, `${path}/${id}`);
  
  onValue(nodeRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id, ...snapshot.val() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Error listening to node at ${path}/${id}:`, error);
    callback(null);
  });
  
  // Return a function to unsubscribe from the listener
  return () => off(nodeRef);
};

/**
 * Listen to all nodes under a path
 * @param path - The database path to listen to
 * @param callback - Function to call when any node changes
 */
export const listenToNodes = (path: string, callback: (data: any[]) => void) => {
  const nodesRef = ref(rtdb, path);
  
  onValue(nodesRef, (snapshot) => {
    const nodes: any[] = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        nodes.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
    }
    
    callback(nodes);
  }, (error) => {
    console.error(`Error listening to nodes at ${path}:`, error);
    callback([]);
  });
  
  // Return a function to unsubscribe from the listener
  return () => off(nodesRef);
}; 