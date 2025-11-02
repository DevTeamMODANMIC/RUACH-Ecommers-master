import { useState, useEffect } from "react";
import { useAuth } from "../components/auth-provider";
import { 
  getUserWallet, 
  addFundsToWallet, 
  getUserTransactions, 
  createReferral, 
  createReferralWithEmail,
  updateReferralWithUserId,
  claimReferralBonus,
  getUserReferrals,
  hasUserMadeFirstPurchase,
  Wallet,
  Transaction,
  Referral
} from "../lib/firebase-wallet";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { listenToUserOrders } from "../lib/firebase-orders";

const REFERRALS_COLLECTION = "referrals";

export function useWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet data
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user) {
        setWallet(null);
        setTransactions([]);
        setReferrals([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch wallet
        const userWallet = await getUserWallet(user.uid);
        setWallet(userWallet);
        
        // Fetch transactions
        const userTransactions = await getUserTransactions(user.uid, 10);
        setTransactions(userTransactions);
        
        // Fetch referrals
        const userReferrals = await getUserReferrals(user.uid);
        setReferrals(userReferrals);
      } catch (err: any) {
        console.error("Error fetching wallet data:", err);
        // More specific error handling
        if (err.code === "failed-precondition" || (err.message && err.message.includes("index"))) {
          setError("Database index error. Please contact support.");
        } else {
          setError("Failed to load wallet data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [user]);

  // Add funds to wallet
  const addFunds = async (amount: number, description: string = "Funds added") => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const transaction = await addFundsToWallet(user.uid, amount, description);
      
      // Update local state
      setWallet(prev => prev ? { 
        ...prev, 
        balance: prev.balance + amount,
        updatedAt: transaction.createdAt
      } : null);
      
      setTransactions(prev => [transaction, ...prev.slice(0, 9)]);
      
      return transaction;
    } catch (err) {
      console.error("Error adding funds:", err);
      throw err;
    }
  };

  // Withdraw funds from wallet
  const withdrawFunds = async (amount: number, description: string = "Withdrawal") => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // For withdrawals, we create a debit transaction
      const transaction = await addFundsToWallet(user.uid, -amount, description);
      
      // Update local state
      setWallet(prev => prev ? { 
        ...prev, 
        balance: prev.balance - amount,
        updatedAt: transaction.createdAt
      } : null);
      
      setTransactions(prev => [transaction, ...prev.slice(0, 9)]);
      
      return transaction;
    } catch (err) {
      console.error("Error withdrawing funds:", err);
      throw err;
    }
  };

  // Create referral with user ID
  const referFriend = async (referredUserId: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const referral = await createReferral(user.uid, referredUserId);
      setReferrals(prev => [referral, ...prev]);
      return referral;
    } catch (err) {
      console.error("Error creating referral:", err);
      throw err;
    }
  };

  // Create referral with email
  const referFriendByEmail = async (referredUserEmail: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const referral = await createReferralWithEmail(user.uid, referredUserEmail);
      setReferrals(prev => [referral, ...prev]);
      return referral;
    } catch (err) {
      console.error("Error creating referral with email:", err);
      throw err;
    }
  };

  // Update referral with user ID when referred user signs up
  const updateReferralForNewUser = async (referredUserEmail: string, referredUserId: string) => {
    try {
      await updateReferralWithUserId(referredUserEmail, referredUserId);
    } catch (err) {
      console.error("Error updating referral for new user:", err);
      throw err;
    }
  };

  // Claim referral bonus
  const claimBonus = async (referralId: string) => {
    try {
      const transaction = await claimReferralBonus(referralId);
      
      // Update local state
      setWallet(prev => prev ? { 
        ...prev, 
        balance: prev.balance + 500, // 500 Naira bonus
        updatedAt: transaction.createdAt
      } : null);
      
      setTransactions(prev => [transaction, ...prev.slice(0, 9)]);
      
      // Update referral status
      setReferrals(prev => prev.map(ref => 
        ref.id === referralId ? { ...ref, claimed: true } : ref
      ));
      
      return transaction;
    } catch (err) {
      console.error("Error claiming bonus:", err);
      throw err;
    }
  };

  // Refresh wallet data
  const refreshWallet = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userWallet = await getUserWallet(user.uid);
      const userTransactions = await getUserTransactions(user.uid, 10);
      const userReferrals = await getUserReferrals(user.uid);
      
      setWallet(userWallet);
      setTransactions(userTransactions);
      setReferrals(userReferrals);
    } catch (err) {
      console.error("Error refreshing wallet data:", err);
      setError("Failed to refresh wallet data");
    } finally {
      setLoading(false);
    }
  };

  // Check for first purchase and auto-claim referral bonuses
  const checkForFirstPurchaseAndClaimBonuses = async (userId: string) => {
    try {
      // Check if user has made their first purchase
      const hasMadeFirstPurchase = await hasUserMadeFirstPurchase(userId);
      
      if (hasMadeFirstPurchase) {
        // Get all referrals where this user is the referred user and bonus hasn't been claimed
        const q = query(
          collection(db, REFERRALS_COLLECTION),
          where("referredUserId", "==", userId),
          where("claimed", "==", false)
        );
        
        const snapshot = await getDocs(q);
        
        // Auto-claim bonuses for all eligible referrals
        const claimPromises = snapshot.docs.map(async (doc) => {
          const referral = { ...doc.data(), id: doc.id } as unknown as Referral;
          return claimReferralBonus(referral.id);
        });
        
        await Promise.all(claimPromises);
        
        // Refresh referrals data
        if (user && user.uid === userId) {
          const updatedReferrals = await getUserReferrals(user.uid);
          setReferrals(updatedReferrals);
        }
      }
    } catch (err) {
      console.error("Error checking for first purchase and claiming bonuses:", err);
    }
  };

  // Add useEffect to check for first purchase when user logs in
  useEffect(() => {
    if (user) {
      checkForFirstPurchaseAndClaimBonuses(user.uid);
    }
  }, [user]);

  // Add real-time listener for new orders to trigger referral bonus checks
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (user) {
      // Listen for order updates for the current user
      unsubscribe = listenToUserOrders((orders) => {
        // Check if this is a new order that might trigger a referral bonus
        checkForFirstPurchaseAndClaimBonuses(user.uid);
      }, user.uid);
    }

    // Clean up listener when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return {
    wallet,
    transactions,
    referrals,
    loading,
    error,
    addFunds,
    withdrawFunds,
    referFriend,
    referFriendByEmail,
    updateReferralForNewUser,
    claimBonus,
    refreshWallet
  };
}