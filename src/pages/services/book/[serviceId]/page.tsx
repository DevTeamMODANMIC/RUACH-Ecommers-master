"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Calendar,
  Clock,
  User,
  CreditCard,
  Shield,
  CheckCircle,
  Star,
  ArrowLeft,
  AlertCircle
} from "lucide-react"
import { Service, ServiceProvider, ServiceBooking, UserAddress } from "@/types"
import { getService } from "@/lib/firebase-services"
import { getServiceProvider } from "@/lib/firebase-service-providers"

export default function ServiceBookingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [service, setService] = useState<Service | null>(null)
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [bookingStep, setBookingStep] = useState(1) // 1: Service Info, 2: Schedule, 3: Details, 4: Payment
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProviderOnlyBooking, setIsProviderOnlyBooking] = useState(false)

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

  const [availableSlots] = useState<any[]>([])

  // Extract serviceId or providerId from URL
  useEffect(() => {
    const loadBookingData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Check for serviceId in path
        const pathParts = location.pathname.split('/')
        const serviceId = pathParts[pathParts.length - 1]
        
        // Check for providerId in query params
        const searchParams = new URLSearchParams(location.search)
        const providerId = searchParams.get('providerId')
        
        if (serviceId && serviceId !== 'book') {
          // Load service and provider
          console.log('Loading service:', serviceId)
          const serviceData = await getService(serviceId)
          if (serviceData) {
            setService(serviceData)
            const providerData = await getServiceProvider(serviceData.providerId)
            if (providerData) {
              setProvider(providerData)
              setBookingForm(prev => ({ ...prev, agreedPrice: serviceData.basePrice || 0 }))
            }
          }
        } else if (providerId) {
          // Load provider only (for providers without services)
          console.log('Loading provider only:', providerId)
          setIsProviderOnlyBooking(true)
          const providerData = await getServiceProvider(providerId)
          if (providerData) {
            setProvider(providerData)
          }
        } else {
          setError("No service or provider specified")
        }
      } catch (err: any) {
        console.error("Error loading booking data:", err)
        setError(err?.message || "Failed to load booking data")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadBookingData()
  }, [location])

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedTime || !bookingForm.customerName) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    
    try {
      if ((!service && !isProviderOnlyBooking) || !provider) {
        alert("Service or provider information is not available")
        return
      }

      const booking: Partial<ServiceBooking> = {
        serviceId: service?.id || undefined,
        providerId: isProviderOnlyBooking ? provider.id : (service ? service.providerId : ""),
        customerId: "", // This would be set by the backend
        customerName: bookingForm.customerName,
        customerEmail: bookingForm.customerEmail,
        customerPhone: bookingForm.customerPhone,
        serviceDetails: {
          name: isProviderOnlyBooking ? `${provider.name} - Custom Service` : (service?.name || ""),
          description: isProviderOnlyBooking ? `Custom service request for ${provider.name}` : (service?.description || ""),
          pricingType: service?.pricingType || "custom",
          agreedPrice: bookingForm.agreedPrice,
          duration: service?.duration || 60
        },
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        address: bookingForm.address,
        specialRequirements: bookingForm.specialRequirements,
        status: service?.bookingRequiresApproval ? "pending" : "confirmed",
        paymentStatus: "pending",
        totalAmount: bookingForm.agreedPrice,
        depositAmount: service?.depositAmount,
        createdAt: null,
        updatedAt: null
      }

      console.log("Submitting booking:", booking)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert("Booking submitted successfully! You will receive confirmation via email.")
      navigate("/services")
      
    } catch (error) {
      console.error("Booking error:", error)
      alert("Failed to submit booking. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAvailableTimesForDate = (date: string) => {
    const slot = availableSlots.find(slot => slot.date === date)
    return slot?.timeSlots || []
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Booking Information</h3>
          <p className="text-gray-600">Please wait while we prepare your booking form...</p>
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
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Booking</h3>
            <p className="text-gray-600">{error}</p>
          </div>
          <Button onClick={() => navigate('/services')} variant="outline">
            Back to Services
          </Button>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (bookingStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {isProviderOnlyBooking ? "Provider Information" : "Service Information"}
              </h3>
              <div className="space-y-4">
                {service && (
                  <div className="flex items-start space-x-4">
                    <img
                      src={service.images?.[0]?.url || '/placeholder.jpg'}
                      alt={service.name || 'Service'}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{service.name || 'Service Name'}</h4>
                      <p className="text-gray-600 text-sm mb-2">{service.description || 'Service description'}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.duration || 0} minutes
                      </div>
                    </div>
                  </div>
                )}
                
                {!isProviderOnlyBooking && service && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">What's included:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {service?.features?.map((feature: string, index: number) => (
                        <li key={index}>{feature}</li>
                      )) || <li>No features listed</li>}
                    </ul>
                  </div>
                )}

                {!isProviderOnlyBooking && service?.requirements && service.requirements.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2 text-yellow-800">Please ensure:</h5>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      {service.requirements.map((req: string, index: number) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {isProviderOnlyBooking && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2 text-blue-800">Provider Booking</h5>
                    <p className="text-sm text-blue-700">
                      You're booking directly with {provider?.name}. They will contact you to discuss your specific needs and provide a custom quote.
                    </p>
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
                {availableSlots.map((slot) => (
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
                ))}
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
                      {time}
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
                    Selected: {new Date(selectedDate).toLocaleDateString()} at {selectedTime}
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
                placeholder={`Any special requirements or notes for the ${isProviderOnlyBooking ? 'provider' : 'service'}...`}
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
                  <span>{isProviderOnlyBooking ? "Provider:" : "Service:"}</span>
                  <span className="font-medium">
                    {isProviderOnlyBooking ? (provider?.name || 'Provider Name') : (service?.name || 'Service Name')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Provider:</span>
                  <span className="font-medium">{provider?.name || 'Provider Name'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString()} at {selectedTime}
                  </span>
                </div>
                {!isProviderOnlyBooking && (
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{service?.duration || 0} minutes</span>
                  </div>
                )}
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
                  <span>
                    {isProviderOnlyBooking ? "Estimated Cost:" : "Service Fee:"}
                  </span>
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
            
            {isProviderOnlyBooking && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-blue-800">
                    <p className="font-medium">Direct Provider Booking</p>
                    <p className="text-sm">
                      You're booking directly with {provider?.name}. They will contact you to discuss your specific needs and provide a custom quote. 
                      Payment details will be arranged directly with the provider.
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

  // Show loading or error state if service/provider data is not available
  if ((!service && !isProviderOnlyBooking) || !provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isProviderOnlyBooking ? "Provider" : "Service"} Not Found
            </h3>
            <p className="text-gray-600">
              The requested {isProviderOnlyBooking ? "provider" : "service"} could not be found or is no longer available.
            </p>
          </div>
          <Button onClick={() => navigate('/services')} variant="outline">
            Back to Services
          </Button>
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
              <h1 className="text-2xl font-bold">
                {isProviderOnlyBooking ? "Book Provider" : "Book Service"}
              </h1>
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
    </div>
  )
}