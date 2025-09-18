import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit
} from "firebase/firestore"
import { db } from "./firebase"

export interface Category {
  id: string        // Unique, URL-friendly slug
  name: string      // Human-readable display name
  description?: string
  parentId?: string // Optional parent category
  vendorId?: string // Optional: track which vendor created this
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export const createCategory = async (
  categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> & { 
    name: string 
    vendorId?: string 
  }
) => {
  // Generate a URL-friendly slug
  const slug = categoryData.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // Remove non-word chars
    .replace(/[\s_-]+/g, '-')   // Replace spaces/underscores with single dash
    .replace(/^-+|-+$/g, '');   // Trim leading/trailing dashes

  const newCategory: Category = {
    id: slug,
    name: categoryData.name,
    description: categoryData.description || '',
    parentId: categoryData.parentId,
    vendorId: categoryData.vendorId,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  }

  const categoryRef = doc(db, "categories", slug)
  await setDoc(categoryRef, newCategory)

  return newCategory
}

export const updateCategory = async (
  categoryId: string, 
  updates: Partial<Omit<Category, 'id' | 'createdAt'>>
) => {
  const categoryRef = doc(db, "categories", categoryId)
  
  await updateDoc(categoryRef, {
    ...updates,
    updatedAt: new Date()
  })
}

export const getCategories = async (options?: {
  vendorId?: string
  parentId?: string
  isActive?: boolean
  limit?: number
}) => {
  let q = query(collection(db, "categories"))

  if (options?.vendorId) {
    q = query(q, where("vendorId", "==", options.vendorId))
  }

  if (options?.parentId) {
    q = query(q, where("parentId", "==", options.parentId))
  }

  if (options?.isActive !== undefined) {
    q = query(q, where("isActive", "==", options.isActive))
  }

  q = query(
    q, 
    orderBy("createdAt", "desc"),
    limit(options?.limit || 100)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Category)
}

export const getCategoryById = async (categoryId: string) => {
  const categoryRef = doc(db, "categories", categoryId)
  const snapshot = await getDoc(categoryRef)
  
  return snapshot.exists() 
    ? { id: snapshot.id, ...snapshot.data() } as Category 
    : null
}

export const deleteCategory = async (categoryId: string) => {
  const categoryRef = doc(db, "categories", categoryId)
  await deleteDoc(categoryRef)
}

export const searchCategories = async (searchTerm: string) => {
  const snapshot = await getDocs(
    query(
      collection(db, "categories"),
      where("name", ">=", searchTerm),
      where("name", "<=", searchTerm + '\uf8ff'),
      limit(10)
    )
  )

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Category)
} 