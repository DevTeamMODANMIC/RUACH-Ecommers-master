import { useEffect, useState, useCallback } from "react"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { db, auth } from "../lib/firebase"
import { approveVendor, rejectVendor, getApprovedVendors, deleteVendorStore } from "../lib/firebase-vendors"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Loader2, Check, X, RefreshCw, Store, Calendar, Eye, Users, ShoppingBag } from "lucide-react"

import { Link } from "react-router-dom";
import { toast } from "sonner"

interface VendorApp {
  id: string
  ownerId: string
  shopName: string
  bio: string
  logoUrl: string
  createdAt?: any
  approved?: boolean
  isActive?: boolean
}

export default function AdminVendorsPage() {
  const handleDeleteStore = async (vendor: VendorApp) => {
    if (!vendor?.id || !vendor?.ownerId) return
    if (!confirm(`Permanently delete store "${vendor.shopName}"? This cannot be undone.`)) return
    try {
      setDeletingId(vendor.id)
      await deleteVendorStore(vendor.ownerId, vendor.id)
      toast.success(`Deleted store: ${vendor.shopName}`)
      await fetchVendors()
    } catch (e: any) {
      console.error("Admin delete store failed", e)
      toast.error(e?.message || "Failed to delete store")
    } finally {
      setDeletingId(null)
    }
  }
  const [loading, setLoading] = useState(true)
  const [pendingVendors, setPendingVendors] = useState<VendorApp[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [approvedVendors, setApprovedVendors] = useState<VendorApp[]>([])
  const [actionUid, setActionUid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("pending")

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("Fetching vendors...")
      
      // Try to fetch pending vendors with client-side sorting to avoid composite index requirement
      try {
        // Use simple query without orderBy to avoid index requirement
        const pendingQuery = query(
          collection(db, "vendors"),
          where("status", "==", "pending")
        )
        const pendingSnapshot = await getDocs(pendingQuery)
        let fetchedPendingVendors = pendingSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ownerId: data.ownerId || data.uid || '', // Fallback for old data structure
            shopName: data.shopName || '',
            bio: data.bio || '',
            logoUrl: data.logoUrl || '',
            createdAt: data.createdAt,
            approved: data.approved || false,
            isActive: data.isActive !== undefined ? data.isActive : true,
          } as VendorApp
        })
        
        // Filter out rejected vendors and sort client-side
        fetchedPendingVendors = fetchedPendingVendors
          .filter(v => !(v as any).rejected)
          .sort((a, b) => {
            // Sort by createdAt desc (newest first) - client side
            const aTime = a.createdAt?.toDate?.() ? a.createdAt.toDate().getTime() : 0
            const bTime = b.createdAt?.toDate?.() ? b.createdAt.toDate().getTime() : 0
            return bTime - aTime
          })
        
        setPendingVendors(fetchedPendingVendors)
        console.log("Fetched pending vendors (client-side sorted):", fetchedPendingVendors)
      } catch (pendingError: any) {
        console.error("Error fetching pending vendors:", pendingError)
        setPendingVendors([])
      }

      // Try to fetch approved vendors
      try {
        const approvedVendorsList = await getApprovedVendors()
        // Ensure proper data structure for approved vendors
        const formattedApprovedVendors = approvedVendorsList.map(vendor => ({
          id: vendor.id,
          ownerId: vendor.ownerId || '', // Ensure ownerId exists
          shopName: vendor.shopName || '',
          bio: vendor.bio || '',
          logoUrl: vendor.logoUrl || '',
          createdAt: vendor.createdAt,
          approved: vendor.approved || false,
          isActive: vendor.isActive !== undefined ? vendor.isActive : true,
        } as VendorApp))
        setApprovedVendors(formattedApprovedVendors)
        console.log("Fetched approved vendors:", formattedApprovedVendors)
      } catch (approvedError: any) {
        console.error("Error fetching approved vendors:", approvedError)
        // Try direct query as fallback
        try {
          const approvedQuery = query(
            collection(db, "vendors"),
            where("approved", "==", true)
          )
          const approvedSnapshot = await getDocs(approvedQuery)
          const fetchedApprovedVendors = approvedSnapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              ownerId: data.ownerId || data.uid || '', // Fallback for old data structure
              shopName: data.shopName || '',
              bio: data.bio || '',
              logoUrl: data.logoUrl || '',
              createdAt: data.createdAt,
              approved: data.approved || false,
              isActive: data.isActive !== undefined ? data.isActive : true,
            } as VendorApp
          })
          setApprovedVendors(fetchedApprovedVendors)
          console.log("Fetched approved vendors (direct query):", fetchedApprovedVendors)
        } catch (directError: any) {
          console.error("Error with direct approved query:", directError)
          setApprovedVendors([])
        }
      }

    } catch (err: any) {
      console.error("General Firebase Error:", err)
      setError(`Failed to fetch vendors: ${err.message}. This might be due to Firestore security rules or missing indexes.`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Listen for auth state and then check admin access
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError("Access denied: Admin role required")
        setLoading(false)
        return
      }
      try {
        const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)))
        if (userDoc.empty) {
          setError("Access denied: Admin role required")
          setLoading(false)
          return
        }
        const userData = userDoc.docs[0].data()
        if (userData.role !== "admin") {
          setError("Access denied: Admin role required")
          setLoading(false)
          return
        }
        // has admin role
        setError(null)
        await fetchVendors()
      } catch (e) {
        console.log("Could not check user role:", e)
        setError("Access denied: Admin role required")
        setLoading(false)
      }
    })
    return () => unsub()
  }, [fetchVendors])

  const handleAction = async (storeId: string, action: 'approve' | 'reject') => {
    setActionUid(storeId)
    try {
      if (action === 'approve') {
        await approveVendor(storeId)
      } else {
        await rejectVendor(storeId)
      }
      await fetchVendors()
    } catch (err: any) {
      console.error(`Failed to ${action} vendor:`, err)
      setError(`Could not ${action} the vendor. Please try again.`)
    } finally {
      setActionUid(null)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown"
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString()
    } catch {
      return "Unknown"
    }
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
                    Reject
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
          <Button 
            variant="outline" 
            onClick={() => {
              console.log("Testing Firestore connection...")
              console.log("Current user:", auth.currentUser)
              console.log("Database instance:", db)
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
  )
} 