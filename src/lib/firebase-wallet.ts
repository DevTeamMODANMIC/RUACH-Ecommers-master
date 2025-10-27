import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  serverTimestamp,
  increment
} from "firebase/firestore";
import { db } from "./firebase";
import { getUserOrders } from "./firebase-orders";

/** Firestore collection names */
const WALLETS_COLLECTION = "userWallets";
const TRANSACTIONS_COLLECTION = "walletTransactions";
const REFERRALS_COLLECTION = "referrals";

/** Wallet model */
export interface Wallet {
  userId: string;
  balance: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Transaction model */
export interface Transaction {
  id: string;
  userId: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: Timestamp;
  reference?: string;
}

/** Referral model */
export interface Referral {
  id: string;
  referrerId: string;
  referredUserId?: string;
  referredUserEmail?: string;
  bonusAmount: number;
  claimed: boolean;
  createdAt: Timestamp;
}

/**
 * Initialize a user wallet with zero balance
 */
export const initializeWallet = async (userId: string): Promise<Wallet> => {
  try {
    const walletRef = doc(db, WALLETS_COLLECTION, userId);
    const walletData: Wallet = {
      userId,
      balance: 0,
      createdAt: serverTimestamp() as unknown as Timestamp,
      updatedAt: serverTimestamp() as unknown as Timestamp,
    };
    
    await setDoc(walletRef, walletData);
    return walletData;
  } catch (error) {
    console.error("Error initializing wallet:", error);
    throw error;
  }
};

/**
 * Get user wallet
 */
export const getUserWallet = async (userId: string): Promise<Wallet | null> => {
  try {
    const walletRef = doc(db, WALLETS_COLLECTION, userId);
    const walletSnap = await getDoc(walletRef);
    
    if (walletSnap.exists()) {
      return { ...walletSnap.data(), id: walletSnap.id } as unknown as Wallet;
    }
    
    // If wallet doesn't exist, initialize it
    return await initializeWallet(userId);
  } catch (error) {
    console.error("Error fetching user wallet:", error);
    throw error;
  }
};

/**
 * Add funds to user wallet (can be positive for deposits or negative for withdrawals)
 */
export const addFundsToWallet = async (
  userId: string, 
  amount: number, 
  description: string = "Funds added"
): Promise<Transaction> => {
  try {
    // Get current wallet balance
    const wallet = await getUserWallet(userId);
    const newBalance = (wallet?.balance || 0) + amount;
    
    // Prevent negative balances
    if (newBalance < 0) {
      throw new Error("Insufficient funds for this transaction");
    }
    
    // Update wallet balance
    const walletRef = doc(db, WALLETS_COLLECTION, userId);
    await updateDoc(walletRef, {
      balance: newBalance,
      updatedAt: serverTimestamp(),
    });
    
    // Create transaction record
    const transactionRef = doc(collection(db, TRANSACTIONS_COLLECTION));
    const transactionData: Transaction = {
      id: transactionRef.id,
      userId,
      type: amount >= 0 ? "credit" : "debit",
      amount: Math.abs(amount),
      description,
      balanceAfter: newBalance,
      createdAt: serverTimestamp() as unknown as Timestamp,
    };
    
    await setDoc(transactionRef, transactionData);
    
    return transactionData;
  } catch (error) {
    console.error("Error adding funds to wallet:", error);
    throw error;
  }
};

/**
 * Get user transactions
 */
export const getUserTransactions = async (userId: string, limitCount: number = 10): Promise<Transaction[]> => {
  try {
    // Simplified query to avoid composite index requirement
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as Transaction));
  } catch (error: any) {
    console.error("Error fetching user transactions:", error);
    
    // If it's an index error, try a simpler query without ordering
    if (error.code === "failed-precondition" || (error.message && error.message.includes("index"))) {
      console.log("Attempting fallback query without composite index");
      try {
        // Fallback query without orderBy to avoid index requirement
        const fallbackQ = query(
          collection(db, TRANSACTIONS_COLLECTION),
          where("userId", "==", userId),
          limit(limitCount * 2) // Get more items to manually sort
        );
        
        const fallbackSnapshot = await getDocs(fallbackQ);
        const transactions = fallbackSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as Transaction));
        
        // Sort manually by createdAt in descending order
        transactions.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        
        // Return only the requested limit
        return transactions.slice(0, limitCount);
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        throw error; // Throw the original error
      }
    }
    
    throw error;
  }
};

/**
 * Create referral record when a user refers a friend
 */
export const createReferral = async (
  referrerId: string,
  referredUserId: string
): Promise<Referral> => {
  try {
    const referralRef = doc(collection(db, REFERRALS_COLLECTION));
    const referralData: Referral = {
      id: referralRef.id,
      referrerId,
      referredUserId,
      bonusAmount: 500, // 500 Naira bonus
      claimed: false,
      createdAt: serverTimestamp() as unknown as Timestamp,
    };
    
    await setDoc(referralRef, referralData);
    return referralData;
  } catch (error) {
    console.error("Error creating referral:", error);
    throw error;
  }
};

/**
 * Create referral record with email when referred user hasn't signed up yet
 */
export const createReferralWithEmail = async (
  referrerId: string,
  referredUserEmail: string
): Promise<Referral> => {
  try {
    const referralRef = doc(collection(db, REFERRALS_COLLECTION));
    const referralData: Referral = {
      id: referralRef.id,
      referrerId,
      referredUserEmail,
      bonusAmount: 500, // 500 Naira bonus
      claimed: false,
      createdAt: serverTimestamp() as unknown as Timestamp,
    };
    
    await setDoc(referralRef, referralData);
    return referralData;
  } catch (error) {
    console.error("Error creating referral with email:", error);
    throw error;
  }
};

/**
 * Update referral record when referred user signs up
 */
export const updateReferralWithUserId = async (
  referredUserEmail: string,
  referredUserId: string
): Promise<void> => {
  try {
    // Find referrals with this email
    const q = query(
      collection(db, REFERRALS_COLLECTION),
      where("referredUserEmail", "==", referredUserEmail),
      where("referredUserId", "==", null)
    );
    
    const snapshot = await getDocs(q);
    
    // Update all matching referrals with the user ID
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        referredUserId,
        referredUserEmail: null // Remove email since we now have user ID
      })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error updating referral with user ID:", error);
    throw error;
  }
};

/**
 * Claim referral bonus
 */
export const claimReferralBonus = async (referralId: string): Promise<Transaction> => {
  try {
    // Get referral record
    const referralRef = doc(db, REFERRALS_COLLECTION, referralId);
    const referralSnap = await getDoc(referralRef);
    
    if (!referralSnap.exists()) {
      throw new Error("Referral not found");
    }
    
    const referral = referralSnap.data() as Referral;
    
    if (referral.claimed) {
      throw new Error("Referral bonus already claimed");
    }
    
    // Verify that the referred user has made their first purchase
    if (referral.referredUserId) {
      const hasMadeFirstPurchase = await hasUserMadeFirstPurchase(referral.referredUserId);
      if (!hasMadeFirstPurchase) {
        throw new Error("Referred user has not made their first purchase yet");
      }
    } else {
      throw new Error("Referred user ID not found");
    }
    
    // Add bonus to referrer's wallet
    const transaction = await addFundsToWallet(
      referral.referrerId,
      referral.bonusAmount,
      "Referral bonus"
    );
    
    // Mark referral as claimed
    await updateDoc(referralRef, {
      claimed: true,
    });
    
    return transaction;
  } catch (error) {
    console.error("Error claiming referral bonus:", error);
    throw error;
  }
};

/**
 * Get user referrals
 */
export const getUserReferrals = async (userId: string): Promise<Referral[]> => {
  try {
    const q = query(
      collection(db, REFERRALS_COLLECTION),
      where("referrerId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as Referral));
  } catch (error) {
    console.error("Error fetching user referrals:", error);
    throw error;
  }
};

/**
 * Check if a user has made their first purchase
 */
export const hasUserMadeFirstPurchase = async (userId: string): Promise<boolean> => {
  try {
    const userOrders = await getUserOrders(userId);
    // Filter for completed orders (delivered or shipped status)
    const completedOrders = userOrders.filter(order => 
      order.status === "delivered" || order.status === "shipped"
    );
    return completedOrders.length > 0;
  } catch (error) {
    console.error("Error checking user's first purchase:", error);
    // In case of error, we assume no purchase to prevent false bonuses
    return false;
  }
};
