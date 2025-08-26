"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { getServiceProviderByOwnerId } from "@/lib/firebase-service-providers"
import { getServicesByProviderId } from "@/lib/firebase-services"
import { ServiceProvider, Service } from "@/types"
import Link from "next/link"
import { RefreshCw, User, Database, Eye, AlertCircle, CheckCircle } from "lucide-react"

export default function ServiceProviderDebugPage() {
  const { user, profile, isLoading: authLoading } = useAuth()
  const [serviceProvider, setServiceProvider] = useState<ServiceProvider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loadingStates, setLoadingStates] = useState({
    serviceProvider: false,
    services: false
  })
  const [errors, setErrors] = useState({
    serviceProvider: null as string | null,
    services: null as string | null
  })
  const [testResults, setTestResults] = useState({
    authCheck: false,
    profileCheck: false,
    serviceProviderCheck: false,
    servicesCheck: false
  })

  const runFullTest = async () => {
    console.log("🧪 Starting full Service Provider test...")
    
    // Reset states
    setLoadingStates({ serviceProvider: true, services: false })
    setErrors({ serviceProvider: null, services: null })
    setTestResults({ authCheck: false, profileCheck: false, serviceProviderCheck: false, servicesCheck: false })
    
    try {
      // Test 1: Auth Check
      if (!user) {
        throw new Error("No authenticated user found")
      }
      setTestResults(prev => ({ ...prev, authCheck: true }))
      console.log("✅ Auth check passed")

      // Test 2: Profile Check
      setTestResults(prev => ({ ...prev, profileCheck: !!profile }))
      console.log("✅ Profile check:", profile ? "Found" : "Not found")

      // Test 3: Service Provider Check
      const sp = await getServiceProviderByOwnerId(user.uid)
      setServiceProvider(sp)
      setTestResults(prev => ({ ...prev, serviceProviderCheck: !!sp }))
      setLoadingStates(prev => ({ ...prev, serviceProvider: false, services: true }))
      console.log("✅ Service Provider check:", sp ? "Found" : "Not found")

      if (sp) {
        // Test 4: Services Check
        const svcs = await getServicesByProviderId(sp.id)
        setServices(svcs)
        setTestResults(prev => ({ ...prev, servicesCheck: true }))
        console.log("✅ Services check passed:", svcs.length, "services found")
      }
      
    } catch (error: any) {
      console.error("❌ Test failed:", error)
      setErrors(prev => ({ ...prev, serviceProvider: error.message }))
    } finally {
      setLoadingStates({ serviceProvider: false, services: false })
    }
  }

  useEffect(() => {
    if (user && !authLoading) {
      runFullTest()
    }
  }, [user, authLoading])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Service Provider Debug Dashboard</h1>
          <Button onClick={runFullTest} disabled={authLoading || loadingStates.serviceProvider}>
            <RefreshCw className={`h-4 w-4 mr-2 ${(authLoading || loadingStates.serviceProvider) ? 'animate-spin' : ''}`} />
            Run Test
          </Button>
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
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                {testResults.authCheck ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className={testResults.authCheck ? "text-green-700" : "text-gray-500"}>
                  Auth Check
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {testResults.profileCheck ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className={testResults.profileCheck ? "text-green-700" : "text-gray-500"}>
                  Profile Check
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {testResults.serviceProviderCheck ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className={testResults.serviceProviderCheck ? "text-green-700" : "text-gray-500"}>
                  Service Provider Check
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {testResults.servicesCheck ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className={testResults.servicesCheck ? "text-green-700" : "text-gray-500"}>
                  Services Check
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Provider Info */}
        <Card>
          <CardHeader>
            <CardTitle>Service Provider Information</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStates.serviceProvider ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading service provider...</span>
              </div>
            ) : errors.serviceProvider ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700">{errors.serviceProvider}</p>
              </div>
            ) : serviceProvider ? (
              <div className="space-y-3">
                <div><strong>ID:</strong> {serviceProvider.id}</div>
                <div><strong>Name:</strong> {serviceProvider.name}</div>
                <div><strong>Description:</strong> {serviceProvider.description}</div>
                <div><strong>Category:</strong> {serviceProvider.category}</div>
                <div><strong>Contact Email:</strong> {serviceProvider.contactEmail}</div>
                <div><strong>Contact Phone:</strong> {serviceProvider.contactPhone}</div>
                <div className="flex items-center space-x-4">
                  <Badge variant={serviceProvider.isApproved ? "default" : "secondary"}>
                    {serviceProvider.isApproved ? "Approved" : "Pending Approval"}
                  </Badge>
                  <Badge variant={serviceProvider.isActive ? "default" : "secondary"}>
                    {serviceProvider.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No service provider profile found</p>
            )}
          </CardContent>
        </Card>

        {/* Services Info */}
        <Card>
          <CardHeader>
            <CardTitle>Services Information</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStates.services ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading services...</span>
              </div>
            ) : services.length > 0 ? (
              <div className="space-y-3">
                <p><strong>Total Services:</strong> {services.length}</p>
                {services.map((service) => (
                  <div key={service.id} className="p-3 border rounded">
                    <div><strong>Name:</strong> {service.name}</div>
                    <div><strong>Category:</strong> {service.category}</div>
                    <div><strong>Pricing:</strong> {service.pricingType}</div>
                    <Badge variant={service.isActive ? "default" : "secondary"}>
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No services found</p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex space-x-3">
              <Button asChild variant="outline">
                <Link href="/service-provider/dashboard">
                  <Eye className="h-4 w-4 mr-2" />
                  View Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/debug/firebase">
                  Firebase Debug
                </Link>
              </Button>
              {!serviceProvider && (
                <Button asChild>
                  <Link href="/vendor/register?type=service-provider">
                    Create Profile
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}