import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, Save, Loader2, Package, Image } from "lucide-react"
import { getProduct, updateProduct, type Product } from "@/lib/firebase-products"
import { MAIN_CATEGORIES } from "@/lib/categories"
import { useAdmin } from "@/hooks/use-admin"

export default function EditProduct() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useAdmin()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    inStock: true,
    stockQuantity: "",
    weight: "",
    dimensions: "",
    origin: "",
    availableCountries: ["United Kingdom"],
    tags: "",
    discount: "",
    images: [""],
    cloudinaryImages: [] as Array<{publicId: string, url: string, alt?: string}>
  })

  // Available categories
  const categories = MAIN_CATEGORIES.filter(c => c.id !== "all").map(c => ({
    id: c.id,
    name: c.name,
  }))

  // Available countries
  const countries = [
    "United Kingdom",
    "Nigeria", 
    "Ghana",
    "Kenya",
    "South Africa"
  ]

  useEffect(() => {
    if (!id) return
    
    const loadProduct = async () => {
      try {
        setLoading(true)
        const productData = await getProduct(id)
        
        if (!productData) {
          console.error("Product not found")
          navigate("/admin/products")
          return
        }
        
        setProduct(productData)
        
        // Populate form data
        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price?.toString() || "",
          originalPrice: productData.originalPrice?.toString() || "",
          category: productData.category || "",
          inStock: productData.inStock ?? true,
          stockQuantity: productData.stockQuantity?.toString() || "",
          weight: productData.weight?.toString() || "",
          dimensions: productData.dimensions ? JSON.stringify(productData.dimensions) : "",
          origin: productData.origin || "",
          availableCountries: productData.availableCountries || ["United Kingdom"],
          tags: productData.tags?.join(", ") || "",
          discount: productData.discount?.toString() || "",
          images: productData.images?.length > 0 ? productData.images : [""],
          cloudinaryImages: productData.cloudinaryImages || []
        })
        
      } catch (error) {
        console.error("Error loading product:", error)
        alert("Failed to load product")
        navigate("/admin/products")
      } finally {
        setLoading(false)
      }
    }

    if (isAdmin) {
      loadProduct()
    }
  }, [id, isAdmin, navigate])

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ""] }))
  }

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData(prev => ({ 
      ...prev, 
      images: newImages.length > 0 ? newImages : [""] 
    }))
  }

  const handleCountryToggle = (country: string) => {
    const newCountries = formData.availableCountries.includes(country)
      ? formData.availableCountries.filter(c => c !== country)
      : [...formData.availableCountries, country]
    handleInputChange("availableCountries", newCountries)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || !id) return

    setIsSaving(true)
    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.price || !formData.category) {
        alert("Please fill in all required fields (name, price, category)")
        setIsSaving(false)
        return
      }

      // Prepare update data
      const updateData: Partial<Product> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        category: formData.category,
        inStock: formData.inStock,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        dimensions: formData.dimensions ? JSON.parse(formData.dimensions) : undefined,
        origin: formData.origin.trim(),
        availableCountries: formData.availableCountries,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
        discount: formData.discount ? parseFloat(formData.discount) : undefined,
        images: formData.images.filter(img => img.trim().length > 0),
        cloudinaryImages: formData.cloudinaryImages,
        updatedAt: new Date()
      }
      
      await updateProduct(id, updateData)
      
      alert("Product updated successfully!")
      navigate("/admin/products")
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Failed to update product. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (adminLoading) {
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

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading product...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/admin/products")}>Back to Products</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/admin/products")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Product</h1>
            <p className="text-gray-600">Update product information and settings</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Stock */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (£) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (£)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => handleInputChange("discount", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => handleInputChange("stockQuantity", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-7">
                  <Switch
                    id="inStock"
                    checked={formData.inStock}
                    onCheckedChange={(checked) => handleInputChange("inStock", checked)}
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => handleInputChange("origin", e.target.value)}
                    placeholder="e.g., Nigeria, Ghana, UK"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions (JSON format)</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange("dimensions", e.target.value)}
                  placeholder='{"length": 10, "width": 5, "height": 3}'
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange("tags", e.target.value)}
                  placeholder="organic, fresh, spicy, healthy"
                />
              </div>
            </CardContent>
          </Card>

          {/* Available Countries */}
          <Card>
            <CardHeader>
              <CardTitle>Available Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {countries.map((country) => (
                  <div key={country} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`country-${country}`}
                      checked={formData.availableCountries.includes(country)}
                      onChange={() => handleCountryToggle(country)}
                      className="rounded border-gray-300"
                    />
                    <Label 
                      htmlFor={`country-${country}`} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      {country}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cloudinary Images */}
              {formData.cloudinaryImages.length > 0 && (
                <div className="space-y-2">
                  <Label>Cloudinary Images (Optimized)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.cloudinaryImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={img.url} 
                          alt={img.alt || formData.name}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Badge className="absolute top-2 left-2 bg-green-500">
                          Cloudinary
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Images */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Image URLs</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageField}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                      {formData.images.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImageField(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/products")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}