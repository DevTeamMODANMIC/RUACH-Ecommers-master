"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/hooks/use-admin"
import { useEffect } from "react"

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAdmin, loading } = useAdmin()

  useEffect(() => {
    console.log("Admin check:", { isAdmin, loading })
    if (!loading && !isAdmin) {
      router.replace("/login")
    }
  }, [loading, isAdmin, router])

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
} 