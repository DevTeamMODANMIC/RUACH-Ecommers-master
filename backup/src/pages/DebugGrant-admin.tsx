import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { useAuth } from "../components/auth-provider"
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { CheckCircle, AlertCircle, Shield, User, Loader2 } from "lucide-react"

export default function GrantAdminPage() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [targetEmail, setTargetEmail] = useState("")
  const [currentRole, setCurrentRole] = useState<string | null>(null)

  const checkCurrentRole = async () => {
    if (!user) {
      alert("Please log in first")
      return
    }

    try {
      setLoading(true)
      const userDoc = await getDoc(doc(db, "users", user.uid))
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        setCurrentRole(userData.role || "user")
        alert(`Current role: ${userData.role || "user"}`)
      } else {
        setCurrentRole("No profile found")
        alert("User profile not found")
      }
    } catch (error: any) {
      console.error("Error checking role:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const grantAdminToSelf = async () => {
    if (!user) {
      alert("Please log in first")
      return
    }

    try {
      setLoading(true)
      
      // Create or update user profile with admin role
      const userProfile = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || 'Admin User',
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await setDoc(doc(db, "users", user.uid), userProfile, { merge: true })
      
      alert("Admin role granted successfully!")
      await checkCurrentRole()
      
    } catch (error: any) {
      console.error("Error granting admin role:", error)
      alert(`Failed to grant admin role: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const removeAdminRole = async () => {
    if (!user) {
      alert("Please log in first")
      return
    }

    try {
      setLoading(true)
      
      await updateDoc(doc(db, "users", user.uid), {
        role: "user",
        updatedAt: new Date()
      })
      
      alert("Admin role removed")
      await checkCurrentRole()
      
    } catch (error: any) {
      console.error("Error removing admin role:", error)
      alert(`Failed to remove admin role: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Role Manager</h1>
          <p className="text-gray-600 mt-2">Grant or remove admin access for testing purposes</p>
        </div>

        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Current User Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user ? (
              <>
                <div className="text-sm">
                  <strong>Email:</strong> {user.email}
                </div>
                <div className="text-sm">
                  <strong>User ID:</strong> {user.uid}
                </div>
                <div className="text-sm">
                  <strong>Display Name:</strong> {user.displayName || "Not set"}
                </div>
                <div className="flex items-center space-x-2">
                  <strong>Current Role:</strong>
                  <Badge variant={currentRole === "admin" ? "default" : "secondary"}>
                    {currentRole || "Unknown"}
                  </Badge>
                </div>
                <Button onClick={checkCurrentRole} disabled={loading} variant="outline">
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Check Current Role
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-gray-600">Please log in to manage admin roles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Actions */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Admin Role Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button 
                  onClick={grantAdminToSelf} 
                  disabled={loading}
                  className="w-full"
                  variant={currentRole === "admin" ? "secondary" : "default"}
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
                  Grant Admin Role to Current User
                </Button>
                
                {currentRole === "admin" && (
                  <Button 
                    onClick={removeAdminRole} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                    Remove Admin Role
                  </Button>
                )}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Development Note:</p>
                    <p className="text-yellow-700 mt-1">
                      This page is for development and testing purposes. In production, admin roles should be granted through secure administrative processes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Access Admin Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <span className="font-medium text-blue-600">1.</span>
                <p>Make sure you're logged in to your account</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="font-medium text-blue-600">2.</span>
                <p>Click "Grant Admin Role to Current User" above</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="font-medium text-blue-600">3.</span>
                <p>Navigate to <code>/admin</code> or <code>/admin/service-providers</code></p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="font-medium text-blue-600">4.</span>
                <p>You should now have full admin access to the service provider management system</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button asChild variant="outline">
                <a href="/admin">Admin Dashboard</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/admin/service-providers">Service Providers</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/debug/admin-test">Admin Test Page</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/login">Login Page</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}