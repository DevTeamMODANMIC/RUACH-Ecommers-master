"use client"

import { useState, useEffect } from 'react'
import { useCurrency } from '@/components/currency-provider'

export function useSafeCurrency() {
  const [isClient, setIsClient] = useState(false)
  const currencyContext = useCurrency()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fallback formatCurrency function for SSR
  const fallbackFormatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`
  }

  // Use the currency context formatPrice if available, otherwise fallback
  const formatPrice = (amount: number) => {
    if (!isClient || !currencyContext) {
      return fallbackFormatCurrency(amount)
    }
    
    try {
      return currencyContext.formatPrice(amount)
    } catch (error) {
      // Fallback if formatPrice fails
      return fallbackFormatCurrency(amount)
    }
  }

  // Use the currency context formatCurrency if available, otherwise fallback
  const formatCurrency = (amount: number) => {
    if (!isClient || !currencyContext) {
      return fallbackFormatCurrency(amount)
    }
    
    try {
      return currencyContext.formatCurrency(amount)
    } catch (error) {
      // Fallback if formatCurrency fails
      return fallbackFormatCurrency(amount)
    }
  }

  return {
    formatPrice,
    formatCurrency,
    isClient
  }
}