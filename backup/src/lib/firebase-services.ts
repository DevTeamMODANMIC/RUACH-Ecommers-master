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
  limit,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import { Service } from "../types"

// Test Firebase connection
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log("🔍 Testing Firebase connection...")
    // Simple collection access test - no field queries needed
    const servicesRef = collection(db, "services")
    // Just check if we can access the collection without querying specific fields
    // This tests Firebase connectivity without requiring specific data or field names
    await getDocs(query(servicesRef, limit(1)))
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
    
    return docRef.id
  } catch (error) {
    console.error("Error creating service:", error)
    throw new Error("Failed to create service")
  }
}

// Update a service
export const updateService = async (
  serviceId: string,
  updates: Partial<Omit<Service, "id" | "createdAt">>
): Promise<void> => {
  try {
    const docRef = doc(db, "services", serviceId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
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
  } catch (error) {
    console.error("Error deleting service:", error)
    throw new Error("Failed to delete service")
  }
}

// Get all services (for admin)
export const getAllServices = async (): Promise<Service[]> => {
  try {
    const q = query(collection(db, "services"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Service))
  } catch (error) {
    console.error("Error fetching all services:", error)
    throw new Error("Failed to fetch services")
  }
}

// Get services by category
export const getServicesByCategory = async (category: string): Promise<Service[]> => {
  try {
    const q = query(
      collection(db, "services"),
      where("category", "==", category),
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

// Search services by keyword
export const searchServices = async (keyword: string): Promise<Service[]> => {
  try {
    // Note: This is a simple implementation. For production, consider using
    // Algolia, Elasticsearch, or Firestore's full-text search capabilities
    const q = query(collection(db, "services"))
    const snapshot = await getDocs(q)
    
    const services = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Service))
    
    // Filter client-side (not ideal for large datasets)
    const filteredServices = services.filter(service =>
      service.name?.toLowerCase().includes(keyword.toLowerCase()) ||
      service.description?.toLowerCase().includes(keyword.toLowerCase()) ||
      service.category?.toLowerCase().includes(keyword.toLowerCase())
    )
    
    return filteredServices
  } catch (error) {
    console.error("Error searching services:", error)
    throw new Error("Failed to search services")
  }
}

// Toggle service active status
export const toggleServiceStatus = async (
  serviceId: string, 
  newStatus?: boolean
): Promise<void> => {
  try {
    console.log("🔄 Toggling service status:", { serviceId, newStatus })
    
    const docRef = doc(db, "services", serviceId)
    
    if (newStatus !== undefined) {
      // Set specific status
      await updateDoc(docRef, {
        isActive: newStatus,
        updatedAt: serverTimestamp(),
      })
      console.log("✅ Service status updated to:", newStatus)
    } else {
      // Toggle current status - need to fetch current value first
      const snapshot = await getDoc(docRef)
      if (!snapshot.exists()) {
        throw new Error("Service not found")
      }
      
      const currentService = snapshot.data() as Service
      const newActiveStatus = !currentService.isActive
      
      await updateDoc(docRef, {
        isActive: newActiveStatus,
        updatedAt: serverTimestamp(),
      })
      console.log("✅ Service status toggled to:", newActiveStatus)
    }
  } catch (error) {
    console.error("Error toggling service status:", error)
    throw new Error("Failed to toggle service status")
  }
}

// Get all active services (for marketplace)
export const getAllActiveServices = async (): Promise<Service[]> => {
  try {
    console.log("🔍 Firebase: Fetching all active services for marketplace...")
    
    // Query services where isActive is true
    const q = query(
      collection(db, "services"),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    )
    
    const snapshot = await getDocs(q)
    const activeServices = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Service))
    
    console.log("✅ Firebase: Active services fetched:", activeServices.length)
    return activeServices
    
  } catch (error: any) {
    console.error("💥 Firebase: Error fetching active services:", error)
    
    // If composite query fails due to missing index, try simple query
    if (error?.code === 'failed-precondition') {
      console.warn("⚠️ Firebase: Composite index not found, using simple query...")
      
      try {
        const q = query(collection(db, "services"))
        const snapshot = await getDocs(q)
        
        const allServices = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Service))
        
        // Filter client-side for active services
        const activeServices = allServices.filter(service => service.isActive === true)
        
        // Sort client-side by createdAt (desc)
        activeServices.sort((a, b) => {
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
        
        console.log("✅ Firebase: Active services fetched with fallback:", activeServices.length)
        return activeServices
        
      } catch (fallbackError: any) {
        console.error("💥 Firebase: Fallback query also failed:", fallbackError)
        throw new Error("Failed to fetch active services")
      }
    }
    
    throw new Error(`Failed to fetch active services: ${error?.message || 'Unknown error'}`)
  }
}