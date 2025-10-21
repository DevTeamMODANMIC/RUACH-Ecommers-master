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
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, orderBy, where, writeBatch } from "firebase/firestore"
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
  roles?: ("admin" | "user" | "vendor")[]

  // Backward compatibility - keep role for now but mark as deprecated
  /** @deprecated Use roles array instead */
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
      roles: ["user"],
      role: "user", // Keep for backward compatibility
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
        roles: ["user"],
        role: "user", // Keep for backward compatibility
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

      // Handle multiple roles with backward compatibility
      let roles: ("admin" | "user" | "vendor")[] = data.roles || []
      const legacyRole = data.role

      // If no roles array but legacy role exists, create roles array
      if (roles.length === 0 && legacyRole) {
        roles = [legacyRole as "admin" | "user" | "vendor"]
      }

      // If still no roles, default to user
      if (roles.length === 0) {
        roles = ["user"]
      }

      return {
        uid: doc.id,
        email: data.email || '',
        name: data.name || '',
        phone: data.phone,
        address: data.address,
        preferences: data.preferences,
        roles, // New multiple roles array
        role: roles[0] || "user", // Keep for backward compatibility
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as UserProfile
    })
  } catch (error: any) {
    console.error("Error getting all users:", error)
    throw new Error(error.message)
  }
}

// Helper functions for multiple roles
export const hasRole = (userRoles: ("admin" | "user" | "vendor")[] | undefined, role: "admin" | "user" | "vendor"): boolean => {
  return userRoles?.includes(role) ?? false
}

export const addUserRole = (currentRoles: ("admin" | "user" | "vendor")[] | undefined, newRole: "admin" | "user" | "vendor"): ("admin" | "user" | "vendor")[] => {
  const roles = currentRoles || []
  if (!roles.includes(newRole)) {
    return [...roles, newRole]
  }
  return roles
}

export const removeUserRole = (currentRoles: ("admin" | "user" | "vendor")[] | undefined, roleToRemove: "admin" | "user" | "vendor"): ("admin" | "user" | "vendor")[] => {
  const roles = currentRoles || []
  return roles.filter(role => role !== roleToRemove)
}

// Admin function to update user role (now supports multiple roles)
export const updateUserRole = async (uid: string, role: "admin" | "user" | "vendor", action: "add" | "remove" = "add") => {
  try {
    // Get current user data
    const userDoc = await getDoc(doc(db, "users", uid))
    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    const userData = userDoc.data() as UserProfile
    const currentRoles = userData.roles || []

    let newRoles: ("admin" | "user" | "vendor")[]
    if (action === "add") {
      newRoles = addUserRole(currentRoles, role)
    } else {
      newRoles = removeUserRole(currentRoles, role)
    }

    await updateDoc(doc(db, "users", uid), {
      roles: newRoles,
      role: newRoles[0] || "user", // Keep single role for backward compatibility
      updatedAt: new Date(),
    })
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Legacy function for backward compatibility
export const setUserRole = async (uid: string, role: "admin" | "user" | "vendor") => {
  try {
    await updateDoc(doc(db, "users", uid), {
      roles: [role],
      role,
      updatedAt: new Date(),
    })
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Migration function to update existing users to use roles array
export const migrateUsersToMultipleRoles = async (): Promise<number> => {
  try {
    console.log("🔄 Starting user migration to multiple roles format...")
    const q = query(collection(db, "users"))
    const snapshot = await getDocs(q)

    let migratedCount = 0
    const batch = writeBatch(db)

    snapshot.docs.forEach(doc => {
      const data = doc.data()
      const currentRoles = data.roles
      const legacyRole = data.role

      // If user has legacy role but no roles array, migrate them
      if (!currentRoles && legacyRole) {
        console.log(`Migrating user ${data.email} from role: ${legacyRole} to roles: [${legacyRole}]`)
        batch.update(doc.ref, {
          roles: [legacyRole],
          updatedAt: new Date(),
        })
        migratedCount++
      }
    })

    if (migratedCount > 0) {
      await batch.commit()
      console.log(`✅ Migrated ${migratedCount} users to multiple roles format`)
    } else {
      console.log(`✅ No users needed migration - all users already have roles array`)
    }

    return migratedCount
  } catch (error: any) {
    console.error("Error migrating users to multiple roles:", error)
    throw new Error(error.message)
  }
}

// Function to find a user by email
export const getUserByEmail = async (email: string): Promise<UserProfile | null> => {
  try {
    const q = query(collection(db, "users"), where("email", "==", email))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null
    }
    
    const doc = snapshot.docs[0]
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
  } catch (error: any) {
    console.error("Error getting user by email:", error)
    return null
  }
}
