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
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

/** Firestore collection names */
const VENDOR_WALLETS_COLLECTION = "vendorWallets";
const VENDOR_TRANSACTIONS_COLLECTION = "vendorTransactions";
const VENDOR_PAYOUTS_COLLECTION = "vendorPayouts";

/** Platform commission rate (percentage) */
export const PLATFORM_COMMISSION_RATE = 10; // 10%

/** Vendor Wallet model */
export interface VendorWallet {
  vendorId: string;
  storeId?: string;
  balance: number;
  pendingBalance: number; // Funds from orders not yet delivered
  totalEarnings: number; // Lifetime earnings
  totalWithdrawn: number; // Lifetime withdrawals
  currency: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

/** Vendor Transaction model */
export interface VendorTransaction {
  id: string;
  vendorId: string;
  storeId?: string;
  type: "credit" | "debit" | "commission" | "payout" | "refund";
  amount: number;
  grossAmount?: number; // Amount before commission
  commission?: number; // Platform commission deducted
  description: string;
  orderId?: string;
  payoutId?: string;
  balanceAfter: number;
  pendingBalanceAfter?: number;
  status: "completed" | "pending" | "failed";
  metadata?: Record<string, any>;
  createdAt: Timestamp | Date;
}

/** Vendor Payout model */
export interface VendorPayout {
  id: string;
  vendorId: string;
  storeId?: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  paymentMethod: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  requestedAt: Timestamp | Date;
  processedAt?: Timestamp | Date;
  completedAt?: Timestamp | Date;
  adminNotes?: string;
  failureReason?: string;
  transactionId?: string;
}

/**
 * Initialize a vendor wallet with zero balance
 */
export const initializeVendorWallet = async (
  vendorId: string,
  storeId?: string
): Promise<VendorWallet> => {
  try {
    const walletId = storeId || vendorId;
    const walletRef = doc(db, VENDOR_WALLETS_COLLECTION, walletId);
    const walletData: VendorWallet = {
      vendorId,
      storeId,
      balance: 0,
      pendingBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      currency: "NGN",
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(walletRef, walletData);
    return walletData;
  } catch (error) {
    console.error("Error initializing vendor wallet:", error);
    throw error;
  }
};

/**
 * Get vendor wallet
 */
export const getVendorWallet = async (
  vendorId: string,
  storeId?: string
): Promise<VendorWallet | null> => {
  try {
    const walletId = storeId || vendorId;
    const walletRef = doc(db, VENDOR_WALLETS_COLLECTION, walletId);
    const walletSnap = await getDoc(walletRef);

    if (walletSnap.exists()) {
      return { ...walletSnap.data() } as VendorWallet;
    }

    // If wallet doesn't exist, initialize it
    return await initializeVendorWallet(vendorId, storeId);
  } catch (error) {
    console.error("Error fetching vendor wallet:", error);
    throw error;
  }
};

/**
 * Calculate commission amount
 */
export const calculateCommission = (amount: number, rate?: number): number => {
  const commissionRate = rate || PLATFORM_COMMISSION_RATE;
  return Math.round((amount * commissionRate) / 100);
};

/**
 * Add funds to vendor wallet (with commission deduction)
 * @param vendorId - Vendor ID
 * @param grossAmount - Amount before commission
 * @param description - Transaction description
 * @param orderId - Related order ID
 * @param storeId - Store ID (optional)
 * @param isPending - Whether funds should go to pending balance (true for new orders)
 */
export const creditVendorWallet = async (
  vendorId: string,
  grossAmount: number,
  description: string,
  orderId?: string,
  storeId?: string,
  isPending: boolean = false
): Promise<VendorTransaction> => {
  try {
    const walletId = storeId || vendorId;

    // Calculate commission
    const commission = calculateCommission(grossAmount);
    const netAmount = grossAmount - commission;

    // Get current wallet
    const wallet = await getVendorWallet(vendorId, storeId);
    if (!wallet) {
      throw new Error("Vendor wallet not found");
    }

    // Calculate new balances
    const newBalance = isPending ? wallet.balance : wallet.balance + netAmount;
    const newPendingBalance = isPending
      ? wallet.pendingBalance + netAmount
      : wallet.pendingBalance;
    const newTotalEarnings = wallet.totalEarnings + netAmount;

    // Update wallet
    const walletRef = doc(db, VENDOR_WALLETS_COLLECTION, walletId);
    await updateDoc(walletRef, {
      balance: newBalance,
      pendingBalance: newPendingBalance,
      totalEarnings: newTotalEarnings,
      updatedAt: serverTimestamp(),
    });

    // Create transaction record
    const transactionRef = doc(collection(db, VENDOR_TRANSACTIONS_COLLECTION));
    const transactionData: VendorTransaction = {
      id: transactionRef.id,
      vendorId,
      storeId,
      type: "credit",
      amount: netAmount,
      grossAmount,
      commission,
      description,
      orderId,
      balanceAfter: newBalance,
      pendingBalanceAfter: newPendingBalance,
      status: isPending ? "pending" : "completed",
      createdAt: serverTimestamp() as Timestamp,
    };

    await setDoc(transactionRef, transactionData);

    // Also create commission transaction record
    const commissionTransactionRef = doc(
      collection(db, VENDOR_TRANSACTIONS_COLLECTION)
    );
    const commissionTransactionData: VendorTransaction = {
      id: commissionTransactionRef.id,
      vendorId,
      storeId,
      type: "commission",
      amount: commission,
      grossAmount,
      commission,
      description: `Platform commission (${PLATFORM_COMMISSION_RATE}%) - ${description}`,
      orderId,
      balanceAfter: newBalance,
      pendingBalanceAfter: newPendingBalance,
      status: "completed",
      createdAt: serverTimestamp() as Timestamp,
    };

    await setDoc(commissionTransactionRef, commissionTransactionData);

    return transactionData;
  } catch (error) {
    console.error("Error crediting vendor wallet:", error);
    throw error;
  }
};

/**
 * Move funds from pending to available balance (when order is delivered)
 */
export const confirmVendorEarnings = async (
  vendorId: string,
  amount: number,
  description: string,
  orderId: string,
  storeId?: string
): Promise<VendorTransaction> => {
  try {
    const walletId = storeId || vendorId;

    // Get current wallet
    const wallet = await getVendorWallet(vendorId, storeId);
    if (!wallet) {
      throw new Error("Vendor wallet not found");
    }

    // Check if pending balance is sufficient
    if (wallet.pendingBalance < amount) {
      throw new Error("Insufficient pending balance");
    }

    // Update wallet - move from pending to available
    const newBalance = wallet.balance + amount;
    const newPendingBalance = wallet.pendingBalance - amount;

    const walletRef = doc(db, VENDOR_WALLETS_COLLECTION, walletId);
    await updateDoc(walletRef, {
      balance: newBalance,
      pendingBalance: newPendingBalance,
      updatedAt: serverTimestamp(),
    });

    // Create transaction record
    const transactionRef = doc(collection(db, VENDOR_TRANSACTIONS_COLLECTION));
    const transactionData: VendorTransaction = {
      id: transactionRef.id,
      vendorId,
      storeId,
      type: "credit",
      amount,
      description,
      orderId,
      balanceAfter: newBalance,
      pendingBalanceAfter: newPendingBalance,
      status: "completed",
      metadata: {
        note: "Moved from pending to available balance",
      },
      createdAt: serverTimestamp() as Timestamp,
    };

    await setDoc(transactionRef, transactionData);

    return transactionData;
  } catch (error) {
    console.error("Error confirming vendor earnings:", error);
    throw error;
  }
};

/**
 * Deduct funds from vendor wallet (for refunds, chargebacks, etc.)
 */
export const debitVendorWallet = async (
  vendorId: string,
  amount: number,
  description: string,
  orderId?: string,
  storeId?: string
): Promise<VendorTransaction> => {
  try {
    const walletId = storeId || vendorId;

    // Get current wallet
    const wallet = await getVendorWallet(vendorId, storeId);
    if (!wallet) {
      throw new Error("Vendor wallet not found");
    }

    const newBalance = wallet.balance - amount;

    // Prevent negative balances
    if (newBalance < 0) {
      throw new Error("Insufficient funds for this transaction");
    }

    // Update wallet
    const walletRef = doc(db, VENDOR_WALLETS_COLLECTION, walletId);
    await updateDoc(walletRef, {
      balance: newBalance,
      updatedAt: serverTimestamp(),
    });

    // Create transaction record
    const transactionRef = doc(collection(db, VENDOR_TRANSACTIONS_COLLECTION));
    const transactionData: VendorTransaction = {
      id: transactionRef.id,
      vendorId,
      storeId,
      type: "debit",
      amount,
      description,
      orderId,
      balanceAfter: newBalance,
      status: "completed",
      createdAt: serverTimestamp() as Timestamp,
    };

    await setDoc(transactionRef, transactionData);

    return transactionData;
  } catch (error) {
    console.error("Error debiting vendor wallet:", error);
    throw error;
  }
};

/**
 * Request payout from vendor wallet
 */
export const requestVendorPayout = async (
  vendorId: string,
  amount: number,
  paymentMethod: string,
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  },
  storeId?: string
): Promise<VendorPayout> => {
  try {
    // Get current wallet
    const wallet = await getVendorWallet(vendorId, storeId);
    if (!wallet) {
      throw new Error("Vendor wallet not found");
    }

    // Check if balance is sufficient
    if (wallet.balance < amount) {
      throw new Error("Insufficient balance for payout");
    }

    // Minimum payout amount check (e.g., 5000 Naira)
    if (amount < 5000) {
      throw new Error("Minimum payout amount is ₦5,000");
    }

    // Create payout request
    const payoutRef = doc(collection(db, VENDOR_PAYOUTS_COLLECTION));
    const payoutData: VendorPayout = {
      id: payoutRef.id,
      vendorId,
      storeId,
      amount,
      status: "pending",
      paymentMethod,
      bankDetails,
      requestedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(payoutRef, payoutData);

    return payoutData;
  } catch (error) {
    console.error("Error requesting vendor payout:", error);
    throw error;
  }
};

/**
 * Process vendor payout (admin function)
 */
export const processVendorPayout = async (
  payoutId: string,
  status: "completed" | "failed",
  adminNotes?: string,
  failureReason?: string
): Promise<VendorPayout> => {
  try {
    const payoutRef = doc(db, VENDOR_PAYOUTS_COLLECTION, payoutId);
    const payoutSnap = await getDoc(payoutRef);

    if (!payoutSnap.exists()) {
      throw new Error("Payout not found");
    }

    const payout = payoutSnap.data() as VendorPayout;

    if (payout.status !== "pending" && payout.status !== "processing") {
      throw new Error("Payout has already been processed");
    }

    const batch = writeBatch(db);

    if (status === "completed") {
      // Deduct amount from vendor wallet
      const walletId = payout.storeId || payout.vendorId;
      const wallet = await getVendorWallet(payout.vendorId, payout.storeId);

      if (!wallet) {
        throw new Error("Vendor wallet not found");
      }

      const newBalance = wallet.balance - payout.amount;
      const newTotalWithdrawn = wallet.totalWithdrawn + payout.amount;

      const walletRef = doc(db, VENDOR_WALLETS_COLLECTION, walletId);
      batch.update(walletRef, {
        balance: newBalance,
        totalWithdrawn: newTotalWithdrawn,
        updatedAt: serverTimestamp(),
      });

      // Create transaction record
      const transactionRef = doc(
        collection(db, VENDOR_TRANSACTIONS_COLLECTION)
      );
      const transactionData: VendorTransaction = {
        id: transactionRef.id,
        vendorId: payout.vendorId,
        storeId: payout.storeId,
        type: "payout",
        amount: payout.amount,
        description: `Payout to ${payout.paymentMethod}`,
        payoutId: payoutId,
        balanceAfter: newBalance,
        status: "completed",
        metadata: {
          bankDetails: payout.bankDetails,
        },
        createdAt: serverTimestamp() as Timestamp,
      };

      batch.set(transactionRef, transactionData);

      // Update payout
      batch.update(payoutRef, {
        status: "completed",
        processedAt: serverTimestamp(),
        completedAt: serverTimestamp(),
        adminNotes,
        transactionId: transactionRef.id,
      });
    } else {
      // Mark payout as failed
      batch.update(payoutRef, {
        status: "failed",
        processedAt: serverTimestamp(),
        adminNotes,
        failureReason,
      });
    }

    await batch.commit();

    // Return updated payout
    const updatedPayoutSnap = await getDoc(payoutRef);
    return updatedPayoutSnap.data() as VendorPayout;
  } catch (error) {
    console.error("Error processing vendor payout:", error);
    throw error;
  }
};

/**
 * Get vendor transactions
 */
export const getVendorTransactions = async (
  vendorId: string,
  storeId?: string,
  limitCount: number = 50
): Promise<VendorTransaction[]> => {
  try {
    const q = query(
      collection(db, VENDOR_TRANSACTIONS_COLLECTION),
      where("vendorId", "==", vendorId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as VendorTransaction)
    );
  } catch (error: any) {
    console.error("Error fetching vendor transactions:", error);

    // Fallback query without orderBy if index doesn't exist
    if (
      error.code === "failed-precondition" ||
      (error.message && error.message.includes("index"))
    ) {
      try {
        const fallbackQ = query(
          collection(db, VENDOR_TRANSACTIONS_COLLECTION),
          where("vendorId", "==", vendorId),
          limit(limitCount * 2)
        );

        const fallbackSnapshot = await getDocs(fallbackQ);
        const transactions = fallbackSnapshot.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id } as VendorTransaction)
        );

        // Sort manually
        transactions.sort((a, b) => {
          const aTime =
            a.createdAt instanceof Timestamp
              ? a.createdAt.seconds
              : new Date(a.createdAt).getTime() / 1000;
          const bTime =
            b.createdAt instanceof Timestamp
              ? b.createdAt.seconds
              : new Date(b.createdAt).getTime() / 1000;
          return bTime - aTime;
        });

        return transactions.slice(0, limitCount);
      } catch (fallbackError) {
        console.error("Fallback query failed:", fallbackError);
        throw error;
      }
    }

    throw error;
  }
};

/**
 * Get vendor payouts
 */
export const getVendorPayouts = async (
  vendorId: string,
  storeId?: string,
  limitCount: number = 20
): Promise<VendorPayout[]> => {
  try {
    const q = query(
      collection(db, VENDOR_PAYOUTS_COLLECTION),
      where("vendorId", "==", vendorId),
      orderBy("requestedAt", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as VendorPayout)
    );
  } catch (error) {
    console.error("Error fetching vendor payouts:", error);
    throw error;
  }
};

/**
 * Get all pending payouts (admin function)
 */
export const getPendingPayouts = async (): Promise<VendorPayout[]> => {
  try {
    const q = query(
      collection(db, VENDOR_PAYOUTS_COLLECTION),
      where("status", "==", "pending"),
      orderBy("requestedAt", "asc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as VendorPayout)
    );
  } catch (error) {
    console.error("Error fetching pending payouts:", error);
    throw error;
  }
};
