"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Star,
  Users
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data - in real app this would come from API/database
const mockServices = [
  {
    id: "1",
    name: "Home Plumbing Repair",
    category: "plumbing",
    pricingType: "fixed",
    basePrice: 15000,
    duration: 120,
    isActive: true,
    bookings: 24,
    rating: 4.8,
    description: "Complete plumbing repair services for homes and offices",
    serviceAreas: ["Lagos Island", "Victoria Island", "Ikoyi"],
    createdAt: "2024-01-15"
  },
  {
    id: "2", 
    name: "Emergency Leak Fix",
    category: "plumbing",
    pricingType: "hourly",
    hourlyRate: 8000,
    duration: 60,
    isActive: true,
    bookings: 18,
    rating: 4.9,
    description: "24/7 emergency plumbing leak repair service",
    serviceAreas: ["Lagos Island", "Victoria Island"],
    createdAt: "2024-01-20"
  },
  {
    id: "3",
    name: "Bathroom Renovation",
    category: "plumbing", 
    pricingType: "custom",
    duration: 480,
    isActive: false,
    bookings: 3,
    rating: 5.0,
    description: "Complete bathroom renovation and fixture installation",
    serviceAreas: ["Lagos"],
    createdAt: "2024-02-01"
  }
]

const categoryColors = {
  plumbing: "bg-blue-100 text-blue-800",
  electrical: "bg-yellow-100 text-yellow-800", 
  cleaning: "bg-green-100 text-green-800",
  "event-planning": "bg-purple-100 text-purple-800",
  catering: "bg-orange-100 text-orange-800",
  beauty: "bg-pink-100 text-pink-800",
  fitness: "bg-red-100 text-red-800",
  tutoring: "bg-indigo-100 text-indigo-800",
  photography: "bg-gray-100 text-gray-800",
  repairs: "bg-emerald-100 text-emerald-800",
  landscaping: "bg-lime-100 text-lime-800",
  other: "bg-slate-100 text-slate-800"
}

export default function ServicesManagement() {
  const [services, setServices] = useState(mockServices)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleServiceStatus = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, isActive: !service.isActive }
        : service
    ))
  }

  const deleteService = (serviceId: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      setServices(prev => prev.filter(service => service.id !== serviceId))
    }
  }

  const formatPrice = (service: any) => {
    if (service.pricingType === "fixed") {
      return `₦${service.basePrice?.toLocaleString()}`
    } else if (service.pricingType === "hourly") {
      return `₦${service.hourlyRate?.toLocaleString()}/hr`
    } else {
      return "Custom Quote"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-600">Manage your service offerings and pricing</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" asChild>
          <Link to="/vendor/dashboard/services/add">
            <Plus className="h-4 w-4 mr-2" />
            Add New Service
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Services</p>
                <p className="text-2xl font-bold">{services.filter(s => s.isActive).length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{services.reduce((sum, s) => sum + s.bookings, 0)}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
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
                  {(services.reduce((sum, s) => sum + s.rating, 0) / services.length).toFixed(1)}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Service Areas</p>
                <p className="text-2xl font-bold">
                  {new Set(services.flatMap(s => s.serviceAreas)).size}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
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
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Categories</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="cleaning">Cleaning</option>
              <option value="event-planning">Event Planning</option>
              <option value="catering">Catering</option>
              <option value="beauty">Beauty</option>
              <option value="other">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredServices.map((service) => (
          <Card key={service.id} className={`${!service.isActive ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Service Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{service.name}</h3>
                        <Badge className={categoryColors[service.category as keyof typeof categoryColors]}>
                          {service.category}
                        </Badge>
                        <Badge variant={service.isActive ? "default" : "secondary"}>
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatPrice(service)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {service.duration} mins
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {service.bookings} bookings
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          {service.rating}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {service.serviceAreas.length} area{service.serviceAreas.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleServiceStatus(service.id)}
                  >
                    {service.isActive ? (
                      <><EyeOff className="h-4 w-4 mr-1" /> Hide</>
                    ) : (
                      <><Eye className="h-4 w-4 mr-1" /> Show</>
                    )}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Service
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="h-4 w-4 mr-2" />
                        Manage Availability
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        View Reviews
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => deleteService(service.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Service
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No services found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== "all" 
                ? "Try adjusting your search or filters" 
                : "Get started by adding your first service"
              }
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}