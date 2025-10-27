import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, orderBy } from "firebase/firestore"
import { auth, db } from "./firebase"
// Don't import firebase-admin in this client-side file

export interface UserProfile {
  uid: string
  email: string
  name: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  preferences?: {
    currency: string
    language: string
    notifications: boolean
  }
  role?: "admin" | "user" | "vendor"
  createdAt: Date
  updatedAt: Date
}

// Initialize Firebase Admin for server-side operations
// This should only be used in server components or API routes
// Moving this to a separate file to avoid client-side imports
// export const getFirebaseAdminApp = () => { ... } - REMOVED

// Authentication functions
export const signUp = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update the user's display name
    await updateProfile(user, { displayName: name })

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      name,
      preferences: {
        currency: "GBP",
        language: "en",
        notifications: true,
      },
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await setDoc(doc(db, "users", user.uid), userProfile)

    return { user, profile: userProfile }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const user = userCredential.user

    // Check if user profile exists, if not create one
    const userDoc = await getDoc(doc(db, "users", user.uid))
    if (!userDoc.exists()) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        name: user.displayName || "User",
        preferences: {
          currency: "GBP",
          language: "en",
          notifications: true,
        },
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await setDoc(doc(db, "users", user.uid), userProfile)
    }

    return user
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const logOut = async () => {
  try {
    await signOut(auth)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const user = auth.currentUser
    if (!user || !user.email) throw new Error("No authenticated user")

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)

    // Update password
    await updatePassword(user, newPassword)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// User profile functions
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error: any) {
    console.error("Error getting user profile:", error)
    return null
  }
}

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    await updateDoc(doc(db, "users", uid), {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Admin function to get all users
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        uid: doc.id,
        email: data.email || '',
        name: data.name || '',
        phone: data.phone,
        address: data.address,
        preferences: data.preferences,
        role: data.role,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as UserProfile
    })
  } catch (error: any) {
    console.error("Error getting all users:", error)
    throw new Error(error.message)
  }
}

// Admin function to update user role
export const updateUserRole = async (uid: string, role: "admin" | "user" | "vendor") => {
  try {
    await updateDoc(doc(db, "users", uid), {
      role,
      updatedAt: new Date(),
    })
  } catch (error: any) {
    throw new Error(error.message)
  }
}
