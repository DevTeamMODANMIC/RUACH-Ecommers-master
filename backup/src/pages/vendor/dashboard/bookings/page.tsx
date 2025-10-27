"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Check,
  X,
  Search,
  Filter,
  Eye,
  MessageCircle,
  Star,
  DollarSign
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data - in real app this would come from API/database
const mockBookings = [
  {
    id: "1",
    service: "Home Plumbing Repair",
    customer: {
      name: "John Doe",
      phone: "+234 901 234 5678", 
      email: "john.doe@email.com",
      avatar: null
    },
    date: "2024-03-25",
    time: "10:00 AM",
    duration: 120,
    location: "15 Victoria Island, Lagos",
    status: "pending",
    amount: 15000,
    notes: "Kitchen sink leak repair needed urgently",
    createdAt: "2024-03-20",
    depositPaid: false
  },
  {
    id: "2", 
    service: "Emergency Leak Fix",
    customer: {
      name: "Sarah Johnson",
      phone: "+234 802 345 6789",
      email: "sarah.j@email.com", 
      avatar: null
    },
    date: "2024-03-23",
    time: "2:00 PM",
    duration: 60,
    location: "45 Ikoyi Street, Lagos",
    status: "confirmed",
    amount: 8000,
    notes: "Bathroom pipe leak",
    createdAt: "2024-03-22",
    depositPaid: true
  },
  {
    id: "3",
    service: "Home Plumbing Repair", 
    customer: {
      name: "Mike Wilson",
      phone: "+234 703 456 7890",
      email: "mike.w@email.com",
      avatar: null
    },
    date: "2024-03-22",
    time: "9:00 AM",
    duration: 120,
    location: "78 Lekki Phase 1, Lagos",
    status: "completed",
    amount: 15000,
    notes: "Replace water heater and fix shower",
    createdAt: "2024-03-18",
    depositPaid: true,
    rating: 5,
    review: "Excellent work! Very professional and timely."
  },
  {
    id: "4",
    service: "Emergency Leak Fix",
    customer: {
      name: "Lisa Brown",
      phone: "+234 904 567 8901",
      email: "lisa.brown@email.com",
      avatar: null
    },
    date: "2024-03-21", 
    time: "4:00 PM",
    duration: 60,
    location: "23 Surulere, Lagos",
    status: "cancelled",
    amount: 8000,
    notes: "Customer cancelled due to travel",
    createdAt: "2024-03-19",
    depositPaid: false
  }
]

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800", 
  "in-progress": "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  "no-show": "bg-gray-100 text-gray-800"
}

export default function BookingsManagement() {
  const [bookings, setBookings] = useState(mockBookings)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState("")

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || booking.status === selectedStatus
    const matchesDate = !selectedDate || booking.date === selectedDate
    return matchesSearch && matchesStatus && matchesDate
  })

  const updateBookingStatus = (bookingId: string, newStatus: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: newStatus }
        : booking
    ))
  }

  const formatTime = (time: string) => {
    return new Date(`2024-01-01 ${time}`).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage your service appointments and bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Clock className="h-4 w-4 mr-2" />
            Set Availability
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Check className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === 'completed').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦{bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Booking Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{booking.service}</h3>
                        <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                          {booking.status}
                        </Badge>
                        {booking.depositPaid && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Deposit Paid
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        ₦{booking.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium">{booking.customer.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Phone className="h-3 w-3" />
                        {booking.customer.phone}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Mail className="h-3 w-3" />
                        {booking.customer.email}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {booking.location}
                      </div>
                    </div>
                  </div>

                  {/* Schedule & Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{booking.time} ({booking.duration} mins)</span>
                      </div>
                    </div>
                    
                    {booking.notes && (
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Notes:</p>
                        <p className="text-gray-600">{booking.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Review (if completed) */}
                  {booking.status === 'completed' && booking.rating && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(booking.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">Customer Review</span>
                      </div>
                      <p className="text-sm text-gray-700">{booking.review}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[120px]">
                  {booking.status === 'pending' && (
                    <>
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </>
                  )}

                  {booking.status === 'confirmed' && (
                    <>
                      <Button 
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => updateBookingStatus(booking.id, 'in-progress')}
                      >
                        Start Service
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </>
                  )}

                  {booking.status === 'in-progress' && (
                    <Button 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}

                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        More
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="h-4 w-4 mr-2" />
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Send Message
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedStatus !== "all" || selectedDate
                ? "Try adjusting your search or filters" 
                : "Your bookings will appear here when customers book your services"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}