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
  limit,
  startAfter,
  onSnapshot,
  type DocumentSnapshot,
} from "firebase/firestore"
import { db } from "./firebase"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  subcategory?: string
  subtitle?: string
  images: string[]
  inStock: boolean
  stockQuantity: number
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  origin: string
  availableCountries: string[]
  tags: string[]
  nutritionalInfo?: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  reviews: {
    average: number
    count: number
  }
  createdAt: Date
  updatedAt: Date
  // UI display properties
  rating?: number
  reviewCount?: number
  bestseller?: boolean
  new?: boolean
  popular?: boolean
  isNew?: boolean
  isBulk?: boolean
  discount?: number
}

export interface ProductFilters {
  category?: string
  country?: string
  priceRange?: { min: number; max: number }
  inStock?: boolean
  tags?: string[]
}

// Product CRUD operations
export const getProducts = async (filters?: ProductFilters, pageSize = 20, lastDoc?: DocumentSnapshot) => {
  try {
    let q = query(collection(db, "products"))

    // Apply filters
    if (filters?.category) {
      q = query(q, where("category", "==", filters.category))
    }
    if (filters?.country) {
      q = query(q, where("availableCountries", "array-contains", filters.country))
    }
    if (filters?.inStock !== undefined) {
      q = query(q, where("inStock", "==", filters.inStock))
    }
    if (filters?.tags && filters.tags.length > 0) {
      q = query(q, where("tags", "array-contains-any", filters.tags))
    }

    // Add ordering and pagination
    q = query(q, orderBy("createdAt", "desc"), limit(pageSize))

    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }

    const querySnapshot = await getDocs(q)
    const products: Product[] = []

    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product)
    })

    return {
      products,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === pageSize,
    }
  } catch (error: any) {
    console.error("Error getting products:", error)
    throw new Error(error.message)
  }
}

// Real-time products listener
export const listenToProducts = (
  callback: (products: Product[]) => void,
  filters?: ProductFilters,
  pageSize = 100
) => {
  try {
    let q = query(collection(db, "products"))

    // Apply filters
    if (filters?.category) {
      q = query(q, where("category", "==", filters.category))
    }
    if (filters?.country) {
      q = query(q, where("availableCountries", "array-contains", filters.country))
    }
    if (filters?.inStock !== undefined) {
      q = query(q, where("inStock", "==", filters.inStock))
    }
    if (filters?.tags && filters.tags.length > 0) {
      q = query(q, where("tags", "array-contains-any", filters.tags))
    }

    // Add ordering and pagination
    q = query(q, orderBy("createdAt", "desc"), limit(pageSize))

    // Set up the listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const products: Product[] = []
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product)
      })
      callback(products)
    }, (error) => {
      console.error("Error listening to products:", error)
    })

    // Return the unsubscribe function
    return unsubscribe
  } catch (error: any) {
    console.error("Error setting up products listener:", error)
    throw new Error(error.message)
  }
}

export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const productDoc = await getDoc(doc(db, "products", id))
    if (productDoc.exists()) {
      return { id: productDoc.id, ...productDoc.data() } as Product
    }
    return null
  } catch (error: any) {
    console.error("Error getting product:", error)
    return null
  }
}

// Real-time single product listener
export const listenToProduct = (id: string, callback: (product: Product | null) => void) => {
  try {
    return onSnapshot(doc(db, "products", id), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Product)
      } else {
        callback(null)
      }
    }, (error) => {
      console.error("Error listening to product:", error)
      callback(null)
    })
  } catch (error: any) {
    console.error("Error setting up product listener:", error)
    throw new Error(error.message)
  }
}

export const searchProducts = async (searchTerm: string, filters?: ProductFilters) => {
  try {
    // Note: Firestore doesn't have full-text search built-in
    // For production, consider using Algolia or Elasticsearch
    let q = query(collection(db, "products"))

    // Apply filters first
    if (filters?.category) {
      q = query(q, where("category", "==", filters.category))
    }
    if (filters?.country) {
      q = query(q, where("availableCountries", "array-contains", filters.country))
    }

    const querySnapshot = await getDocs(q)
    const products: Product[] = []

    querySnapshot.forEach((doc) => {
      const product = { id: doc.id, ...doc.data() } as Product
      // Client-side filtering for search term
      if (
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      ) {
        products.push(product)
      }
    })

    return products
  } catch (error: any) {
    console.error("Error searching products:", error)
    throw new Error(error.message)
  }
}

export const getFeaturedProducts = async (count = 8) => {
  try {
    const q = query(
      collection(db, "products"),
      where("inStock", "==", true),
      orderBy("reviews.average", "desc"),
      limit(count),
    )

    const querySnapshot = await getDocs(q)
    const products: Product[] = []

    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product)
    })

    return products
  } catch (error: any) {
    console.error("Error getting featured products:", error)
    return []
  }
}

// Admin functions (for adding/updating products)
export const addProduct = async (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
  try {
    const docRef = await addDoc(collection(db, "products"), {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error: any) {
    console.error("Error adding product:", error)
    throw new Error(error.message)
  }
}

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  try {
    const productRef = doc(db, "products", id)
    await updateDoc(productRef, {
      ...updates,
      updatedAt: new Date(),
    })
    return id
  } catch (error: any) {
    console.error("Error updating product:", error)
    throw new Error(error.message)
  }
}

export const deleteProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, "products", id))
  } catch (error: any) {
    throw new Error(error.message)
  }
}

