import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { useVendor } from "@/hooks/use-vendor"
import { useVendorPayouts } from "@/hooks/use-vendor-payouts"

export default function PayoutHistory() {
  const { activeStore } = useVendor()
  const { payouts, loading, error } = useVendorPayouts(activeStore?.id || null)

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "processing":
        return "secondary"
      case "pending":
        return "outline"
      case "failed":
        return "destructive"
      default:
        return "default"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="h-8 w-8 border-4 border-t-green-500 border-l-green-600 border-r-green-600 border-b-green-700 rounded-full animate-spin mx-auto mb-4" />
            <p>Loading payout history...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500">Error loading payout history: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout History</CardTitle>
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No payout history available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{formatCurrency(payout.amount)}</div>
                  <div className="text-sm text-gray-500">
                    {payout.periodStart.toLocaleDateString()} - {payout.periodEnd.toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={getStatusBadgeVariant(payout.status)}>
                    {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                  </Badge>
                  <div className="text-sm text-gray-500">
                    {payout.createdAt.toDate().toLocaleDateString()}
                  </div>
                  {payout.transactionId && (
                    <div className="text-xs text-gray-400">
                      ID: {payout.transactionId}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}