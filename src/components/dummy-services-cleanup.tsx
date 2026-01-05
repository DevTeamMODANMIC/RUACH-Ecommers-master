"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Trash2, AlertTriangle, CheckCircle } from "lucide-react"
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "../lib/firebase"

/**
 * Temporary component to remove dummy services from Firebase
 * 
 * Add this component to your service provider dashboard temporarily,
 * run the cleanup, then remove the component.
 */

export default function DummyServicesCleanup() {
  const [isRemoving, setIsRemoving] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    deletedServices: string[]
  } | null>(null)

  const dummyServiceNames = [
    "Home Plumbing Repair",
    "Emergency Leak Fix", 
    "Bathroom Renovation"
  ]

  const removeDummyServices = async () => {
    setIsRemoving(true)
    setResult(null)
    
    try {
      const deletedServices: string[] = []
      let totalDeleted = 0
      
      // First, get ALL services and filter on client side to avoid caching issues
      console.log("🔍 Fetching all services to find dummy services...")
      const allServicesSnapshot = await getDocs(collection(db, "services"))
      
      console.log(`📊 Found ${allServicesSnapshot.docs.length} total services in database`)
      
      // Find all services that match our dummy service criteria
      const servicesToDelete: { id: string; name: string; data: any }[] = []
      
      allServicesSnapshot.docs.forEach((docSnapshot) => {
        const serviceData = docSnapshot.data()
        const serviceName = serviceData.name || ""
        
        // Check for exact matches
        if (dummyServiceNames.includes(serviceName)) {
          servicesToDelete.push({
            id: docSnapshot.id,
            name: serviceName,
            data: serviceData
          })
        }
        
        // Also check for partial matches (in case names are slightly different)
        const isPlumbingDummy = (
          serviceName.toLowerCase().includes("plumbing") && 
          serviceName.toLowerCase().includes("repair")
        ) || (
          serviceName.toLowerCase().includes("emergency") && 
          serviceName.toLowerCase().includes("leak")
        ) || (
          serviceName.toLowerCase().includes("bathroom") && 
          serviceName.toLowerCase().includes("renovation")
        )
        
        if (isPlumbingDummy && !servicesToDelete.find(s => s.id === docSnapshot.id)) {
          servicesToDelete.push({
            id: docSnapshot.id,
            name: serviceName,
            data: serviceData
          })
        }
      })
      
      console.log(`🎯 Found ${servicesToDelete.length} dummy services to delete:`, servicesToDelete.map(s => s.name))
      
      if (servicesToDelete.length === 0) {
        setResult({
          success: true,
          message: "No dummy services found to delete",
          deletedServices: []
        })
        return
      }
      
      // Delete all found dummy services
      for (const service of servicesToDelete) {
        try {
          console.log(`🗑️  Deleting service: "${service.name}" (ID: ${service.id})`)
          console.log(`   📋 Service details:`, {
            description: service.data.description,
            category: service.data.category,
            price: service.data.basePrice || service.data.hourlyRate || 'Custom'
          })
          
          await deleteDoc(doc(db, "services", service.id))
          deletedServices.push(service.name)
          totalDeleted++
          
          console.log(`✅ Successfully deleted "${service.name}"`)
        } catch (deleteError: any) {
          console.error(`❌ Failed to delete "${service.name}":`, deleteError)
        }
      }
      
      // Force refresh the services list by clearing any potential cache
      if (totalDeleted > 0) {
        console.log("🔄 Clearing potential service cache...")
        
        // Clear localStorage cache if any
        Object.keys(localStorage).forEach(key => {
          if (key.includes('service') || key.includes('firebase')) {
            localStorage.removeItem(key)
          }
        })
        
        // Clear sessionStorage cache if any
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('service') || key.includes('firebase')) {
            sessionStorage.removeItem(key)
          }
        })
      }
      
      setResult({
        success: true,
        message: `Successfully removed ${totalDeleted} dummy services (${deletedServices.length} unique names)`,
        deletedServices
      })
      
    } catch (error: any) {
      console.error("Error removing dummy services:", error)
      setResult({
        success: false,
        message: `Error: ${error.message}`,
        deletedServices: []
      })
    } finally {
      setIsRemoving(false)
    }
  }

  const forceRefreshAndReload = () => {
    // Clear all possible caches
    localStorage.clear()
    sessionStorage.clear()
    
    // Force reload the page
    window.location.reload()
  }

  const showAllServices = async () => {
    try {
      const allServicesSnapshot = await getDocs(collection(db, "services"))
      console.log("=== ALL SERVICES IN DATABASE ===")
      allServicesSnapshot.docs.forEach((doc, index) => {
        const data = doc.data()
        console.log(`${index + 1}. "${data.name}" (ID: ${doc.id})`, {
          category: data.category,
          providerId: data.providerId,
          isActive: data.isActive
        })
      })
      console.log("=== END OF SERVICES LIST ===")
    } catch (error) {
      console.error("Error fetching all services:", error)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto my-8 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-600">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Remove Dummy Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This will permanently remove the following dummy services from your Firebase database:
          </AlertDescription>
        </Alert>
        
        <ul className="list-disc pl-6 space-y-1">
          {dummyServiceNames.map((name, index) => (
            <li key={index} className="text-sm text-gray-600">{name}</li>
          ))}
        </ul>
        
        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
              {result.message}
              {result.success && result.deletedServices.length > 0 && (
                <div className="mt-2">
                  <strong>Deleted services:</strong>
                  <ul className="list-disc pl-4 mt-1">
                    {result.deletedServices.map((service, index) => (
                      <li key={index}>{service}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={removeDummyServices}
            disabled={isRemoving}
            variant="destructive"
            className="flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isRemoving ? "Removing..." : "Remove Dummy Services"}
          </Button>
          
          {result?.success && (
            <Button
              onClick={forceRefreshAndReload}
              variant="outline"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              Force Refresh & Reload
            </Button>
          )}
          
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="ghost"
            size="sm"
          >
            {showAdvanced ? "Hide" : "Show"} Advanced Options
          </Button>
        </div>
        
        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-3">Advanced Debug Options</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={showAllServices}
                variant="outline"
                size="sm"
              >
                List All Services (Check Console)
              </Button>
              <Button
                onClick={() => {
                  localStorage.clear()
                  sessionStorage.clear()
                  alert("Cache cleared! Please refresh the page.")
                }}
                variant="outline"
                size="sm"
              >
                Clear All Cache
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              If services keep coming back, use "List All Services" to see what's in the database,
              then "Clear All Cache" and refresh.
            </p>
          </div>
        )}
        
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Note:</strong> Remove this component from your dashboard after cleanup is complete.
          This is a temporary utility component.
        </div>
      </CardContent>
    </Card>
  )
}