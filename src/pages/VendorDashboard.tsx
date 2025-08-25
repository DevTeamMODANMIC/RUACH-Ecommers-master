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
  Wrench,
  Calendar,
  BarChart3
} from "lucide-react"
import { Link } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard-header"
import { DashboardStatsCard } from "../components/dashboard-stats-card"
import { DashboardQuickActions } from "../components/dashboard-quick-actions"
import { DashboardWelcome } from "../components/dashboard-welcome"
import { useRouter } from "react-router-dom"

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
  const [isServiceProvider, setIsServiceProvider] = useState(false)
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
  }, [router])

  // Check if user is in service provider mode
  useEffect(() => {
    const serviceProviderMode = localStorage.getItem('serviceProviderMode') === 'true'
    setIsServiceProvider(serviceProviderMode)
    
    // If service provider mode, set loading to false immediately
    if (serviceProviderMode) {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Skip vendor data fetching for service providers
      if (isServiceProvider) {
        setLoading(false)
        return
      }
      
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
  }, [activeStore, isServiceProvider])

  if (loading || (!isServiceProvider && !activeStore)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-t-green-500 border-l-green-600 border-r-green-600 border-b-green-700 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Check if this is a new vendor (no products yet) or service provider mode
  const isNewVendor = !isServiceProvider && stats.totalProducts === 0
  
  // Service Provider Dashboard
  if (isServiceProvider) {
    return (
      <div className="space-y-8">
        {/* Service Provider Welcome Header */}
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {getTimeBasedGreeting()}, Service Provider!
          </h1>
          <p className="text-lg text-gray-500 mb-2">Welcome to your service provider dashboard</p>
          <p className="text-xl text-gray-600 mb-8">
            Manage your services, bookings, and grow your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/vendor/dashboard/services">
                <Wrench className="h-5 w-5 mr-2" />
                Manage Services
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/vendor/dashboard/bookings">
                <Calendar className="h-5 w-5 mr-2" />
                View Bookings
              </Link>
            </Button>
          </div>
        </div>

        {/* Service Provider Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full w-12 h-12 bg-blue-100 flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-gray-600">Active Services</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full w-12 h-12 bg-green-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full w-12 h-12 bg-yellow-100 flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold">0.0</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full w-12 h-12 bg-purple-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold">₦0</div>
                  <div className="text-sm text-gray-600">Total Earnings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto p-4">
                <Link to="/vendor/dashboard/services/add">
                  <div className="text-center">
                    <Plus className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-medium">Add New Service</div>
                    <div className="text-sm text-gray-500">Create a new service offering</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4">
                <Link to="/vendor/dashboard/bookings">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-medium">Manage Bookings</div>
                    <div className="text-sm text-gray-500">View and manage appointments</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4">
                <Link to="/vendor/dashboard/analytics">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-medium">View Analytics</div>
                    <div className="text-sm text-gray-500">Track your performance</div>
                  </div>
                </Link>
              </Button>
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
      <DashboardWelcome 
        userType="vendor" 
        userName={activeStore?.shopName || 'Vendor'}
      />
    )
  }

  // Existing vendor dashboard (when they have products)
  return (
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
      <DashboardQuickActions userType="vendor" />

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
  )
}