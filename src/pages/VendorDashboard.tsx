import { useState } from "react"
import { VendorLayout } from "@/components/vendor-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { useVendor } from "@/hooks/use-vendor"
import { 
  Store, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Star,
  Wallet,
  Lock
} from "lucide-react"
import { Link } from "react-router-dom"

export default function VendorDashboard() {
  const { activeStore } = useVendor()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000)
  }

  // Mock data for dashboard stats
  const stats = {
    totalSales: 125000,
    pendingOrders: 12,
    completedOrders: 86,
    averageRating: 4.8,
    totalCustomers: 243,
    walletBalance: activeStore?.walletBalance || 0
  }

  const isKycVerified = activeStore?.kycStatus === "verified"

  return (
    <VendorLayout 
      title="Vendor Dashboard" 
      description="Overview of your store performance and activities"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500">Welcome back! Here's what's happening with your store today.</p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing}>
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-500" />
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">3 orders need attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                Total Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4 text-yellow-500" />
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.walletBalance)}</div>
              <p className="text-xs text-muted-foreground">
                <Link to="/vendor/dashboard/wallet" className="text-blue-600 hover:underline">
                  View wallet
                </Link>
                {!isKycVerified && (
                  <span className="text-yellow-600 ml-2 flex items-center">
                    <Lock className="h-3 w-3 mr-1" />
                    KYC required for withdrawals
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Link to="/vendor/dashboard/products/new">
                  <Store className="h-5 w-5" />
                  <span>Add Product</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Link to="/vendor/dashboard/orders">
                  <ShoppingCart className="h-5 w-5" />
                  <span>View Orders</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Link to="/vendor/dashboard/reviews">
                  <Star className="h-5 w-5" />
                  <span>Reviews</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Link to="/vendor/dashboard/wallet">
                  <Wallet className="h-5 w-5" />
                  <span>Wallet</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity to show.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  )
}