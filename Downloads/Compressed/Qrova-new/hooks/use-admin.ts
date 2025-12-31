"use client"

import { useEffect, useState } from "react"
import { getIdTokenResult } from "firebase/auth"
import { useAuth } from "@/components/auth-provider"

interface UseAdminResult {
  isAdmin: boolean
  loading: boolean
}

export function useAdmin(): UseAdminResult {
  const { user, profile, isLoading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function checkAdmin() {
      // No authenticated user => not admin
      if (!user) {
        if (active) {
          setIsAdmin(false)
          setLoading(false)
        }
        return
      }

      // 1. Try custom claims
      try {
        const tokenResult = await getIdTokenResult(user, /* forceRefresh */ true)
        if (active && tokenResult.claims?.admin) {
          setIsAdmin(true)
          setLoading(false)
          return
        }
      } catch (err) {
        console.error("Failed to read ID token claims", err)
      }

      // 2. Fallback: check Firestore profile role field
      if (active) {
        // Check if user has admin role in their profile
        setIsAdmin(profile?.role === "admin")
        setLoading(false)
      }
    }

    checkAdmin()

    return () => {
      active = false
    }
  }, [user, profile])

  return { isAdmin, loading: authLoading || loading }
} 