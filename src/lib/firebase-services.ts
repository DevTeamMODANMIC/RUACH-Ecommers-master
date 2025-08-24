import { db } from "./firebase"
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore"
import { Service, ServiceCategory } from "@/types"

const COLLECTION_NAME = "services"

export interface CreateServiceData {
  providerId: string
  name: string
  description: string
  category: ServiceCategory
  price: number
  duration: number
  availability: {
    days: string[]
    hours: {
      start: string
      end: string
    }
  }
  isActive?: boolean
}

/**
 * Create a new service
 */
export async function createService(data: CreateServiceData): Promise<string> {
  try {
    const serviceData = {
      ...data,
      isActive: data.isActive ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), serviceData)
    console.log("Service created with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error creating service:", error)
    throw new Error("Failed to create service")
  }
}

/**
 * Get services by provider ID
 */
export async function getServicesByProviderId(providerId: string): Promise<Service[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("providerId", "==", providerId),
      orderBy("createdAt", "desc")
    )
    
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Service[]
  } catch (error) {
    console.error("Error getting services by provider ID:", error)
    throw new Error("Failed to get services")
  }
}

/**
 * Get service by ID
 */
export async function getServiceById(id: string): Promise<Service | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Service
  } catch (error) {
    console.error("Error getting service by ID:", error)
    throw new Error("Failed to get service")
  }
}

/**
 * Update service
 */
export async function updateService(id: string, updates: Partial<Service>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error("Error updating service:", error)
    throw new Error("Failed to update service")
  }
}

/**
 * Delete service
 */
export async function deleteService(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error("Error deleting service:", error)
    throw new Error("Failed to delete service")
  }
}

/**
 * Get active services by category
 */
export async function getServicesByCategory(category: ServiceCategory): Promise<Service[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("category", "==", category),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    )
    
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Service[]
  } catch (error) {
    console.error("Error getting services by category:", error)
    throw new Error("Failed to get services")
  }
}

/**
 * Get all active services
 */
export async function getAllActiveServices(): Promise<Service[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    )
    
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Service[]
  } catch (error) {
    console.error("Error getting all active services:", error)
    throw new Error("Failed to get services")
  }
}