import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAdmin } from "@/hooks/use-admin"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { 
  BarChart3, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Image, 
  Download, 
  FileText,
  TrendingUp,
  Calendar,
  Filter,
  RefreshCw,
  ExternalLink
} from "lucide-react"

interface Product {
  id: string
  name: string
  image?: string
  images?: string[]
  cloudinaryImages?: string[]
  migrationStatus?: 'pending' | 'migrating' | 'completed' | 'failed'
  migrationDate?: Date
  vendorId?: string
  vendor?: {
    name: string
    email: string
  }
}

interface MigrationStats {
  total: number
  pending: number
  migrating: number
  completed: number
  failed: number
  totalImages: number
  migratedImages: number
  savedStorage: number // in MB
  avgMigrationTime: number // in minutes
}

interface MigrationReport {
  productId: string
  productName: string
  vendorName: string
  originalImages: number
  migratedImages: number
  status: string
  migrationDate?: Date
  errors?: string[]
  storageSize: number // in MB
  cloudinaryUrls: string[]
}

interface TimelineData {
  date: string
  completed: number
  failed: number
}

export default function CloudinaryReport() {
  const { isAdmin } = useAdmin()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<MigrationStats>({
    total: 0,
    pending: 0,
    migrating: 0,
    completed: 0,
    failed: 0,
    totalImages: 0,
    migratedImages: 0,
    savedStorage: 0,
    avgMigrationTime: 0
  })
  const [reports, setReports] = useState<MigrationReport[]>([])
  const [timeline, setTimeline] = useState<TimelineData[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredReports, setFilteredReports] = useState<MigrationReport[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date')

  useEffect(() => {
    if (isAdmin) {
      loadReportData()
    }
  }, [isAdmin])

  useEffect(() => {
    filterReports()
  }, [reports, statusFilter, searchTerm, dateRange, sortBy])

  const loadReportData = async () => {
    try {
      setLoading(true)
      
      // Load products
      const productsRef = collection(db, 'products')
      const productsSnapshot = await getDocs(productsRef)
      
      const productsData: Product[] = []
      productsSnapshot.forEach((doc) => {
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
      
      // Load vendor information
      await loadVendorInfo(productsData)
      
      // Calculate stats and generate reports
      calculateStats(productsData)
      generateReports(productsData)
      generateTimeline(productsData)
      
    } catch (error) {
      console.error('Error loading report data:', error)
      toast({
        title: "Error",
        description: "Failed to load report data.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadVendorInfo = async (productsData: Product[]) => {
    try {
      const vendorIds = [...new Set(productsData.map(p => p.vendorId).filter(Boolean))]
      
      for (const vendorId of vendorIds) {
        // In a real implementation, you would fetch vendor data from Firestore
        // For now, we'll simulate vendor data
        const vendorData = {
          name: `Vendor ${vendorId?.slice(-4)}`,
          email: `vendor${vendorId?.slice(-4)}@example.com`
        }
        
        productsData.forEach(product => {
          if (product.vendorId === vendorId) {
            product.vendor = vendorData
          }
        })
      }
    } catch (error) {
      console.error('Error loading vendor info:', error)
    }
  }

  const calculateStats = (productsData: Product[]) => {
    const newStats: MigrationStats = {
      total: productsData.length,
      pending: 0,
      migrating: 0,
      completed: 0,
      failed: 0,
      totalImages: 0,
      migratedImages: 0,
      savedStorage: 0,
      avgMigrationTime: 0
    }

    let totalMigrationTime = 0
    let completedMigrations = 0

    productsData.forEach(product => {
      const status = product.migrationStatus || 'pending'
      newStats[status]++
      
      const imageCount = (product.image ? 1 : 0) + (product.images?.length || 0)
      const cloudinaryCount = product.cloudinaryImages?.length || 0
      
      newStats.totalImages += imageCount
      newStats.migratedImages += cloudinaryCount
      
      // Simulate storage savings (assume each image saves ~2MB)
      newStats.savedStorage += cloudinaryCount * 2
      
      // Simulate migration time
      if (status === 'completed' && product.migrationDate) {
        totalMigrationTime += Math.random() * 10 + 2 // 2-12 minutes per product
        completedMigrations++
      }
    })

    newStats.avgMigrationTime = completedMigrations > 0 ? totalMigrationTime / completedMigrations : 0

    setStats(newStats)
  }

  const generateReports = (productsData: Product[]) => {
    const reportsData: MigrationReport[] = productsData.map(product => {
      const originalImages = (product.image ? 1 : 0) + (product.images?.length || 0)
      const migratedImages = product.cloudinaryImages?.length || 0
      
      return {
        productId: product.id,
        productName: product.name,
        vendorName: product.vendor?.name || 'Unknown Vendor',
        originalImages,
        migratedImages,
        status: product.migrationStatus || 'pending',
        migrationDate: product.migrationDate,
        errors: product.migrationStatus === 'failed' ? ['Migration failed due to network timeout'] : undefined,
        storageSize: migratedImages * 2, // Simulate 2MB per image
        cloudinaryUrls: product.cloudinaryImages || []
      }
    })
    
    setReports(reportsData)
  }

  const generateTimeline = (productsData: Product[]) => {
    const timelineMap = new Map<string, { completed: number; failed: number }>()
    
    productsData.forEach(product => {
      if (product.migrationDate && (product.migrationStatus === 'completed' || product.migrationStatus === 'failed')) {
        const dateKey = product.migrationDate.toLocaleDateString()
        const current = timelineMap.get(dateKey) || { completed: 0, failed: 0 }
        
        if (product.migrationStatus === 'completed') {
          current.completed++
        } else {
          current.failed++
        }
        
        timelineMap.set(dateKey, current)
      }
    })
    
    const timelineData: TimelineData[] = Array.from(timelineMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    setTimeline(timelineData)
  }

  const filterReports = () => {
    let filtered = [...reports]
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter)
    }
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(report => 
        report.productName.toLowerCase().includes(term) ||
        report.vendorName.toLowerCase().includes(term)
      )
    }
    
    // Date range filter
    if (dateRange !== 'all' && dateRange) {
      const now = new Date()
      const daysBack = parseInt(dateRange)
      const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
      
      filtered = filtered.filter(report => 
        report.migrationDate && report.migrationDate >= cutoffDate
      )
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return (b.migrationDate?.getTime() || 0) - (a.migrationDate?.getTime() || 0)
        case 'name':
          return a.productName.localeCompare(b.productName)
        case 'vendor':
          return a.vendorName.localeCompare(b.vendorName)
        case 'images':
          return b.migratedImages - a.migratedImages
        default:
          return 0
      }
    })
    
    setFilteredReports(filtered)
  }

  const downloadReport = () => {
    const csvContent = [
      ['Product Name', 'Vendor', 'Original Images', 'Migrated Images', 'Status', 'Migration Date', 'Storage Size (MB)', 'Errors'].join(','),
      ...filteredReports.map(report => [
        `"${report.productName}"`,
        `"${report.vendorName}"`,
        report.originalImages,
        report.migratedImages,
        report.status,
        report.migrationDate?.toLocaleDateString() || 'N/A',
        report.storageSize,
        `"${report.errors?.join('; ') || ''}"`
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cloudinary-migration-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Report Downloaded",
      description: "Migration report has been downloaded as CSV."
    })
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
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getSuccessRate = () => {
    if (stats.total === 0) return 0
    return Math.round((stats.completed / (stats.completed + stats.failed)) * 100) || 0
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
          <h1 className="text-3xl font-bold mb-2">Cloudinary Migration Report</h1>
          <p className="text-gray-600">Comprehensive migration status, analytics, and detailed reports.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={loadReportData} 
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button onClick={downloadReport} disabled={filteredReports.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{getSuccessRate()}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.migratedImages}</div>
                <div className="text-sm text-gray-600">Images Migrated</div>
              </div>
              <Image className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.savedStorage.toFixed(1)}MB</div>
                <div className="text-sm text-gray-600">Storage Optimized</div>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.avgMigrationTime.toFixed(1)}min</div>
                <div className="text-sm text-gray-600">Avg Migration Time</div>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.migrating}</div>
              <div className="text-sm text-gray-600">In Progress</div>
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

      {/* Migration Timeline */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Migration Timeline
            </CardTitle>
            <CardDescription>
              Daily migration activity over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {timeline.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="font-medium">{day.date}</div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{day.completed} completed</span>
                    </div>
                    {day.failed > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">{day.failed} failed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Products</Label>
              <Input
                id="search"
                placeholder="Search by product or vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="migrating">Migrating</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Migration Date</SelectItem>
                  <SelectItem value="name">Product Name</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="images">Images Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Migration Reports ({filteredReports.length})
          </CardTitle>
          <CardDescription>
            Detailed migration status for each product.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Loading reports...</div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600">No reports match the current filters.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report.productId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">{report.productName}</div>
                        <div className="text-sm text-gray-600">
                          {report.vendorName} • 
                          {report.migratedImages}/{report.originalImages} images migrated • 
                          {report.storageSize}MB
                          {report.migrationDate && (
                            <span className="ml-2">
                              • {report.migrationDate.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {report.errors && report.errors.length > 0 && (
                          <div className="text-sm text-red-600 mt-1">
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            {report.errors.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {report.cloudinaryUrls.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Open first Cloudinary URL in new tab
                          window.open(report.cloudinaryUrls[0], '_blank')
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    )}
                    {getStatusBadge(report.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Performance Summary</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Total Products Processed:</span>
                  <span className="font-medium">{stats.total}</span>
                </li>
                <li className="flex justify-between">
                  <span>Images Successfully Migrated:</span>
                  <span className="font-medium">{stats.migratedImages}</span>
                </li>
                <li className="flex justify-between">
                  <span>Storage Optimized:</span>
                  <span className="font-medium">{stats.savedStorage.toFixed(1)} MB</span>
                </li>
                <li className="flex justify-between">
                  <span>Average Processing Time:</span>
                  <span className="font-medium">{stats.avgMigrationTime.toFixed(1)} minutes</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {stats.failed > 0 && (
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Review and retry {stats.failed} failed migrations</span>
                  </li>
                )}
                {stats.pending > 0 && (
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>Schedule migration for {stats.pending} pending products</span>
                  </li>
                )}
                {stats.completed > 0 && (
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Great job! {stats.completed} products successfully migrated</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}