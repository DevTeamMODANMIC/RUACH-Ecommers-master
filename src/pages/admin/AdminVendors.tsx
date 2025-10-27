import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Search, Store, CheckCircle, XCircle, Clock, Eye, UserCheck, Calendar, Package } from "lucide-react"
import { 
  getAllVendors, 
  approveVendor, 
  rejectVendor, 
  getVendorProducts,
  type Vendor 
} from "@/lib/firebase-vendors"
import { getUserProfile, type UserProfile } from "@/lib/firebase-auth"
import { useAdmin } from "@/hooks/use-admin"
// import { formatDistanceToNow } from "date-fns"

// Simple date formatting function to replace formatDistanceToNow
const formatDateDistance = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "1 day ago"
  if (diffDays < 30) return `${diffDays} days ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

interface VendorWithDetails extends Vendor {
  ownerProfile?: UserProfile
  productCount?: number
}

export default function AdminVendors() {
  const { isAdmin, loading } = useAdmin()
  const [vendors, setVendors] = useState<VendorWithDetails[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const vendorsPerPage = 15

  useEffect(() => {
    const loadVendors = async () => {
      if (!isAdmin) return
      
      try {
        setIsLoading(true)
        const allVendors = await getAllVendors()
        
        // Fetch additional details for each vendor
        const vendorsWithDetails = await Promise.all(
          allVendors.map(async (vendor) => {
            try {
              // Get owner profile
              const ownerProfile = await getUserProfile(vendor.ownerId)
              
              // Get product count
              const products = await getVendorProducts(vendor.id)
              
              return {
                ...vendor,
                ownerProfile,
                productCount: products.length
              } as VendorWithDetails
            } catch (error) {
              console.error(`Error fetching details for vendor ${vendor.id}:`, error)
              return {
                ...vendor,
                productCount: 0
              } as VendorWithDetails
            }
          })
        )
        
        setVendors(vendorsWithDetails)
      } catch (error) {
        console.error("Error loading vendors:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVendors()
  }, [isAdmin])

  const handleApproveVendor = async (vendorId: string) => {
    try {
      await approveVendor(vendorId)
      setVendors(vendors.map(vendor => 
        vendor.id === vendorId 
          ? { ...vendor, approved: true, status: "approved", rejected: false }
          : vendor
      ))
    } catch (error) {
      console.error("Error approving vendor:", error)
      alert("Failed to approve vendor")
    }
  }

  const handleRejectVendor = async (vendorId: string) => {
    try {
      await rejectVendor(vendorId)
      setVendors(vendors.map(vendor => 
        vendor.id === vendorId 
          ? { ...vendor, approved: false, status: "rejected", rejected: true }
          : vendor
      ))
    } catch (error) {
      console.error("Error rejecting vendor:", error)
      alert("Failed to reject vendor")
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vendor.ownerProfile?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vendor.ownerProfile?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (statusFilter === "pending") {
      matchesStatus = !vendor.approved && !vendor.rejected
    } else if (statusFilter === "approved") {
      matchesStatus = vendor.approved === true
    } else if (statusFilter === "rejected") {
      matchesStatus = vendor.rejected === true
    }
    
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredVendors.length / vendorsPerPage)
  const startIndex = (currentPage - 1) * vendorsPerPage
  const paginatedVendors = filteredVendors.slice(startIndex, startIndex + vendorsPerPage)

  // Statistics
  const stats = {
    total: vendors.length,
    pending: vendors.filter(v => !v.approved && !v.rejected).length,
    approved: vendors.filter(v => v.approved).length,
    rejected: vendors.filter(v => v.rejected).length
  }

  const getStatusBadge = (vendor: Vendor) => {
    if (vendor.approved) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      )
    } else if (vendor.rejected) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      )
    }
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vendor Management</h1>
          <p className="text-gray-600">Review vendor applications and manage vendor accounts</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Store className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Vendors</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-xl font-bold">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-xl font-bold">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search vendors by shop name, owner name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Vendors Table */}
        <Card>
          <CardHeader>
            <CardTitle>Vendors ({filteredVendors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading vendors...</div>
            ) : paginatedVendors.length === 0 ? (
              <div className="text-center py-8">
                <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shop Info</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedVendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              {vendor.logoUrl ? (
                                <img 
                                  src={vendor.logoUrl} 
                                  alt={vendor.shopName}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Store className="h-6 w-6 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{vendor.shopName}</p>
                              <p className="text-sm text-gray-600 line-clamp-1">{vendor.bio}</p>
                              <p className="text-xs text-gray-500">ID: {vendor.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {vendor.ownerProfile?.name || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {vendor.ownerProfile?.email || vendor.ownerId}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{vendor.productCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(vendor)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                              {vendor.createdAt 
                                ? formatDateDistance(vendor.createdAt.toDate())
                                : "Unknown"
                              }
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/vendor/${vendor.id}`}>
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Link>
                            </Button>
                            
                            {!vendor.approved && !vendor.rejected && (
                              <>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Approve
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Approve Vendor</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to approve "{vendor.shopName}"? 
                                        This will allow them to start selling products.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleApproveVendor(vendor.id)}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        Approve
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Reject
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Reject Vendor</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to reject "{vendor.shopName}"? 
                                        This action can be reversed later.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleRejectVendor(vendor.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Reject
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                            
                            {vendor.rejected && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Re-approve
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Re-approve Vendor</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to re-approve "{vendor.shopName}"? 
                                      This will restore their selling privileges.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleApproveVendor(vendor.id)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Re-approve
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}