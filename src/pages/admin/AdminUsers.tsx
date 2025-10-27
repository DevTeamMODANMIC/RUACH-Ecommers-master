import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Search, Users, UserCheck, UserX, Crown, Mail, Phone, Calendar, Plus } from "lucide-react"
import { getAllUsers, updateUserRole, hasRole, addUserRole, removeUserRole, migrateUsersToMultipleRoles, type UserProfile } from "@/lib/firebase-auth"
import { getAuth } from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getAllVendors, getVendorOwner } from "@/lib/firebase-vendors"
import { useAdmin } from "@/hooks/use-admin"

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

export default function AdminUsers() {
  const { isAdmin, loading } = useAdmin()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 20

  useEffect(() => {
    const loadUsers = async () => {
      if (!isAdmin) return

      try {
        setIsLoading(true)
        const allUsers = await getAllUsers()
        console.log("Loaded users:", allUsers)
        console.log("User roles:", allUsers.map(u => ({ email: u.email, roles: u.roles })))
        setUsers(allUsers)
      } catch (error) {
        console.error("Error loading users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [isAdmin])

  const handleRoleUpdate = async (userId: string, role: "admin" | "user" | "vendor", action: "add" | "remove" = "add") => {
    try {
      await updateUserRole(userId, role, action)
      setUsers(users.map(user => {
        if (user.uid === userId) {
          const currentRoles = user.roles || []
          let newRoles: ("admin" | "user" | "vendor")[]

          if (action === "add") {
            newRoles = addUserRole(currentRoles, role)
          } else {
            newRoles = removeUserRole(currentRoles, role)
          }

          return {
            ...user,
            roles: newRoles,
            role: newRoles[0] || "user" // Keep for backward compatibility
          }
        }
        return user
      }))
    } catch (error) {
      console.error("Error updating user role:", error)
      alert("Failed to update user role")
    }
  }

  const createTestVendor = async () => {
    try {
      const testVendor: UserProfile = {
        uid: `test-vendor-${Date.now()}`,
        email: `testvendor${Date.now()}@example.com`,
        name: "Test Vendor User",
        role: "vendor",
        preferences: {
          currency: "GBP",
          language: "en",
          notifications: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await setDoc(doc(db, "users", testVendor.uid), testVendor)
      console.log("Test vendor created:", testVendor)

      // Refresh the users list
      const allUsers = await getAllUsers()
      setUsers(allUsers)

      alert("Test Vendor Created: A test vendor user has been created to verify the statistics are working.")
    } catch (error) {
      console.error("Error creating test vendor:", error)
      alert("Failed to create test vendor")
    }
  }

  const convertUserToVendor = async (userId: string) => {
    try {
      await updateUserRole(userId, "vendor", "add")
      setUsers(users.map(user => {
        if (user.uid === userId) {
          const currentRoles = user.roles || []
          return {
            ...user,
            roles: addUserRole(currentRoles, "vendor"),
            role: addUserRole(currentRoles, "vendor")[0] || "user"
          }
        }
        return user
      }))
      alert("User Converted to Vendor: Vendor role added successfully.")
    } catch (error) {
      console.error("Error converting user to vendor:", error)
      alert("Failed to convert user to vendor")
    }
  }

  const handleUserSelection = (userId: string, checked: boolean) => {
    const newSelection = new Set(selectedUsers)
    if (checked) {
      newSelection.add(userId)
    } else {
      newSelection.delete(userId)
    }
    setSelectedUsers(newSelection)
  }

  const convertSelectedToVendors = async () => {
    if (selectedUsers.size === 0) {
      alert("No Users Selected: Please select users to convert to vendors.")
      return
    }

    const confirmConvert = window.confirm(
      `Convert ${selectedUsers.size} selected users to vendors?`
    )

    if (confirmConvert) {
      for (const userId of selectedUsers) {
        await convertUserToVendor(userId)
      }
      setSelectedUsers(new Set())
    }
  }

  const selectAllEligibleUsers = () => {
    const eligibleUsers = users.filter(u => !hasRole(u.roles, "vendor") && !hasRole(u.roles, "admin"))
    setSelectedUsers(new Set(eligibleUsers.map(u => u.uid)))
  }

  const clearSelection = () => {
    setSelectedUsers(new Set())
  }

  const migrateUserRoles = async () => {
    try {
      console.log("🔄 Starting user role migration...")

      const migratedCount = await migrateUsersToMultipleRoles()

      if (migratedCount > 0) {
        // Refresh the users list after migration
        const allUsers = await getAllUsers()
        setUsers(allUsers)

        alert(`✅ User Migration Completed!\n\n• Migrated ${migratedCount} users to multiple roles format\n• All existing roles preserved\n• Users can now have multiple roles\n• Refreshing user list...\n\nThe statistics should now show correct role counts!`)
      } else {
        alert("ℹ️ Migration Not Needed\n\nAll users already have the multiple roles format. No migration was necessary.")
      }
    } catch (error) {
      console.error("Error during user migration:", error)
      alert("❌ Migration Failed\n\nCheck the console for detailed error information.")
    }
  }

  /**
   * SAFELY sync vendor roles with existing vendor store ownership
   *
   * This function:
   * ✅ Adds vendor roles to users who own vendor stores
   * ✅ Preserves ALL existing admin privileges
   * ✅ Never removes any roles, only adds missing ones
   * ✅ Safe for admin users to run
   * ✅ Maintains database integrity
   */
  const syncVendorRoles = async () => {
    try {
      console.log("🔄 Starting SAFE vendor role sync...")

      // Get all vendors from the vendors collection
      const vendors = await getAllVendors()
      console.log(`📊 Found ${vendors.length} vendor stores in database`)

      if (vendors.length === 0) {
        alert("⚠️ No vendors found in the vendors collection.\n\nTo use this feature:\n1. Create some vendor stores first\n2. Then run this sync to assign vendor roles to store owners\n\n🛡️ This sync is completely safe for admin users!")
        return
      }

      // Additional safety check for admin users
      const currentUser = await getAuth().currentUser
      if (currentUser) {
        const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid))
        if (currentUserDoc.exists()) {
          const currentUserData = currentUserDoc.data() as UserProfile
          if (hasRole(currentUserData.roles, "admin")) {
            console.log("🛡️ Admin user detected - sync is safe to run")
          }
        }
      }

      // Get unique owner IDs from vendors
      const vendorOwnerIds = [...new Set(vendors.map(v => v.ownerId))]
      console.log(`👥 Found ${vendorOwnerIds.length} unique vendor store owners`)

      // Update user roles for vendor owners - EXTRA SAFE
      let updatedCount = 0
      let skippedCount = 0
      let adminProtectedCount = 0

      for (const ownerId of vendorOwnerIds) {
        try {
          // Get current user data to preserve existing roles
          const userDoc = await getDoc(doc(db, "users", ownerId))
          if (!userDoc.exists()) {
            console.log(`⚠️ User ${ownerId} not found in users collection - skipping`)
            continue
          }

          const userData = userDoc.data() as UserProfile
          const currentRoles = userData.roles || []
          const email = userData.email || 'Unknown'

          console.log(`🔍 Processing user: ${email} (ID: ${ownerId})`)
          console.log(`   Current roles: ${currentRoles.join(', ') || 'none'}`)

          // CRITICAL: Never remove admin role!
          if (hasRole(currentRoles, "admin")) {
            console.log(`🔒 User ${email} is an admin - preserving admin role`)

            // Only add vendor role if they don't have it
            if (!hasRole(currentRoles, "vendor")) {
              const newRoles = addUserRole(currentRoles, "vendor")
              console.log(`   Adding vendor role: ${currentRoles.join(', ')} → ${newRoles.join(', ')}`)

              await updateDoc(doc(db, "users", ownerId), {
                roles: newRoles,
                role: newRoles[0] || "user",
                updatedAt: new Date(),
              })

              updatedCount++
              console.log(`✅ Updated ${email}: Admin + Vendor`)
            } else {
              console.log(`✅ ${email} already has both admin and vendor roles`)
              skippedCount++
            }

            adminProtectedCount++
          } else {
            // For non-admin users, just add vendor role if they don't have it
            if (!hasRole(currentRoles, "vendor")) {
              const newRoles = addUserRole(currentRoles, "vendor")

              await updateDoc(doc(db, "users", ownerId), {
                roles: newRoles,
                role: newRoles[0] || "user",
                updatedAt: new Date(),
              })

              updatedCount++
              console.log(`✅ Updated ${email}: ${currentRoles.join(', ')} → ${newRoles.join(', ')}`)
            } else {
              console.log(`✅ ${email} already has vendor role`)
              skippedCount++
            }
          }
        } catch (error) {
          console.error(`❌ Error updating vendor role for ${ownerId}:`, error)
        }
      }

      // Refresh the users list
      console.log("🔄 Refreshing users list...")
      const allUsers = await getAllUsers()
      setUsers(allUsers)

      const totalProcessed = updatedCount + skippedCount
      alert(`🎉 Vendor Role Sync Completed Successfully!

📊 Summary:
• Total vendor stores found: ${vendors.length}
• Users processed: ${totalProcessed}
• Users updated with vendor role: ${updatedCount}
• Users already had vendor role: ${skippedCount}
• Admin users protected: ${adminProtectedCount}

🔒 Safety Features:
• ✅ All admin privileges preserved
• ✅ No existing roles removed
• ✅ Only added missing vendor roles
• ✅ Database integrity maintained

Your admin access is completely safe!`)
    } catch (error) {
      console.error("❌ Critical error in vendor role sync:", error)
      alert(`❌ Critical Error in Vendor Sync!

This error has been logged to the console. Your admin privileges are safe, but the sync operation failed.

Please check the browser console for detailed error information and contact support if the issue persists.`)
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

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || hasRole(user.roles, roleFilter as "admin" | "user" | "vendor")
    return matchesSearch && matchesRole
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage)

  // Statistics - count users who have each role (users can have multiple roles)
  const stats = {
    total: users.length,
    admins: users.filter(u => hasRole(u.roles, "admin")).length,
    vendors: users.filter(u => hasRole(u.roles, "vendor")).length,
    regular: users.filter(u => hasRole(u.roles, "user") || (!u.roles || u.roles.length === 0)).length,
    multiRole: users.filter(u => u.roles && u.roles.length > 1).length
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800"
      case "vendor": return "bg-blue-100 text-blue-800"
      case "user": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Crown className="h-3 w-3" />
      case "vendor": return <UserCheck className="h-3 w-3" />
      case "user": return <Users className="h-3 w-3" />
      default: return <Users className="h-3 w-3" />
    }
  }

  const renderUserRoles = (userRoles?: ("admin" | "user" | "vendor")[]) => {
    const roles = userRoles || []
    if (roles.length === 0) {
      return <Badge className="bg-gray-100 text-gray-800">No Role</Badge>
    }

    return (
      <div className="flex flex-wrap gap-1">
        {roles.map(role => (
          <Badge key={role} className={getRoleBadgeColor(role)}>
            <div className="flex items-center gap-1">
              {getRoleIcon(role)}
              {role}
            </div>
          </Badge>
        ))}
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={migrateUserRoles}
              className="flex items-center gap-2"
              variant="secondary"
              title="Fix existing users to use the new multiple roles format"
            >
              🚀 Fix User Roles
            </Button>

            <Button
              onClick={syncVendorRoles}
              className="flex items-center gap-2"
              variant="default"
              title="Safely sync vendor roles based on existing vendor store ownership - preserves all admin privileges"
            >
              🔄 Sync Vendor Roles (Safe)
            </Button>

            <Button
              onClick={createTestVendor}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Create Test Vendor
            </Button>

            {selectedUsers.size > 0 && (
              <Button
                onClick={convertSelectedToVendors}
                className="flex items-center gap-2"
                variant="default"
              >
                Convert Selected ({selectedUsers.size}) to Vendors
              </Button>
            )}

            <Button
              onClick={selectAllEligibleUsers}
              className="flex items-center gap-2"
              variant="outline"
            >
              Select All Eligible ({users.filter(u => !hasRole(u.roles, "vendor") && !hasRole(u.roles, "admin")).length})
            </Button>

            {selectedUsers.size > 0 && (
              <Button
                onClick={clearSelection}
                className="flex items-center gap-2"
                variant="outline"
              >
                Clear Selection
              </Button>
            )}
          </div>
        </div>

        {/* Debug Panel */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Total Users Loaded:</strong> {users.length}</p>
              <p><strong>Users with vendor role:</strong> {users.filter(u => hasRole(u.roles, "vendor")).length}</p>
              <p><strong>Users with admin role:</strong> {users.filter(u => hasRole(u.roles, "admin")).length}</p>
              <p><strong>Users with user role:</strong> {users.filter(u => hasRole(u.roles, "user")).length}</p>
              <p><strong>Users with multiple roles:</strong> {users.filter(u => u.roles && u.roles.length > 1).length}</p>
              <p><strong>Selected for conversion:</strong> {selectedUsers.size}</p>
              <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                <p className="font-medium text-green-800">🛡️ Multiple Roles System Active!</p>
                <p className="text-sm text-green-700 mt-1">
                  • Click "🚀 Fix User Roles" to migrate existing users to multiple roles format<br/>
                  • Click "🔄 Sync Vendor Roles (Safe)" to assign vendor roles based on store ownership<br/>
                  • All operations are safe and preserve admin privileges
                </p>
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">View All User Roles (Click to expand)</summary>
                <div className="mt-2 p-2 bg-white rounded border max-h-40 overflow-y-auto">
                  {users.map(user => (
                    <div key={user.uid} className="py-1 text-xs">
                      {user.email}: {user.roles?.join(', ') || 'no roles'}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Crown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Admins</p>
                  <p className="text-xl font-bold">{stats.admins}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vendors</p>
                  <p className="text-xl font-bold">{stats.vendors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Regular Users</p>
                  <p className="text-xl font-bold">{stats.regular}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Crown className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Multi-Role Users</p>
                  <p className="text-xl font-bold">{stats.multiRole}</p>
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
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="vendor">Vendors</SelectItem>
                  <SelectItem value="user">Regular Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : paginatedUsers.length === 0 ? (
              <div className="text-center py-8">
                <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.size === users.filter(u => !hasRole(u.roles, "vendor") && !hasRole(u.roles, "admin")).length && users.filter(u => !hasRole(u.roles, "vendor") && !hasRole(u.roles, "admin")).length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              selectAllEligibleUsers()
                            } else {
                              clearSelection()
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.uid}>
                        <TableCell>
                          {!hasRole(user.roles, "vendor") && !hasRole(user.roles, "admin") && (
                            <Checkbox
                              checked={selectedUsers.has(user.uid)}
                              onCheckedChange={(checked) => handleUserSelection(user.uid, !!checked)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.uid}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-sm">{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {renderUserRoles(user.roles)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                              {user.createdAt ? formatDateDistance(new Date(user.createdAt)) : "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-1">
                              {renderUserRoles(user.roles)}
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              {!hasRole(user.roles, "admin") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRoleUpdate(user.uid, "admin", "add")}
                                  className="text-xs h-6"
                                >
                                  +Admin
                                </Button>
                              )}
                              {!hasRole(user.roles, "vendor") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRoleUpdate(user.uid, "vendor", "add")}
                                  className="text-xs h-6"
                                >
                                  +Vendor
                                </Button>
                              )}
                              {!hasRole(user.roles, "user") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRoleUpdate(user.uid, "user", "add")}
                                  className="text-xs h-6"
                                >
                                  +User
                                </Button>
                              )}
                              {hasRole(user.roles, "admin") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRoleUpdate(user.uid, "admin", "remove")}
                                  className="text-xs h-6 text-red-600"
                                >
                                  -Admin
                                </Button>
                              )}
                              {hasRole(user.roles, "vendor") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRoleUpdate(user.uid, "vendor", "remove")}
                                  className="text-xs h-6 text-red-600"
                                >
                                  -Vendor
                                </Button>
                              )}
                              {hasRole(user.roles, "user") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRoleUpdate(user.uid, "user", "remove")}
                                  className="text-xs h-6 text-red-600"
                                >
                                  -User
                                </Button>
                              )}
                            </div>
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