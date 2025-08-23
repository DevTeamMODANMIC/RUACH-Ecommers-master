"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useVendor } from "@/hooks/use-vendor"
import { addProduct } from "@/lib/firebase-products"
import CloudinaryUploadWidget from "@/components/cloudinary-upload-widget"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, X, Plus } from "lucide-react"
import Image from "next/image"

// Popular category examples - vendors can use these or create their own
const categoryExamples = [
  "African Foods",
  "Traditional Spices", 
  "Fresh Vegetables",
  "Beverages & Drinks",
  "Grains & Rice",
  "Flour & Baking",
  "Meat & Fish",
  "Snacks & Sweets",
  "Health & Beauty",
  "Home & Kitchen",
  "Baby Products",
  "Traditional Medicine",
  "Clothing & Fashion",
  "Electronics",
  "Books & Education",
  "Toys & Games",
  "Sports & Fitness",
  "Arts & Crafts",
  "Automotive",
  "Garden & Outdoor"
]

export default function VendorAddProductPage() {
  const { vendor, activeStore } = useVendor()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [cloudinaryImages, setCloudinaryImages] = useState<Array<{ publicId: string; url: string; alt?: string }>>([])
  const [categoryInput, setCategoryInput] = useState("")
  const [showExamples, setShowExamples] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    inStock: true,
    stockQuantity: "100",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCloudinaryUpload = (publicId: string, url: string, alt?: string) => {
    setCloudinaryImages((prev) => [...prev, { publicId, url, alt: alt || formData.name }])
  }

  const handleRemoveCloudinaryImage = (publicId: string) => {
    setCloudinaryImages((prev) => prev.filter((img) => img.publicId !== publicId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeStore) return
    
    if (cloudinaryImages.length === 0) {
      alert("Please upload at least one product image.")
      return
    }
    
    // Validate category input
    if (!categoryInput.trim()) {
      alert("Please enter a category for your product.")
      return
    }
    
    setSubmitting(true)
    try {
      // Use the category input directly
      const finalCategory = categoryInput.trim().toLowerCase().replace(/\s+/g, '-')
      const finalDisplayCategory = categoryInput.trim()
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: finalCategory,
        displayCategory: finalDisplayCategory,
        images: cloudinaryImages.map(img => img.url),
        cloudinaryImages,
        cloudinaryMigrated: true,
        inStock: formData.inStock,
        stockQuantity: parseInt(formData.stockQuantity),
        origin: "Nigeria",
        availableCountries: ["Nigeria"],
        tags: [],
        reviews: { average: 0, count: 0 },
        vendorId: activeStore.id,
      }
      
      console.log("Creating product with data:", productData)
      const id = await addProduct(productData as any)
      console.log("Product created with ID:", id)
      
      alert("Product added successfully!")
      router.push("/vendor/dashboard/products")
    } catch (err: any) {
      console.error("Error creating product:", err)
      alert(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!activeStore) return <div>Loading store information...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="description">Product Description</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="price">Price (₦)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
              <Input 
                id="price" 
                type="number" 
                step="0.01" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                className="pl-8"
                placeholder="0.00"
                required 
              />
            </div>
          </div>
          <div>
            <Label htmlFor="category">Product Category *</Label>
            <div className="space-y-3">
              <div className="relative">
                <Input
                  id="category"
                  placeholder="Enter your product category (e.g., Traditional African Spices, Fresh Vegetables, Handmade Crafts)"
                  value={categoryInput}
                  onChange={(e) => {
                    setCategoryInput(e.target.value)
                    console.log("Category input:", e.target.value)
                  }}
                  className="w-full"
                  required
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowExamples(!showExamples)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                >
                  {showExamples ? "Hide" : "Show"} Examples
                </Button>
              </div>
              
              {showExamples && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-sm font-medium text-gray-700 mb-3">Popular category examples (click to use):</p>
                  <div className="flex flex-wrap gap-2">
                    {categoryExamples.map((example, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCategoryInput(example)
                          setShowExamples(false)
                          console.log("Selected example category:", example)
                        }}
                        className="text-xs h-7 px-2 hover:bg-green-50 hover:border-green-300"
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    💡 Tip: Create categories that best describe your products. This helps customers find what they're looking for!
                  </p>
                </div>
              )}
              
              {categoryInput.trim() && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Your category:</strong> {categoryInput.trim()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    This will help customers find your product when browsing or searching.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="stockQuantity">Stock Quantity</Label>
          <Input id="stockQuantity" type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} />
        </div>
        <div>
          <Label>Product Images</Label>
          <CloudinaryUploadWidget
            onUploadSuccess={handleCloudinaryUpload}
            buttonText="Upload Images"
            multiple
          />
          {cloudinaryImages.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {cloudinaryImages.map((image) => (
                <div key={image.publicId} className="relative">
                  <Image
                    src={image.url}
                    alt={image.alt || "Product image"}
                    width={150}
                    height={150}
                    className="rounded-md object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => handleRemoveCloudinaryImage(image.publicId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Save Product"}
          {submitting && "Saving..."}
        </Button>
      </form>
    </div>
  )
} 