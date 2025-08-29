import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  addDoc,
} from "firebase/firestore"
import { db } from "./firebase"
import { ServiceProvider } from "../types"

// Get all service providers for admin dashboard
export const getAllServiceProviders = async (): Promise<ServiceProvider[]> => {
  try {
    console.log("🔍 Firebase: Fetching all service providers...")
    
    // Try with orderBy first
    try {
      const q = query(collection(db, "serviceProviders"), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      console.log("✅ Firebase: All providers fetched with orderBy:", snapshot.docs.length)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceProvider))
    } catch (orderError: any) {
      // If orderBy fails (likely due to missing index), fall back to simple query
      console.warn("⚠️ Firebase: OrderBy failed, using fallback query:", orderError.message)
      
      const q = query(collection(db, "serviceProviders"))
      const snapshot = await getDocs(q)
      const providers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceProvider))
      
      // Sort client-side
      providers.sort((a, b) => {
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
        return bTime - aTime
      })
      
      console.log("✅ Firebase: All providers fetched with fallback:", providers.length)
      return providers
    }
  } catch (error: any) {
    console.error("💥 Firebase: Error fetching service providers:", error)
    throw new Error(`Failed to fetch service providers: ${error.message}`)
  }
}

// Get pending service providers (awaiting approval)
export const getPendingServiceProviders = async (): Promise<ServiceProvider[]> => {
  try {
    console.log("🔍 Firebase: Fetching pending service providers...")
    
    // Try with where + orderBy first
    try {
      const q = query(
        collection(db, "serviceProviders"),
        where("isApproved", "==", false),
        orderBy("createdAt", "desc")
      )
      const snapshot = await getDocs(q)
      console.log("✅ Firebase: Pending providers fetched with orderBy:", snapshot.docs.length)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceProvider))
    } catch (orderError: any) {
      // If composite query fails, fall back to where-only query
      console.warn("⚠️ Firebase: Composite query failed, using fallback:", orderError.message)
      
      const q = query(
        collection(db, "serviceProviders"),
        where("isApproved", "==", false)
      )
      const snapshot = await getDocs(q)
      const providers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceProvider))
      
      // Sort client-side
      providers.sort((a, b) => {
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
        return bTime - aTime
      })
      
      console.log("✅ Firebase: Pending providers fetched with fallback:", providers.length)
      return providers
    }
  } catch (error: any) {
    console.error("💥 Firebase: Error fetching pending service providers:", error)
    throw new Error(`Failed to fetch pending service providers: ${error.message}`)
  }
}

// Get approved and active service providers
export const getApprovedServiceProviders = async (): Promise<ServiceProvider[]> => {
  try {
    console.log("🔍 Firebase: Fetching approved service providers...")
    
    // Try with where + orderBy first
    try {
      const q = query(
        collection(db, "serviceProviders"),
        where("isApproved", "==", true),
        orderBy("createdAt", "desc")
      )
      const snapshot = await getDocs(q)
      console.log("✅ Firebase: Approved providers fetched with orderBy:", snapshot.docs.length)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceProvider))
    } catch (orderError: any) {
      // If composite query fails, fall back to where-only query
      console.warn("⚠️ Firebase: Composite query failed, using fallback:", orderError.message)
      
      const q = query(
        collection(db, "serviceProviders"),
        where("isApproved", "==", true)
      )
      const snapshot = await getDocs(q)
      const providers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceProvider))
      
      // Sort client-side
      providers.sort((a, b) => {
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
        return bTime - aTime
      })
      
      console.log("✅ Firebase: Approved providers fetched with fallback:", providers.length)
      return providers
    }
  } catch (error: any) {
    console.error("💥 Firebase: Error fetching approved service providers:", error)
    throw new Error(`Failed to fetch approved service providers: ${error.message}`)
  }
}

// Get service provider by ID
export const getServiceProvider = async (providerId: string): Promise<ServiceProvider | null> => {
  try {
    const docRef = doc(db, "serviceProviders", providerId)
    const snapshot = await getDoc(docRef)
    
    if (!snapshot.exists()) {
      return null
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as ServiceProvider
  } catch (error) {
    console.error("Error fetching service provider:", error)
    throw new Error("Failed to fetch service provider")
  }
}

// In-memory cache for service provider data
const serviceProviderCache = new Map<string, { data: ServiceProvider | null, timestamp: number }>()
const CACHE_TTL = 30000 // 30 seconds cache
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// Active request tracking to prevent duplicate queries
const activeRequests = new Map<string, Promise<ServiceProvider | null>>()

// Helper function to check if data is in cache and not expired
const getCachedServiceProvider = (ownerId: string): ServiceProvider | null | undefined => {
  const cached = serviceProviderCache.get(ownerId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log("💾 Firebase: Using cached service provider for:", ownerId)
    return cached.data
  }
  return undefined
}

// Helper function to cache service provider data
const cacheServiceProvider = (ownerId: string, data: ServiceProvider | null) => {
  serviceProviderCache.set(ownerId, { data, timestamp: Date.now() })
}

// Retry logic with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number,
  baseDelay: number,
  context: string
): Promise<T> => {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      // Don't retry on certain errors
      if (error?.message?.includes('aborted') ||
          error?.code === 'permission-denied' ||
          error?.message?.includes('Invalid ownerId')) {
        throw error
      }
      
      if (attempt === maxRetries) {
        console.error(`💥 Firebase: ${context} failed after ${maxRetries} attempts:`, error)
        break
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1) // Exponential backoff
      console.warn(`⚠️ Firebase: ${context} attempt ${attempt} failed, retrying in ${delay}ms:`, error?.message)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

// Get service provider by owner ID
export const getServiceProviderByOwnerId = async (
  ownerId: string, 
  abortController?: AbortController
): Promise<ServiceProvider | null> => {
  try {
    console.log("🔍 Firebase: Querying service provider by ownerId:", ownerId)
    
    if (!ownerId || typeof ownerId !== 'string') {
      throw new Error('Invalid ownerId provided')
    }
    
    // Check cache first
    const cached = getCachedServiceProvider(ownerId)
    if (cached !== undefined) {
      return cached
    }
    
    // Check if there's already an active request for this ownerId
    if (activeRequests.has(ownerId)) {
      console.log("🔄 Firebase: Reusing active request for ownerId:", ownerId)
      return await activeRequests.get(ownerId)!
    }
    
    // Create new request with retry logic
    const requestPromise = retryWithBackoff(
      async () => {
        // Check if request was aborted
        if (abortController?.signal.aborted) {
          throw new Error('Request was aborted')
        }
        
        // Create a timeout promise that's shorter than the overall timeout
        const queryPromise = (async () => {
          const q = query(collection(db, "serviceProviders"), where("ownerId", "==", ownerId))
          console.log("🔍 Firebase: Executing service provider query...")
          
          const snapshot = await getDocs(q)
          
          // Check if request was aborted after query
          if (abortController?.signal.aborted) {
            throw new Error('Request was aborted')
          }
          
          console.log("📊 Firebase: Service provider query executed:", {
            empty: snapshot.empty,
            size: snapshot.size,
            docs: snapshot.docs.length
          })
          
          if (snapshot.empty) {
            console.log("❌ Firebase: No service provider found for ownerId:", ownerId)
            return null
          }
          
          const doc = snapshot.docs[0]
          const data = doc.data()
          console.log("✅ Firebase: Service provider found:", {
            id: doc.id,
            name: data.name,
            ownerId: data.ownerId
          })
          
          return {
            id: doc.id,
            ...data
          } as ServiceProvider
        })()
        
        const timeoutPromise = new Promise<never>((_, reject) => {
          const timeoutId = setTimeout(() => {
            console.error("⏰ Firebase: Service provider query timeout after 15 seconds")
            reject(new Error('Database connection timeout. Please check your internet connection and try again.'))
          }, 15000) // Increased to 15 seconds
          
          // Clear timeout if request is aborted
          if (abortController) {
            abortController.signal.addEventListener('abort', () => {
              clearTimeout(timeoutId)
              reject(new Error('Request was aborted'))
            })
          }
        })
        
        return await Promise.race([queryPromise, timeoutPromise])
      },
      MAX_RETRIES,
      RETRY_DELAY,
      `Service provider query for ${ownerId}`
    )
    
    // Store the active request
    activeRequests.set(ownerId, requestPromise)
    
    try {
      const result = await requestPromise
      
      // Cache the result
      cacheServiceProvider(ownerId, result)
      
      console.log("✅ Firebase: Service provider query completed successfully")
      return result
    } finally {
      // Clean up active request
      activeRequests.delete(ownerId)
    }
    
  } catch (error: any) {
    // Don't log error if request was aborted
    if (!error?.message?.includes('aborted')) {
      console.error("💥 Firebase: Error fetching service provider by owner ID:", {
        errorMessage: error?.message || 'No message',
        errorCode: error?.code || 'no_code',
        ownerId
      })
    }
    
    // Handle specific Firebase errors gracefully
    if (error?.message?.includes('aborted')) {
      throw new Error('Request was cancelled')
    } else if (error?.code === 'failed-precondition') {
      throw new Error("Database index required - please contact support")
    } else if (error?.code === 'permission-denied') {
      throw new Error("Permission denied - please check your login status")
    } else if (error?.code === 'unavailable') {
      throw new Error("Database temporarily unavailable - please try again")
    } else if (error?.message?.includes('timeout')) {
      throw new Error("Database query timeout - please try again")
    }
    
    throw new Error(`Failed to fetch service provider: ${error?.message || 'Unknown error'}`)
  }
}

// Create service provider profile
export const createServiceProvider = async (
  providerData: Omit<ServiceProvider, "id" | "createdAt" | "updatedAt" | "isApproved" | "isActive">
): Promise<string> => {
  try {
    // Check if provider already exists for this owner
    const existingProvider = await getServiceProviderByOwnerId(providerData.ownerId)
    if (existingProvider) {
      throw new Error("Service provider profile already exists for this user")
    }

    const docRef = await addDoc(collection(db, "serviceProviders"), {
      ...providerData,
      isApproved: false,  // Pending approval by default
      isActive: false,    // Inactive until approved
      rating: 0,
      reviewCount: 0,
      totalBookings: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return docRef.id
  } catch (error) {
    console.error("Error creating service provider:", error)
    throw error
  }
}

// Approve service provider (Admin function)
export const approveServiceProvider = async (providerId: string): Promise<void> => {
  try {
    const docRef = doc(db, "serviceProviders", providerId)
    await updateDoc(docRef, {
      isApproved: true,
      isActive: true,
      updatedAt: serverTimestamp(),
    })
    
    console.log(`Service provider ${providerId} approved successfully`)
  } catch (error) {
    console.error("Error approving service provider:", error)
    throw new Error("Failed to approve service provider")
  }
}

// Reject service provider application (Admin function)
export const rejectServiceProvider = async (providerId: string): Promise<void> => {
  try {
    const docRef = doc(db, "serviceProviders", providerId)
    await updateDoc(docRef, {
      isApproved: false,
      isActive: false,
      updatedAt: serverTimestamp(),
    })
    
    console.log(`Service provider ${providerId} rejected`)
  } catch (error) {
    console.error("Error rejecting service provider:", error)
    throw new Error("Failed to reject service provider")
  }
}

// Suspend service provider (Admin function)
export const suspendServiceProvider = async (providerId: string): Promise<void> => {
  try {
    const docRef = doc(db, "serviceProviders", providerId)
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: serverTimestamp(),
    })
    
    console.log(`Service provider ${providerId} suspended`)
  } catch (error) {
    console.error("Error suspending service provider:", error)
    throw new Error("Failed to suspend service provider")
  }
}

// Reactivate service provider (Admin function)
export const reactivateServiceProvider = async (providerId: string): Promise<void> => {
  try {
    const docRef = doc(db, "serviceProviders", providerId)
    await updateDoc(docRef, {
      isActive: true,
      updatedAt: serverTimestamp(),
    })
    
    console.log(`Service provider ${providerId} reactivated`)
  } catch (error) {
    console.error("Error reactivating service provider:", error)
    throw new Error("Failed to reactivate service provider")
  }
}

// Update service provider profile
export const updateServiceProvider = async (
  providerId: string,
  updates: Partial<ServiceProvider>
): Promise<void> => {
  try {
    const docRef = doc(db, "serviceProviders", providerId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
    
    console.log(`Service provider ${providerId} updated successfully`)
  } catch (error) {
    console.error("Error updating service provider:", error)
    throw new Error("Failed to update service provider")
  }
}

// Delete service provider (Admin function - use with caution)
export const deleteServiceProvider = async (providerId: string): Promise<void> => {
  try {
    const docRef = doc(db, "serviceProviders", providerId)
    await deleteDoc(docRef)
    
    console.log(`Service provider ${providerId} deleted`)
  } catch (error) {
    console.error("Error deleting service provider:", error)
    throw new Error("Failed to delete service provider")
  }
}

// Get service providers by category
export const getServiceProvidersByCategory = async (category: string): Promise<ServiceProvider[]> => {
  try {
    const q = query(
      collection(db, "serviceProviders"),
      where("category", "==", category),
      where("isApproved", "==", true),
      where("isActive", "==", true),
      orderBy("rating", "desc")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ServiceProvider))
  } catch (error) {
    console.error("Error fetching service providers by category:", error)
    throw new Error("Failed to fetch service providers by category")
  }
}

// Get service providers by service area
export const getServiceProvidersByArea = async (area: string): Promise<ServiceProvider[]> => {
  try {
    const q = query(
      collection(db, "serviceProviders"),
      where("serviceAreas", "array-contains", area),
      where("isApproved", "==", true),
      where("isActive", "==", true),
      orderBy("rating", "desc")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ServiceProvider))
  } catch (error) {
    console.error("Error fetching service providers by area:", error)
    throw new Error("Failed to fetch service providers by area")
  }
}

// Get dashboard statistics for admin
export const getServiceProviderStats = async () => {
  try {
    console.log("📊 Firebase: Fetching service provider statistics...")
    
    // Fetch data with error handling for each function
    const results = await Promise.allSettled([
      getAllServiceProviders(),
      getPendingServiceProviders(),
      getApprovedServiceProviders()
    ])
    
    // Extract data or use empty arrays as fallback
    const allProviders = results[0].status === 'fulfilled' ? results[0].value : []
    const pendingProviders = results[1].status === 'fulfilled' ? results[1].value : []
    const approvedProviders = results[2].status === 'fulfilled' ? results[2].value : []
    
    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const names = ['getAllServiceProviders', 'getPendingServiceProviders', 'getApprovedServiceProviders']
        console.error(`❌ ${names[index]} failed:`, result.reason)
      }
    })
    
    const activeProviders = approvedProviders.filter(p => p.isActive)
    
    const stats = {
      totalProviders: allProviders.length,
      pendingApprovals: pendingProviders.length,
      approvedProviders: approvedProviders.length,
      activeProviders: activeProviders.length,
      inactiveProviders: approvedProviders.length - activeProviders.length,
    }
    
    console.log("✅ Firebase: Service provider stats calculated:", stats)
    return stats
    
  } catch (error: any) {
    console.error("💥 Firebase: Error fetching service provider stats:", error)
    
    // Return basic stats as fallback
    console.log("🔄 Firebase: Returning fallback stats")
    return {
      totalProviders: 0,
      pendingApprovals: 0,
      approvedProviders: 0,
      activeProviders: 0,
      inactiveProviders: 0,
    }
  }
}

// Cache management functions
export const clearServiceProviderCache = (ownerId?: string) => {
  if (ownerId) {
    serviceProviderCache.delete(ownerId)
    console.log("🗑️ Firebase: Cleared cache for ownerId:", ownerId)
  } else {
    serviceProviderCache.clear()
    console.log("🗑️ Firebase: Cleared all service provider cache")
  }
}

export const getServiceProviderCacheStats = () => {
  const now = Date.now()
  const valid = Array.from(serviceProviderCache.values()).filter(cached => now - cached.timestamp < CACHE_TTL).length
  const expired = serviceProviderCache.size - valid
  
  return {
    total: serviceProviderCache.size,
    valid,
    expired,
    cacheTTL: CACHE_TTL
  }
}

// Global error testing function for debugging
if (typeof window !== 'undefined') {
  (window as any).testServiceProviderConnection = async (ownerId: string = 'test-user-id') => {
    try {
      console.log("🧪 Testing service provider connection with ownerId:", ownerId)
      
      // Clear cache first
      clearServiceProviderCache(ownerId)
      
      const startTime = Date.now()
      const result = await getServiceProviderByOwnerId(ownerId)
      const endTime = Date.now()
      
      console.log(`✅ Service provider connection test completed in ${endTime - startTime}ms:`, {
        ownerId,
        found: !!result,
        result: result ? { id: result.id, name: result.name } : null,
        cacheStats: getServiceProviderCacheStats()
      })
      
      return result
    } catch (error: any) {
      console.error("❌ Service provider connection test failed:", error?.message || error)
      throw error
    }
  }
  
  ;(window as any).clearServiceProviderCache = clearServiceProviderCache
  ;(window as any).getServiceProviderCacheStats = getServiceProviderCacheStats
}