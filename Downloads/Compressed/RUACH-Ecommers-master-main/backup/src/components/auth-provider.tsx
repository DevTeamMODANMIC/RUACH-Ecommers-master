import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../lib/firebase"; // Correct relative path
import { getUserProfile, type UserProfile } from "../lib/firebase-auth"; // Correct relative path

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
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