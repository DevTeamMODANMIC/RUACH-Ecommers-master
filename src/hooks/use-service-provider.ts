"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { getServiceProviderByOwnerId } from "@/lib/firebase-service-providers"
import { ServiceProvider } from "@/types"

export function useServiceProvider() {
  const { user, isLoading: authLoading } = useAuth()
  const [serviceProvider, setServiceProvider] = useState<ServiceProvider | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchServiceProviderData = async (userId: string) => {
    try {
      console.log("Fetching service provider data for user:", userId)
      
      const provider = await getServiceProviderByOwnerId(userId)
      console.log("Service provider found:", provider)
      
      setServiceProvider(provider)
    } catch (error) {
      console.error("Failed to fetch service provider data:", error)
      setServiceProvider(null)
    }
  }

  useEffect(() => {
    if (authLoading) {
      return // Wait for authentication to resolve
    }

    if (!user) {
      setServiceProvider(null)
      setIsLoading(false)
      return
    }

    let isMounted = true
    
    fetchServiceProviderData(user.uid)
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [user, authLoading])

  const refreshServiceProvider = async () => {
    if (!user) return
    await fetchServiceProviderData(user.uid)
  }

  const loading = authLoading || isLoading
  const isServiceProvider = !!serviceProvider

  return { 
    serviceProvider,
    isServiceProvider, 
    loading,
    refreshServiceProvider
  }
}