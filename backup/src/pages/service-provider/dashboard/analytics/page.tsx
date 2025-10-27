"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Star,
  Clock,
  Target
} from "lucide-react"

// Define types for analytics data
type TopService = {
  name: string
  bookings: number
  revenue: number
}

type AnalyticsData = {
  overview: {
    totalRevenue: number
    totalBookings: number
    averageRating: number
    completionRate: number
  }
  monthlyRevenue: Array<{
    month: string
    revenue: number
  }>
  topServices: TopService[]
  customerSatisfaction: {
    fiveStars: number
    fourStars: number
    threeStars: number
    twoStars: number
    oneStar: number
  }
}

export default function ServiceProviderAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  // Analytics data will be loaded from the database
  const analytics: AnalyticsData = {
    overview: {
      totalRevenue: 450000,
      totalBookings: 156,
      averageRating: 4.8,
      completionRate: 94
    },
    monthlyRevenue: [
      { month: "Jul", revenue: 320000 },
      { month: "Aug", revenue: 380000 },
      { month: "Sep", revenue: 420000 },
      { month: "Oct", revenue: 380000 },
      { month: "Nov", revenue: 450000 },
      { month: "Dec", revenue: 490000 }
    ],
    topServices: [] as TopService[],
    customerSatisfaction: {
      fiveStars: 78,
      fourStars: 15,
      threeStars: 5,
      twoStars: 2,
      oneStar: 0
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="w-full px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your performance and business insights</p>
        </div>
      </div>

      <div className="w-full px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full w-12 h-12 bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold">₦{(analytics.overview.totalRevenue / 1000).toFixed(0)}K</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full w-12 h-12 bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold">{analytics.overview.totalBookings}</div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                  <div className="flex items-center text-xs text-blue-600 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% from last month
                  </div>
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
                  <div className="text-2xl font-bold">{analytics.overview.averageRating}</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                  <div className="flex items-center text-xs text-yellow-600 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +0.2 from last month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full w-12 h-12 bg-purple-100 flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold">{analytics.overview.completionRate}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                  <div className="flex items-center text-xs text-purple-600 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2% from last month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.monthlyRevenue.map((item, index) => (
                  <div key={item.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.month}</span>
                    <div className="flex items-center flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(item.revenue / 500000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">₦{(item.revenue / 1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Satisfaction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Customer Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { stars: 5, count: analytics.customerSatisfaction.fiveStars, color: "bg-green-500" },
                  { stars: 4, count: analytics.customerSatisfaction.fourStars, color: "bg-blue-500" },
                  { stars: 3, count: analytics.customerSatisfaction.threeStars, color: "bg-yellow-500" },
                  { stars: 2, count: analytics.customerSatisfaction.twoStars, color: "bg-orange-500" },
                  { stars: 1, count: analytics.customerSatisfaction.oneStar, color: "bg-red-500" }
                ].map((rating) => (
                  <div key={rating.stars} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium w-8">{rating.stars}★</span>
                    </div>
                    <div className="flex items-center flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${rating.color} h-2 rounded-full`}
                          style={{ width: `${(rating.count / 100) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{rating.count}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topServices.length > 0 ? (
                analytics.topServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600">{service.bookings} bookings</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₦{(service.revenue / 1000).toFixed(0)}K</div>
                      <div className="text-sm text-gray-600">revenue</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No service performance data yet</p>
                  <p className="text-sm">Service analytics will appear here once you start receiving bookings</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}