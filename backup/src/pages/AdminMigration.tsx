import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { 
  Database, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Info
} from "lucide-react"
import { migrateOldVendorData, checkMigrationNeeded } from "../lib/vendor-migration"

interface MigrationResult {
  storeId: string
  ownerId: string
  shopName: string
}

export default function MigrationPage() {
  const [isChecking, setIsChecking] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [migrationNeeded, setMigrationNeeded] = useState<boolean | null>(null)
  const [migrationResults, setMigrationResults] = useState<MigrationResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const checkMigration = async () => {
    setIsChecking(true)
    setError(null)
    
    try {
      const needed = await checkMigrationNeeded()
      setMigrationNeeded(needed)
    } catch (err: any) {
      setError(`Failed to check migration status: ${err.message}`)
    } finally {
      setIsChecking(false)
    }
  }

  const runMigration = async () => {
    setIsRunning(true)
    setError(null)
    
    try {
      const results = await migrateOldVendorData()
      setMigrationResults(results)
      setMigrationNeeded(false)
    } catch (err: any) {
      setError(`Migration failed: ${err.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Migration</h1>
        <p className="text-gray-600 mt-1">
          Migrate vendor data from single-store to multi-store structure
        </p>
      </div>

      {/* Migration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Check Migration Status</h3>
              <p className="text-sm text-gray-600">
                Check if any vendor data needs to be migrated to the new structure
              </p>
            </div>
            <Button 
              onClick={checkMigration} 
              disabled={isChecking}
              variant="outline"
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Info className="h-4 w-4 mr-2" />
              )}
              {isChecking ? "Checking..." : "Check Status"}
            </Button>
          </div>

          {migrationNeeded !== null && (
            <div className="p-4 rounded-lg border">
              {migrationNeeded ? (
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Migration Required</span>
                  <Badge variant="secondary">Action Needed</Badge>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">No Migration Needed</span>
                  <Badge className="bg-green-100 text-green-800">Up to Date</Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Run Migration */}
      {migrationNeeded && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Play className="h-5 w-5" />
              Run Migration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-amber-700">
              <p className="font-medium mb-2">What this migration will do:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Convert existing vendor records to new multi-store structure</li>
                <li>Create vendor owner documents for existing users</li>
                <li>Preserve all existing data (shop names, logos, etc.)</li>
                <li>Set existing stores as the active store for each user</li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded border border-amber-200">
              <p className="text-sm text-gray-700 mb-3">
                                <strong>Important:</strong> This migration is safe and will not delete any data. 
                However, it’s recommended to backup your database before proceeding.
              </p>
              
              <Button 
                onClick={runMigration} 
                disabled={isRunning}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isRunning ? "Running Migration..." : "Run Migration"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Migration Results */}
      {migrationResults.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Migration Completed Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-4">
              Successfully migrated {migrationResults.length} vendor{migrationResults.length !== 1 ? 's' : ''}:
            </p>
            
            <div className="space-y-2">
              {migrationResults.map((result, index) => (
                <div key={index} className="bg-white p-3 rounded border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{result.shopName}</p>
                      <p className="text-sm text-gray-600">
                        Store ID: {result.storeId} | Owner: {result.ownerId}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Migrated</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Migration Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Before Migration:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Ensure you have admin access to the database</li>
              <li>Consider backing up your Firestore database</li>
              <li>Check that all existing vendors are properly configured</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">After Migration:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Existing vendors will be able to access their stores normally</li>
              <li>Users can create additional stores (up to 3 total)</li>
              <li>All existing products and data will remain intact</li>
              <li>The admin panel will show the new store structure</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}