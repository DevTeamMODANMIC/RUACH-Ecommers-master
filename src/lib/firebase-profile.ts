import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { updateProfile, updateEmail } from "firebase/auth";

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  photoURL?: string;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

export interface SecurityLog {
  id?: string;
  userId: string;
  action:
    | "login"
    | "logout"
    | "password_change"
    | "email_change"
    | "profile_update"
    | "2fa_enabled"
    | "2fa_disabled"
    | "payment_method_added"
    | "payment_method_removed"
    | "address_added"
    | "address_updated"
    | "address_deleted";
  description: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string | Timestamp;
  metadata?: Record<string, any>;
}

// Get user profile from Firestore
export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const profileRef = doc(db, "userProfiles", userId);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      return { id: profileSnap.id, ...profileSnap.data() } as UserProfile;
    }

    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
}

// Create or update user profile
export async function saveUserProfile(
  userId: string,
  profileData: Partial<UserProfile>,
): Promise<void> {
  try {
    const profileRef = doc(db, "userProfiles", userId);
    const profileSnap = await getDoc(profileRef);

    const dataToSave = {
      ...profileData,
      userId,
      updatedAt: serverTimestamp(),
    };

    if (profileSnap.exists()) {
      // Update existing profile
      await updateDoc(profileRef, dataToSave);
    } else {
      // Create new profile
      await setDoc(profileRef, {
        ...dataToSave,
        createdAt: serverTimestamp(),
      });
    }

    // Update Firebase Auth display name if firstName and lastName are provided
    if (auth.currentUser && profileData.firstName && profileData.lastName) {
      await updateProfile(auth.currentUser, {
        displayName: `${profileData.firstName} ${profileData.lastName}`,
      });
    }

    // Update Firebase Auth email if email is provided and different
    if (
      auth.currentUser &&
      profileData.email &&
      profileData.email !== auth.currentUser.email
    ) {
      await updateEmail(auth.currentUser, profileData.email);
    }

    // Log security event
    await logSecurityEvent(userId, "profile_update", "User profile updated", {
      fields: Object.keys(profileData),
    });
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
}

// Update profile photo
export async function updateProfilePhoto(
  userId: string,
  photoURL: string,
): Promise<void> {
  try {
    const profileRef = doc(db, "userProfiles", userId);
    await updateDoc(profileRef, {
      photoURL,
      updatedAt: serverTimestamp(),
    });

    // Update Firebase Auth photo URL
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { photoURL });
    }

    await logSecurityEvent(userId, "profile_update", "Profile photo updated");
  } catch (error) {
    console.error("Error updating profile photo:", error);
    throw error;
  }
}

// Listen to profile changes in real-time
export function listenToUserProfile(
  userId: string,
  callback: (profile: UserProfile | null) => void,
): () => void {
  const profileRef = doc(db, "userProfiles", userId);

  const unsubscribe = onSnapshot(
    profileRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as UserProfile);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error listening to profile:", error);
      callback(null);
    },
  );

  return unsubscribe;
}

// Security Logging Functions

// Log security event
export async function logSecurityEvent(
  userId: string,
  action: SecurityLog["action"],
  description: string,
  metadata?: Record<string, any>,
): Promise<void> {
  try {
    const securityLogsRef = collection(db, "securityLogs");

    // Get IP address and user agent (in a real app, you'd get this from the server)
    const ipAddress = "Unknown"; // You'd get this from a service or server
    const userAgent = navigator.userAgent;

    await setDoc(doc(securityLogsRef), {
      userId,
      action,
      description,
      ipAddress,
      userAgent,
      timestamp: serverTimestamp(),
      metadata: metadata || {},
    });
  } catch (error) {
    console.error("Error logging security event:", error);
    // Don't throw error - logging should not break the flow
  }
}

// Get user security logs
export async function getUserSecurityLogs(
  userId: string,
  limitCount: number = 50,
): Promise<SecurityLog[]> {
  try {
    const securityLogsRef = collection(db, "securityLogs");
    const q = query(
      securityLogsRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(limitCount),
    );

    const querySnapshot = await getDocs(q);
    const logs: SecurityLog[] = [];

    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() } as SecurityLog);
    });

    return logs;
  } catch (error) {
    console.error("Error getting security logs:", error);
    throw error;
  }
}

// Listen to security logs in real-time
export function listenToSecurityLogs(
  userId: string,
  callback: (logs: SecurityLog[]) => void,
  limitCount: number = 50,
): () => void {
  const securityLogsRef = collection(db, "securityLogs");
  const q = query(
    securityLogsRef,
    where("userId", "==", userId),
    orderBy("timestamp", "desc"),
    limit(limitCount),
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const logs: SecurityLog[] = [];
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() } as SecurityLog);
      });
      callback(logs);
    },
    (error) => {
      console.error("Error listening to security logs:", error);
      callback([]);
    },
  );

  return unsubscribe;
}

// Address Management Functions

export interface UserAddress {
  id?: string;
  userId: string;
  type: "Home" | "Work" | "Other";
  name: string;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  validated?: boolean;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

// Get user addresses
export async function getUserAddresses(userId: string): Promise<UserAddress[]> {
  try {
    const addressesRef = collection(db, "userAddresses");
    const q = query(addressesRef, where("userId", "==", userId));

    const querySnapshot = await getDocs(q);
    const addresses: UserAddress[] = [];

    querySnapshot.forEach((doc) => {
      addresses.push({ id: doc.id, ...doc.data() } as UserAddress);
    });

    return addresses;
  } catch (error) {
    console.error("Error getting user addresses:", error);
    throw error;
  }
}

// Save user address
export async function saveUserAddress(
  userId: string,
  address: Partial<UserAddress>,
): Promise<string> {
  try {
    const addressesRef = collection(db, "userAddresses");

    const addressData = {
      ...address,
      userId,
      updatedAt: serverTimestamp(),
    };

    let addressId: string;

    if (address.id) {
      // Update existing address
      const addressRef = doc(db, "userAddresses", address.id);
      await updateDoc(addressRef, addressData);
      addressId = address.id;

      await logSecurityEvent(
        userId,
        "address_updated",
        `Address updated: ${address.type}`,
      );
    } else {
      // Create new address
      const newAddressRef = doc(addressesRef);
      await setDoc(newAddressRef, {
        ...addressData,
        createdAt: serverTimestamp(),
      });
      addressId = newAddressRef.id;

      await logSecurityEvent(
        userId,
        "address_added",
        `Address added: ${address.type}`,
      );
    }

    // If this address is set as default, remove default from other addresses
    if (address.isDefault) {
      const userAddresses = await getUserAddresses(userId);
      for (const addr of userAddresses) {
        if (addr.id !== addressId && addr.isDefault) {
          await updateDoc(doc(db, "userAddresses", addr.id!), {
            isDefault: false,
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    return addressId;
  } catch (error) {
    console.error("Error saving user address:", error);
    throw error;
  }
}

// Delete user address
export async function deleteUserAddress(
  userId: string,
  addressId: string,
): Promise<void> {
  try {
    const addressRef = doc(db, "userAddresses", addressId);
    const addressSnap = await getDoc(addressRef);

    if (addressSnap.exists()) {
      const addressData = addressSnap.data();
      await updateDoc(addressRef, {
        deleted: true,
        deletedAt: serverTimestamp(),
      });

      await logSecurityEvent(
        userId,
        "address_deleted",
        `Address deleted: ${addressData.type}`,
      );
    }
  } catch (error) {
    console.error("Error deleting user address:", error);
    throw error;
  }
}

// Listen to user addresses
export function listenToUserAddresses(
  userId: string,
  callback: (addresses: UserAddress[]) => void,
): () => void {
  const addressesRef = collection(db, "userAddresses");
  const q = query(addressesRef, where("userId", "==", userId));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const addresses: UserAddress[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filter out deleted addresses
        if (!data.deleted) {
          addresses.push({ id: doc.id, ...data } as UserAddress);
        }
      });
      callback(addresses);
    },
    (error) => {
      console.error("Error listening to addresses:", error);
      callback([]);
    },
  );

  return unsubscribe;
}

// Account Deletion
export async function requestAccountDeletion(
  userId: string,
  reason: string,
  feedback?: string,
): Promise<void> {
  try {
    const deletionRequestRef = doc(collection(db, "accountDeletionRequests"));

    await setDoc(deletionRequestRef, {
      userId,
      reason,
      feedback: feedback || "",
      status: "pending",
      requestedAt: serverTimestamp(),
      processedAt: null,
    });

    await logSecurityEvent(
      userId,
      "profile_update",
      "Account deletion requested",
      {
        reason,
      },
    );
  } catch (error) {
    console.error("Error requesting account deletion:", error);
    throw error;
  }
}
