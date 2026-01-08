import { useState, useEffect, useRef } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { ArrowLeft, Upload, Check, Trash2, Loader2, FileUp, Info, AlertCircle, Copy, Save, Download } from "lucide-react"
import { Link } from "react-router-dom";
import { addProduct, getAllProducts, deleteProduct, getProducts } from "../lib/firebase-products"
import { useToast } from "../hooks/use-toast"
import { useAdmin } from "../hooks/use-admin"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion"
import { Badge } from "../components/ui/badge"
import { Textarea } from "../components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"

// Define category mapping to ensure consistency with shop page
const categoryMapping: Record<string, string> = {
  "Beverages": "drinks",
  "Drinks & Beverages": "drinks",
  "Drinks": "drinks",
  "Food": "food",
  "Flour": "flour",
  "Rice": "rice",
  "Rice & Grains": "rice",
  "Pap/Custard": "pap-custard",
  "Spices": "spices",
  "Spices & Seasonings": "spices",
  "Dried Spices": "dried-spices",
  "Oil": "oil",
  "Provisions": "provisions",
  "Fresh Produce": "fresh-produce",
  "Fresh Vegetables": "fresh-vegetables",
  "Vegetables": "vegetables",
  "Vegetables & Fruits": "vegetables",
  "Meat": "meat",
  "Fish & Meat": "meat",
  "Meat & Fish": "meat"
};

// Import the hardcoded product data from featured-products and product-showcase
const featuredProducts = [
  {
    id: "coca-cola-50cl",
    name: "Coca-Cola 50cl",
    description: "Refreshing Coca-Cola soft drink in a 50cl bottle. Perfect for quenching your thirst.",
    price: 1.20,
    images: ["/product_images/beverages/coke-50cl-250x250.jpg"],
    rating: 4.9,
    reviewCount: 124,
    bestseller: true,
    category: "Beverages",
    inStock: true,
    stockQuantity: 100,
    origin: "United Kingdom",
    availableCountries: ["United Kingdom", "Nigeria"],
    tags: ["beverages", "soft drinks", "cola"]
  },
  {
    id: "fanta-50cl",
    name: "Fanta Orange 50cl",
    description: "Vibrant orange-flavored Fanta soft drink in a 50cl bottle. Sweet, fizzy, and refreshing.",
    price: 1.20,
    images: ["/product_images/beverages/Fanta-PET-Bottles-50cl.jpg"],
    rating: 4.7,
    reviewCount: 86,
    new: true,
    category: "Beverages",
    discount: 10,
    inStock: true,
    stockQuantity: 100,
    origin: "United Kingdom",
    availableCountries: ["United Kingdom", "Nigeria"],
    tags: ["beverages", "soft drinks", "orange"]
  },
  {
    id: "aani-basmati-rice",
    name: "Aani Basmati Rice",
    description: "Premium Aani Basmati Rice - 10kg. Aromatic long grain rice perfect for special meals.",
    price: 19.99,
    images: ["/product_images/rice/Aani-Basmatic-rice-10kg-4-250x250.jpg"],
    rating: 4.9,
    reviewCount: 31,
    category: "Rice & Grains",
    inStock: true,
    stockQuantity: 50,
    origin: "India",
    availableCountries: ["United Kingdom", "Nigeria"],
    tags: ["rice", "basmati", "grains"]
  },
  {
    id: "ayoola-pounded-yam",
    name: "Ayoola Pounded Yam Flour",
    description: "Authentic Ayoola Pounded Yam Flour. Easy to prepare, smooth texture with authentic taste.",
    price: 8.99,
    images: ["/product_images/flour/Ayoola-pounded-yam-250x250.jpg"],
    rating: 4.8,
    reviewCount: 26,
    popular: true,
    category: "Flour",
    inStock: true,
    stockQuantity: 75,
    origin: "Nigeria",
    availableCountries: ["United Kingdom", "Nigeria", "Ghana"],
    tags: ["flour", "pounded yam", "nigerian"]
  },
  {
    id: "cat-fish",
    name: "Cat Fish",
    description: "Fresh Cat Fish. Perfect for traditional Nigerian fish stews and soups.",
    price: 9.99,
    images: ["/product_images/meat/Cat-fish-250x250.jpg"],
    rating: 4.8,
    reviewCount: 17,
    category: "Meat & Fish",
    inStock: true,
    stockQuantity: 30,
    origin: "Nigeria",
    availableCountries: ["United Kingdom"],
    tags: ["fish", "meat", "seafood"]
  },
  {
    id: "everyday-seasoning",
    name: "Everyday Seasoning",
    description: "All-purpose Everyday Seasoning blend. Perfect for enhancing the flavor of any dish.",
    price: 4.50,
    images: ["/product_images/spices/Everyday-seasoning-250x250.jpg"],
    rating: 4.8,
    reviewCount: 28,
    bestseller: true,
    category: "Spices & Seasonings",
    inStock: true,
    stockQuantity: 120,
    origin: "Nigeria",
    availableCountries: ["United Kingdom", "Nigeria", "Ghana"],
    tags: ["spices", "seasoning", "cooking"]
  },
  {
    id: "bitter-leaf",
    name: "Bitter Leaf",
    description: "Fresh Bitter Leaf. Essential ingredient for traditional Nigerian soups and stews.",
    price: 3.50,
    images: ["/product_images/vegetables/Bitter-leaf-250x250.jpg"],
    rating: 4.6,
    reviewCount: 12,
    new: true,
    category: "Vegetables & Fruits",
    inStock: true,
    stockQuantity: 40,
    origin: "Nigeria",
    availableCountries: ["United Kingdom"],
    tags: ["vegetables", "bitter leaf", "soup ingredients"]
  },
  {
    id: "cerelac-honey-wheat",
    name: "Cerelac Honey and Wheat",
    description: "Cerelac Honey and Wheat baby food - 1kg. Nutritious baby cereal with honey and wheat.",
    price: 8.99,
    images: ["/product_images/food/Cerelac-Honey-and-wheat-1kg-1-250x250.jpg"],
    rating: 4.8,
    reviewCount: 24,
    category: "Food",
    inStock: true,
    stockQuantity: 45,
    origin: "United Kingdom",
    availableCountries: ["United Kingdom", "Nigeria"],
    tags: ["food", "baby food", "cereal"]
  }
]

const beverageProducts = [
  {
    id: "sprite-50cl",
    name: "Sprite",
    description: "Refreshing lemon-lime Sprite soft drink in a 50cl bottle.",
    price: 1.20,
    images: ["/product_images/beverages/Sprite-50cl-1-250x250.jpg"],
    rating: 4.8,
    reviewCount: 92,
    category: "Beverages",
    inStock: true,
    stockQuantity: 100,
    origin: "United Kingdom",
    availableCountries: ["United Kingdom", "Nigeria"],
    tags: ["beverages", "soft drinks", "sprite"]
  },
  {
    id: "amstel-malta",
    name: "Amstel Malta",
    description: "Non-Alcoholic Malt Drink - rich in vitamins and nutrients.",
    price: 1.50,
    images: ["/product_images/beverages/Amstel-malta-150x150.jpg"],
    rating: 4.6,
    reviewCount: 58,
    category: "Beverages",
    inStock: true,
    stockQuantity: 80,
    origin: "Nigeria",
    availableCountries: ["United Kingdom", "Nigeria"],
    tags: ["beverages", "malt drink", "non-alcoholic"]
  },
  {
    id: "malta-guinness-pack",
    name: "Malta Guinness",
    description: "Pack of 24 Cans - Premium non-alcoholic malt drink.",
    price: 28.99,
    images: ["/product_images/beverages/malta_guinness_can_(pack_of_24).png"],
    rating: 4.9,
    reviewCount: 73,
    category: "Beverages",
    inStock: true,
    stockQuantity: 40,
    origin: "Nigeria",
    availableCountries: ["United Kingdom", "Nigeria"],
    tags: ["beverages", "malt drink", "non-alcoholic", "bulk"]
  },
  {
    id: "schweppes-chapman",
    name: "Schweppes Chapman",
    description: "Pack of 24 - Refreshing fruit-flavored soft drink.",
    price: 26.99,
    images: ["/product_images/beverages/swhwappes_chapman_pack_of_24.png"],
    rating: 4.8,
    reviewCount: 42,
    category: "Beverages",
    new: true,
    inStock: true,
    stockQuantity: 35,
    origin: "Nigeria",
    availableCountries: ["United Kingdom", "Nigeria"],
    tags: ["beverages", "soft drinks", "chapman", "bulk"]
  },
  {
    id: "lacasera",
    name: "LaCasera",
    description: "Sparkling Apple Drink - Sweet and refreshing.",
    price: 1.35,
    images: ["/product_images/beverages/Lacasara-150x150.jpg"],
    rating: 4.7,
    reviewCount: 36,
    category: "Beverages",
    new: true,
    inStock: true,
    stockQuantity: 90,
    origin: "Nigeria",
    availableCountries: ["United Kingdom", "Nigeria"],
    tags: ["beverages", "soft drinks", "apple"]
  },
  {
    id: "maltina-can",
    name: "Maltina",
    description: "Premium Malt Drink (Can) - Vitamin-rich non-alcoholic beverage.",
    price: 1.40,
    images: ["/product_images/beverages/Maltina-can-150x150.jpg"],
    rating: 4.8,
    reviewCount: 64,
    category: "Beverages",
    inStock: true,
    stockQuantity: 85,
    origin: "Nigeria",
    availableCountries: ["United Kingdom", "Nigeria"],
    tags: ["beverages", "malt drink", "non-alcoholic"]
  }
]

// Add more products from other categories
const additionalProducts = [
  {
    id: "abacha-african-salad",
    name: "Abacha",
    description: "African Salad - Traditional Nigerian delicacy.",
    price: 5.99,
    images: ["/product_images/food/Abacha-250x250.jpg"],
    rating: 4.6,
    reviewCount: 18,
    category: "Food",
    inStock: true,
    stockQuantity: 25,
    origin: "Nigeria",
    availableCountries: ["United Kingdom"],
    tags: ["food", "salad", "nigerian"]
  },
  {
    id: "nigerian-bread",
    name: "Nigerian Bread",
    description: "Traditional Soft Bread - Freshly baked.",
    price: 3.50,
    images: ["/product_images/food/bread-250x250.png"],
    rating: 4.4,
    reviewCount: 12,
    bestseller: true,
    category: "Food",
    inStock: true,
    stockQuantity: 30,
    origin: "Nigeria",
    availableCountries: ["United Kingdom"],
    tags: ["food", "bread", "bakery"]
  },
  {
    id: "butter-mint-sweets",
    name: "Butter Mint Sweets",
    description: "Classic Creamy Mints - Perfect after-dinner treat.",
    price: 2.25,
    images: ["/product_images/food/Butter-mint-sweets-1-250x250.jpg"],
    rating: 4.3,
    reviewCount: 9,
    category: "Food",
    inStock: true,
    stockQuantity: 50,
    origin: "United Kingdom",
    availableCountries: ["United Kingdom", "Nigeria"],
    tags: ["food", "sweets", "candy"]
  },
  {
    id: "bawa-pepper",
    name: "Bawa Pepper",
    description: "Traditional Spice - Adds rich flavor to any dish.",
    price: 3.99,
    images: ["/product_images/spices/Bawa-pepper-250x250.jpg"],
    rating: 4.7,
    reviewCount: 21,
    bestseller: true,
    category: "Spices",
    inStock: true,
    stockQuantity: 60,
    origin: "Nigeria",
    availableCountries: ["United Kingdom", "Nigeria"],
    tags: ["spices", "pepper", "seasoning"]
  },
  {
    id: "ducros-thyme",
    name: "Ducros Thyme",
    description: "Premium Herb - Essential for soups and stews.",
    price: 2.99,
    images: ["/product_images/spices/Ducros-thyme-250x250.jpg"],
    rating: 4.5,
    reviewCount: 16,
    category: "Spices",
    inStock: true,
    stockQuantity: 70,
    origin: "United Kingdom",
    availableCountries: ["United Kingdom", "Nigeria"],
    tags: ["spices", "herbs", "thyme"]
  },
  {
    id: "ayoola-plantain-flour",
    name: "Ayoola Plantain Flour",
    description: "100% Natural Plantains - Perfect for traditional recipes.",
    price: 7.50,
    images: ["/product_images/flour/Ayoola-Plantain-flour-250x250.jpg"],
    rating: 4.6,
    reviewCount: 14,
    category: "Flour",
    inStock: true,
    stockQuantity: 45,
    origin: "Nigeria",
    availableCountries: ["United Kingdom", "Nigeria"],
    tags: ["flour", "plantain", "baking"]
  },
  {
    id: "yam-flour",
    name: "Yam Flour",
    description: "Traditional - 4kg. Perfect for making amala.",
    price: 12.99,
    images: ["/product_images/flour/yam-flour-4kg-250x250.png"],
    rating: 4.7,
    reviewCount: 19,
    category: "Flour",
    inStock: true,
    stockQuantity: 35,
    origin: "Nigeria",
    availableCountries: ["United Kingdom", "Nigeria"],
    tags: ["flour", "yam", "amala"]
  },
  {
    id: "agbalumo",
    name: "Agbalumo",
    description: "African Star Apple - Sweet and tangy tropical fruit.",
    price: 5.99,
    images: ["/product_images/vegetables/Agbalumo-250x250.jpg"],
    rating: 4.7,
    reviewCount: 14,
    new: true,
    category: "Vegetables & Fruits",
    inStock: true,
    stockQuantity: 20,
    origin: "Nigeria",
    availableCountries: ["United Kingdom"],
    tags: ["fruits", "african", "tropical"]
  }
]

// Combine all products
const allProducts = [...featuredProducts, ...beverageProducts, ...additionalProducts]

// Custom JSON import section
function CustomJsonImport({ onImport, existingProducts }: { 
  onImport: (products: any[]) => Promise<void>, 
  existingProducts: any[]
}) {
  const [jsonInput, setJsonInput] = useState<string>('')
  const [isValidJson, setIsValidJson] = useState<boolean>(true)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [parsedProducts, setParsedProducts] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const exampleJson = JSON.stringify([
    {
      "name": "Example Product",
      "description": "This is an example product for import.",
      "price": 9.99,
      "category": "Beverages",
      "images": ["/product_images/example-image.jpg"],
      "inStock": true,
      "stockQuantity": 100
    }
  ], null, 2)

  // Download the example JSON template
  const downloadExample = () => {
    const element = document.createElement('a')
    const file = new Blob([exampleJson], {type: 'application/json'})
    element.href = URL.createObjectURL(file)
    element.download = 'product-import-example.json'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    
    toast({
      title: 'Example Downloaded',
      description: 'JSON template has been downloaded.',
    })
  }

  // Download existing products as JSON
  const downloadExistingProducts = () => {
    if (existingProducts.length === 0) {
      toast({
        title: 'No Products',
        description: 'There are no products to export.',
        variant: 'destructive',
      })
      return
    }
    
    // Format products for export by removing Firebase-specific fields
    const exportedProducts = existingProducts.map(product => {
      const { id, createdAt, updatedAt, lastSyncedAt, firebaseSynced, ...exportProduct } = product
      return exportProduct
    })
    
    const element = document.createElement('a')
    const file = new Blob([JSON.stringify(exportedProducts, null, 2)], {type: 'application/json'})
    element.href = URL.createObjectURL(file)
    element.download = 'exported-products.json'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    
    toast({
      title: 'Products Exported',
      description: `${exportedProducts.length} products exported as JSON.`,
    })
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setJsonInput(content)
      validateJson(content)
    }
    reader.readAsText(file)
  }

  // Validate JSON input
  const validateJson = (input: string) => {
    setIsAnalyzing(true)
    try {
      if (!input.trim()) {
        setIsValidJson(false)
        setJsonError('Please provide JSON input')
        setParsedProducts([])
        setIsAnalyzing(false)
        return false
      }
      
      const parsed = JSON.parse(input)
      
      // Check if it's an array
      if (!Array.isArray(parsed)) {
        setIsValidJson(false)
        setJsonError('JSON must be an array of products')
        setParsedProducts([])
        setIsAnalyzing(false)
        return false
      }
      
      // Validate each product
      const validationErrors: string[] = []
      const validProducts = parsed.filter((product, index) => {
        if (!product.name) {
          validationErrors.push(`Product ${index + 1}: Missing name`)
          return false
        }
        if (!product.price && product.price !== 0) {
          validationErrors.push(`Product "${product.name}": Missing price`)
          return false
        }
        if (!product.category) {
          validationErrors.push(`Product "${product.name}": Missing category`)
          return false
        }
        return true
      })
      
      if (validationErrors.length > 0) {
        setIsValidJson(false)
        setJsonError(`Found ${validationErrors.length} validation errors:\n${validationErrors.join('\n')}`)
        setParsedProducts([])
        setIsAnalyzing(false)
        return false
      }
      
      // Apply category mapping to products
      const mappedProducts = validProducts.map(product => {
        const categoryId = categoryMapping[product.category] || "other"
        const displayCategory = product.category
        
        return {
          ...product,
          category: categoryId,
          displayCategory: displayCategory,
        }
      })
      
      setIsValidJson(true)
      setJsonError(null)
      setParsedProducts(mappedProducts)
      setIsAnalyzing(false)
      return true
    } catch (error) {
      setIsValidJson(false)
      setJsonError(`Invalid JSON: ${(error as Error).message}`)
      setParsedProducts([])
      setIsAnalyzing(false)
      return false
    }
  }

  // Handle import button click
  const handleImportClick = async () => {
    if (!validateJson(jsonInput)) return
    
    setIsUploading(true)
    try {
      await onImport(parsedProducts)
      setJsonInput('')
      setParsedProducts([])
    } catch (error) {
      console.error('Import error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Import Custom Products</h3>
          <p className="text-sm text-gray-500">
            Import products from a JSON file or paste JSON directly
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadExample}
          >
            <Download className="h-4 w-4 mr-2" />
            Example
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={downloadExistingProducts}
            disabled={existingProducts.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Export Current
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                JSON Data
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your JSON data here or upload a file..."
              className="min-h-[200px] font-mono"
            />
          </div>

          {jsonError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>JSON Error</AlertTitle>
              <AlertDescription>
                <pre className="text-xs mt-2 whitespace-pre-wrap">{jsonError}</pre>
              </AlertDescription>
            </Alert>
          )}

          {isValidJson && parsedProducts.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Valid JSON</AlertTitle>
              <AlertDescription>
                Found {parsedProducts.length} valid products to import
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => validateJson(jsonInput)}
              disabled={isAnalyzing || !jsonInput.trim()}
            >
              {isAnalyzing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
              ) : (
                <>Validate JSON</>
              )}
            </Button>

            <Button
              onClick={handleImportClick}
              disabled={!isValidJson || parsedProducts.length === 0 || isUploading}
            >
              {isUploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</>
              ) : (
                <><Upload className="mr-2 h-4 w-4" /> Import {parsedProducts.length} Products</>
              )}
            </Button>
          </div>
        </div>

        {parsedProducts.length > 0 && (
          <Accordion type="single" collapsible>
            <AccordionItem value="parsed-products">
              <AccordionTrigger className="text-sm">
                Show products to be imported ({parsedProducts.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="max-h-60 overflow-y-auto overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2 hidden sm:table-cell">Original Category</th>
                        <th className="text-left p-2 hidden md:table-cell">Mapped Category ID</th>
                        <th className="text-left p-2 hidden sm:table-cell">Price</th>
                        <th className="text-left p-2 hidden lg:table-cell">Images</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {parsedProducts.map((product, index) => {
                        // Check if this product already exists in Firebase by name
                        const existsInFirebase = existingProducts.some(
                          (p) => p.name.toLowerCase() === product.name.toLowerCase()
                        );
                        
                        return (
                          <tr key={index} className={existsInFirebase ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"}>
                            <td className="p-2">
                              {product.name}
                              {existsInFirebase && <span className="ml-1 text-xs text-blue-600">(duplicate)</span>}
                            </td>
                            <td className="p-2 hidden sm:table-cell">{product.displayCategory}</td>
                            <td className="p-2 hidden md:table-cell">{product.category}</td>
                            <td className="p-2 hidden sm:table-cell">£{product.price.toFixed(2)}</td>
                            <td className="p-2 hidden lg:table-cell">{(product.images || []).length} images</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </div>
  )
}

export default function ImportProductsPage() {
  const { toast } = useToast()
  const { isAdmin, loading } = useAdmin()
  const [importing, setImporting] = useState(false)
  const [importedProducts, setImportedProducts] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [removing, setRemoving] = useState(false)
  const [removedCount, setRemovedCount] = useState(0)
  const [detailedError, setDetailedError] = useState<string | null>(null)
  const [existingProducts, setExistingProducts] = useState<any[]>([])
  const [loadingExisting, setLoadingExisting] = useState(true)
  
  // Load existing products from Firebase on component mount
  useEffect(() => {
    async function loadExistingProducts() {
      setLoadingExisting(true)
      try {
        const response = await getProducts({}, 100)
        setExistingProducts(response.products)
        console.log(`Loaded ${response.products.length} existing products from Firebase`)
      } catch (err) {
        console.error("Error loading existing products:", err)
        setError("Failed to load existing products from Firebase")
      } finally {
        setLoadingExisting(false)
      }
    }
    
    if (isAdmin && !loading) {
      loadExistingProducts()
    }
  }, [isAdmin, loading])

  const handleRemoveAll = async () => {
    setRemoving(true)
    setError(null)
    setDetailedError(null)
    
    try {
      // Get all products from Firestore
      const productsResponse = await getProducts({}, 100)
      const products = productsResponse.products
      
      console.log(`Found ${products.length} products to remove`);
      
      // Delete each product
      let count = 0
      for (const product of products) {
        if (product.id) {
          try {
            await deleteProduct(product.id)
            count++
            console.log(`Deleted product: ${product.name} (${product.id})`);
          } catch (err) {
            console.error(`Failed to delete product ${product.id}:`, err);
          }
        }
      }
      
      setRemovedCount(count)
      toast({
        title: "Products Removed",
        description: `Successfully removed ${count} products from the database.`,
        variant: "default",
      })

      // Refresh the product list after removal
      refreshExistingProducts()
    } catch (err: any) {
      console.error("Failed to remove products:", err)
      setError(err.message || "Failed to remove products. Please try again.")
      setDetailedError(JSON.stringify(err, null, 2))
      toast({
        title: "Removal Failed",
        description: err.message || "Failed to remove products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRemoving(false)
    }
  }

  const handleImport = async () => {
    setImporting(true)
    setError(null)
    setDetailedError(null)
    setImportedProducts([])
    
    const successfulImports: string[] = [];

    try {
      console.log(`Starting import of ${allProducts.length} products`);
      
      // Import each product
      for (const product of allProducts) {
        try {
          console.log(`Importing product: ${product.name}`);
          
          // Map the category name to the correct category ID
          const categoryName = product.category;
          const categoryId = categoryMapping[categoryName] || "other";
          
          // Also get the display category name
          const displayCategory = categoryName;
          
          console.log(`Mapped category "${categoryName}" to ID "${categoryId}" with display name "${displayCategory}"`);
          
          // Prepare product data for Firestore
          const productData: any = {
            name: product.name,
            description: product.description,
            price: product.price,
            category: categoryId, // Use the mapped ID
            displayCategory: displayCategory, // Keep the original category name for display
            images: product.images || [],
            inStock: product.inStock || true,
            stockQuantity: product.stockQuantity || 100,
            origin: product.origin || "United Kingdom",
            availableCountries: product.availableCountries || ["United Kingdom"],
            tags: product.tags || [],
            reviews: {
              average: product.rating || 0,
              count: product.reviewCount || 0,
            },
            // Add any UI display properties
            bestseller: product.bestseller || false,
            new: product.new || false,
            popular: product.popular || false,
            discount: product.discount || 0,
            // Ensure Firebase synchronization flags are set
            hasLegacyImages: product.images && product.images.length > 0,
            legacyImageCount: product.images ? product.images.length : 0,
            firebaseSynced: true, // Mark as synced with Firebase
            lastSyncedAt: new Date(),
            // Add these fields required by the schema
            createdAt: new Date(),
            updatedAt: new Date()
          }
          
          // Only add originalPrice if it exists
          if (product.originalPrice) {
            productData.originalPrice = product.originalPrice;
          }

          // Add the product to Firestore
          try {
            console.log("Adding product to Firebase:", {
              name: productData.name,
              category: productData.category,
              displayCategory: productData.displayCategory,
              images: productData.images.length,
            });
            
          const productId = await addProduct(productData)
          console.log(`Successfully imported ${product.name} with ID: ${productId}`);
          successfulImports.push(product.name);
          setImportedProducts(prev => [...prev, product.name])
          } catch (importErr: any) {
            console.error(`Firebase error adding product ${product.name}:`, importErr);
            const errorMessage = importErr.message || "Unknown Firebase error";
            setDetailedError(prev => 
              prev ? 
              `${prev}\n\nFirebase error importing ${product.name}: ${errorMessage}` : 
              `Firebase error importing ${product.name}: ${errorMessage}`
            );
          }
        } catch (productErr: any) {
          console.error(`Error processing product ${product.name}:`, productErr);
          const errorMessage = productErr.message || "Unknown product processing error";
          setDetailedError(prev => 
            prev ? 
            `${prev}\n\nError processing ${product.name || "unnamed product"}: ${errorMessage}` : 
            `Error processing ${product.name || "unnamed product"}: ${errorMessage}`
          );
        }
      }

      if (successfulImports.length > 0) {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${successfulImports.length} products.`,
          variant: "default",
        })
        
        // Refresh the product list after import
        refreshExistingProducts()
      } else {
        toast({
          title: "Import Failed",
          description: "No products were imported. Check the console for details.",
          variant: "destructive",
        })
      }
        } catch (err: any) {
      console.error("Import failed:", err)
      setError(err.message || "Import failed. Please try again.")
      setDetailedError(JSON.stringify(err, null, 2))
      toast({
        title: "Import Failed",
        description: err.message || "Failed to import products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
    }
  }

  // Add a refresh function to reload existing products
  const refreshExistingProducts = async () => {
    setLoadingExisting(true)
    try {
      const response = await getProducts({}, 100)
      setExistingProducts(response.products)
      console.log(`Reloaded ${response.products.length} existing products from Firebase`)
      toast({
        title: "Products Refreshed",
        description: `Loaded ${response.products.length} products from Firebase.`,
        variant: "default",
      })
    } catch (err) {
      console.error("Error refreshing products:", err)
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh products from Firebase.",
        variant: "destructive",
      })
    } finally {
      setLoadingExisting(false)
    }
  }

  // Export custom products to Firebase
  const handleExportCustomProducts = () => {
    toast({
      title: "Feature Not Available",
      description: "Custom product export will be available in a future update.",
      variant: "default",
    })
  }

  // Handle import from custom JSON
  const handleCustomImport = async (products: any[]) => {
    setImporting(true)
    setError(null)
    setDetailedError(null)
    setImportedProducts([])
    
    const successfulImports: string[] = [];
    
    try {
      console.log(`Starting import of ${products.length} custom products`);
      
      // Import each product
      for (const product of products) {
        try {
          console.log(`Importing product: ${product.name}`);
          
          // Prepare product data for Firestore
          const productData: any = {
            name: product.name,
            description: product.description || "",
            price: product.price,
            category: product.category,
            displayCategory: product.displayCategory,
            images: product.images || [],
            inStock: product.inStock !== undefined ? product.inStock : true,
            stockQuantity: product.stockQuantity || 100,
            origin: product.origin || "United Kingdom",
            availableCountries: product.availableCountries || ["United Kingdom"],
            tags: product.tags || [],
            reviews: product.reviews || {
              average: product.rating || 0,
              count: product.reviewCount || 0,
            },
            // Add any UI display properties
            bestseller: product.bestseller || false,
            new: product.new || false,
            popular: product.popular || false,
            discount: product.discount || 0,
            // Ensure Firebase synchronization flags are set
            hasLegacyImages: product.images && product.images.length > 0,
            legacyImageCount: product.images ? product.images.length : 0,
            firebaseSynced: true, // Mark as synced with Firebase
            lastSyncedAt: new Date(),
            // Add these fields required by the schema
            createdAt: new Date(),
            updatedAt: new Date()
          }

          // Add the product to Firestore
          try {
            console.log("Adding product to Firebase:", {
              name: productData.name,
              category: productData.category,
              displayCategory: productData.displayCategory,
              images: productData.images.length,
            });
            
            const productId = await addProduct(productData)
            console.log(`Successfully imported ${product.name} with ID: ${productId}`);
            successfulImports.push(product.name);
            setImportedProducts(prev => [...prev, product.name])
          } catch (importErr: any) {
            console.error(`Firebase error adding product ${product.name}:`, importErr);
            const errorMessage = importErr.message || "Unknown Firebase error";
            setDetailedError(prev => 
              prev ? 
              `${prev}\n\nFirebase error importing ${product.name}: ${errorMessage}` : 
              `Firebase error importing ${product.name}: ${errorMessage}`
            );
          }
        } catch (productErr: any) {
          console.error(`Error processing product ${product.name}:`, productErr);
          const errorMessage = productErr.message || "Unknown product processing error";
          setDetailedError(prev => 
            prev ? 
            `${prev}\n\nError processing ${product.name || "unnamed product"}: ${errorMessage}` : 
            `Error processing ${product.name || "unnamed product"}: ${errorMessage}`
          );
        }
      }

      if (successfulImports.length > 0) {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${successfulImports.length} products.`,
          variant: "default",
        })
        
        // Refresh the product list after import
        refreshExistingProducts()
      } else {
        toast({
          title: "Import Failed",
          description: "No products were imported. Check the console for details.",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("Import failed:", err)
      setError(err.message || "Import failed. Please try again.")
      setDetailedError(JSON.stringify(err, null, 2))
      toast({
        title: "Import Failed",
        description: err.message || "Failed to import products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
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
    return null // Router will redirect in layout
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-center">
        <div>
          <Button variant="outline" size="sm" className="mb-4" asChild>
            <Link to="/admin/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
            <h1 className="text-3xl font-bold">Product Database Management</h1>
          <p className="text-gray-500 mt-2">
              Import, export, and manage your product database.
          </p>
          </div>
        </div>

        {/* Existing Products Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Existing Firebase Products</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshExistingProducts} 
                disabled={loadingExisting}
              >
                {loadingExisting ? 
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading...</> : 
                  <>Refresh</>
                }
              </Button>
            </CardTitle>
            <CardDescription>
              These are the products currently stored in your Firebase database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingExisting ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : existingProducts.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 text-gray-700 p-3 rounded-md text-sm">
                No products found in Firebase. Use the import button below to add sample products.
              </div>
            ) : (
              <Accordion type="single" collapsible>
                <AccordionItem value="existing-products">
                  <AccordionTrigger className="text-sm">
                    Show existing products ({existingProducts.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Category ID</th>
                            <th className="text-left p-2">Display Category</th>
                            <th className="text-left p-2">Last Updated</th>
                            <th className="text-left p-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {existingProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                              <td className="p-2">{product.name}</td>
                              <td className="p-2">{product.category}</td>
                              <td className="p-2">{product.displayCategory || "-"}</td>
                              <td className="p-2">
                                {product.updatedAt ? 
                                  new Date(product.updatedAt.seconds * 1000).toLocaleString() : 
                                  "-"}
                              </td>
                              <td className="p-2">
                                <Button variant="ghost" size="sm" asChild className="h-6 px-2">
                                  <Link to={`/admin/products/edit/${product.id}`}>
                                    Edit
                                  </Link>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-xs text-gray-500">
                        Category Distribution:
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(
                          existingProducts.reduce((acc, product) => {
                            const category = product.category || "uncategorized";
                            acc[category] = (acc[category] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([category, count]) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                window.open("/shop", "_blank");
              }}
            >
              View Shop Page
            </Button>
          </CardFooter>
        </Card>

        {/* Existing Remove Products Card */}
        <Card>
          <CardHeader>
            <CardTitle>Remove Existing Products</CardTitle>
            <CardDescription>
              Remove all existing products from your Firestore database before importing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete all products currently in your Firestore database.
              This action cannot be undone.
            </p>
            {removedCount > 0 && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md text-sm">
                Successfully removed {removedCount} products from the database.
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleRemoveAll} 
              disabled={removing || existingProducts.length === 0}
              variant="destructive"
              className="w-full"
            >
              {removing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Removing Products...</>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove All Products ({existingProducts.length})
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Import Products Card */}
        <Card>
          <CardHeader>
            <CardTitle>Import Products</CardTitle>
            <CardDescription>
              Add products to your Firestore database from various sources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="json" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="demo">Demo Products</TabsTrigger>
                <TabsTrigger value="json">JSON Import</TabsTrigger>
              </TabsList>
              
              <TabsContent value="demo" className="mt-4 space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Import the products shown on the homepage and other example products into your Firebase database. 
                  This will create {allProducts.length} sample products with images, categories, and other metadata.
                </p>
                
                <Accordion type="single" collapsible>
                  <AccordionItem value="products-list">
                    <AccordionTrigger className="text-sm">
                      Show demo products ({allProducts.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="max-h-60 overflow-y-auto overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="text-left p-2">Name</th>
                              <th className="text-left p-2 hidden sm:table-cell">Original Category</th>
                              <th className="text-left p-2 hidden md:table-cell">Mapped Category ID</th>
                              <th className="text-left p-2 hidden sm:table-cell">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {allProducts.map((product) => {
                              const categoryId = categoryMapping[product.category] || "other";
                              // Check if this product already exists in Firebase by name
                              const existsInFirebase = existingProducts.some(
                                (p) => p.name.toLowerCase() === product.name.toLowerCase()
                              );
                              
                              return (
                                <tr key={product.id} className="hover:bg-gray-50">
                                  <td className="p-2">{product.name}</td>
                                  <td className="p-2 hidden sm:table-cell">{product.category}</td>
                                  <td className="p-2 hidden md:table-cell">{categoryId}</td>
                                  <td className="p-2 hidden sm:table-cell">
                                    {importedProducts.includes(product.name) ? (
                                      <span className="text-green-600 flex items-center">
                          <Check className="h-3 w-3 mr-1" /> Imported
                        </span>
                                    ) : existsInFirebase ? (
                                      <span className="text-blue-600 flex items-center">
                                        Already in Firebase
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">Pending</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
              </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
            <Button 
              onClick={handleImport} 
              disabled={importing}
                  className="w-full sm:w-auto"
            >
              {importing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing Products...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                      Import Demo Products
                </>
              )}
            </Button>
              </TabsContent>
              
              <TabsContent value="json" className="mt-4">
                <CustomJsonImport onImport={handleCustomImport} existingProducts={existingProducts} />
              </TabsContent>
            </Tabs>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 mt-4 rounded-md text-sm">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {detailedError && (
              <div className="mt-4">
                <Accordion type="single" collapsible>
                  <AccordionItem value="detailed-error">
                    <AccordionTrigger className="text-red-600 text-sm">
                      Show detailed error information
                    </AccordionTrigger>
                    <AccordionContent>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
                        {detailedError}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
            
            {importedProducts.length > 0 && (
              <div className="mt-4">
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md text-sm mb-2">
                  Successfully imported {importedProducts.length} products.
                </div>
                
                <Accordion type="single" collapsible>
                  <AccordionItem value="imported-products">
                    <AccordionTrigger className="text-sm">
                      Show imported products
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="text-xs space-y-1 max-h-60 overflow-auto">
                        {importedProducts.map((name, i) => (
                          <li key={i} className="text-gray-700">{name}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("Firebase configuration:", {
                  isAdmin,
                  productsToImport: allProducts.length,
                  importedProducts: importedProducts.length,
                  existingProducts: existingProducts.length
                });
                toast({
                  title: "Debug Info",
                  description: "Check browser console for debug information",
                  variant: "default",
                });
              }}
              className="w-full"
            >
              Debug Firebase Connection
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 