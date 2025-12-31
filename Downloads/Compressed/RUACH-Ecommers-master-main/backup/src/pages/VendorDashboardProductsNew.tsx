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
import { Loader2, X, Image as ImageIcon } from "lucide-react"
import { MAIN_CATEGORIES } from "../lib/categories"
import { VendorLayout } from "../components/vendor-layout"

// Define size options for different categories
const SIZE_OPTIONS = {
  shoes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"],
  kidsShoes: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"],
  clothing: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  kids: ["0-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y", "10-12Y", "12-14Y", "14-16Y"],
  default: ["One Size"]
}

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
    size: "" // Add size field
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

  // Determine which size options to show based on subcategory
  const getSizeOptions = () => {
    // Check if subcategory is shoes
    if (formData.subcategory === "shoes") {
      return SIZE_OPTIONS.shoes
    } 
    // Check if subcategory is kids shoes
    else if (formData.subcategory === "kids-fashion") {
      // For kids fashion, we need to determine if it's shoes or clothing
      // We'll show kids clothing sizes by default, but this could be enhanced
      // to detect specific items within the subcategory
      // For now, we'll use a simple approach - if the product name contains
      // shoe-related keywords, show kids shoe sizes
      const lowerName = formData.name.toLowerCase();
      const shoeKeywords = ["shoe", "sneaker", "boot", "sandal", "slipper", "footwear"];
      const isKidsShoe = shoeKeywords.some(keyword => lowerName.includes(keyword));
      
      return isKidsShoe ? SIZE_OPTIONS.kidsShoes : SIZE_OPTIONS.kids
    }
    // Check if subcategory is other fashion
    else if (["mens-fashion", "womens-fashion"].includes(formData.subcategory)) {
      return SIZE_OPTIONS.clothing
    }
    
    return SIZE_OPTIONS.default
  }

  // Check if size selection should be shown
  const shouldShowSizeSelection = () => {
    // Show size selection for fashion subcategories
    return formData.category === "fashion" && 
      ["mens-fashion", "womens-fashion", "kids-fashion", "shoes"].includes(formData.subcategory)
  }

  // Get current size options (memoized to prevent unnecessary re-renders)
  const currentSizeOptions = getSizeOptions();

  // Reset size when subcategory or product name changes to ensure correct size options are shown
  useEffect(() => {
    // Only reset size if we're showing size selection
    if (shouldShowSizeSelection()) {
      // Get current size options based on subcategory and product name
      const sizeOptions = getSizeOptions();
      
      // If current size is not in the new options, reset it
      if (formData.size && !sizeOptions.includes(formData.size)) {
        setFormData(prev => ({ ...prev, size: "" }));
      }
    }
  }, [formData.subcategory, formData.name, formData.category]);

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

    // For fashion categories that require size, require size selection
    if (shouldShowSizeSelection() && !formData.size) {
      alert("Please select a size for fashion products.")
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

      // Prepare tags including size if applicable
      const tags = []
      if (formData.size) {
        tags.push(`size:${formData.size}`)
      }

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
        tags, // Include tags with size information
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

  // Check if size selection should be shown
  const showSizeSelection = shouldShowSizeSelection()

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
                setFormData((prev) => ({ ...prev, category: value, subcategory: "", size: "" }))
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
                  setFormData((prev) => ({ ...prev, subcategory: value, size: "" }))
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
                value={formData.size || ""}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, size: value }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                  {currentSizeOptions.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
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
          <Label>Product Images</Label>
          <CloudinaryUploadWidget
            onUploadSuccess={handleCloudinaryUpload}
            buttonText="Upload Images"
            multiple
          />
          
          {/* Image upload info */}
          <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span>
              {cloudinaryImages.length > 0 
                ? `${cloudinaryImages.length} image${cloudinaryImages.length > 1 ? 's' : ''} uploaded` 
                : 'No images uploaded yet'}
            </span>
          </div>
          
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