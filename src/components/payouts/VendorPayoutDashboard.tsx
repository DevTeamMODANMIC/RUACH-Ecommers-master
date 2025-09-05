import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { useVendor } from "@/hooks/use-vendor"
import { DollarSign, Clock, TrendingUp } from "lucide-react"

export default function VendorPayoutDashboard() {
  const { activeStore } = useVendor()
  
  // Mock data for demonstration
  const upcomingPayout = {
    amount: 15000,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    period: "Sep 1-15, 2025"
  }
  
  const lifetimeEarnings = 125000
  const pendingBalance = 15000

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Lifetime Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(lifetimeEarnings)}</div>
            <p className="text-xs text-muted-foreground">Total earnings from sales</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingBalance)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payout processing</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              Next Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(upcomingPayout.amount)}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingPayout.date.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Information Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">How Payouts Work</h3>
              <ul className="mt-2 text-sm text-blue-800 list-disc pl-5 space-y-1">
                <li>Payouts are processed automatically based on your selected frequency</li>
                <li>A 10% platform fee is deducted from each sale before calculating your earnings</li>
                <li>Payouts are sent to the bank account details you've provided</li>
                <li>Processing typically takes 2-3 business days after the payout date</li>
              </ul>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Info
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}