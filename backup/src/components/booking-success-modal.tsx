import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { 
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  X,
  ExternalLink
} from "lucide-react"
import { ServiceBooking, Service, ServiceProvider } from "../types"
import { formatTimeForDisplay } from "../lib/availability"

interface BookingSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  booking: Partial<ServiceBooking>
  service: Service
  provider: ServiceProvider
  onViewBookings: () => void
}

export default function BookingSuccessModal({
  isOpen,
  onClose,
  booking,
  service,
  provider,
  onViewBookings
}: BookingSuccessModalProps) {
  if (!isOpen) return null

  const bookingStatus = service.bookingRequiresApproval ? "pending" : "confirmed"
  const statusColor = bookingStatus === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  const statusIcon = bookingStatus === "confirmed" ? "✅" : "⏳"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600 mb-2">
              🎉 Booking Submitted Successfully!
            </CardTitle>
            <p className="text-gray-600">
              {service.bookingRequiresApproval 
                ? "Your booking request has been submitted and is awaiting provider approval."
                : "Your booking has been confirmed! The service provider will contact you soon."
              }
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Booking Status */}
          <div className="flex items-center justify-center">
            <Badge className={`${statusColor} text-lg px-4 py-2`}>
              <span className="mr-2">{statusIcon}</span>
              {bookingStatus === "confirmed" ? "Booking Confirmed" : "Awaiting Approval"}
            </Badge>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">{new Date(booking.scheduledDate!).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium">{formatTimeForDisplay(booking.scheduledTime!)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-medium">₦{booking.totalAmount?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Service Provider</p>
                    <p className="font-medium">{provider.name}</p>
                    <p className="text-sm text-gray-500">{provider.category}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Service Address</p>
                    <p className="font-medium">{booking.address?.address1}</p>
                    <p className="text-sm text-gray-500">{booking.address?.city}, {booking.address?.state}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">{service.name}</h4>
            <p className="text-gray-600 text-sm mb-3">{service.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Duration: {service.duration} minutes</span>
              <span className="text-gray-500">Category: {service.category}</span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-blue-800">📧 What happens next?</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Confirmation email sent to {booking.customerEmail}</span>
              </li>
              {service.bookingRequiresApproval ? (
                <li className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Provider will review and respond within 24 hours</span>
                </li>
              ) : (
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Provider will contact you at {booking.customerPhone}</span>
                </li>
              )}
              <li className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span>Track your booking status in "My Bookings"</span>
              </li>
            </ul>
          </div>

          {/* Booking ID */}
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Your Booking Reference</p>
            <p className="font-mono text-lg font-bold text-gray-800">
              #{booking.serviceId?.slice(-8).toUpperCase()}-{new Date().getFullYear()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Keep this reference for your records</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={onViewBookings}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              View My Bookings
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}