import { useState } from "react"
import { useAuth } from "../components/auth-provider"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { 
  getServiceProviderByOwnerId, 
  getAllServiceProviders,
  createServiceProvider 
} from "../lib/firebase-service-providers"

export default function FirebaseDebugPage() {
  const { user } = useAuth()
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [testUserId, setTestUserId] = useState("")

  const addResult = (operation: string, result: any) => {
    setResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      operation,
      result: JSON.stringify(result, null, 2)
    }])
  }

  const testGetByOwnerId = async () => {
    if (!user) {
      addResult("Get by Owner ID", "Error: No user logged in")
      return
    }
    
    setLoading(true)
    try {
      const result = await getServiceProviderByOwnerId(user.uid)
      addResult("Get by Owner ID", result || "No service provider found")
    } catch (error: any) {
      addResult("Get by Owner ID", `Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testGetByCustomUserId = async () => {
    if (!testUserId) {
      addResult("Get by Custom User ID", "Error: No user ID provided")
      return
    }
    
    setLoading(true)
    try {
      const result = await getServiceProviderByOwnerId(testUserId)
      addResult("Get by Custom User ID", result || "No service provider found")
    } catch (error: any) {
      addResult("Get by Custom User ID", `Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testGetAllProviders = async () => {
    setLoading(true)
    try {
      const result = await getAllServiceProviders()
      addResult("Get All Providers", `Found ${result.length} providers`)
      result.forEach((provider, index) => {
        addResult(`Provider ${index + 1}`, {
          id: provider.id,
          name: provider.name,
          ownerId: provider.ownerId,
          isApproved: provider.isApproved,
          isActive: provider.isActive
        })
      })
    } catch (error: any) {
      addResult("Get All Providers", `Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testCreateProvider = async () => {
    if (!user) {
      addResult("Create Provider", "Error: No user logged in")
      return
    }
    
    setLoading(true)
    try {
      const providerId = await createServiceProvider({
        ownerId: user.uid,
        name: "Debug Test Provider",
        description: "Test service provider for debugging",
        category: "other",
        contactEmail: user.email || "test..example.com",
        contactPhone: "+234 800 000 0000",
        serviceAreas: ["Lagos"],
        rating: 0,
        reviewCount: 0,
        totalBookings: 0
      })
      addResult("Create Provider", `Created with ID: ${providerId}`)
    } catch (error: any) {
      addResult("Create Provider", `Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Firebase Service Provider Debug</CardTitle>
          <p className="text-gray-600">Test Firebase operations to debug dashboard issues</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Current User</h3>
            <p><strong>UID:</strong> {user?.uid || "Not logged in"}</p>
            <p><strong>Email:</strong> {user?.email || "N/A"}</p>
          </div>

          {/* Test Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={testGetByOwnerId} 
              disabled={loading || !user}
              className="w-full"
            >
              Test Get by Current User ID
            </Button>
            
            <Button 
              onClick={testGetAllProviders} 
              disabled={loading}
              className="w-full"
            >
              Test Get All Providers
            </Button>
            
            <Button 
              onClick={testCreateProvider} 
              disabled={loading || !user}
              className="w-full"
              variant="outline"
            >
              Test Create Provider
            </Button>
            
            <Button 
              onClick={clearResults} 
              disabled={loading}
              className="w-full"
              variant="secondary"
            >
              Clear Results
            </Button>
          </div>

          {/* Custom User ID Test */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Test with specific User ID:</label>
            <div className="flex gap-2">
              <Input
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                placeholder="Enter user ID to test"
                className="flex-1"
              />
              <Button 
                onClick={testGetByCustomUserId}
                disabled={loading || !testUserId}
              >
                Test
              </Button>
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                    <div className="font-medium text-blue-600">
                      [{result.timestamp}] {result.operation}
                    </div>
                    <pre className="mt-1 text-xs text-gray-700 whitespace-pre-wrap">
                      {result.result}
                    </pre>
                  </div>
                )).reverse()}
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Running test...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}