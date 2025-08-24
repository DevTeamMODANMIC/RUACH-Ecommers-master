"use client"

import { useState } from "react"
import { collection, query, getDocs, doc, updateDoc, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Package, Loader2 } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  vendorId?: string
  [key: string]: any
}

interface Vendor {
  id: string
  shopName: string
  approved: boolean
  isActive?: boolean
  ownerId: string
  [key: string]: any
}

export default function FixVendorIdMigrationPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    productsWithoutVendorId: Product[]
    productsFixed: number
    errors: string[]
  }>({
    productsWithoutVendorId: [],
    productsFixed: 0,
    errors: []
  })
  const [step, setStep] = useState<'scan' | 'fix' | 'complete'>('scan')

  const scanProducts = async () => {
    setLoading(true)
    try {
      // Find products without vendorId
      const productsQuery = query(collection(db, "products"))
      const productsSnapshot = await getDocs(productsQuery)
      
      const productsWithoutVendorId: Product[] = []
      
      for (const productDoc of productsSnapshot.docs) {
        const product = productDoc.data()
        if (!product.vendorId) {
          productsWithoutVendorId.push({
            id: productDoc.id,
            ...product
          } as Product)
        }
      }

      setResults(prev => ({
        ...prev,
        productsWithoutVendorId
      }))
      
      setStep('fix')
      console.log("Found products without vendorId:", productsWithoutVendorId)
      
    } catch (error) {
      console.error("Error scanning products:", error)
      setResults(prev => ({
        ...prev,
        errors: [...prev.errors, `Scan error: ${error}`]
      }))
    } finally {
      setLoading(false)
    }
  }

  const fixProducts = async () => {
    setLoading(true)
    let fixed = 0
    const errors: string[] = []
    
    try {
      // Get all approved vendors to assign products to
      const vendorsQuery = query(
        collection(db, "vendors"), 
        where("approved", "==", true)
      )
      const vendorsSnapshot = await getDocs(vendorsQuery)
      const approvedVendors = vendorsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vendor[]

      if (approvedVendors.length === 0) {
        errors.push("No approved vendors found. Please approve at least one vendor first.")
        setResults(prev => ({ ...prev, errors }))
        setLoading(false)
        return
      }

      // Use the first approved vendor as default (you can modify this logic)
      const defaultVendor = approvedVendors[0]
      
      // Fix each product without vendorId
      for (const product of results.productsWithoutVendorId) {
        try {
          const productRef = doc(db, "products", product.id)
          await updateDoc(productRef, {
            vendorId: defaultVendor.id
          })
          fixed++
          console.log(`Fixed product ${product.name} - assigned to ${defaultVendor.shopName}`)
        } catch (error) {
          errors.push(`Failed to fix product ${product.name}: ${error}`)
        }
      }

      setResults(prev => ({
        ...prev,
        productsFixed: fixed,
        errors
      }))
      
      setStep('complete')
      
    } catch (error) {
      errors.push(`Fix process error: ${error}`)
      setResults(prev => ({ ...prev, errors }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fix VendorId Migration</h1>
        <p className="text-gray-600 mt-2">
          This tool fixes products that are missing the vendorId field, which prevents them from showing on store pages.
        </p>
      </div>

      {step === 'scan' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Step 1: Scan for Products Missing VendorId
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Click the button below to scan your database for products that don't have a vendorId field.
              These products won't appear on any store pages.
            </p>
            <Button onClick={scanProducts} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                "Scan Products"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'fix' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Scan Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="font-medium">
                  Found {results.productsWithoutVendorId.length} products without vendorId
                </p>
                {results.productsWithoutVendorId.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    These products will be assigned to the first approved vendor. You can reassign them later through the vendor dashboard.
                  </p>
                )}
              </div>
              
              {results.productsWithoutVendorId.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="font-medium">Products to fix:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {results.productsWithoutVendorId.slice(0, 10).map((product) => (
                      <div key={product.id} className="bg-gray-50 p-2 rounded text-sm">
                        <div className="font-medium truncate">{product.name}</div>
                        <div className="text-gray-600">₦{product.price}</div>
                      </div>
                    ))}
                    {results.productsWithoutVendorId.length > 10 && (
                      <div className="text-sm text-gray-600 col-span-2">
                        ...and {results.productsWithoutVendorId.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {results.productsWithoutVendorId.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">All products have vendorId!</span>
                  </div>
                  <p className="text-green-700 mt-1">
                    No products need fixing. The issue might be elsewhere.
                  </p>
                </div>
              ) : (
                <Button onClick={fixProducts} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Fixing Products...
                    </>
                  ) : (
                    `Fix ${results.productsWithoutVendorId.length} Products`
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'complete' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Migration Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="font-medium text-green-800">
                Successfully fixed {results.productsFixed} products
              </p>
              <p className="text-green-700 mt-1">
                Products should now appear on their respective store pages.
              </p>
            </div>
            
            {results.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="font-medium text-red-800 mb-2">Errors:</p>
                <ul className="text-red-700 text-sm space-y-1">
                  {results.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button asChild>
                <a href="/debug/store-products">
                  Check Debug Page
                </a>
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Run Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}