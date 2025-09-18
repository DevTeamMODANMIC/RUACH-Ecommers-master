import { useVendor } from "../hooks/use-vendor"
import { useEffect, useState } from "react"
import { getVendorProducts } from "../lib/firebase-vendors"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Progress } from "../components/ui/progress"
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Eye,
  Star,
  Plus,
  ArrowUpRight,
  Sparkles,
  CheckCircle,
  BarChart3
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard-header"
import { DashboardStatsCard } from "../components/dashboard-stats-card"
import { DashboardQuickActions } from "../components/dashboard-quick-actions"
import { DashboardWelcome } from "../components/dashboard-welcome"
import { VendorLayout } from "../components/vendor-layout"


interface DashboardStats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  totalRevenue: number
  viewsThisMonth: number
  averageRating: number
  lowStockProducts: number
}

// Helper function to get time-based greeting
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default function VendorDashboardHome() {
  const { vendor, activeStore, allStores } = useVendor()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    viewsThisMonth: 0,
    averageRating: 0,
    lowStockProducts: 0
  })
  const [loading, setLoading] = useState(true)
  const [keySequence, setKeySequence] = useState<string[]>([])
  const [showSecretMessage, setShowSecretMessage] = useState(false)

  // Secret code: VENDOR (V-E-N-D-O-R)
  const secretCode = [
    'KeyV', 'KeyE', 'KeyN', 'KeyD', 'KeyO', 'KeyR'
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Shift+G shortcut
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault()
        navigate('/admin/vendors')
        setShowSecretMessage(true)
        setTimeout(() => setShowSecretMessage(false), 3000)
        return
      }

      // Add the pressed key to the sequence for the word-based secret
      setKeySequence(prev => {
        const newSequence = [...prev, e.code].slice(-secretCode.length)
        
        // Check if the sequence matches the secret code
        if (newSequence.length === secretCode.length && 
            newSequence.every((key, index) => key === secretCode[index])) {
          // Navigate to admin vendors page
          navigate('/admin/vendors')
          setShowSecretMessage(true)
          setTimeout(() => setShowSecretMessage(false), 3000)
        }
        
        return newSequence
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!activeStore) return
      
      try {
        const vendorProducts = await getVendorProducts(activeStore.id)
        
        // Calculate stats from actual products
        const activeProducts = vendorProducts.filter((p: any) => p.inStock).length
        const lowStock = vendorProducts.filter((p: any) => p.stockQuantity < 10).length
        
        setStats({
          totalProducts: vendorProducts.length,
          activeProducts,
          totalOrders: 0, // Start with 0 for new vendors
          totalRevenue: 0, // Start with 0 for new vendors
          viewsThisMonth: 0, // Start with 0 for new vendors
          averageRating: 0, // Start with 0 for new vendors
          lowStockProducts: lowStock
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [activeStore])

  // Let VendorLayout handle all authentication checks and redirects
  // Only show loading for dashboard data, not vendor authentication
  if (loading) {
    return (
      <VendorLayout title="Dashboard" description="Loading your dashboard...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-t-green-500 border-l-green-600 border-r-green-600 border-b-green-700 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </VendorLayout>
    )
  }

  // Check if this is a new vendor (no products yet)
  const isNewVendor = stats.totalProducts === 0
  
  // Safety check - this should be handled by VendorLayout, but just in case
  if (!activeStore) {
    return (
      <VendorLayout title="Dashboard" description="Setting up your dashboard...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-t-green-500 border-l-green-600 border-r-green-600 border-b-green-700 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Setting up your store...</p>
          </div>
        </div>
      </VendorLayout>
    )
  }
  
  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: isNewVendor ? "Get started" : `${stats.activeProducts}/${stats.totalProducts} active`
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: isNewVendor ? "Awaiting first order" : "+12% from last month"
    },
    {
      title: "Revenue",
      value: `₦${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: isNewVendor ? "Start selling" : "+8.2% from last month"
    },
    {
      title: "Store Views",
      value: stats.viewsThisMonth,
      icon: Eye,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      change: isNewVendor ? "Add products to get views" : "This month"
    }
  ]

  if (isNewVendor) {
    return (
      <VendorLayout title="Welcome to Your Vendor Dashboard" description="Let's get your store set up and start selling!">
        <DashboardWelcome 
          userType="vendor" 
          userName={activeStore?.shopName || 'Vendor'}
          vendorId={activeStore?.id}
        />
      </VendorLayout>
    )
  }

  // Existing vendor dashboard (when they have products)
  return (
    <VendorLayout 
      title={`${getTimeBasedGreeting()}, ${activeStore?.shopName || 'Vendor'}!`} 
      description="Here's what's happening with your store today."
    >
      <div className="space-y-8">
        {/* Header */}
        <DashboardHeader
          title={`${getTimeBasedGreeting()}, ${activeStore?.shopName || 'Vendor'}!`}
          subtitle="Here's what's happening with your store today."
          userType="vendor"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <DashboardStatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <DashboardQuickActions userType="vendor" vendorId={activeStore?.id} />

        {/* Store Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Store Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Store Completion</span>
                <span>{Math.min(100, (stats.totalProducts * 20))}%</span>
              </div>
              <Progress value={Math.min(100, (stats.totalProducts * 20))} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                Add more products to improve store completion
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.totalProducts}</p>
                <p className="text-sm text-gray-600">Products Listed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.activeProducts}</p>
                <p className="text-sm text-gray-600">Active Products</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.totalOrders}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Secret message overlay */}
        {showSecretMessage && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center">
              <h2 className="text-2xl font-bold mb-2">Secret Unlocked!</h2>
              <p>Navigating to Admin Vendors page...</p>
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  )
}