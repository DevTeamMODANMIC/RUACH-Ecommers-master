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

// Get service provider by owner ID
export const getServiceProviderByOwnerId = async (ownerId: string): Promise<ServiceProvider | null> => {
  try {
    console.log("🔍 Firebase: Querying service provider by ownerId:", ownerId)
    
    if (!ownerId || typeof ownerId !== 'string') {
      throw new Error('Invalid ownerId provided')
    }
    
    // Add timeout to prevent hanging
    const queryPromise = (async () => {
      try {
        const q = query(collection(db, "serviceProviders"), where("ownerId", "==", ownerId))
        console.log("🔍 Firebase: Query created, executing...")
        
        const snapshot = await getDocs(q)
        console.log("📊 Firebase: Query executed, results:", {
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
      } catch (queryError: any) {
        console.error("💥 Firebase: Error in query execution for service provider:", {
          queryError: queryError,
          queryErrorString: JSON.stringify(queryError, Object.getOwnPropertyNames(queryError)),
          queryErrorMessage: queryError?.message || 'No message',
          queryErrorCode: queryError?.code || 'no_code',
          queryErrorName: queryError?.name || 'no_name',
          ownerId,
          queryErrorStack: queryError?.stack || 'No stack trace'
        })
        throw queryError
      }
    })()
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      console.log("⏰ Firebase: Setting up timeout for 8 seconds")
      setTimeout(() => {
        console.error("⏰ Firebase: Query timeout after 8 seconds")
        reject(new Error('Database query timeout after 8 seconds'))
      }, 8000)
    })
    
    console.log("🏁 Firebase: Starting Promise.race between query and timeout")
    const result = await Promise.race([queryPromise, timeoutPromise])
    console.log("✅ Firebase: Promise.race completed successfully")
    return result
    
  } catch (error: any) {
    // Enhanced error logging to capture more details
    console.error("💥 Firebase: Error fetching service provider by owner ID:", {
      error: error,
      errorString: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      errorType: typeof error,
      errorMessage: error?.message || 'No message',
      errorCode: error?.code || 'no_code',
      errorName: error?.name || 'no_name',
      ownerId,
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