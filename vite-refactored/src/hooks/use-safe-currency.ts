"use client"

import { useState, useEffect } from "react"
import { useCurrency } from "@/components/currency-provider"

/**
 * A safer version of useCurrency that handles SSR hydration mismatches
 * by returning placeholder values during server rendering and initial hydration
 */
export function useSafeCurrency() {
  const currencyContext = useCurrency()
  const [isClient, setIsClient] = useState(false)
  
  // After hydration, set isClient to true
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // During SSR and initial hydration, return placeholder values
  if (!isClient) {
    return {
      ...currencyContext,
      // Return a function that always returns the same value for server rendering
      formatPrice: () => "£0.00",
      formatCurrency: () => "£0.00",
    }
  }
  
  // After hydration, return the actual context
  return currencyContext
} 