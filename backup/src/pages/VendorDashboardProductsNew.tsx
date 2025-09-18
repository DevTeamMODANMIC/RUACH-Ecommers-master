import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useVendor } from "../hooks/use-vendor"
import { addProduct } from "../lib/firebase-products"
import CloudinaryUploadWidget from "../components/cloudinary-upload-widget"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Button } from "../components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../components/ui/select"
import { Label } from "../components/ui/label"
import { Loader2, X } from "lucide-react"
import { MAIN_CATEGORIES } from "../lib/categories"
import { VendorLayout } from "../components/vendor-layout"

export default function VendorAddProductPage() {
  const categories = MAIN_CATEGORIES.filter(
    (c) => c.id !== "all" && c.subcategories && c.subcategories.length > 0
  )

  const { vendor, activeStore } = useVendor()
  const navigate = useNavigate()

  const [submitting, setSubmitting] = useState(false)
  const [cloudinaryImages, setCloudinaryImages] = useState<
    Array<{ publicId: string; url: string; alt?: string }>
  >([])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    inStock: true,
    stockQuantity: "100",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

    if (!formData.category) {
      alert("Please select a category for your product.")
      return
    }

    if (!formData.subcategory) {
      alert("Please select a subcategory for your product.")
      return
    }

    setSubmitting(true)
    try {
      const selectedCategory = categories.find((cat) => cat.id === formData.category)
      const selectedSubcategory = selectedCategory?.subcategories?.find(
        (sub) => sub.id === formData.subcategory
      )
      const finalCategory = formData.subcategory
      const finalDisplayCategory = selectedSubcategory
        ? selectedSubcategory.name
        : formData.subcategory

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: finalCategory,
        displayCategory: finalDisplayCategory,
        images: cloudinaryImages.map((img) => img.url),
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

      const id = await addProduct(productData as any)
      alert("Product added successfully!")
      navigate("/vendor/dashboard/products")
    } catch (err: any) {
      console.error("Error creating product:", err)
      alert(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!activeStore) return <div>Loading store information...</div>

  return (
    <VendorLayout 
      title="Add New Product" 
      description="Create a new product listing for your store"
    >
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Product Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="price">Price (₦)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₦
              </span>
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
            <Select
              value={formData.category || ""}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, category: value, subcategory: "" }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <SelectItem value="no-categories" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {formData.category && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="space-y-2">
              <h3 className="text-md font-semibold text-gray-700">Product Subcategory</h3>
              <p className="text-sm text-gray-600">
                Select the specific subcategory for your product within "
                {categories.find((cat) => cat.id === formData.category)?.name}".
              </p>
            </div>

            <div>
              <Label htmlFor="subcategory">Subcategory *</Label>
              <Select
                value={formData.subcategory || ""}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, subcategory: value }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const selectedCategory = categories.find(
                      (cat) => cat.id === formData.category
                    )

                    if (!selectedCategory || !selectedCategory.subcategories) {
                      return (
                        <SelectItem value="no-subcategories" disabled>
                          No subcategories available
                        </SelectItem>
                      )
                    }

                    return selectedCategory.subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))
                  })()}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {!formData.category && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="text-blue-500">ℹ️</div>
              <div>
                <p className="text-sm font-medium text-blue-700">Select a Category First</p>
                <p className="text-xs text-blue-600">
                  Choose a main category above to see available subcategories for your product.
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="stockQuantity">Stock Quantity</Label>
          <Input
            id="stockQuantity"
            type="number"
            name="stockQuantity"
            value={formData.stockQuantity}
            onChange={handleChange}
          />
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
                  <img
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
    </VendorLayout>
  )
}
