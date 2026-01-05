import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { getVendor } from "@/lib/firebase-vendors"
import { getVendorPayoutHistory } from "@/lib/payout-processing"
import { Wallet, RefreshCw } from "lucide-react"

interface PayoutRecord {
  id: string
  vendorId: string
  amount: number
  status: "pending" | "processing" | "completed" | "failed"
  periodStart: Date
  periodEnd: Date
  createdAt: Date
  processedAt?: Date
  transactionId?: string
  failureReason?: string
  vendorName?: string
}

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchPayouts()
  }, [])

  const fetchPayouts = async () => {
    setLoading(true)
    try {
      // In a real implementation, you would fetch all payouts from the database
      // For now, we'll create mock data
      const mockPayouts: PayoutRecord[] = [
        {
          id: "payout_001",
          vendorId: "vendor_123",
          amount: 45000,
          status: "completed",
          periodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          periodEnd: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          processedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          transactionId: "txn_12345"
        },
        {
          id: "payout_002",
          vendorId: "vendor_456",
          amount: 32500,
          status: "processing",
          periodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          periodEnd: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          id: "payout_003",
          vendorId: "vendor_789",
          amount: 28750,
          status: "pending",
          periodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          periodEnd: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      ]

      // Add vendor names to payouts
      const payoutsWithVendorNames = await Promise.all(
        mockPayouts.map(async (payout) => {
          try {
            const vendor = await getVendor(payout.vendorId)
            return {
              ...payout,
              vendorName: vendor?.shopName || `Vendor ${payout.vendorId.substring(0, 8)}`
            }
          } catch (error) {
            console.error("Error fetching vendor:", error)
            return {
              ...payout,
              vendorName: `Vendor ${payout.vendorId.substring(0, 8)}`
            }
          }
        })
      )

      setPayouts(payoutsWithVendorNames)
    } catch (error) {
      console.error("Error fetching payouts:", error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleProcessPayouts = async () => {
    setProcessing(true)
    try {
      // In a real implementation, this would call the payout processing function
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update mock data to show processing
      setPayouts(prev => prev.map(payout => 
        payout.status === "pending" 
          ? { ...payout, status: "processing" } 
          : payout
      ))
      
      // Simulate completion after a delay
      setTimeout(() => {
        setPayouts(prev => prev.map(payout => 
          payout.status === "processing" 
            ? { ...payout, status: "completed", processedAt: new Date() } 
            : payout
        ))
      }, 3000)
    } catch (error) {
      console.error("Error processing payouts:", error)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payout Management</h1>
          <p className="text-gray-500">Manage and process vendor payouts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{payouts.reduce((sum, payout) => sum + payout.amount, 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across {payouts.length} payouts</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payouts.filter(p => p.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payouts.filter(p => p.status === "processing").length}
              </div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payouts.filter(p => p.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">Successfully processed</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Payouts</h2>
          <Button 
            onClick={handleProcessPayouts} 
            disabled={processing || payouts.filter(p => p.status === "pending").length === 0}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${processing ? "animate-spin" : ""}`} />
            {processing ? "Processing..." : "Process Pending Payouts"}
          </Button>
        </div>

        {/* Payouts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              <span>Payout Records</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 border-4 border-t-green-500 border-l-green-600 border-r-green-600 border-b-green-700 rounded-full animate-spin mx-auto mb-4" />
                <p>Loading payouts...</p>
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No payouts found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{payout.vendorName}</div>
                      <div className="text-sm text-gray-500">
                        {payout.periodStart.toLocaleDateString()} - {payout.periodEnd.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(payout.amount)}</div>
                        <div className="text-sm text-gray-500">
                          {payout.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(payout.status)}>
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </Badge>
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
      </div>
    </div>
  )
}