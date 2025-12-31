import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  AlertCircle, 
  Database, 
  Play, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Users, 
  Store,
  ArrowRight,
  Info
} from "lucide-react"
import { migrateOldVendorData, checkMigrationNeeded } from "@/lib/vendor-migration"
import { useAdmin } from "@/hooks/use-admin"

interface MigrationResult {
  success: boolean
  message: string
  migrated: number
  skipped: number
  errors: string[]
}

export default function AdminMigration() {
  const { isAdmin, loading } = useAdmin()
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
  const [migrationProgress, setMigrationProgress] = useState(0)
  const [migrationNeeded, setMigrationNeeded] = useState<boolean | null>(null)
  const [checkingMigration, setCheckingMigration] = useState(false)

  const checkMigrationStatus = async () => {
    setCheckingMigration(true)
    try {
      const needed = await checkMigrationNeeded()
      setMigrationNeeded(needed)
    } catch (error) {
      console.error("Error checking migration status:", error)
      alert("Failed to check migration status")
    } finally {
      setCheckingMigration(false)
    }
  }

  const runMigration = async () => {
    setIsMigrating(true)
    setMigrationProgress(0)
    setMigrationResult(null)

    try {
      // Start migration with progress updates
      setMigrationProgress(25)
      
      await migrateOldVendorData()
      
      setMigrationProgress(75)
      
      // Simulate final steps
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMigrationProgress(100)
      
      setMigrationResult({
        success: true,
        message: "Migration completed successfully!",
        migrated: 0, // This would be updated by the actual migration function
        skipped: 0,
        errors: []
      })
      
      // Check if migration is still needed after completion
      setTimeout(() => {
        checkMigrationStatus()
      }, 1000)
      
    } catch (error: any) {
      console.error("Migration failed:", error)
      setMigrationResult({
        success: false,
        message: "Migration failed",
        migrated: 0,
        skipped: 0,
        errors: [error.message || "Unknown error occurred"]
      })
    } finally {
      setIsMigrating(false)
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

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Data Migration</h1>
          <p className="text-gray-600">Migrate vendor data from old single-store structure to new multi-store system</p>
        </div>

        {/* Migration Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Migration Type</p>
                  <p className="text-lg font-semibold">Vendor Structure</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Target</p>
                  <p className="text-lg font-semibold">Multi-Store System</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Store className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex items-center gap-2">
                    {migrationNeeded === null ? (
                      <Badge variant="secondary">Unknown</Badge>
                    ) : migrationNeeded ? (
                      <Badge variant="destructive">Migration Needed</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">Up to Date</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Migration Information */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Info className="h-5 w-5" />
              Migration Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-700">
            <div className="space-y-4">
              <p>
                This migration converts the old vendor data structure where each vendor had a single store 
                to the new multi-store structure where users can have multiple vendor stores.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold mb-2 text-amber-800">What this migration does:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Converts <code className="bg-amber-100 px-1 rounded">uid</code> field to <code className="bg-amber-100 px-1 rounded">ownerId</code> in vendor documents</li>
                  <li>Creates <code className="bg-amber-100 px-1 rounded">vendorOwners</code> collection to track user stores</li>
                  <li>Sets up proper relationships between users and their stores</li>
                  <li>Maintains all existing vendor data and relationships</li>
                  <li>Enables users to have up to 3 stores per account</li>
                </ul>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-amber-100 rounded-lg border border-amber-300">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  <strong>Note:</strong> This operation is safe and reversible. It only adds new fields and collections without removing existing data.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Migration Control */}
        <Card>
          <CardHeader>
            <CardTitle>Migration Control</CardTitle>
            <CardDescription>
              Check the current migration status and run the migration if needed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Check */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Check Migration Status</h4>
                <p className="text-sm text-gray-600">Verify if migration is required</p>
              </div>
              <Button 
                onClick={checkMigrationStatus}
                disabled={checkingMigration}
                variant="outline"
              >
                {checkingMigration ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Status
                  </>
                )}
              </Button>
            </div>

            {/* Migration Progress */}
            {isMigrating && (
              <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="font-semibold text-blue-800">Migration in progress...</span>
                </div>
                <Progress value={migrationProgress} className="w-full" />
                <p className="text-sm text-blue-700">{migrationProgress}% complete</p>
              </div>
            )}

            {/* Migration Results */}
            {migrationResult && (
              <div className={`p-4 border rounded-lg ${
                migrationResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {migrationResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${
                    migrationResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {migrationResult.message}
                  </span>
                </div>
                
                {migrationResult.success && (
                  <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                    <div>Vendors migrated: {migrationResult.migrated}</div>
                    <div>Vendors skipped: {migrationResult.skipped}</div>
                  </div>
                )}
                
                {migrationResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-red-800 mb-1">Errors:</p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {migrationResult.errors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Migration Action */}
            <div className="flex items-center justify-between p-4 border-2 border-dashed border-amber-300 rounded-lg bg-amber-50">
              <div>
                <h4 className="font-semibold text-amber-800">Run Migration</h4>
                <p className="text-sm text-amber-700">
                  {migrationNeeded === false 
                    ? "Migration has already been completed"
                    : "Convert vendor data to multi-store structure"
                  }
                </p>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    disabled={isMigrating || migrationNeeded === false}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {migrationNeeded === false ? "Already Complete" : "Start Migration"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Migration</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>
                        This will migrate your vendor data from the old single-store structure 
                        to the new multi-store system.
                      </p>
                      <p className="font-semibold">
                        This operation is safe and does not delete any existing data.
                      </p>
                      <p>Are you sure you want to proceed?</p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={runMigration}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Yes, Start Migration
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Migration Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Benefits of Migration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-800">New Features Enabled:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Multiple stores per user (up to 3)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Better store management dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Individual store analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Store switching functionality</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800">Technical Improvements:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span>Improved data structure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span>Better scalability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span>Enhanced user experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span>Future-proof architecture</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}