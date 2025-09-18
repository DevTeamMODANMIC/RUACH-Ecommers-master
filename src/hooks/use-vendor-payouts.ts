import { useState, useEffect } from "react"
import { getVendorPayoutHistory } from "@/lib/payout-processing"
import { PayoutRecord } from "@/lib/payout-processing"

export const useVendorPayouts = (vendorId: string | null) => {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPayouts = async () => {
      if (!vendorId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const vendorPayouts = await getVendorPayoutHistory(vendorId)
        setPayouts(vendorPayouts)
      } catch (err) {
        console.error("Error fetching vendor payouts:", err)
        setError("Failed to load payout history")
      } finally {
        setLoading(false)
      }
    }

    fetchPayouts()
  }, [vendorId])

  return {
    payouts,
    loading,
    error,
    refresh: () => {
      if (vendorId) {
        getVendorPayoutHistory(vendorId).then(setPayouts).catch(console.error)
      }
    }
  }
}