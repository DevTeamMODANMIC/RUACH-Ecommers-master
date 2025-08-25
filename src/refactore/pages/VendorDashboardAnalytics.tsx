import { useState, useEffect } from "react"
import { useVendor } from "../hooks/use-vendor"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  ShoppingBag, 
  Users, 
  Eye,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from "lucide-react"
import Link from "react-router-dom"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

interface AnalyticsData {
  revenue: { current: number; previous: number; change: number }
  orders: { current: number; previous: number; change: number }
  customers: { current: number; previous: number; change: number }
  views: { current: number; previous: number; change: number }
}

export default function VendorAnalyticsPage() {
  const { vendor, activeStore } = useVendor()
  const [timeRange, setTimeRange] = useState("30d")
  const [hasData, setHasData] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: { current: 0, previous: 0, change: 0 },
    orders: { current: 0, previous: 0, change: 0 },
    customers: { current: 0, previous: 0, change: 0 },
    views: { current: 0, previous: 0, change: 0 }
  })

  // Empty data for new vendors
  const revenueData = hasData ? [
    { name: 'Jan', revenue: 1200, orders: 24 },
    { name: 'Feb', revenue: 1800, orders: 32 },
    { name: 'Mar', revenue: 1600, orders: 28 },
    { name: 'Apr', revenue: 2100, orders: 38 },
    { name: 'May', revenue: 2340, orders: 45 },
    { name: 'Jun', revenue: 2800, orders: 52 }
  ] : [
    { name: 'Week 1', revenue: 0, orders: 0 },
    { name: 'Week 2', revenue: 0, orders: 0 },
    { name: 'Week 3', revenue: 0, orders: 0 },
    { name: 'Week 4', revenue: 0, orders: 0 }
  ]

  const categoryData = hasData ? [
    { name: 'Food', value: 45, color: '#10B981' },
    { name: 'Beverages', value: 30, color: '#3B82F6' },
    { name: 'Spices', value: 15, color: '#F59E0B' },
    { name: 'Others', value: 10, color: '#EF4444' }
  ] : []

  const topProductsData = hasData ? [
    { name: 'African Rice 5kg', sales: 28, revenue: 447.72 },
    { name: 'Palm Oil 1L', sales: 22, revenue: 187.00 },
    { name: 'Plantain Flour 2kg', sales: 18, revenue: 233.82 },
    { name: 'Yam Flour 1kg', sales: 15, revenue: 149.85 },
    { name: 'Cassava Flour 2kg', sales: 12, revenue: 143.88 }
  ] : []

  const trafficData = hasData ? [
    { name: 'Week 1', views: 280, visitors: 210 },
    { name: 'Week 2', views: 320, visitors: 245 },
    { name: 'Week 3', views: 290, visitors: 220 },
    { name: 'Week 4', views: 360, visitors: 280 }
  ] : [
    { name: 'Week 1', views: 0, visitors: 0 },
    { name: 'Week 2', views: 0, visitors: 0 },
    { name: 'Week 3', views: 0, visitors: 0 },
    { name: 'Week 4', views: 0, visitors: 0 }
  ]

  const getMetricCard = (title: string, current: number, previous: number, change: number, icon: any, format: string = '') => {
    const isPositive = change > 0
    const Icon = icon
    
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {format === 'currency' ? `₦${current.toFixed(2)}` : current.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                {isPositive ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ml-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(change).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track your store&apos;s performance and insights
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getMetricCard("Revenue", analyticsData.revenue.current, analyticsData.revenue.previous, analyticsData.revenue.change, DollarSign, 'currency')}
        {getMetricCard("Orders", analyticsData.orders.current, analyticsData.orders.previous, analyticsData.orders.change, ShoppingBag)}
        {getMetricCard("Customers", analyticsData.customers.current, analyticsData.customers.previous, analyticsData.customers.change, Users)}
        {getMetricCard("Store Views", analyticsData.views.current, analyticsData.views.previous, analyticsData.views.change, Eye)}
      </div>

      {/* Charts or Empty State */}
      {!hasData ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start selling products to see detailed analytics about your store performance, customer behavior, and sales trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/vendor/dashboard/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/vendor/dashboard/products">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Manage Products
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList>
            <TabsTrigger value="revenue">Revenue & Orders</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
          </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue & Orders Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="right" dataKey="orders" fill="#3B82F6" name="Orders" />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} name="Revenue (₦)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Top Performing Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProductsData.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.sales} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₦{product.revenue.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{category.name}</span>
                        <span>{category.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${category.value}%`, 
                            backgroundColor: category.color 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Store Traffic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="views" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Page Views" />
                  <Area type="monotone" dataKey="visitors" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Unique Visitors" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      )}

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Strong Growth</p>
                <p className="text-sm text-green-700">
                  Your revenue increased by 8.5% compared to last period
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Top Category</p>
                <p className="text-sm text-blue-700">
                  Food products account for 45% of your sales
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <Users className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Customer Growth</p>
                <p className="text-sm text-yellow-700">
                  You gained 3 new customers this period
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Optimize Product Listings</h4>
              <p className="text-sm text-gray-600">
                Add more detailed descriptions and images to increase conversion rates
              </p>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Expand Popular Categories</h4>
              <p className="text-sm text-gray-600">
                Consider adding more food products as they&apos;re your best performers
              </p>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Seasonal Promotions</h4>
              <p className="text-sm text-gray-600">
                Create targeted promotions for your top-selling products
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 