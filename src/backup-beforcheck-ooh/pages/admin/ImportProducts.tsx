import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table"
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Download,
  Trash2,
  Play,
  RefreshCw,
  Package
} from "lucide-react"
import { addProduct, type Product } from "@/lib/firebase-products"
import { MAIN_CATEGORIES } from "@/lib/categories"
import { useAdmin } from "@/hooks/use-admin"

interface CSVProduct {
  name: string
  description: string
  price: number
  category: string
  inStock: boolean
  stockQuantity: number
  origin: string
  tags: string[]
  images: string[]
  weight?: number
  discount?: number
}

interface ImportResult {
  success: boolean
  imported: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

export default function ImportProducts() {
  const { isAdmin, loading } = useAdmin()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVProduct[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const csvTemplate = `name,description,price,category,inStock,stockQuantity,origin,tags,images,weight,discount
"Sample Product","This is a sample product description",29.99,supermarket,true,100,"United Kingdom","organic,fresh,healthy","https://example.com/image1.jpg,https://example.com/image2.jpg",0.5,10
"Another Product","Another sample product",15.50,electronics,true,50,"Nigeria","electronics,gadgets","https://example.com/image3.jpg",1.2,5`

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products_import_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
      parseCSV(file)
    } else {
      alert('Please select a valid CSV file')
    }
  }

  const parseCSV = (file: File) => {
    setIsProcessing(true)
    setValidationErrors([])
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          setValidationErrors(['CSV file must contain at least a header row and one data row'])
          setIsProcessing(false)
          return
        }
        
        const headers = parseCSVLine(lines[0])
        const requiredHeaders = ['name', 'description', 'price', 'category', 'inStock', 'stockQuantity']
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
        
        if (missingHeaders.length > 0) {
          setValidationErrors([`Missing required columns: ${missingHeaders.join(', ')}`])
          setIsProcessing(false)
          return
        }
        
        const products: CSVProduct[] = []
        const errors: string[] = []
        
        for (let i = 1; i < lines.length; i++) {
          try {
            const values = parseCSVLine(lines[i])
            if (values.length !== headers.length) {
              errors.push(`Row ${i + 1}: Column count mismatch`)
              continue
            }
            
            const product: CSVProduct = {
              name: getValue(headers, values, 'name') || '',
              description: getValue(headers, values, 'description') || '',
              price: parseFloat(getValue(headers, values, 'price') || '0'),
              category: getValue(headers, values, 'category') || '',
              inStock: getValue(headers, values, 'inStock')?.toLowerCase() === 'true',
              stockQuantity: parseInt(getValue(headers, values, 'stockQuantity') || '0'),
              origin: getValue(headers, values, 'origin') || 'United Kingdom',
              tags: getValue(headers, values, 'tags')?.split(',').map(t => t.trim()).filter(t => t) || [],
              images: getValue(headers, values, 'images')?.split(',').map(t => t.trim()).filter(t => t) || [],
              weight: getValue(headers, values, 'weight') ? parseFloat(getValue(headers, values, 'weight')!) : undefined,
              discount: getValue(headers, values, 'discount') ? parseFloat(getValue(headers, values, 'discount')!) : undefined
            }
            
            // Validate product
            if (!product.name.trim()) {
              errors.push(`Row ${i + 1}: Product name is required`)
              continue
            }
            if (product.price <= 0) {
              errors.push(`Row ${i + 1}: Price must be greater than 0`)
              continue
            }
            if (!product.category.trim()) {
              errors.push(`Row ${i + 1}: Category is required`)
              continue
            }
            
            products.push(product)
          } catch (error) {
            errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`)
          }
        }
        
        setCsvData(products)
        setValidationErrors(errors)
        
      } catch (error) {
        setValidationErrors(['Failed to parse CSV file'])
      } finally {
        setIsProcessing(false)
      }
    }
    
    reader.readAsText(file)
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  const getValue = (headers: string[], values: string[], header: string): string | undefined => {
    const index = headers.indexOf(header)
    return index !== -1 ? values[index] : undefined
  }

  const importProducts = async () => {
    if (csvData.length === 0) return
    
    setIsImporting(true)
    setImportProgress(0)
    setImportResult(null)
    
    let imported = 0
    let failed = 0
    const errors: Array<{ row: number; error: string }> = []
    
    for (let i = 0; i < csvData.length; i++) {
      try {
        const product = csvData[i]
        
        const productData: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          inStock: product.inStock,
          stockQuantity: product.stockQuantity,
          origin: product.origin,
          availableCountries: ['United Kingdom'], // Default
          tags: product.tags,
          images: product.images,
          weight: product.weight,
          discount: product.discount,
          reviews: { average: 0, count: 0 } // Default
        }
        
        await addProduct(productData)
        imported++
        
        setImportProgress(Math.round(((i + 1) / csvData.length) * 100))
        
        // Small delay to prevent overwhelming Firebase
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        failed++
        errors.push({ 
          row: i + 2, // +2 because CSV is 1-indexed and has header
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    setImportResult({
      success: imported > 0,
      imported,
      failed,
      errors
    })
    
    setIsImporting(false)
  }

  const resetImport = () => {
    setCsvFile(null)
    setCsvData([])
    setValidationErrors([])
    setImportResult(null)
    setImportProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
          <h1 className="text-3xl font-bold mb-2">Import Products</h1>
          <p className="text-gray-600">Bulk import products from CSV files</p>
        </div>

        {/* Template Download */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              CSV Template
            </CardTitle>
            <CardDescription>
              Download the CSV template to ensure your data is formatted correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
              <div>
                <h4 className="font-semibold text-blue-800">Download Template</h4>
                <p className="text-sm text-blue-700">Get the properly formatted CSV template with sample data</p>
              </div>
              <Button onClick={downloadTemplate} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-semibold mb-2">Required Columns:</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <Badge variant="secondary">name</Badge>
                <Badge variant="secondary">description</Badge>
                <Badge variant="secondary">price</Badge>
                <Badge variant="secondary">category</Badge>
                <Badge variant="secondary">inStock</Badge>
                <Badge variant="secondary">stockQuantity</Badge>
              </div>
              <h5 className="font-semibold mb-2 mt-4">Optional Columns:</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <Badge variant="outline">origin</Badge>
                <Badge variant="outline">tags</Badge>
                <Badge variant="outline">images</Badge>
                <Badge variant="outline">weight</Badge>
                <Badge variant="outline">discount</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload CSV File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Label htmlFor="csv-file" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">Choose CSV File</p>
                  <p className="text-sm text-gray-500">Click to select your products CSV file</p>
                </div>
              </Label>
              <Input
                id="csv-file"
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            
            {csvFile && (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-800">{csvFile.name}</span>
                  <Badge className="bg-green-100 text-green-800">
                    {(csvFile.size / 1024).toFixed(1)} KB
                  </Badge>
                </div>
                <Button onClick={resetImport} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processing Status */}
        {isProcessing && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <span className="font-semibold text-blue-800">Processing CSV file...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <XCircle className="h-5 w-5" />
                Validation Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-red-700">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Preview Data */}
        {csvData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Preview Products ({csvData.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 10).map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>£{product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>{product.stockQuantity}</TableCell>
                        <TableCell>
                          {product.inStock ? (
                            <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {csvData.length > 10 && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Showing first 10 of {csvData.length} products
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Import Progress */}
        {isImporting && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="font-semibold text-blue-800">Importing products...</span>
                </div>
                <Progress value={importProgress} className="w-full" />
                <p className="text-sm text-blue-700">{importProgress}% complete</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Import Results */}
        {importResult && (
          <Card className={importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${
                importResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {importResult.success ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                Import Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid grid-cols-2 gap-4 mb-4 text-sm ${
                importResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                <div>Successfully imported: {importResult.imported}</div>
                <div>Failed to import: {importResult.failed}</div>
              </div>
              
              {importResult.errors.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-red-800">Import Errors:</h4>
                  <div className="max-h-32 overflow-auto">
                    <ul className="space-y-1 text-sm text-red-700">
                      {importResult.errors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500">•</span>
                          <span>Row {error.row}: {error.error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Import Actions */}
        {csvData.length > 0 && !isImporting && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Ready to Import</h4>
                  <p className="text-sm text-gray-600">
                    {csvData.length} products ready for import
                    {validationErrors.length > 0 && (
                      <span className="text-red-600"> ({validationErrors.length} errors to fix)</span>
                    )}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={resetImport} variant="outline">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        disabled={validationErrors.length > 0}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Import Products
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Import</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will import {csvData.length} products into your database. 
                          This action cannot be easily undone. Are you sure you want to proceed?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={importProducts}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Yes, Import Products
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}