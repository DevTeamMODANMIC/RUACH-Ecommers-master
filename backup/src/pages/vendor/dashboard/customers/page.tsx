"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  MessageCircle,
  Eye,
  DollarSign,
  Clock,
  TrendingUp
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock customer data
const mockCustomers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+234 901 234 5678",
    location: "Victoria Island, Lagos",
    totalBookings: 5,
    totalSpent: 67500,
    averageRating: 4.8,
    lastBooking: "2024-03-22",
    joinDate: "2024-01-15",
    status: "regular",
    preferredServices: ["Home Plumbing Repair", "Emergency Leak Fix"],
    notes: "Prefers morning appointments. Very punctual."
  },
  {
    id: "2", 
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+234 802 345 6789", 
    location: "Ikoyi, Lagos",
    totalBookings: 3,
    totalSpent: 31000,
    averageRating: 5.0,
    lastBooking: "2024-03-23",
    joinDate: "2024-02-10",
    status: "new",
    preferredServices: ["Emergency Leak Fix"],
    notes: "Always tips well. Friendly customer."
  },
  {
    id: "3",
    name: "Mike Wilson", 
    email: "mike.w@email.com",
    phone: "+234 703 456 7890",
    location: "Lekki Phase 1, Lagos",
    totalBookings: 8,
    totalSpent: 120000,
    averageRating: 4.9,
    lastBooking: "2024-03-22",
    joinDate: "2023-11-20",
    status: "vip",
    preferredServices: ["Home Plumbing Repair", "Bathroom Renovation"],
    notes: "Property manager. Books services for multiple units."
  },
  {
    id: "4",
    name: "Lisa Brown",
    email: "lisa.brown@email.com", 
    phone: "+234 904 567 8901",
    location: "Surulere, Lagos",
    totalBookings: 1,
    totalSpent: 8000,
    averageRating: null,
    lastBooking: "2024-03-21",
    joinDate: "2024-03-19",
    status: "new",
    preferredServices: ["Emergency Leak Fix"],
    notes: "First-time customer. Cancelled last appointment due to travel."
  }
]

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  regular: "bg-green-100 text-green-800", 
  vip: "bg-purple-100 text-purple-800",
  inactive: "bg-gray-100 text-gray-800"
}

export default function CustomersManagement() {
  const [customers, setCustomers] = useState(mockCustomers)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || customer.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCustomerStatusBadge = (customer: any) => {
    if (customer.totalBookings >= 5) return "vip"
    if (customer.totalBookings >= 2) return "regular"
    return "new"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer relationships and history</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <MessageCircle className="h-4 w-4 mr-2" />
          Send Newsletter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">VIP Customers</p>
                <p className="text-2xl font-bold text-purple-600">
                  {customers.filter(c => c.totalBookings >= 5).length}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ₦{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">
                  {(customers.filter(c => c.averageRating).reduce((sum, c) => sum + (c.averageRating || 0), 0) / 
                    customers.filter(c => c.averageRating).length).toFixed(1)}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
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
                  placeholder="Search customers..."
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
              <option value="all">All Customers</option>
              <option value="new">New Customers</option>
              <option value="regular">Regular Customers</option>
              <option value="vip">VIP Customers</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Customer Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{customer.name}</h3>
                        <Badge className={statusColors[getCustomerStatusBadge(customer) as keyof typeof statusColors]}>
                          {getCustomerStatusBadge(customer)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {customer.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{customer.totalBookings}</p>
                      <p className="text-xs text-gray-600">Total Bookings</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">₦{customer.totalSpent.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Total Spent</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {customer.averageRating ? customer.averageRating.toFixed(1) : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-600">Avg Rating</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-bold text-gray-900">{formatDate(customer.lastBooking)}</p>
                      <p className="text-xs text-gray-600">Last Booking</p>
                    </div>
                  </div>

                  {/* Preferred Services */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Preferred Services:</p>
                    <div className="flex flex-wrap gap-2">
                      {customer.preferredServices.map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {customer.notes && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900 mb-1">Notes:</p>
                      <p className="text-sm text-blue-800">{customer.notes}</p>
                    </div>
                  )}

                  {/* Timeline Info */}
                  <div className="flex items-center gap-6 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Joined {formatDate(customer.joinDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Last booking {formatDate(customer.lastBooking)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                  
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-1" />
                    Book Service
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        More Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View History
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        View Reviews
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Customer Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Send Newsletter
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No customers found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedStatus !== "all"
                ? "Try adjusting your search or filters" 
                : "Your customers will appear here once you start receiving bookings"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}