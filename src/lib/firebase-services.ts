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

// Test Firebase connection
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log("🔍 Testing Firebase connection...")
    // Simple read test that doesn't require data to exist
    const testQuery = query(collection(db, "services"), where("__fake__", "==", "test"))
    await getDocs(testQuery)
    console.log("✅ Firebase connection test passed")
    return true
  } catch (error: any) {
    console.error("❌ Firebase connection test failed:", error?.message || error)
    return false
  }
}

// Get all services for a specific service provider
export const getServicesByProviderId = async (
  providerId: string, 
  abortController?: AbortController
): Promise<Service[]> => {
  try {
    console.log("🔍 Firebase: Querying services for provider:", providerId)
    
    if (!providerId || typeof providerId !== 'string') {
      throw new Error('Invalid providerId provided')
    }
    
    // Simplified query without orderBy to avoid index requirements
    const queryPromise = (async () => {
      try {
        // Check if request was aborted before starting
        if (abortController?.signal.aborted) {
          throw new Error('Request was aborted')
        }
        
        // First try simple where query (no orderBy to avoid composite index requirement)
        const q = query(
          collection(db, "services"),
          where("providerId", "==", providerId)
        )
        
        console.log("🔍 Firebase: Executing simplified query...")
        const snapshot = await getDocs(q)
        
        // Check if request was aborted after query
        if (abortController?.signal.aborted) {
          throw new Error('Request was aborted')
        }
        
        console.log("📊 Firebase: Services query executed, found:", snapshot.docs.length, "services")
        
        const services = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Service))
        
        // Sort client-side by createdAt (desc)
        services.sort((a, b) => {
          const getTimestamp = (timestamp: string | number | null): number => {
            if (!timestamp) return 0
            if (typeof timestamp === 'number') return timestamp
            if (typeof timestamp === 'string') {
              const parsed = new Date(timestamp).getTime()
              return isNaN(parsed) ? 0 : parsed
            }
            // Handle Firebase Timestamp objects
            if (typeof timestamp === 'object' && 'seconds' in timestamp) {
              return (timestamp as any).seconds * 1000
            }
            return 0
          }
          
          const aTime = getTimestamp(a.createdAt)
          const bTime = getTimestamp(b.createdAt)
          return bTime - aTime // desc order
        })
        
        return services
      } catch (queryError: any) {
        // Don't log error if request was aborted
        if (!queryError?.message?.includes('aborted')) {
          console.error("💥 Firebase: Error in query execution:", {
            queryError: queryError,
            queryErrorMessage: queryError?.message || 'No message',
            queryErrorCode: queryError?.code || 'no_code',
            providerId
          })
        }
        throw queryError
      }
    })()
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timeoutId = setTimeout(() => {
        console.error("⏰ Firebase: Query timeout after 6 seconds")
        reject(new Error('Services query timeout after 6 seconds'))
      }, 6000) // Standardized 6-second timeout
      
      // Clear timeout if request is aborted
      if (abortController) {
        abortController.signal.addEventListener('abort', () => {
          clearTimeout(timeoutId)
          reject(new Error('Request was aborted'))
        })
      }
    })
    
    const result = await Promise.race([queryPromise, timeoutPromise])
    console.log("✅ Firebase: Services query completed successfully, count:", result.length)
    return result
    
  } catch (error: any) {
    // Don't log error if request was aborted
    if (!error?.message?.includes('aborted')) {
      console.error("💥 Firebase: Error fetching services:", {
        errorMessage: error?.message || 'No message',
        errorCode: error?.code || 'no_code',
        providerId
      })
    }
    
    // Handle specific Firebase errors gracefully
    if (error?.message?.includes('aborted')) {
      console.warn("Services query was cancelled, returning empty array")
      return []
    } else if (error?.code === 'failed-precondition') {
      console.warn("Firebase index required for services query, returning empty array")
      return []
    } else if (error?.code === 'permission-denied') {
      console.warn("Permission denied for services query, returning empty array")
      return []
    } else if (error?.message?.includes('timeout')) {
      console.warn("Services query timeout, returning empty array")
      return []
    } else if (error?.code === 'unavailable') {
      console.warn("Firebase temporarily unavailable, returning empty array")
      return []
    }
    
    // For services, don't throw - just return empty array for better UX
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
    // Use simple where query first, then sort client-side to avoid index issues
    const q = query(
      collection(db, "services"),
      where("category", "==", category),
      where("isActive", "==", true)
    )
    const snapshot = await getDocs(q)
    const services = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Service))
    
    // Sort client-side by createdAt (desc)
    services.sort((a, b) => {
      const getTimestamp = (timestamp: string | number | null): number => {
        if (!timestamp) return 0
        if (typeof timestamp === 'number') return timestamp
        if (typeof timestamp === 'string') {
          const parsed = new Date(timestamp).getTime()
          return isNaN(parsed) ? 0 : parsed
        }
        if (typeof timestamp === 'object' && 'seconds' in timestamp) {
          return (timestamp as any).seconds * 1000
        }
        return 0
      }
      
      const aTime = getTimestamp(a.createdAt)
      const bTime = getTimestamp(b.createdAt)
      return bTime - aTime
    })
    
    return services
  } catch (error) {
    console.error("Error fetching services by category:", error)
    // Return empty array instead of throwing to improve UX
    return []
  }
}

// Get all active services
export const getAllActiveServices = async (): Promise<Service[]> => {
  try {
    // Simplified query without orderBy
    const q = query(
      collection(db, "services"),
      where("isActive", "==", true)
    )
    const snapshot = await getDocs(q)
    const services = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Service))
    
    // Sort client-side by createdAt (desc)
    services.sort((a, b) => {
      const getTimestamp = (timestamp: string | number | null): number => {
        if (!timestamp) return 0
        if (typeof timestamp === 'number') return timestamp
        if (typeof timestamp === 'string') {
          const parsed = new Date(timestamp).getTime()
          return isNaN(parsed) ? 0 : parsed
        }
        if (typeof timestamp === 'object' && 'seconds' in timestamp) {
          return (timestamp as any).seconds * 1000
        }
        return 0
      }
      
      const aTime = getTimestamp(a.createdAt)
      const bTime = getTimestamp(b.createdAt)
      return bTime - aTime
    })
    
    return services
  } catch (error) {
    console.error("Error fetching all active services:", error)
    // Return empty array instead of throwing to improve UX
    return []
  }
}

// Firebase Services Module Complete