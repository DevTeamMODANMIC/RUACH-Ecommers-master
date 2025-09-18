import { useState } from "react"
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { useAuth } from "../components/auth-provider"
import { useAdmin } from "../hooks/use-admin"
import { CheckCircle, AlertCircle, User, Shield, Settings, Eye, Wrench } from "lucide-react"

export default function AdminTestPage() {
  const { user, profile, isLoading: authLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Access Test</h1>
          <p className="text-gray-600 mt-2">Test admin functionality and access to service provider management</p>
        </div>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Auth Loading:</span>
              <Badge variant={authLoading ? "secondary" : "default"}>
                {authLoading ? "Loading..." : "Ready"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>User Authenticated:</span>
              <Badge variant={user ? "default" : "destructive"}>
                {user ? "Yes" : "No"}
              </Badge>
            </div>
            {user && (
              <>
                <div className="text-sm text-gray-600">
                  <strong>User ID:</strong> {user.uid}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Email:</strong> {user.email}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Display Name:</strong> {user.displayName || "Not set"}
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <span>Profile Loaded:</span>
              <Badge variant={profile ? "default" : "secondary"}>
                {profile ? "Yes" : "No"}
              </Badge>
            </div>
            {profile && (
              <div className="text-sm text-gray-600">
                <strong>Profile Role:</strong> {profile.role || "user"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Admin Access Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Admin Check Loading:</span>
              <Badge variant={adminLoading ? "secondary" : "default"}>
                {adminLoading ? "Loading..." : "Complete"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Admin Access:</span>
              <Badge variant={isAdmin ? "default" : "destructive"}>
                {isAdmin ? "Granted" : "Denied"}
              </Badge>
            </div>
            {!isAdmin && user && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> You need admin role to access the service provider management page.
                  Contact an administrator to grant admin access.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Access Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Quick Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button asChild variant="outline" className="justify-start">
                <Link to="/admin">
                  <Eye className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start" disabled={!isAdmin}>
                <Link to="/admin/service-providers">
                  <Wrench className="h-4 w-4 mr-2" />
                  Service Providers
                </Link>
              </Button>
              
              {!user && (
                <Button asChild variant="default" className="justify-start">
                  <Link to="/login">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
              )}
              
              <Button asChild variant="outline" className="justify-start">
                <Link to="/service-provider/dashboard">
                  <Wrench className="h-4 w-4 mr-2" />
                  Service Provider Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Service Provider Admin Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Service Provider Approval</h4>
                  <p className="text-sm text-gray-600">Review and approve/reject service provider applications</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Provider Management</h4>
                  <p className="text-sm text-gray-600">Suspend, reactivate, and manage service provider accounts</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Search & Filter</h4>
                  <p className="text-sm text-gray-600">Find providers by name, email, status, or category</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Analytics & Stats</h4>
                  <p className="text-sm text-gray-600">View provider statistics, bookings, and revenue data</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Complaint Management</h4>
                  <p className="text-sm text-gray-600">Handle customer complaints about service providers</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Real-time Actions</h4>
                  <p className="text-sm text-gray-600">Instant approval/rejection with Firebase integration</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Access Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <span className="font-medium text-blue-600">1.</span>
                <p>Ensure you're logged in with an admin account</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="font-medium text-blue-600">2.</span>
                <p>Navigate to Admin Dashboard → Service Providers</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="font-medium text-blue-600">3.</span>
                <p>Use the tabs to switch between Overview, Providers, and Complaints</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="font-medium text-blue-600">4.</span>
                <p>Review pending applications and approve/reject as needed</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="font-medium text-blue-600">5.</span>
                <p>Use search and filters to find specific providers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}