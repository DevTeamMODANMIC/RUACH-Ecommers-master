"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
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
import { ArrowLeft, X, Plus, Loader2 } from "lucide-react"
import { getProduct, updateProduct, type Product } from "@/lib/firebase-products"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { useCurrency } from "@/hooks/use-currency"
import CloudinaryUploadWidget from "@/components/cloudinary-upload-widget"

// Use centralized categories
import { MAIN_CATEGORIES } from "@/lib/categories"
const categories = MAIN_CATEGORIES.filter(c => c.id !== 'all').map(c => ({ id: c.id, name: c.name }))

const countries = [
  "All", "United Kingdom", "Nigeria", "Ghana", "South Africa", "Kenya", 
  "Cameroon", "Zimbabwe", "Uganda", "Tanzania", "United States"
]

interface EditProductProps {
  params: {
    id: string
  }
}

export default function EditProduct({ params }: EditProductProps) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const { formatPrice } = useCurrency()
  
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [cloudinaryImages, setCloudinaryImages] = useState<Array<{publicId: string, url: string, alt?: string}>>([])
  const [product, setProduct] = useState<Product | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    inStock: true,
    stockQuantity: "",
    origin: "",
    availableCountries: ["United Kingdom"],
    tags: "",
  })

  useEffect(() => {
    const checkAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Here you would check if the user has admin role
        // For demo purposes, we're just checking if the user is authenticated
        setIsAdmin(true)
        fetchProduct()
      } else {
        router.push("/login")
      }
    })

    return () => checkAuth()
  }, [router, id])

  const fetchProduct = async () => {
    try {
      const productData = await getProduct(id)
      if (productData) {
        setProduct(productData)
        setExistingImages(productData.images || [])
        
        console.log("Fetched product data:", {
          id: productData.id,
          name: productData.name,
          hasCloudinaryImages: !!(productData.cloudinaryImages && productData.cloudinaryImages.length > 0),
          cloudinaryImageCount: productData.cloudinaryImages?.length || 0,
          hasLegacyImages: !!(productData.images && productData.images.length > 0),
          legacyImageCount: productData.images?.length || 0
        });
        
        // Initialize cloudinary images if they exist
        if (productData.cloudinaryImages && productData.cloudinaryImages.length > 0) {
          console.log("Setting cloudinary images:", productData.cloudinaryImages);
          setCloudinaryImages(productData.cloudinaryImages)
        }

        // Map existing category string to category ID if needed
        let categoryId = productData.category;
        
        // Helper to normalize strings (lowercase, remove spaces, slashes, dashes)
        const normalize = (str: string) => str.toLowerCase().replace(/[\s/_-]+/g, "");
        
        // Check if the category is an old string format and needs mapping
        if (productData.category && !categories.some(cat => cat.id === productData.category)) {
          const normalizedProductCat = normalize(productData.category);
          
          // Try to match by normalized name or id
          const matchingCategory = categories.find(cat => 
            normalize(cat.id) === normalizedProductCat || normalize(cat.name) === normalizedProductCat
          );
          
          if (matchingCategory) {
            categoryId = matchingCategory.id;
          } else {
            // Default to "other" if no match found
            categoryId = "other";
          }
        }
        
        setFormData({
          name: productData.name,
          description: productData.description,
          price: productData.price.toString(),
          category: categoryId,
          inStock: productData.inStock,
          stockQuantity: productData.stockQuantity.toString(),
          origin: productData.origin,
          availableCountries: productData.availableCountries,
          tags: productData.tags.join(", "),
        })
      } else {
        toast({
          title: "Product not found",
          description: "The product you are trying to edit does not exist.",
          variant: "destructive",
        })
        router.push("/admin/products")
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      toast({
        title: "Error",
        description: "Failed to load product data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      inStock: checked,
    })
  }

  const handleCountrySelect = (country: string) => {
    let newCountries
    if (country === "All") {
      newCountries = countries.filter(c => c !== "All")
    } else {
      if (formData.availableCountries.includes(country)) {
        newCountries = formData.availableCountries.filter(c => c !== country)
      } else {
        newCountries = [...formData.availableCountries, country]
      }
    }
    setFormData({
      ...formData,
      availableCountries: newCountries,
    })
  }

  const handleAddImageUrl = () => {
    if (imageUrl && !existingImages.includes(imageUrl)) {
      setExistingImages([...existingImages, imageUrl])
      setImageUrl("")
    }
  }

  const handleRemoveImage = (index: number) => {
    const newUrls = [...existingImages]
    newUrls.splice(index, 1)
    setExistingImages(newUrls)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Don't require new Cloudinary images if product already has images
      // Either existing Cloudinary images or legacy URL-based images are acceptable
      const hasExistingCloudinaryImages = cloudinaryImages.length > 0;
      const hasLegacyImages = existingImages.length > 0;
      
      console.log("Edit product form submission:", {
        hasExistingCloudinaryImages,
        cloudinaryImageCount: cloudinaryImages.length,
        hasLegacyImages,
        legacyImageCount: existingImages.length
      });
      
      if (!hasExistingCloudinaryImages && !hasLegacyImages) {
        toast({
          title: "Image required",
          description: "Please upload at least one product image before saving.",
          variant: "destructive",
        })
        setSubmitting(false)
        return
      }

      // Keep legacy images for backward compat (optional)
      const allImages = existingImages.length > 0 ? existingImages : ["/product_images/unknown-product.jpg"]

      // Find display name for the selected category
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      const displayCategory = selectedCategory ? selectedCategory.name : formData.category;

      // Prepare data for Firebase
      const productData = {
        // Keep essential data from the existing product if available
        ...(product && {
          createdAt: product.createdAt,
          reviews: product.reviews,
          // Preserve other fields not in the form but important
          weight: product.weight,
          dimensions: product.dimensions,
          subcategory: product.subcategory,
          originalPrice: product.originalPrice,
          // UI display properties
          rating: product.rating,
          reviewCount: product.reviewCount,
          bestseller: product.bestseller,
          new: product.new,
          popular: product.popular,
          isNew: product.isNew,
          isBulk: product.isBulk,
          discount: product.discount,
        }),
        
        // Form data (overrides existing data if changed)
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category, // This is the category ID
        displayCategory: displayCategory, // This is the human-readable category name
        images: allImages,
        // Only include cloudinaryImages if there are actual images
        ...(cloudinaryImages.length > 0 && { cloudinaryImages }),
        inStock: formData.inStock,
        stockQuantity: parseInt(formData.stockQuantity),
        origin: formData.origin,
        availableCountries: formData.availableCountries,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
        // Only mark as migrated if we have Cloudinary images
        ...(cloudinaryImages.length > 0 && { cloudinaryMigrated: true }),
      }

      // Get current user token for authorization
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be logged in to update products");
      }

      const idToken = await currentUser.getIdToken();
      
      console.log("Making product update API call:", {
        url: `/api/products/update/${id}`,
        productId: id,
        method: 'PUT',
        productData: {
          name: productData.name,
          category: productData.category,
          displayCategory: productData.displayCategory,
          imageCount: productData.images.length,
          cloudinaryImageCount: cloudinaryImages.length,
        }
      });

      // Call our API endpoint for updating products
      const response = await fetch(`/api/products/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(productData)
      });
      
      // Save the status code before consuming the response
      const responseStatus = response.status;
      
      // Try to parse the response as JSON
      let responseData;
      try {
        responseData = await response.json();
        console.log("Product update API response:", {
          status: responseStatus,
          ok: response.ok,
          data: responseData
        });
      } catch (jsonError) {
        console.error("Error parsing API response:", jsonError);
        // If we can't parse the response, continue with the status code we captured
        responseData = { error: "Could not parse API response" };
      }

      // If the API route is not available or returns 404, fall back to direct Firebase update
      if (responseStatus === 404) {
        console.log("API returned 404, falling back to direct Firebase update");
        await updateProduct(id, productData);
      } 
      // If the API returned an error status, throw an error
      else if (!response.ok) {
        throw new Error(responseData?.error || 'Failed to update product');
      }
      // Otherwise, API call was successful, no further action needed

      toast({
        title: "Product updated",
        description: "The product has been successfully updated in Firebase and Cloudinary.",
      })
      router.push("/admin/products")
    } catch (error: any) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Function to explicitly export the current product to Firebase
  const handleExportToFirebase = async () => {
    try {
      setSubmitting(true);
      
      // Find display name for the selected category
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      const displayCategory = selectedCategory ? selectedCategory.name : formData.category;
      
      // Keep legacy images for backward compat (optional)
      const allImages = existingImages.length > 0 ? existingImages : ["/product_images/unknown-product.jpg"];

      // Prepare data for Firebase - same as in handleSubmit
      const productData = {
        // Keep essential data from the existing product if available
        ...(product && {
          createdAt: product.createdAt,
          reviews: product.reviews,
          // Preserve other fields not in the form but important
          weight: product.weight,
          dimensions: product.dimensions,
          subcategory: product.subcategory,
          originalPrice: product.originalPrice,
          // UI display properties
          rating: product.rating,
          reviewCount: product.reviewCount,
          bestseller: product.bestseller,
          new: product.new,
          popular: product.popular,
          isNew: product.isNew,
          isBulk: product.isBulk,
          discount: product.discount,
        }),
        
        // Form data (overrides existing data if changed)
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category, // This is the category ID
        displayCategory: displayCategory, // This is the human-readable category name
        images: allImages,
        // Only include cloudinaryImages if there are actual images
        ...(cloudinaryImages.length > 0 && { cloudinaryImages }),
        inStock: formData.inStock,
        stockQuantity: parseInt(formData.stockQuantity),
        origin: formData.origin,
        availableCountries: formData.availableCountries,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
        // Only mark as migrated if we have Cloudinary images
        ...(cloudinaryImages.length > 0 && { cloudinaryMigrated: true }),
      };
      
      console.log("Exporting product to Firebase:", {
        id,
        name: productData.name,
        category: productData.category,
        displayCategory: productData.displayCategory,
      });

      // Direct Firebase update
      await updateProduct(id, productData);
      
      toast({
        title: "Export successful",
        description: "The product has been successfully exported to Firebase.",
      });
    } catch (error: any) {
      console.error("Error exporting product to Firebase:", error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export product to Firebase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!isAdmin || !product) {
    return null // Router will redirect
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" size="sm" className="mb-6" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-gray-500 mt-2">Update product information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Jollof Rice Spice Mix"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (£) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="9.99"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
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

            <div className="space-y-2">
              <Label htmlFor="origin">Country of Origin *</Label>
              <Select 
                value={formData.origin}
                onValueChange={(value) => handleSelectChange("origin", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country of origin" />
                </SelectTrigger>
                <SelectContent>
                  {countries.filter(c => c !== "All").map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Stock Quantity *</Label>
              <Input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                min="0"
                placeholder="100"
                value={formData.stockQuantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="inStock">In Stock</Label>
            </div>
          </div>

          {/* Product Images Section */}
          <div className="space-y-4">
            <Label>Product Images</Label>
            
            {/* Cloudinary Image Upload Section */}
            <div className="mb-6 border p-4 rounded-md bg-gray-50">
              <h3 className="text-sm font-medium mb-3">Cloudinary Images (Recommended)</h3>
              <CloudinaryUploadWidget
                onUploadSuccess={(publicId, url) => {
                  setCloudinaryImages([...cloudinaryImages, { publicId, url, alt: formData.name }]);
                  // Automatically add the Cloudinary URL to the Alternative URL Method
                  if (url && !existingImages.includes(url)) {
                    setExistingImages(prev => [...prev, url]);
                  }
                }}
                buttonText="Upload Product Image"
              />
              
              {cloudinaryImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {cloudinaryImages.map((image, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square rounded-md overflow-hidden border bg-white">
                        <img 
                          src={image.url} 
                          alt={image.alt || `Product image ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                        onClick={() => {
                          const newImages = [...cloudinaryImages];
                          newImages.splice(index, 1);
                          setCloudinaryImages(newImages);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Alternative URL Input Section */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium mb-3">Alternative URL Method</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button 
                  type="button" 
                  onClick={handleAddImageUrl}
                  disabled={!imageUrl}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter URLs to product images. You can use images from the public/product_images folder.
                <br />
                Example: /product_images/beverages/coke-50cl-250x250.jpg
              </p>
            </div>
            
            {/* Image URL Previews */}
            {existingImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {existingImages.map((url, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square rounded-md overflow-hidden border">
                      <Image
                        src={url}
                        alt={`Product image ${index + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = "/product_images/unknown-product.jpg";
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your product..."
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="e.g. spicy, organic, vegan"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Available Countries</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Button
                type="button"
                variant={formData.availableCountries.length === countries.length - 1 ? "default" : "outline"}
                className="text-sm h-8"
                onClick={() => handleCountrySelect("All")}
              >
                All Countries
              </Button>
              {countries.filter(c => c !== "All").map((country) => (
                <Button
                  key={country}
                  type="button"
                  variant={formData.availableCountries.includes(country) ? "default" : "outline"}
                  className="text-sm h-8"
                  onClick={() => handleCountrySelect(country)}
                >
                  {country}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Update Product"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                disabled={submitting}
                onClick={handleExportToFirebase}
              >
                {submitting ? "Exporting..." : "Export to Firebase"}
              </Button>
            </div>
            
            <Button variant="ghost" type="button" asChild>
              <Link href="/admin/products">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
 