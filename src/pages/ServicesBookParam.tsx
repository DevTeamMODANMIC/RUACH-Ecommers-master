import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Shield,
  CheckCircle,
  Star,
  ArrowLeft,
  AlertCircle
} from "lucide-react"
import { Service, ServiceProvider, ServiceBooking, UserAddress } from "../types"
import { getService } from "../lib/firebase-services"
import { getServiceProvider } from "../lib/firebase-service-providers"
import { createBooking } from "../lib/firebase-bookings"
import { generateAvailableSlots, TimeSlot, formatTimeForDisplay } from "../lib/availability"
import { useAuth } from "../components/auth-provider"
import { toast } from "sonner"
import BookingSuccessModal from "../components/booking-success-modal"

export default function ServiceBookingPage() {
  const params = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const serviceId = params.serviceId as string

  const [service, setService] = useState<Service | null>(null)
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [bookingStep, setBookingStep] = useState(1) // 1: Service Info, 2: Schedule, 3: Details, 4: Payment
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [completedBooking, setCompletedBooking] = useState<Partial<ServiceBooking> | null>(null)

  const [bookingForm, setBookingForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: {
      firstName: "",
      lastName: "",
      address1: "",
      city: "",
      state: "",
      country: "Nigeria",
      postalCode: "",
      phone: ""
    } as UserAddress,
    specialRequirements: "",
    agreedPrice: 0
  })

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])

  // Load service and provider data
  useEffect(() => {
    const loadServiceData = async () => {
      if (!serviceId) {
        setError("No service ID provided")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        console.log('🔍 Loading service:', serviceId)
        
        // Load service data
        const serviceData = await getService(serviceId)
        
        if (!serviceData) {
          setError("Service not found or is no longer available")
          setIsLoading(false)
          return
        }

        // Check if service is active
        if (!serviceData.isActive) {
          setError("This service is currently not available for booking")
          setIsLoading(false)
          return
        }

        console.log('✅ Service loaded:', serviceData.name)
        setService(serviceData)

        // Load provider data
        console.log('🔍 Loading provider:', serviceData.providerId)
        const providerData = await getServiceProvider(serviceData.providerId)
        
        if (!providerData) {
          setError("Service provider not found")
          setIsLoading(false)
          return
        }

        // Check if provider is active and approved
        if (!providerData.isActive || !providerData.isApproved) {
          setError("This service provider is currently not available")
          setIsLoading(false)
          return
        }

        console.log('✅ Provider loaded:', providerData.name)
        setProvider(providerData)

        // Load available time slots
        console.log('🔍 Loading available slots...')
        const slots = await generateAvailableSlots(providerData.id, 14)
        setAvailableSlots(slots)
        console.log('✅ Available slots loaded:', slots.length)

      } catch (err: any) {
        console.error('💥 Error loading service data:', err)
        setError(err.message || 'Failed to load service data')
      } finally {
        setIsLoading(false)
      }
    }

    loadServiceData()
  }, [serviceId])

  useEffect(() => {
    if (service?.basePrice) {
      setBookingForm(prev => ({ ...prev, agreedPrice: service.basePrice || 0 }))
    }
  }, [service])

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedTime || !bookingForm.customerName) {
      toast.error("Please fill in all required fields", {
        description: "Make sure to select a date, time, and provide your contact information."
      })
      return
    }

    if (!user) {
      toast.error("Authentication required", {
        description: "Please log in to make a booking."
      })
      navigate("/login")
      return
    }

    setIsSubmitting(true)
    
    try {
      if (!service || !provider) {
        toast.error("Service information unavailable", {
          description: "Unable to load service or provider details. Please try again."
        })
        return
      }

      const bookingData: Omit<ServiceBooking, "id" | "createdAt" | "updatedAt"> = {
        serviceId: service.id,
        providerId: service.providerId,
        customerId: user.uid,
        customerName: bookingForm.customerName,
        customerEmail: bookingForm.customerEmail,
        customerPhone: bookingForm.customerPhone,
        serviceDetails: {
          name: service.name,
          description: service.description,
          pricingType: service.pricingType,
          agreedPrice: bookingForm.agreedPrice,
          duration: service.duration
        },
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        address: bookingForm.address,
        specialRequirements: bookingForm.specialRequirements,
        status: service.bookingRequiresApproval ? "pending" : "confirmed",
        paymentStatus: "pending",
        totalAmount: bookingForm.agreedPrice,
        depositAmount: service.depositAmount
      }

      console.log("Submitting booking:", bookingData)
      
      // Create the booking in Firebase
      const bookingId = await createBooking(bookingData)
      
      console.log("✅ Booking created with ID:", bookingId)
      
      // Store the completed booking data
      setCompletedBooking({
        ...bookingData,
        id: bookingId
      })
      
      // Show the success modal
      setShowSuccessModal(true)
      
      // Also show a quick toast notification
      toast.success("🎉 Booking Submitted!", {
        description: "Your booking has been processed successfully.",
        duration: 3000
      })
      
    } catch (error: any) {
      console.error("Booking error:", error)
      toast.error("❌ Booking Failed", {
        description: error.message || "Something went wrong while processing your booking. Please try again.",
        duration: 5000,
        action: {
          label: "Retry",
          onClick: () => handleBookingSubmit()
        }
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAvailableTimesForDate = (date: string) => {
    const slot = availableSlots.find(slot => slot.date === date)
    return slot?.timeSlots || []
  }

  const renderStepContent = () => {
    switch (bookingStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Service Information</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={service?.images?.[0]?.url || '/placeholder.jpg'}
                    alt={service?.name || 'Service'}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{service?.name || 'Service Name'}</h4>
                    <p className="text-gray-600 text-sm mb-2">{service?.description || 'Service description'}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {service?.duration || 0} minutes
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">What's included:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {service?.features?.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    )) || <li>No features listed</li>}
                  </ul>
                </div>

                {service?.requirements && service.requirements.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2 text-yellow-800">Please ensure:</h5>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      {service.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Service Provider</h3>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{provider?.name || 'Provider Name'}</h4>
                  <p className="text-gray-600 text-sm">{provider?.description || 'Provider description'}</p>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(provider?.rating || 0)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      {provider?.rating || 0} ({provider?.reviewCount || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Select Date & Time</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Dates
              </label>
              <div className="grid grid-cols-3 gap-3">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot) => (
                    <button
                      key={slot.date}
                      type="button"
                      onClick={() => {
                        setSelectedDate(slot.date)
                        setSelectedTime("") // Reset time when date changes
                      }}
                      className={`p-3 text-sm border rounded-lg transition-colors ${
                        selectedDate === slot.date
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-blue-300"
                      }`}
                    >
                      {new Date(slot.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short", 
                        day: "numeric"
                      })}
                    </button>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No available dates at the moment</p>
                    <p className="text-sm">Please check back later</p>
                  </div>
                )}
              </div>
            </div>

            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Available Times
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {getAvailableTimesForDate(selectedDate).map((time: string) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 text-sm border rounded-lg transition-colors ${
                        selectedTime === time
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-blue-300"
                      }`}
                    >
                      {formatTimeForDisplay(time)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedDate && selectedTime && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    Selected: {new Date(selectedDate).toLocaleDateString()} at {formatTimeForDisplay(selectedTime)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Your Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <Input
                  type="text"
                  value={bookingForm.address.firstName}
                  onChange={(e) => setBookingForm({
                    ...bookingForm,
                    customerName: `${e.target.value} ${bookingForm.address.lastName}`.trim(),
                    address: { ...bookingForm.address, firstName: e.target.value }
                  })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <Input
                  type="text"
                  value={bookingForm.address.lastName}
                  onChange={(e) => setBookingForm({
                    ...bookingForm,
                    customerName: `${bookingForm.address.firstName} ${e.target.value}`.trim(),
                    address: { ...bookingForm.address, lastName: e.target.value }
                  })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={bookingForm.customerEmail}
                  onChange={(e) => setBookingForm({
                    ...bookingForm,
                    customerEmail: e.target.value
                  })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  value={bookingForm.customerPhone}
                  onChange={(e) => setBookingForm({
                    ...bookingForm,
                    customerPhone: e.target.value,
                    address: { ...bookingForm.address, phone: e.target.value }
                  })}
                  required
                />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Service Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <Input
                    type="text"
                    value={bookingForm.address.address1}
                    onChange={(e) => setBookingForm({
                      ...bookingForm,
                      address: { ...bookingForm.address, address1: e.target.value }
                    })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <Input
                    type="text"
                    value={bookingForm.address.city}
                    onChange={(e) => setBookingForm({
                      ...bookingForm,
                      address: { ...bookingForm.address, city: e.target.value }
                    })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <Input
                    type="text"
                    value={bookingForm.address.state}
                    onChange={(e) => setBookingForm({
                      ...bookingForm,
                      address: { ...bookingForm.address, state: e.target.value }
                    })}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requirements (Optional)
              </label>
              <Textarea
                value={bookingForm.specialRequirements}
                onChange={(e) => setBookingForm({
                  ...bookingForm,
                  specialRequirements: e.target.value
                })}
                placeholder="Any special requirements or notes for the service provider..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Booking Summary & Payment</h3>
            
            {/* Booking Summary */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h4 className="font-semibold">Booking Details</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{service?.name || 'Service Name'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Provider:</span>
                  <span className="font-medium">{provider?.name || 'Provider Name'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString()} at {formatTimeForDisplay(selectedTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{service?.duration || 0} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-medium">{bookingForm.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Address:</span>
                  <span className="font-medium text-right">
                    {bookingForm.address.address1}, {bookingForm.address.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white p-6 border rounded-lg space-y-4">
              <h4 className="font-semibold">Pricing</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Service Fee:</span>
                  <span>₦{bookingForm.agreedPrice.toLocaleString()}</span>
                </div>
                {service?.depositRequired && (
                  <div className="flex justify-between text-blue-600">
                    <span>Deposit Required:</span>
                    <span>₦{service.depositAmount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>₦{bookingForm.agreedPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h4 className="font-semibold">Payment Method</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 cursor-pointer hover:border-blue-500">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Card Payment</div>
                      <div className="text-sm text-gray-600">Visa, Mastercard</div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 cursor-pointer hover:border-blue-500">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Bank Transfer</div>
                      <div className="text-sm text-gray-600">Direct bank transfer</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {service?.bookingRequiresApproval && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-yellow-800">
                    <p className="font-medium">Approval Required</p>
                    <p className="text-sm">
                      This service requires provider approval. You'll be notified once your 
                      booking is confirmed. Payment will only be processed after approval.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">
            <User className="h-12 w-12 mx-auto mb-4 text-blue-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-600">Please log in to book this service.</p>
          </div>
          <div className="space-x-4">
            <Button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700">
              Login
            </Button>
            <Button onClick={() => navigate('/services')} variant="outline">
              Back to Services
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Service...</h3>
          <p className="text-gray-600">Please wait while we load the service details.</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Service Not Found</h3>
            <p className="text-gray-600">{error}</p>
          </div>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => navigate('/services')} variant="outline">
              Back to Services
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state if service/provider data is not available
  if (!service || !provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
          <p className="text-gray-600">Preparing service details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Book Service</h1>
              <p className="text-gray-600">Step {bookingStep} of 4</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= bookingStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                <div className={`flex-1 h-0.5 mx-4 ${
                  step < bookingStep ? "bg-blue-600" : "bg-gray-200"
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8">
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                {bookingStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setBookingStep(bookingStep - 1)}
                  >
                    Previous
                  </Button>
                )}
                
                <div className="ml-auto">
                  {bookingStep < 4 ? (
                    <Button
                      onClick={() => setBookingStep(bookingStep + 1)}
                      disabled={
                        (bookingStep === 2 && (!selectedDate || !selectedTime)) ||
                        (bookingStep === 3 && (!bookingForm.customerName || !bookingForm.customerEmail))
                      }
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleBookingSubmit}
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? "Submitting..." : "Confirm Booking"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && completedBooking && service && provider && (
        <BookingSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          booking={completedBooking}
          service={service}
          provider={provider}
          onViewBookings={() => {
            setShowSuccessModal(false)
            navigate("/my-bookings")
          }}
        />
      )}
    </div>
  )
}