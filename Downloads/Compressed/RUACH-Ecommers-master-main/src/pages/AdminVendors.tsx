import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { 
  Search, 
  Store, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  UserCheck, 
  Calendar, 
  Package, 
  ArrowLeft, 
  Home,
  RefreshCw,
  Loader2,
  X,
  Check,
  Users,
  ShoppingBag
} from "lucide-react"
import { 
  getAllVendors, 
  approveVendor, 
  rejectVendor, 
  getVendorProducts,
  deleteVendor,
  type Vendor 
} from "@/lib/firebase-vendors"
import { getUserProfile, type UserProfile } from "@/lib/firebase-auth"
import { useAdmin } from "@/hooks/use-admin"
import { auth, db } from "@/lib/firebase"

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

// Helper function to format date
const formatDate = (timestamp: any): string => {
  if (!timestamp) return 'Unknown'
  
  let date: Date
  if (timestamp?.toDate) {
    date = timestamp.toDate()
  } else if (timestamp instanceof Date) {
    date = timestamp
  } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    date = new Date(timestamp)
  } else {
    return 'Unknown'
  }
  
  return formatDateDistance(date)
}

type VendorApp = Vendor

interface VendorWithDetails extends Vendor {
  ownerProfile?: UserProfile
  productCount?: number
}

export default function AdminVendorsPage() {
  const { isAdmin, loading: adminLoading } = useAdmin()
  const [vendors, setVendors] = useState<VendorWithDetails[]>([])
  const [pendingVendors, setPendingVendors] = useState<Vendor[]>([])
  const [approvedVendors, setApprovedVendors] = useState<Vendor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("pending")
  const [actionUid, setActionUid] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const vendorsPerPage = 15

  const fetchVendors = async () => {
    if (!isAdmin) return
    
    try {
      setLoading(true)
      setError(null)
      const allVendors = await getAllVendors()
      
      console.log('DEBUG: All vendors fetched:', allVendors)
      console.log('DEBUG: Number of vendors:', allVendors.length)
      
      // Separate pending and approved vendors
      // Handle cases where status might be undefined by falling back to approved/rejected fields
      const pending = allVendors.filter(v => {
        if (v.status) {
          return v.status === 'pending'
        }
        // Fallback: if no status field, check if not approved and not rejected
        return !v.approved && !v.rejected
      })
      
      const approved = allVendors.filter(v => {
        if (v.status) {
          return v.status === 'approved'
        }
        // Fallback: if no status field, check if approved is true
        return v.approved === true
      })
      
      console.log('DEBUG: Pending vendors:', pending.length, pending)
      console.log('DEBUG: Approved vendors:', approved.length, approved)
      
      setPendingVendors(pending)
      setApprovedVendors(approved)
      
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
      
      console.log('DEBUG: Vendors with details:', vendorsWithDetails)
      setVendors(vendorsWithDetails)
    } catch (error) {
      console.error("Error loading vendors:", error)
      setError(error instanceof Error ? error.message : 'Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [isAdmin])

  const handleAction = async (vendorId: string, action: 'approve' | 'reject') => {
    try {
      setActionUid(vendorId)
      
      if (action === 'approve') {
        await approveVendor(vendorId)
      } else {
        // Show confirmation dialog for rejection since it will delete the store
        if (!window.confirm('Are you sure you want to reject this vendor? This will permanently delete the vendor store and all associated data.')) {
          setActionUid(null)
          return
        }
        await rejectVendor(vendorId)
      }
      
      // Refresh vendors list
      await fetchVendors()
    } catch (error) {
      console.error(`Error ${action}ing vendor:`, error)
      setError(`Failed to ${action} vendor`)
    } finally {
      setActionUid(null)
    }
  }

  const handleDeleteStore = async (vendor: Vendor) => {
    try {
      setDeletingId(vendor.id)
      await deleteVendor(vendor.id)
      await fetchVendors()
    } catch (error) {
      console.error('Error deleting vendor:', error)
      setError('Failed to delete vendor')
    } finally {
      setDeletingId(null)
    }
  }

  // Test function to create sample vendor data for debugging
  const createTestVendors = async () => {
    try {
      console.log('Creating test vendors...')
      const { createVendorStore } = await import('@/lib/firebase-vendors')
      
      // Create test vendors with different statuses
      const testVendors = [
        {
          shopName: 'Test Pending Store',
          bio: 'This is a test pending store for debugging',
          logoUrl: ''
        },
        {
          shopName: 'Test Store 2',
          bio: 'Another test store',
          logoUrl: ''
        }
      ]
      
      for (const vendor of testVendors) {
        if (auth.currentUser) {
          await createVendorStore(auth.currentUser.uid, vendor)
        }
      }
      
      console.log('Test vendors created successfully')
      await fetchVendors()
    } catch (error) {
      console.error('Error creating test vendors:', error)
    }
  }

  // Test database connectivity
  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...')
      const { collection, getDocs } = await import('firebase/firestore')
      
      // Try to access the vendors collection directly
      const vendorsRef = collection(db, 'vendors')
      const snapshot = await getDocs(vendorsRef)
      
      console.log('Direct database query results:')
      console.log('Number of documents:', snapshot.size)
      
      snapshot.forEach((doc) => {
        console.log('Document ID:', doc.id)
        console.log('Document data:', doc.data())
      })
      
    } catch (error) {
      console.error('Database connection test failed:', error)
    }
  }

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block">
          <p>Access denied. Admin privileges required.</p>
        </div>
      </div>
    )
  }

  const VendorCard = ({ vendor, isPending = false }: { vendor: VendorApp, isPending?: boolean }) => {
    // Safety check for vendor data
    if (!vendor || !vendor.id) {
      return (
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Store className="h-8 w-8 mx-auto mb-2" />
              <p>Invalid vendor data</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {vendor.logoUrl ? (
              <img 
                src={vendor.logoUrl} 
                alt={vendor.shopName} 
                width={60} 
                height={60} 
                className="rounded-full object-cover border-2 border-gray-200" 
              />
            ) : (
              <div className="w-15 h-15 bg-gray-200 rounded-full flex items-center justify-center">
                <Store className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg truncate">{vendor.shopName}</h3>
              {!isPending && (
                <Badge className="bg-green-100 text-green-800">
                  Approved
                </Badge>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{vendor.bio}</p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Joined {formatDate(vendor.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>Store ID: {vendor.id?.slice(0, 8) || 'N/A'}...</span>
              </div>
              {vendor.ownerId && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>Owner: {vendor.ownerId.slice(0, 8)}...</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!isPending ? (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/vendor/${vendor.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Store
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    Products
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => handleDeleteStore(vendor)}
                    disabled={deletingId === vendor.id}
                  >
                    {deletingId === vendor.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                    Delete
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => handleAction(vendor.id, 'reject')}
                    disabled={actionUid === vendor.id}
                  >
                    {actionUid === vendor.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                    Reject & Delete
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleAction(vendor.id, 'approve')}
                    disabled={actionUid === vendor.id}
                  >
                    {actionUid === vendor.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                    Approve
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    )
  }

  return (
    <>
      {/* Admin Navigation Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/admin" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Back to Admin Dashboard</span>
              </Link>
              <div className="text-gray-300">|</div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Home className="h-4 w-4" />
                <span>/</span>
                <Link to="/admin" className="hover:text-gray-700">Admin</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">Vendors</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/admin/products">
                <Button variant="outline" size="sm">
                  Products
                </Button>
              </Link>
              <Link to="/admin/orders">
                <Button variant="outline" size="sm">
                  Orders
                </Button>
              </Link>
              <Link to="/admin/service-providers">
                <Button variant="outline" size="sm">
                  Service Providers
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600 mt-1">
            Manage vendor applications and approved vendor accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchVendors} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={createTestVendors}>
            Create Test Vendors
          </Button>
          <Button variant="outline" onClick={testDatabaseConnection}>
            Test DB Connection
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              console.log("=== DETAILED DEBUG INFO ===")
              console.log("Current user:", auth.currentUser)
              console.log("Database instance:", db)
              console.log("All vendors state:", vendors)
              console.log("Pending vendors state:", pendingVendors)
              console.log("Approved vendors state:", approvedVendors)
              console.log("Loading state:", loading)
              console.log("Error state:", error)
              console.log("Active tab:", activeTab)
              
              // Test vendor status values
              if (vendors.length > 0) {
                console.log("Vendor status values:")
                vendors.forEach((vendor, index) => {
                  console.log(`Vendor ${index + 1}: ${vendor.shopName}`, {
                    status: vendor.status,
                    approved: vendor.approved,
                    isActive: vendor.isActive,
                    rejected: vendor.rejected
                  })
                })
              }
            }}
          >
            Debug Info
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingVendors.length}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Approved Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedVendors.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active vendors</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingVendors.length + approvedVendors.length}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-500 mt-0.5" />
            </div>
            <div className="flex-1">
              <strong className="font-medium">Error: </strong>
              <span>{error}</span>
              
              <div className="mt-3 text-sm">
                <p className="font-medium mb-2">Possible solutions:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Check if you have admin permissions in your user profile</li>
                  <li>Ensure Firestore security rules allow admin access to the vendors collection</li>
                  <li>Verify that the vendors collection exists in your Firestore database</li>
                  <li>Check if composite indexes are created for the vendors collection</li>
                </ul>
                
                <div className="mt-3 p-2 bg-red-100 rounded text-xs">
                  <p className="font-medium">Required Firestore Security Rule:</p>
                  <code className="block mt-1 font-mono">
                    {`// Allow admin users to read/write vendors
match /vendors/{vendorId} {
  allow read, write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
}`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Pending Applications ({pendingVendors.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved Vendors ({approvedVendors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
            </div>
          ) : pendingVendors.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Applications</h3>
                <p className="text-gray-600">
                  When users apply to become vendors, their applications will appear here for review.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} isPending={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
            </div>
          ) : approvedVendors.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Vendors</h3>
                <p className="text-gray-600">
                  Approved vendors will appear here once you approve their applications.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {approvedVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} isPending={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </>
  )
} 