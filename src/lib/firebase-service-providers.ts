import { db } from "./firebase"
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore"
import { ServiceProvider, ServiceCategory } from "@/types"

const COLLECTION_NAME = "serviceProviders"

export interface CreateServiceProviderData {
  ownerId: string
  name: string
  description: string
  category: ServiceCategory
  contactEmail: string
  contactPhone: string
  serviceAreas: string[]
  qualifications?: string[]
  profileImage?: {
    publicId: string
    url: string
    alt?: string
  }
  rating: number
  reviewCount: number
  totalBookings: number
}

/**
 * Create a new service provider
 */
export async function createServiceProvider(data: CreateServiceProviderData): Promise<string> {
  try {
    const serviceProviderData = {
      ...data,
      isApproved: false, // New providers need approval
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), serviceProviderData)
    console.log("Service provider created with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error creating service provider:", error)
    throw new Error("Failed to create service provider")
  }
}

/**
 * Get service provider by owner ID
 */
export async function getServiceProviderByOwnerId(ownerId: string): Promise<ServiceProvider | null> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("ownerId", "==", ownerId)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }
    
    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as ServiceProvider
  } catch (error) {
    console.error("Error getting service provider by owner ID:", error)
    throw new Error("Failed to get service provider")
  }
}

/**
 * Get service provider by ID
 */
export async function getServiceProviderById(id: string): Promise<ServiceProvider | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as ServiceProvider
  } catch (error) {
    console.error("Error getting service provider by ID:", error)
    throw new Error("Failed to get service provider")
  }
}

/**
 * Get all service providers
 */
export async function getAllServiceProviders(): Promise<ServiceProvider[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc")
    )
    
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ServiceProvider[]
  } catch (error) {
    console.error("Error getting all service providers:", error)
    throw new Error("Failed to get service providers")
  }
}

/**
 * Update service provider
 */
export async function updateServiceProvider(id: string, updates: Partial<ServiceProvider>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error("Error updating service provider:", error)
    throw new Error("Failed to update service provider")
  }
}

/**
 * Approve service provider
 */
export async function approveServiceProvider(id: string): Promise<void> {
  try {
    await updateServiceProvider(id, { 
      isApproved: true,
      isActive: true 
    })
  } catch (error) {
    console.error("Error approving service provider:", error)
    throw new Error("Failed to approve service provider")
  }
}

/**
 * Deactivate service provider
 */
export async function deactivateServiceProvider(id: string): Promise<void> {
  try {
    await updateServiceProvider(id, { isActive: false })
  } catch (error) {
    console.error("Error deactivating service provider:", error)
    throw new Error("Failed to deactivate service provider")
  }
}

/**
 * Get approved service providers by category
 */
export async function getServiceProvidersByCategory(category: ServiceCategory): Promise<ServiceProvider[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("category", "==", category),
      where("isApproved", "==", true),
      where("isActive", "==", true),
      orderBy("rating", "desc")
    )
    
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ServiceProvider[]
  } catch (error) {
    console.error("Error getting service providers by category:", error)
    throw new Error("Failed to get service providers")
  }
}