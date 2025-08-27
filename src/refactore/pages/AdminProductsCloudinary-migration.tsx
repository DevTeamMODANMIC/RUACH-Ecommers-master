import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Link from "react-router-dom"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, UploadCloud, Loader2, AlertCircle } from "lucide-react"
import { auth } from "../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useToast } from "../hooks/use-toast"
import { Product } from "../types"
import { getProducts } from "../lib/firebase-products"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import CloudinaryImage from "../components/cloudinary-image"

export default function CloudinaryMigrationPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState<Record<string, boolean>>({})
  const [products, setProducts] = useState<Product[]>([])
  const [migrating, setMigrating] = useState(false)
  const [migrationResults, setMigrationResults] = useState<Record<string, any>>({})
  const [error, setError] = useState<string | null>(null)
  const [successCount, setSuccessCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)
  const [skippedCount, setSkippedCount] = useState(0)

  useEffect(() => {
    const checkAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Here you would check if the user has admin role
        setIsAdmin(true)
        loadProducts()
      } else {
        setIsAdmin(false)
        navigate("/login")
      }
      setLoading(false)
    })

    return () => checkAuth()
  }, [router])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const result = await getProducts({}, 100)
      setProducts(result.products)
    } catch (err: any) {
      toast({
        title: "Error loading products",
        description: err.message || "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const migrateAllProducts = async () => {
    if (migrating) return
    
    try {
      setMigrating(true)
      setError(null)
      setMigrationResults({})
      
      // Get the current user's ID token
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error("You must be logged in to perform migration")
      }
      
      const idToken = await currentUser.getIdToken()
      
      // Call the migration API endpoint
      const response = await fetch('/api/cloudinary/migrate-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ updateDatabase: true })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Migration failed')
      }
      
      setMigrationResults(data.results || {})
      setSuccessCount(data.stats?.success || 0)
      setFailedCount(data.stats?.failed || 0)
      setSkippedCount(data.stats?.skipped || 0)
      
      toast({
        title: "Migration completed",
        description: `Successfully migrated ${data.stats?.success || 0} products`,
      })
      
      // Reload products to see the updated data
      loadProducts()
    } catch (err: any) {
      setError(err.message || "Migration failed")
      toast({
        title: "Migration failed",
        description: err.message || "Failed to migrate products to Cloudinary",
        variant: "destructive",
      })
    } finally {
      setMigrating(false)
    }
  }

  const migrateSingleProduct = async (productId: string) => {
    if (migrating) return
    
    try {
      setMigrating(true)
      
      // Get the current user's ID token
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error("You must be logged in to perform migration")
      }
      
      const idToken = await currentUser.getIdToken()
      
      // Call the single product migration API endpoint
      const response = await fetch(`/api/cloudinary/migrate/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ updateDatabase: true })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Migration failed')
      }
      
      toast({
        title: "Product migrated",
        description: `Successfully migrated product to Cloudinary`,
      })
      
      // Reload products to see the updated data
      loadProducts()
    } catch (err: any) {
      toast({
        title: "Migration failed",
        description: err.message || "Failed to migrate product to Cloudinary",
        variant: "destructive",
      })
    } finally {
      setMigrating(false)
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Router will redirect
  }

  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto">
        <Button variant="outline" size="sm" className="mb-6" asChild>
          <Link to="/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Cloudinary Migration</h1>
          <p className="text-gray-500 mt-2">
            Migrate product images from URLs to Cloudinary for optimized delivery
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Migration Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Batch Migration</CardTitle>
            <CardDescription>
              Migrate all product images to Cloudinary in a single operation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-2">
                  Total Products: <span className="font-medium">{products.length}</span>
                </p>
                <p className="mb-2">
                  Already Migrated: <span className="font-medium">
                    {products.filter(p => p.cloudinaryMigrated).length}
                  </span>
                </p>
                <p className="mb-2">
                  Pending Migration: <span className="font-medium">
                    {products.filter(p => !p.cloudinaryMigrated).length}
                  </span>
                </p>
              </div>
              <Button 
                onClick={migrateAllProducts} 
                disabled={migrating || products.filter(p => !p.cloudinaryMigrated).length === 0}
                className="ml-auto"
              >
                {migrating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  <>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Migrate All Pending Products
                  </>
                )}
              </Button>
            </div>

            {Object.keys(migrationResults).length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Migration Results</h3>
                <div className="flex gap-4 mb-4">
                  <div className="bg-green-50 text-green-700 px-4 py-2 rounded-md">
                    <p className="font-bold text-lg">{successCount}</p>
                    <p className="text-sm">Successful</p>
                  </div>
                  <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-md">
                    <p className="font-bold text-lg">{skippedCount}</p>
                    <p className="text-sm">Skipped</p>
                  </div>
                  <div className="bg-red-50 text-red-700 px-4 py-2 rounded-md">
                    <p className="font-bold text-lg">{failedCount}</p>
                    <p className="text-sm">Failed</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  {product.cloudinaryImages && product.cloudinaryImages.length > 0 ? (
                    <CloudinaryImage
                      publicId={product.cloudinaryImages[0].publicId}
                      alt={product.name}
                      size="medium"
                      className="w-full h-full object-contain"
                    />
                  ) : product.images && product.images.length > 0 && !imageError[product.id] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain"
                      onError={() => {
                        setImageError(prev => ({ ...prev, [product.id]: true }));
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {product.cloudinaryMigrated ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Migrated
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Migrated
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    ID: {product.id.substring(0, 8)}...
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm">
                      <span className="font-medium">Images: </span>
                      {product.images?.length || 0}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Cloudinary: </span>
                      {product.cloudinaryImages?.length || 0}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => migrateSingleProduct(product.id)}
                      disabled={migrating || product.cloudinaryMigrated}
                    >
                      {migrating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <UploadCloud className="h-4 w-4 mr-2" />
                      )}
                      {product.cloudinaryMigrated ? "Already Migrated" : "Migrate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
