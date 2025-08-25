import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import { Service } from "../types"

// Get all services for a specific service provider
export const getServicesByProviderId = async (providerId: string): Promise<Service[]> => {
  try {
    console.log("🔍 Firebase: Querying services for provider:", providerId)
    
    if (!providerId || typeof providerId !== 'string') {
      throw new Error('Invalid providerId provided')
    }
    
    // Add timeout to prevent hanging
    const queryPromise = (async () => {
      try {
        const q = query(
          collection(db, "services"),
          where("providerId", "==", providerId),
          orderBy("createdAt", "desc")
        )
        
        console.log("🔍 Firebase: Executing query...")
        const snapshot = await getDocs(q)
        console.log("📊 Firebase: Services query executed, found:", snapshot.docs.length, "services")
        
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Service))
      } catch (queryError: any) {
        console.error("💥 Firebase: Error in query execution:", {
          queryError: queryError,
          queryErrorString: JSON.stringify(queryError, Object.getOwnPropertyNames(queryError)),
          queryErrorMessage: queryError?.message || 'No message',
          queryErrorCode: queryError?.code || 'no_code',
          queryErrorName: queryError?.name || 'no_name',
          providerId,
          queryErrorStack: queryError?.stack || 'No stack trace'
        })
        throw queryError
      }
    })()
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      console.log("⏰ Firebase: Setting up timeout for 5 seconds")
      setTimeout(() => {
        console.error("⏰ Firebase: Query timeout after 5 seconds")
        reject(new Error('Services query timeout after 5 seconds'))
      }, 5000)
    })
    
    console.log("🏁 Firebase: Starting Promise.race between query and timeout")
    const result = await Promise.race([queryPromise, timeoutPromise])
    console.log("✅ Firebase: Promise.race completed successfully")
    return result
    
  } catch (error: any) {
    // Enhanced error logging to capture more details
    console.error("💥 Firebase: Error fetching services (catch block):", {
      error: error,
      errorString: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      errorType: typeof error,
      errorMessage: error?.message || 'No message',
      errorCode: error?.code || 'no_code',
      errorName: error?.name || 'no_name',
      providerId,
      stack: error?.stack || 'No stack trace',
      // Additional error properties that might exist in Firebase errors
      errorConstructor: error?.constructor?.name,
      errorKeys: error ? Object.keys(error) : 'No keys',
      errorHasMessage: 'message' in error,
      errorHasCode: 'code' in error,
      errorToString: error?.toString(),
      // Try to get Firebase-specific error details
      firebaseErrorDetails: error?.details || error?.customData || error?.serverResponse || 'No Firebase details',
      // Check if this is a timeout error
      isTimeoutError: error?.message?.includes('timeout'),
      // Check if this is a Firebase error
      isFirebaseError: error?.code !== undefined,
      // Try to stringify the error in different ways
      errorJSON: JSON.stringify(error),
      errorStringifyAll: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      // Check if error has a message property
      hasMessageProperty: Object.prototype.hasOwnProperty.call(error, 'message'),
      // Try to access error properties directly
      directMessage: error.message,
      directCode: error.code,
      directName: error.name,
      directStack: error.stack
    })
    
    // Handle specific Firebase errors
    if (error?.code === 'failed-precondition') {
      console.warn("Firebase index required for services query, returning empty array")
      return []
    } else if (error?.code === 'permission-denied') {
      console.warn("Permission denied for services query, returning empty array")
      return []
    } else if (error?.message?.includes('timeout')) {
      console.warn("Services query timeout, returning empty array")
      return []
    }
    
    // For services, don't throw - just return empty array
    console.warn("Services query failed, returning empty array:", error?.message || 'Unknown error')
    return []
  }
}

// Get a specific service by ID
export const getService = async (serviceId: string): Promise<Service | null> => {
  try {
    const docRef = doc(db, "services", serviceId)
    const snapshot = await getDoc(docRef)
    
    if (!snapshot.exists()) {
      return null
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as Service
  } catch (error) {
    console.error("Error fetching service:", error)
    throw new Error("Failed to fetch service")
  }
}

// Create a new service
export const createService = async (
  serviceData: Omit<Service, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "services"), {
      ...serviceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    
    console.log(`Service created with ID: ${docRef.id}`)
    return docRef.id
  } catch (error) {
    console.error("Error creating service:", error)
    throw new Error("Failed to create service")
  }
}

// Update a service
export const updateService = async (
  serviceId: string,
  updates: Partial<Service>
): Promise<void> => {
  try {
    const docRef = doc(db, "services", serviceId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
    
    console.log(`Service ${serviceId} updated successfully`)
  } catch (error) {
    console.error("Error updating service:", error)
    throw new Error("Failed to update service")
  }
}

// Delete a service
export const deleteService = async (serviceId: string): Promise<void> => {
  try {
    const docRef = doc(db, "services", serviceId)
    await deleteDoc(docRef)
    
    console.log(`Service ${serviceId} deleted successfully`)
  } catch (error) {
    console.error("Error deleting service:", error)
    throw new Error("Failed to delete service")
  }
}

// Toggle service active status
export const toggleServiceStatus = async (serviceId: string, isActive: boolean): Promise<void> => {
  try {
    const docRef = doc(db, "services", serviceId)
    await updateDoc(docRef, {
      isActive,
      updatedAt: serverTimestamp(),
    })
    
    console.log(`Service ${serviceId} status updated to ${isActive ? 'active' : 'inactive'}`)
  } catch (error) {
    console.error("Error updating service status:", error)
    throw new Error("Failed to update service status")
  }
}

// Get active services by category
export const getServicesByCategory = async (category: string): Promise<Service[]> => {
  try {
    const q = query(
      collection(db, "services"),
      where("category", "==", category),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Service))
  } catch (error) {
    console.error("Error fetching services by category:", error)
    throw new Error("Failed to fetch services by category")
  }
}

// Get all active services
export const getAllActiveServices = async (): Promise<Service[]> => {
  try {
    const q = query(
      collection(db, "services"),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Service))
  } catch (error) {
    console.error("Error fetching active services:", error)
    throw new Error("Failed to fetch active services")
  }
}