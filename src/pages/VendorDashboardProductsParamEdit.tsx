import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useVendor } from "../hooks/use-vendor"
import { getProduct, updateProduct } from "../lib/firebase-products"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Checkbox } from "../components/ui/checkbox"
import { ArrowLeft, Save, Loader2, X, Image as ImageIcon } from "lucide-react"
import { useToast } from "../components/ui/use-toast"
import { Link } from "react-router-dom";
import { VendorLayout } from "../components/vendor-layout"

import CloudinaryUploadWidget from "../components/cloudinary-upload-widget"
import { MAIN_CATEGORIES } from "../lib/categories"

// Define size options for different categories
const SIZE_OPTIONS = {
  shoes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"],
  kidsShoes: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"],
  clothing: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  kids: ["0-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y", "10-12Y", "12-14Y", "14-16Y"],
  default: ["One Size"]
}

interface ProductFormData {
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  displayCategory: string
  inStock: boolean
  images: string[]
  cloudinaryImages: Array<{ url: string; publicId: string }>
  tags: string[]
  origin: string
  weight?: string
  dimensions?: string
  discount?: number
  size?: string // Add size field
}

// Use centralized categories to match shop page filtering
const categories = MAIN_CATEGORIES.filter(
  (c) => c.id !== "all" && c.subcategories && c.subcategories.length > 0
)

export default function VendorEditProductPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { vendor, loading } = useVendor()
  
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [imageError, setImageError] = useState<Record<string, boolean>>({})
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return
      
      try {
        const productData = await getProduct(productId)
        if (!productData) {
          toast({
            title: "Product not found",
            description: "The requested product could not be found.",
            variant: "destructive"
          })
          navigate("/vendor/dashboard/products")
          return
        }
        
        // Check if user owns this product
        if (productData.vendorId !== vendor?.id) {
          toast({
            title: "Access denied",
            description: "You don't have permission to edit this product.",
            variant: "destructive"
          })
          navigate("/vendor/dashboard/products")
          return
        }
        
        // Extract size from tags if it exists
        let size = ""
        if (productData.tags && Array.isArray(productData.tags)) {
          const sizeTag = productData.tags.find((tag: string) => tag.startsWith("size:"))
          if (sizeTag) {
            size = sizeTag.replace("size:", "")
          }
        }
        
        setProduct({
          ...productData,
          size // Add size to the product state
        })
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: "Error loading product",
          description: "Failed to load product details. Please try again.",
          variant: "destructive"
        })
        navigate("/vendor/dashboard/products")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (vendor && productId) {
      fetchProduct()
    }
  }, [productId, vendor, toast, navigate])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setProduct({
      ...product,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    })
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setProduct({
      ...product,
      [name]: value
    })
  }
  
  // Check if size selection should be shown
  const shouldShowSizeSelection = (category: string, subcategory: string) => {
    // Show size selection for fashion subcategories
    return category === "fashion" && 
      ["mens-fashion", "womens-fashion", "kids-fashion", "shoes"].includes(subcategory)
  }
  
  // Determine which size options to show based on subcategory
  const getSizeOptions = (subcategory: string, productName: string = "") => {
    // Check if subcategory is shoes
    if (subcategory === "shoes") {
      return SIZE_OPTIONS.shoes
    } 
    // Check if subcategory is kids fashion
    else if (subcategory === "kids-fashion") {
      // For kids fashion, we need to determine if it's shoes or clothing
      // We'll show kids clothing sizes by default, but this could be enhanced
      // to detect specific items within the subcategory
      // For now, we'll use a simple approach - if the product name contains
      // shoe-related keywords, show kids shoe sizes
      const lowerName = productName.toLowerCase();
      const shoeKeywords = ["shoe", "sneaker", "boot", "sandal", "slipper", "footwear"];
      const isKidsShoe = shoeKeywords.some(keyword => lowerName.includes(keyword));
      
      return isKidsShoe ? SIZE_OPTIONS.kidsShoes : SIZE_OPTIONS.kids
    } 
    // Check if subcategory is other fashion
    else if (["mens-fashion", "womens-fashion"].includes(subcategory)) {
      return SIZE_OPTIONS.clothing
    }
    
    return SIZE_OPTIONS.default
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || !productId) return
    
    setIsSaving(true)
    
    try {
      // Validate required fields
      if (!product.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Product name is required.",
          variant: "destructive"
        })
        return
      }
      
      if (!product.price || product.price <= 0) {
        toast({
          title: "Validation Error",
          description: "Valid product price is required.",
          variant: "destructive"
        })
        return
      }
      
      if (!product.category) {
        toast({
          title: "Validation Error",
          description: "Product category is required.",
          variant: "destructive"
        })
        return
      }
      
      if (product.cloudinaryImages.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one product image is required.",
          variant: "destructive"
        })
        return
      }
      
      // For fashion categories that require size, require size selection
      const showSizeSelection = shouldShowSizeSelection(product.category, product.subcategory || product.category)
      if (showSizeSelection && !product.size) {
        toast({
          title: "Validation Error",
          description: "Please select a size for fashion products.",
          variant: "destructive"
        })
        return
      }
      
      // Prepare tags including size if applicable
      let tags = product.tags || []
      if (product.size) {
        // Remove any existing size tags
        tags = tags.filter((tag: string) => !tag.startsWith("size:"))
        // Add the new size tag
        tags.push(`size:${product.size}`)
      }
      
      // Prepare update data
      const updateData = {
        ...product,
        price: parseFloat(product.price.toString()),
        originalPrice: product.originalPrice ? parseFloat(product.originalPrice.toString()) : undefined,
        weight: product.weight ? product.weight.toString() : undefined,
        dimensions: product.dimensions ? JSON.stringify(product.dimensions) : undefined,
        discount: product.discount,
        vendorId: vendor.id,
        updatedAt: new Date(),
        tags // Include updated tags with size information
      }
      
      await updateProduct(productId, updateData)
      
      toast({
        title: "Product updated",
        description: "Your product has been successfully updated."
      })
      
      navigate("/vendor/dashboard/products")
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error updating product",
        description: "Failed to update product. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleImageUpload = (publicId: string, url: string) => {
    if (!product) return
    
    setProduct({
      ...product,
      cloudinaryImages: [...product.cloudinaryImages, { url, publicId }],
      images: [...product.images, url]
    })
  }
  
  const removeImage = (index: number) => {
    if (!product) return
    
    setProduct({
      ...product,
      cloudinaryImages: product.cloudinaryImages.filter((_: any, i: number) => i !== index),
      images: product.images.filter((_: any, i: number) => i !== index)
    })
  }
  
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  
  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Product not found.</p>
      </div>
    )
  }
  
  // Check if size selection should be shown
  const showSizeSelection = shouldShowSizeSelection(product.category, product.subcategory || product.category)
  
  return (
    <VendorLayout 
      title="Edit Product" 
      description="Update your product details"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            to="/vendor/dashboard/products" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Products
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price (₦) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₦
                    </span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={product.price}
                      onChange={handleChange}
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="originalPrice">Original Price (₦)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₦
                    </span>
                    <Input
                      id="originalPrice"
                      name="originalPrice"
                      type="number"
                      step="0.01"
                      value={product.originalPrice || ""}
                      onChange={handleChange}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={product.discount || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={product.description || ""}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={product.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    id="origin"
                    name="origin"
                    value={product.origin || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              {/* Size selection for fashion categories */}
              {showSizeSelection && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-md font-semibold text-gray-700">Product Size</h3>
                    <p className="text-sm text-gray-600">
                      Select the size for your fashion product.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="size">Size *</Label>
                    <Select
                      value={product.size || ""}
                      onValueChange={(value) => {
                        setProduct((prev: any) => ({ ...prev, size: value }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a size" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSizeOptions(product.category, product.name).map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.01"
                    value={product.weight || ""}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="dimensions">Dimensions (L x W x H cm)</Label>
                  <Input
                    id="dimensions"
                    name="dimensions"
                    value={product.dimensions || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  name="inStock"
                  checked={product.inStock}
                  onCheckedChange={(checked) => 
                    setProduct({ ...product, inStock: checked })
                  }
                />
                <Label htmlFor="inStock">In Stock</Label>
              </div>
              
              <div>
                <Label>Product Images</Label>
                <CloudinaryUploadWidget
                  onUploadSuccess={handleImageUpload}
                  buttonText="Upload More Images"
                  multiple
                />
                
                {/* Image upload info */}
                <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>
                    {product.cloudinaryImages.length > 0 
                      ? `${product.cloudinaryImages.length} image${product.cloudinaryImages.length > 1 ? 's' : ''} uploaded` 
                      : 'No images uploaded yet'}
                  </span>
                </div>
                
                {product.cloudinaryImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {product.cloudinaryImages.map((img: any, index: number) => (
                      <div key={index} className="relative">
                        <div className="relative w-full h-24">
                          {!imageError[img.url] && (
                            <img
                              src={imageError[img.url] ? "/product_images/unknown-product.jpg" : img.url}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
                              onError={() => setImageError(prev => ({ ...prev, [img.url]: true }))}
                            />
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/vendor/dashboard/products")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  )
}