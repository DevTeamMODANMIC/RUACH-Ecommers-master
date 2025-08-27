"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { getServiceProviderByOwnerId, clearServiceProviderCache } from "@/lib/firebase-service-providers"
import { ServiceProvider } from "@/types"

export function useServiceProvider() {
  const { user, isLoading: authLoading } = useAuth()
  const [serviceProvider, setServiceProvider] = useState<ServiceProvider | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 2

  const fetchServiceProviderData = async (userId: string, retryCount = 0) => {
    try {
      console.log(`Fetching service provider data for user: ${userId} (attempt ${retryCount + 1})`);
      
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()
      
      const provider = await getServiceProviderByOwnerId(userId, abortControllerRef.current)
      console.log("Service provider found:", provider)
      
      setServiceProvider(provider)
      setError(null)
      retryCountRef.current = 0 // Reset retry count on success
    } catch (error: any) {
      console.error("Failed to fetch service provider data:", error)
      
      // Don't set error state if request was aborted (component unmounted)
      if (error?.message?.includes('aborted')) {
        return
      }
      
      // Retry logic for certain errors
      if (retryCount < maxRetries && 
          (error?.message?.includes('timeout') || 
           error?.message?.includes('unavailable') ||
           error?.message?.includes('network'))) {
        console.log(`Retrying service provider fetch (${retryCount + 1}/${maxRetries})...`)
        retryCountRef.current = retryCount + 1
        
        // Wait a bit before retrying
        setTimeout(() => {
          fetchServiceProviderData(userId, retryCount + 1)
        }, 1000 * (retryCount + 1)) // Exponential backoff
        return
      }
      
      setServiceProvider(null)
      setError(error?.message || 'Failed to load service provider data')
    }
  }

  useEffect(() => {
    // Cleanup function to abort ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    if (authLoading) {
      return // Wait for authentication to resolve
    }

    if (!user) {
      setServiceProvider(null)
      setError(null)
      setIsLoading(false)
      return
    }

    let isMounted = true
    
    // Reset error state when starting new fetch
    setError(null)
    retryCountRef.current = 0
    
    fetchServiceProviderData(user.uid)
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
      // Abort the request if component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [user, authLoading])

  const refreshServiceProvider = async (clearCache = false) => {
    if (!user) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      if (clearCache) {
        clearServiceProviderCache(user.uid)
      }
      
      await fetchServiceProviderData(user.uid)
    } catch (error: any) {
      console.error("Failed to refresh service provider:", error)
      setError(error?.message || 'Failed to refresh service provider data')
    } finally {
      setIsLoading(false)
    }
  }

  const loading = authLoading || isLoading
  const isServiceProvider = !!serviceProvider

  return { 
    serviceProvider,
    isServiceProvider, 
    loading,
    error,
    retryCount: retryCountRef.current,
    refreshServiceProvider
  }
}