"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Textarea } from "../components/ui/textarea"
import { 
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  DollarSign,
  MoreVertical,
  Download
} from "lucide-react"
import { ServiceBooking } from "../types"
import { useAuth } from "../components/auth-provider"

export default function ServiceProviderBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<ServiceBooking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<ServiceBooking[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all")
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const loadBookings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // TODO: Load real bookings data from Firebase
        // For now, just set empty array without delay
        setBookings([])
        setFilteredBookings([])
      } catch (err: any) {
        console.error("Error loading bookings:", err)
        setError(err.message || "Failed to load bookings")
      } finally {
        setIsLoading(false)
      }
    }

    loadBookings()
  }, [user])

  useEffect(() => {
    let filtered = [...bookings]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.serviceDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())

    setFilteredBookings(filtered)
  }, [bookings, searchQuery, statusFilter])

  const handleUpdateBookingStatus = (bookingId: string, newStatus: ServiceBooking['status']) => {
    setBookings(bookings.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: newStatus, updatedAt: Date.now() }
        : booking
    ))
  }

  const handleAddNote = (bookingId: string, note: string) => {
    setBookings(bookings.map(booking =>
      booking.id === bookingId
        ? { ...booking, providerNotes: note, updatedAt: Date.now() }
        : booking
    ))
  }

  const getStatusColor = (status: ServiceBooking['status']) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "confirmed": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: ServiceBooking['paymentStatus']) => {
    switch (status) {
      case "pending": return "bg-red-100 text-red-800"
      case "deposit_paid": return "bg-yellow-100 text-yellow-800"
      case "fully_paid": return "bg-green-100 text-green-800"
      case "refunded": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === "pending").length,
    confirmedBookings: bookings.filter(b => b.status === "confirmed").length,
    completedBookings: bookings.filter(b => b.status === "completed").length,
    totalRevenue: bookings
      .filter(b => b.paymentStatus === "fully_paid")
      .reduce((sum, b) => sum + b.totalAmount, 0)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
              <p className="text-gray-600 mt-1">Manage your service bookings and appointments</p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="w-full px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.totalBookings}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.confirmedBookings}</div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.completedBookings}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">₦{(stats.totalRevenue / 1000).toFixed(0)}K</div>
              <div className="text-sm text-gray-600">Revenue</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: "all", label: "All Bookings" },
                  { key: "pending", label: "Pending" },
                  { key: "confirmed", label: "Confirmed" },
                  { key: "completed", label: "Completed" },
                  { key: "cancelled", label: "Cancelled" }
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={statusFilter === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(key as any)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.serviceDetails.name}
                      </h3>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <Badge variant="outline" className={getPaymentStatusColor(booking.paymentStatus)}>
                        {booking.paymentStatus.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{booking.serviceDetails.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      ₦{booking.totalAmount.toLocaleString()}
                    </div>
                    {booking.depositAmount && booking.paymentStatus === "deposit_paid" && (
                      <div className="text-sm text-gray-600">
                        Deposit: ₦{booking.depositAmount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Customer Info */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium">{booking.customerName}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{booking.customerEmail}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{booking.customerPhone}</span>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium">
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{booking.scheduledTime}</span>
                    </div>
                    {booking.serviceDetails.duration && (
                      <div className="text-sm text-gray-600">
                        Duration: {Math.floor(booking.serviceDetails.duration / 60)}h {booking.serviceDetails.duration % 60}m
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <div className="flex items-start text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <div className="font-medium">{booking.address.city}, {booking.address.state}</div>
                        <div className="text-gray-600">{booking.address.address1}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {booking.status === "pending" && (
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleUpdateBookingStatus(booking.id, "confirmed")}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Confirm
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full"
                          onClick={() => handleUpdateBookingStatus(booking.id, "cancelled")}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                    
                    {booking.status === "confirmed" && (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleUpdateBookingStatus(booking.id, "completed")}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mark Complete
                      </Button>
                    )}

                    <Button size="sm" variant="outline" className="w-full">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Contact Customer
                    </Button>
                  </div>
                </div>

                {/* Provider Notes */}
                {booking.providerNotes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-1">Provider Notes:</div>
                    <div className="text-sm text-blue-700">{booking.providerNotes}</div>
                  </div>
                )}

                {/* Special Requirements */}
                {booking.specialRequirements && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <div className="text-sm font-medium text-orange-800 mb-1">Special Requirements:</div>
                    <div className="text-sm text-orange-700">{booking.specialRequirements}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <Calendar className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || statusFilter !== "all" ? "No bookings found" : "No bookings yet"}
              </h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Bookings will appear here once customers start booking your services"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}