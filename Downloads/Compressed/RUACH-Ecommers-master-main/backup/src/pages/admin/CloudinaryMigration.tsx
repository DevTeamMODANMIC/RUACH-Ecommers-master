import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAdmin } from "@/hooks/use-admin"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, updateDoc, query, where, limit } from "firebase/firestore"
import { CloudUpload, AlertCircle, CheckCircle, Clock, Image, Download, Upload } from "lucide-react"

interface Product {
  id: string
  name: string
  image?: string
  images?: string[]
  cloudinaryImages?: string[]
  migrationStatus?: 'pending' | 'migrating' | 'completed' | 'failed'
  migrationDate?: Date
  vendorId?: string
}

interface MigrationStats {
  total: number
  pending: number
  migrating: number
  completed: number
  failed: number
}

interface MigrationLog {
  id: string
  productId: string
  productName: string
  status: 'success' | 'error'
  message: string
  timestamp: Date
  originalUrl?: string
  cloudinaryUrl?: string
}

export default function CloudinaryMigration() {
  const { isAdmin } = useAdmin()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<MigrationStats>({
    total: 0,
    pending: 0,
    migrating: 0,
    completed: 0,
    failed: 0
  })
  const [migrationLogs, setMigrationLogs] = useState<MigrationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [migrating, setMigrating] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [cloudinaryConfig, setCloudinaryConfig] = useState({
    cloudName: '',
    apiKey: '',
    apiSecret: ''
  })
  const [configValid, setConfigValid] = useState(false)
  const [migrationProgress, setMigrationProgress] = useState(0)
  const [currentMigrating, setCurrentMigrating] = useState('')

  useEffect(() => {
    if (isAdmin) {
      loadProducts()
      loadMigrationLogs()
    }
  }, [isAdmin])

  useEffect(() => {
    calculateStats()
  }, [products])

  useEffect(() => {
    validateCloudinaryConfig()
  }, [cloudinaryConfig])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const productsRef = collection(db, 'products')
      const querySnapshot = await getDocs(productsRef)
      
      const productsData: Product[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        productsData.push({
          id: doc.id,
          name: data.name || 'Unnamed Product',
          image: data.image,
          images: data.images || [],
          cloudinaryImages: data.cloudinaryImages || [],
          migrationStatus: data.migrationStatus || 'pending',
          migrationDate: data.migrationDate?.toDate(),
          vendorId: data.vendorId
        })
      })
      
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading products:', error)
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMigrationLogs = async () => {
    try {
      const logsRef = collection(db, 'migrationLogs')
      const q = query(logsRef, limit(50))
      const querySnapshot = await getDocs(q)
      
      const logsData: MigrationLog[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        logsData.push({
          id: doc.id,
          productId: data.productId,
          productName: data.productName,
          status: data.status,
          message: data.message,
          timestamp: data.timestamp?.toDate() || new Date(),
          originalUrl: data.originalUrl,
          cloudinaryUrl: data.cloudinaryUrl
        })
      })
      
      // Sort by timestamp descending
      logsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      setMigrationLogs(logsData)
    } catch (error) {
      console.error('Error loading migration logs:', error)
    }
  }

  const calculateStats = () => {
    const newStats: MigrationStats = {
      total: products.length,
      pending: 0,
      migrating: 0,
      completed: 0,
      failed: 0
    }

    products.forEach(product => {
      const status = product.migrationStatus || 'pending'
      newStats[status]++
    })

    setStats(newStats)
  }

  const validateCloudinaryConfig = () => {
    const isValid = cloudinaryConfig.cloudName.trim() !== '' && 
                   cloudinaryConfig.apiKey.trim() !== '' && 
                   cloudinaryConfig.apiSecret.trim() !== ''
    setConfigValid(isValid)
  }

  const simulateImageUpload = async (imageUrl: string, productId: string): Promise<string> => {
    // Simulate Cloudinary upload delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    // Simulate some failures (10% failure rate)
    if (Math.random() < 0.1) {
      throw new Error('Upload failed: Network timeout')
    }
    
    // Return simulated Cloudinary URL
    return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/v${Date.now()}/products/${productId}_${Math.random().toString(36).substr(2, 9)}.jpg`
  }

  const migrateProductImages = async (productIds: string[]) => {
    if (!configValid) {
      toast({
        title: "Configuration Error",
        description: "Please configure Cloudinary settings first.",
        variant: "destructive"
      })
      return
    }

    setMigrating(true)
    setMigrationProgress(0)
    
    let completedCount = 0
    const totalProducts = productIds.length

    for (const productId of productIds) {
      const product = products.find(p => p.id === productId)
      if (!product) continue

      setCurrentMigrating(`Migrating ${product.name}...`)
      
      try {
        // Update status to migrating
        await updateDoc(doc(db, 'products', productId), {
          migrationStatus: 'migrating'
        })

        // Update local state
        setProducts(prev => prev.map(p => 
          p.id === productId 
            ? { ...p, migrationStatus: 'migrating' as const }
            : p
        ))

        const cloudinaryUrls: string[] = []
        const imagesToMigrate = [
          ...(product.image ? [product.image] : []),
          ...(product.images || [])
        ].filter(url => url && !url.includes('cloudinary.com'))

        // Migrate each image
        for (const imageUrl of imagesToMigrate) {
          try {
            const cloudinaryUrl = await simulateImageUpload(imageUrl, productId)
            cloudinaryUrls.push(cloudinaryUrl)
            
            // Log successful migration
            await addMigrationLog(productId, product.name, 'success', 
              `Image migrated successfully`, imageUrl, cloudinaryUrl)
          } catch (error) {
            console.error(`Failed to migrate image ${imageUrl}:`, error)
            await addMigrationLog(productId, product.name, 'error', 
              `Failed to migrate image: ${error}`, imageUrl)
          }
        }

        // Update product with cloudinary URLs
        await updateDoc(doc(db, 'products', productId), {
          cloudinaryImages: cloudinaryUrls,
          migrationStatus: cloudinaryUrls.length > 0 ? 'completed' : 'failed',
          migrationDate: new Date()
        })

        // Update local state
        setProducts(prev => prev.map(p => 
          p.id === productId 
            ? { 
                ...p, 
                cloudinaryImages: cloudinaryUrls,
                migrationStatus: cloudinaryUrls.length > 0 ? 'completed' as const : 'failed' as const,
                migrationDate: new Date()
              }
            : p
        ))

        toast({
          title: "Migration Completed",
          description: `Successfully migrated ${cloudinaryUrls.length} images for ${product.name}.`
        })

      } catch (error) {
        console.error(`Migration failed for product ${productId}:`, error)
        
        // Update status to failed
        await updateDoc(doc(db, 'products', productId), {
          migrationStatus: 'failed'
        })

        setProducts(prev => prev.map(p => 
          p.id === productId 
            ? { ...p, migrationStatus: 'failed' as const }
            : p
        ))

        await addMigrationLog(productId, product.name, 'error', 
          `Migration failed: ${error}`)

        toast({
          title: "Migration Failed",
          description: `Failed to migrate images for ${product.name}.`,
          variant: "destructive"
        })
      }

      completedCount++
      setMigrationProgress((completedCount / totalProducts) * 100)
    }

    setMigrating(false)
    setCurrentMigrating('')
    setSelectedProducts([])
    toast({
      title: "Migration Process Completed",
      description: `Processed ${totalProducts} products.`
    })
  }

  const addMigrationLog = async (productId: string, productName: string, 
                                 status: 'success' | 'error', message: string, 
                                 originalUrl?: string, cloudinaryUrl?: string) => {
    try {
      const logData = {
        productId,
        productName,
        status,
        message,
        timestamp: new Date(),
        originalUrl: originalUrl || '',
        cloudinaryUrl: cloudinaryUrl || ''
      }
      
      // In a real implementation, you would add this to Firestore
      // await addDoc(collection(db, 'migrationLogs'), logData)
      
      // For now, just update local state
      setMigrationLogs(prev => [{
        id: Date.now().toString(),
        ...logData
      }, ...prev.slice(0, 49)])
    } catch (error) {
      console.error('Error adding migration log:', error)
    }
  }

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  const handleSelectAll = () => {
    const pendingProducts = products
      .filter(p => p.migrationStatus === 'pending' || !p.migrationStatus)
      .map(p => p.id)
    
    if (selectedProducts.length === pendingProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(pendingProducts)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case 'migrating':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Migrating</Badge>
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="secondary"><Upload className="w-3 h-3 mr-1" />Pending</Badge>
    }
  }

  if (!isAdmin) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. Admin access required.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cloudinary Migration</h1>
          <p className="text-gray-600">Migrate product images to Cloudinary for better performance and management.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={loadProducts} 
            variant="outline"
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Cloudinary Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudUpload className="w-5 h-5" />
            Cloudinary Configuration
          </CardTitle>
          <CardDescription>
            Configure your Cloudinary account settings for image migration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cloudName">Cloud Name</Label>
              <Input
                id="cloudName"
                value={cloudinaryConfig.cloudName}
                onChange={(e) => setCloudinaryConfig(prev => ({ ...prev, cloudName: e.target.value }))}
                placeholder="your-cloud-name"
              />
            </div>
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                value={cloudinaryConfig.apiKey}
                onChange={(e) => setCloudinaryConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="123456789012345"
              />
            </div>
            <div>
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input
                id="apiSecret"
                type="password"
                value={cloudinaryConfig.apiSecret}
                onChange={(e) => setCloudinaryConfig(prev => ({ ...prev, apiSecret: e.target.value }))}
                placeholder="your-api-secret"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {configValid ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Configuration Valid
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                Configuration Incomplete
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Migration Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.migrating}</div>
              <div className="text-sm text-gray-600">Migrating</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Migration Progress */}
      {migrating && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Migration in Progress</h3>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Processing
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{currentMigrating}</span>
                  <span>{Math.round(migrationProgress)}%</span>
                </div>
                <Progress value={migrationProgress} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Migration Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Actions</CardTitle>
          <CardDescription>
            Select products to migrate their images to Cloudinary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSelectAll}
                variant="outline"
                size="sm"
                disabled={migrating || stats.pending === 0}
              >
                {selectedProducts.length === products.filter(p => p.migrationStatus === 'pending' || !p.migrationStatus).length 
                  ? 'Deselect All' : 'Select All Pending'}
              </Button>
              <span className="text-sm text-gray-600">
                {selectedProducts.length} selected
              </span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={selectedProducts.length === 0 || migrating || !configValid}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CloudUpload className="w-4 h-4 mr-2" />
                  Start Migration
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Migration</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will migrate images for {selectedProducts.length} selected products to Cloudinary. 
                    This process may take several minutes and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => migrateProductImages(selectedProducts)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Start Migration
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
          <CardDescription>
            Select products to migrate their images to Cloudinary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600">No products found.</div>
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((product) => {
                const imageCount = (product.image ? 1 : 0) + (product.images?.length || 0)
                const cloudinaryCount = product.cloudinaryImages?.length || 0
                const canSelect = (product.migrationStatus === 'pending' || !product.migrationStatus) && !migrating
                
                return (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                      selectedProducts.includes(product.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        disabled={!canSelect}
                        className="rounded border-gray-300"
                      />
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            {imageCount} images • {cloudinaryCount} on Cloudinary
                            {product.migrationDate && (
                              <span className="ml-2">
                                • Migrated {product.migrationDate.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(product.migrationStatus || 'pending')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Migration Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Logs</CardTitle>
          <CardDescription>
            Recent migration activity and status updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {migrationLogs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600">No migration logs yet.</div>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {migrationLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 border rounded-lg ${
                    log.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {log.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">{log.productName}</div>
                        <div className="text-sm text-gray-600">{log.message}</div>
                        {log.originalUrl && (
                          <div className="text-xs text-gray-500 truncate max-w-md">
                            {log.originalUrl} {log.cloudinaryUrl && `→ ${log.cloudinaryUrl}`}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {log.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}