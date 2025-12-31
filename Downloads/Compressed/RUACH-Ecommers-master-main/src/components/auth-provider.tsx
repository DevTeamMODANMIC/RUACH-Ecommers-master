import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { type UserProfile } from "../lib/firebase-auth";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = undefined;
      }

      setUser(user);

      if (user) {
        const profileRef = doc(db, "users", user.uid);
        unsubscribeProfile = onSnapshot(
          profileRef,
          (snapshot) => {
            if (snapshot.exists()) {
              setProfile(snapshot.data() as UserProfile);
            } else {
              setProfile(null);
            }
            setIsLoading(false);
          },
          (error) => {
            console.error("Error listening to user profile:", error);
            setProfile(null);
            setIsLoading(false);
          }
        );
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { signIn } = await import("../lib/firebase-auth"); // Correct relative path
    await signIn(email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    const { signUp } = await import("../lib/firebase-auth"); // Correct relative path
    const { initializeWallet } = await import("../lib/firebase-wallet"); // Import wallet functions
    const { updateReferralWithUserId } = await import("../lib/firebase-wallet"); // Import referral functions
    
    const { user, profile } = await signUp(email, password, name);
    setProfile(profile);
    
    // Initialize user wallet
    try {
      await initializeWallet(user.uid);
    } catch (error) {
      console.error("Error initializing wallet for new user:", error);
    }
    
    // Update any referrals with this user's email
    try {
      await updateReferralWithUserId(email, user.uid);
    } catch (error) {
      console.error("Error updating referrals for new user:", error);
    }
  };

  const loginWithGoogle = async () => {
    const { signInWithGoogle } = await import("../lib/firebase-auth"); // Correct relative path
    const getUserInfo = await signInWithGoogle();

    const configBody = {
      email: getUserInfo?.email,
      password: "",
    };

    const config = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(configBody),
    };

    const handeLocalhostLocation = "https://custome-backend.onrender.com/api/";
    const url = `${handeLocalhostLocation}SMTP`;

    const response = await fetch(url, config);
    const data = await response.json();
    console.log("getUserInfo", getUserInfo);

    return getUserInfo;
  };

  const logout = async () => {
    const { logOut } = await import("../lib/firebase-auth"); // Correct relative path
    await logOut();
  };

  const resetPassword = async (email: string) => {
    const { resetPassword: resetPwd } = await import("../lib/firebase-auth"); // Correct relative path
    await resetPwd(email);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error("No authenticated user");

    const { updateUserProfile } = await import("../lib/firebase-auth"); // Correct relative path
    await updateUserProfile(user.uid, updates);

    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        updateProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
