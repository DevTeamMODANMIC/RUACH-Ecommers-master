import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "./firebase"

/**
 * Migration utility to convert old vendor structure to new multi-store structure
 * This should be run once to migrate existing data
 */
export const migrateOldVendorData = async () => {
  console.log("Starting vendor data migration...")
  
  try {
    // Get all existing vendors
    const vendorsSnapshot = await getDocs(collection(db, "vendors"))
    const migrations = []
    
    for (const vendorDoc of vendorsSnapshot.docs) {
      const data = vendorDoc.data()
      
      // Check if this is old format (has uid field instead of ownerId)
      if (data.uid && !data.ownerId) {
        console.log(`Migrating vendor: ${data.shopName} (${vendorDoc.id})`)
        
        const oldUid = data.uid
        const newStoreData = {
          id: vendorDoc.id,
          ownerId: oldUid, // Convert uid to ownerId
          shopName: data.shopName,
          bio: data.bio,
          logoUrl: data.logoUrl,
          approved: data.approved || false,
          isActive: true,
          createdAt: data.createdAt,
        }
        
        // Update the vendor document
        await updateDoc(doc(db, "vendors", vendorDoc.id), {
          ownerId: oldUid,
          isActive: true,
          // Remove the old uid field
          uid: null
        })
        
        // Create or update vendor owner document
        const ownerRef = doc(db, "vendorOwners", oldUid)
        await setDoc(ownerRef, {
          uid: oldUid,
          stores: [vendorDoc.id],
          activeStoreId: vendorDoc.id,
          maxStores: 3,
        }, { merge: true })
        
        migrations.push({
          storeId: vendorDoc.id,
          ownerId: oldUid,
          shopName: data.shopName
        })
      }
    }
    
    console.log(`Migration completed. Migrated ${migrations.length} vendors:`, migrations)
    return migrations
    
  } catch (error) {
    console.error("Migration failed:", error)
    throw error
  }
}

/**
 * Utility to check if migration is needed
 */
export const checkMigrationNeeded = async (): Promise<boolean> => {
  try {
    const vendorsSnapshot = await getDocs(collection(db, "vendors"))
    
    for (const vendorDoc of vendorsSnapshot.docs) {
      const data = vendorDoc.data()
      // If we find any vendor with uid field and no ownerId, migration is needed
      if (data.uid && !data.ownerId) {
        return true
      }
    }
    
    return false
  } catch (error) {
    console.error("Error checking migration status:", error)
    return false
  }
}

/**
 * Create a vendor owner document for existing users who don't have one
 */
export const ensureVendorOwnerExists = async (userId: string, storeId: string) => {
  try {
    const ownerRef = doc(db, "vendorOwners", userId)
    await setDoc(ownerRef, {
      uid: userId,
      stores: [storeId],
      activeStoreId: storeId,
      maxStores: 3,
    }, { merge: true })
    
    console.log(`Created vendor owner document for user: ${userId}`)
  } catch (error) {
    console.error("Error creating vendor owner document:", error)
    throw error
  }
}