import { useState } from "react"
import { VendorLayout } from "@/components/vendor-layout"
import VendorPayoutDashboard from "@/components/payouts/VendorPayoutDashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, DollarSign, Settings, History } from "lucide-react"
import { useVendor } from "@/hooks/use-vendor"
import VendorPayoutSettings from "@/components/payouts/VendorPayoutSettings"
import PayoutHistory from "@/components/payouts/PayoutHistory"

export default function VendorDashboardPayouts() {
  const { activeStore } = useVendor()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000)
  }

  if (!activeStore) {
    return (
      <VendorLayout 
        title="Payouts" 
        description="Manage your payout settings and view payout history"
      >
        <div className="text-center py-8">
          <p className="text-gray-500">No active store selected.</p>
        </div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout 
      title="Payouts" 
      description="Manage your payout settings and view payout history"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payouts</h1>
            <p className="text-gray-500">Manage your payout settings and view payout history</p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <VendorPayoutDashboard />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <VendorPayoutSettings />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <PayoutHistory />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </VendorLayout>
  )
}