

import type React from "react"
import { useNavigate } from "react-router-dom"
import { useAdmin } from "../../src/hooks/use-admin"
import { useEffect } from "react"

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { isAdmin, loading } = useAdmin()

  useEffect(() => {
    console.log("Admin check:", { isAdmin, loading })
    if (!loading && !isAdmin) {
      navigate("/login", { replace: true })
    }
  }, [loading, isAdmin, navigate])

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