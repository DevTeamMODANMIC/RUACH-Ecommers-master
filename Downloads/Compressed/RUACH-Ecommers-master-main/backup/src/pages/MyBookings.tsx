import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react"
import { ServiceBooking } from "../types"
import { getCustomerBookings, cancelBooking } from "../lib/firebase-bookings"
import { useAuth } from "../components/auth-provider"
import { formatTimeForDisplay } from "../lib/availability"
import { toast } from "sonner"

export default function MyBookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [bookings, setBookings] = useState<ServiceBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null)

  // Load customer bookings
  useEffect(() => {
    const loadBookings = async () => {
      if (!user) {
        navigate('/login')
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        console.log('🔍 Loading bookings for user:', user.uid)
        const customerBookings = await getCustomerBookings(user.uid)
        
        setBookings(customerBookings)
        console.log('✅ Bookings loaded:', customerBookings.length)
        
      } catch (err: any) {
        console.error('💥 Error loading bookings:', err)
        setError(err.message || 'Failed to load bookings')
      } finally {
        setIsLoading(false)
      }
    }

    loadBookings()
  }, [user, navigate])

  const handleCancelBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId)
    
    if (!confirm(`Are you sure you want to cancel your booking for "${booking?.serviceDetails.name}"?`)) {
      return
    }

    setCancellingBookingId(bookingId)
    
    try {
      await cancelBooking(bookingId, 'Cancelled by customer', 'customer')
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' }
          : booking
      ))
      
      toast.success("✅ Booking Cancelled", {
        description: `Your booking for "${booking?.serviceDetails.name}" has been cancelled successfully.`,
        duration: 4000
      })
      
      // Show refund info if applicable
      if (booking?.paymentStatus === 'deposit_paid' || booking?.paymentStatus === 'fully_paid') {
        setTimeout(() => {
          toast.info("💰 Refund Information", {
            description: "Your refund will be processed within 3-5 business days according to our refund policy.",
            duration: 6000
          })
        }, 1000)
      }
      
    } catch (error: any) {
      console.error('Error cancelling booking:', error)
      toast.error("❌ Cancellation Failed", {
        description: error.message || "Failed to cancel booking. Please try again or contact support.",
        duration: 5000
      })
    } finally {
      setCancellingBookingId(null)
    }
  }

  const getStatusColor = (status: ServiceBooking['status']) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "confirmed": return "bg-blue-100 text-blue-800"
      case "in_progress": return "bg-purple-100 text-purple-800"
      case "completed": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: ServiceBooking['status']) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />
      case "confirmed": return <CheckCircle className="h-4 w-4" />
      case "in_progress": return <Loader2 className="h-4 w-4 animate-spin" />
      case "completed": return <CheckCircle className="h-4 w-4" />
      case "cancelled": return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const canCancelBooking = (booking: ServiceBooking): boolean => {
    return booking.status === 'pending' || booking.status === 'confirmed'
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Your Bookings...</h3>
          <p className="text-gray-600">Please wait while we fetch your booking history.</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Bookings</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => navigate('/services')} variant="outline">
              Browse Services
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1">Manage your service bookings</p>
            </div>
            <Button onClick={() => navigate('/services')} className="bg-blue-600 hover:bg-blue-700">
              Book New Service
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Bookings Yet</h3>
            <p className="text-gray-600 mb-6">You haven't made any service bookings yet.</p>
            <Button onClick={() => navigate('/services')} className="bg-blue-600 hover:bg-blue-700">
              Browse Services
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{booking.serviceDetails.name}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(booking.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTimeForDisplay(booking.scheduledTime)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {booking.address.city}, {booking.address.state}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(booking.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">{booking.status.replace('_', ' ')}</span>
                        </div>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Service Details */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Service Details</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">{booking.serviceDetails.description}</p>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">{booking.serviceDetails.duration || 60} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-medium">₦{booking.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Status:</span>
                          <Badge variant={booking.paymentStatus === 'fully_paid' ? 'default' : 'secondary'}>
                            {booking.paymentStatus.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Address & Notes */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Service Address</h4>
                      <div className="text-sm text-gray-600">
                        <p>{booking.address.address1}</p>
                        <p>{booking.address.city}, {booking.address.state}</p>
                        <p>{booking.address.country}</p>
                      </div>
                      
                      {booking.specialRequirements && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Special Requirements</h5>
                          <p className="text-sm text-gray-600">{booking.specialRequirements}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Booking ID: {booking.id}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {booking.status === 'completed' && !booking.rating && (
                        <Button variant="outline" size="sm">
                          <Star className="h-4 w-4 mr-1" />
                          Rate Service
                        </Button>
                      )}
                      
                      {canCancelBooking(booking) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingBookingId === booking.id}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          {cancellingBookingId === booking.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-1" />
                          )}
                          Cancel
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}