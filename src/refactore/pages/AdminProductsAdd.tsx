import { useState, useEffect } from "react"
import { useRouter } from "react-router-dom"
import Link from "react-router-dom"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Switch } from "../components/ui/switch"
import { ArrowLeft, X, Plus, Loader2 } from "lucide-react"
import { addProduct } from "../lib/firebase-products"
import { auth } from "../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useToast } from "../hooks/use-toast"
import { useCurrency } from "../hooks/use-currency"
import CloudinaryUploadWidget from "../components/cloudinary-upload-widget"

// Use centralized categories
import { MAIN_CATEGORIES } from "../lib/categories"

const countries = [
  "All", "United Kingdom", "Nigeria", "Ghana", "South Africa", "Kenya", 
  "Cameroon", "Zimbabwe", "Uganda", "Tanzania", "United States"
]

export default function AddProduct() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { formatPrice } = useCurrency()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [cloudinaryImages, setCloudinaryImages] = useState<Array<{publicId: string, url: string, alt?: string}>>([])
  
  // Move categories filter inside component for better debugging
  const categories = MAIN_CATEGORIES.filter(c => c.id !== 'all' && c.subcategories && c.subcategories.length > 0)
  
  // Add debug state to track what's happening
  const [debugInfo, setDebugInfo] = useState<string>("");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    images: [] as string[],
    inStock: true,
    stockQuantity: "100",
    origin: "",
    availableCountries: ["United Kingdom"],
    tags: "",
  })

  useEffect(() => {
    const checkAuth = onAuthStateChanged(auth, (user) => {
      setLoading(false)
      if (user) {
        // Here you would check if the user has admin role
        // For demo purposes, we're just checking if the user is authenticated
        setIsAdmin(true)
      } else {
        navigate("/login")
      }
    })

    return () => checkAuth()
  }, [router])
  
  // Debug: Log categories on component mount
  useEffect(() => {
    console.log('=== ADD PRODUCT PAGE DEBUG ===');
    console.log('Total MAIN_CATEGORIES:', MAIN_CATEGORIES.length);
    console.log('Filtered categories (with subcategories):', categories.length);
    console.log('Categories:', categories.map(c => ({
      id: c.id,
      name: c.name,
      subcategoryCount: c.subcategories?.length || 0
    })));
    console.log('================================');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] handleSelectChange called:`, { name, value });
    
    const newFormData = {
      ...formData,
      [name]: value,
    };
    
    console.log(`[${timestamp}] Setting formData:`, newFormData);
    setFormData(newFormData);
    
    // Update debug info for display
    setDebugInfo(`Last action: Set ${name} = "${value}" at ${timestamp}`);
    
    // If changing category, log the available subcategories
    if (name === 'category') {
      const selectedCategory = categories.find(cat => cat.id === value);
      console.log(`[${timestamp}] Selected category:`, selectedCategory);
      console.log(`[${timestamp}] Available subcategories:`, selectedCategory?.subcategories);
      
      if (selectedCategory?.subcategories) {
        console.log(`[${timestamp}] Subcategory count:`, selectedCategory.subcategories.length);
        selectedCategory.subcategories.forEach((sub, index) => {
          console.log(`[${timestamp}] Subcategory ${index + 1}:`, { id: sub.id, name: sub.name });
        });
      } else {
        console.log(`[${timestamp}] ERROR: No subcategories found for category ${value}`);
      }
    }
    
    console.log(`[${timestamp}] Current formData.category:`, newFormData.category);
    console.log(`[${timestamp}] Should show subcategory section:`, !!newFormData.category);
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
    if (imageUrl && !imageUrls.includes(imageUrl)) {
      setImageUrls([...imageUrls, imageUrl])
      setImageUrl("")
    }
  }

  const handleRemoveImage = (index: number) => {
    const newUrls = [...imageUrls]
    newUrls.splice(index, 1)
    setImageUrls(newUrls)
  }

  const handleCloudinaryUpload = (publicId: string, url: string, alt?: string) => {
    setCloudinaryImages(prev => {
      // Check if this image already exists in the array
      if (prev.some(img => img.publicId === publicId)) {
        return prev;
      }
      return [...prev, { publicId, url, alt: alt || formData.name }];
    });
    
    // Automatically add the Cloudinary URL to the Alternative URL Method
    if (url && !imageUrls.includes(url)) {
      setImageUrls(prev => [...prev, url]);
    }
  }

  const handleRemoveCloudinaryImage = (publicId: string) => {
    setCloudinaryImages(prev => prev.filter(img => img.publicId !== publicId));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    if (cloudinaryImages.length === 0) {
      toast({
        title: "Image required",
        description: "Please upload at least one product image via Cloudinary before saving.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Validate category and subcategory selection
    if (!formData.category) {
      toast({
        title: "Category required",
        description: "Please select a main category.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    if (!formData.subcategory) {
      toast({
        title: "Subcategory required",
        description: "Please select a subcategory.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Validate that the selected category actually has the selected subcategory
    const selectedCategory = categories.find(cat => cat.id === formData.category);
    if (!selectedCategory?.subcategories?.find(sub => sub.id === formData.subcategory)) {
      toast({
        title: "Invalid subcategory",
        description: "The selected subcategory is not valid for the selected category. Please reselect.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    try {
      // Use the collected image URLs
      let productImages = imageUrls.length > 0 ? imageUrls : ["/product_images/unknown-product.jpg"]

      // Find display name for the selected category and subcategory
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      const selectedSubcategory = selectedCategory?.subcategories?.find(sub => sub.id === formData.subcategory);
      const finalCategory = formData.subcategory; // Use subcategory as the main category
      const finalDisplayCategory = selectedSubcategory ? selectedSubcategory.name : formData.subcategory;

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: finalCategory, // This is the subcategory ID
        displayCategory: finalDisplayCategory, // This is the human-readable subcategory name
        images: productImages,
        cloudinaryImages,
        cloudinaryMigrated: true, // Mark as already migrated
        inStock: formData.inStock,
        stockQuantity: parseInt(formData.stockQuantity),
        origin: formData.origin,
        availableCountries: formData.availableCountries,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
        reviews: {
          average: 0,
          count: 0,
        },
      }

      // Get current user token for authorization
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be logged in to add products");
      }

      const idToken = await currentUser.getIdToken();

      // Call our API endpoint
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add product');
      }

      const result = await response.json();

      toast({
        title: "Product added",
        description: "The product has been successfully added to Firebase and Cloudinary.",
      })
      navigate("/admin/products")
    } catch (error: any) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
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
    return null // Router will redirect
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" size="sm" className="mb-6" asChild>
          <Link to="/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-gray-500 mt-2">Create a new product to your inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Debug Information Section */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Debug Information</h4>
            <div className="text-xs space-y-1">
              <p><strong>Categories loaded:</strong> {categories.length}</p>
              <p><strong>Current category:</strong> "{formData.category}" {formData.category ? '✅' : '❌'}</p>
              <p><strong>Current subcategory:</strong> "{formData.subcategory}" {formData.subcategory ? '✅' : '❌'}</p>
              <p><strong>Should show subcategory section:</strong> {formData.category ? 'YES ✅' : 'NO ❌'}</p>
              <p><strong>Last action:</strong> {debugInfo || 'None yet'}</p>
              
              <div className="mt-2 space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    console.log('=== MANUAL TEST BUTTON CLICKED ===');
                    console.log('Setting category to appliances manually');
                    handleSelectChange('category', 'appliances');
                  }}
                  className="px-2 py-1 bg-yellow-200 rounded text-xs"
                >
                  Test: Set Category to Appliances
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log('=== CLEARING CATEGORY ===');
                    handleSelectChange('category', '');
                    handleSelectChange('subcategory', '');
                  }}
                  className="px-2 py-1 bg-red-200 rounded text-xs"
                >
                  Clear Category
                </button>
              </div>
              
              <details className="mt-2">
                <summary className="cursor-pointer text-yellow-700">Available Categories ({categories.length})</summary>
                <div className="mt-1 ml-4 max-h-32 overflow-y-auto">
                  {categories.map((cat, index) => (
                    <div key={cat.id} className="text-xs">
                      {index + 1}. {cat.name} (ID: {cat.id}) - {cat.subcategories?.length || 0} subcategories
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
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
              <Label htmlFor="category">Main Category *</Label>
              <p className="text-xs text-blue-600 mb-1">
                Click dropdown to select from {categories.length} available categories
              </p>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  console.log('=== CATEGORY SELECTION EVENT ===');
                  console.log('Raw value received:', value);
                  console.log('Type of value:', typeof value);
                  console.log('Current formData.category before:', formData.category);
                  
                  handleSelectChange("category", value);
                  // Reset subcategory when main category changes
                  handleSelectChange("subcategory", "");
                  
                  console.log('=== END CATEGORY SELECTION ===');
                }}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="no-categories" disabled>
                      No categories available
                    </SelectItem>
                  ) : (
                    categories.map((category, index) => (
                      <SelectItem key={category.id} value={category.id}>
                        {index + 1}. {category.name} ({category.subcategories?.length || 0} subs)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {categories.length === 0 && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ No categories with subcategories available. Please check your category configuration.
                </p>
              )}
              {categories.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ {categories.length} categories available with subcategories
                </p>
              )}
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
          
          {/* Subcategory Selection - Separate section for better visibility */}
          {formData.category && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="space-y-2">
                <h3 className="text-md font-semibold text-gray-700">Product Subcategory</h3>
                <p className="text-sm text-gray-600">
                  Select the specific subcategory that best describes your product within the "{categories.find(cat => cat.id === formData.category)?.name}" category.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory *</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) => handleSelectChange("subcategory", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const selectedCategory = categories.find(cat => cat.id === formData.category);
                      if (!selectedCategory || !selectedCategory.subcategories) {
                        return (
                          <SelectItem value="no-subcategories" disabled>
                            No subcategories available
                          </SelectItem>
                        );
                      }
                      return selectedCategory.subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ));
                    })()} 
                  </SelectContent>
                </Select>
                
                <div className="text-xs space-y-1">
                  <p className="text-gray-500">
                    💡 This hierarchical structure matches the shop page categories.
                  </p>
                  {(() => {
                    const selectedCategory = categories.find(cat => cat.id === formData.category);
                    if (selectedCategory?.subcategories) {
                      return (
                        <p className="text-green-600">
                          ✅ {selectedCategory.subcategories.length} subcategories available for "{selectedCategory.name}"
                        </p>
                      );
                    }
                    return (
                      <p className="text-orange-600">
                        ⚠️ No subcategories available for this category. Please select a different category.
                      </p>
                    );
                  })()} 
                </div>
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

          <div className="space-y-2">
            <Label>Product Images (via Cloudinary)</Label>
            <p className="text-sm text-gray-500 mb-4">
              Upload product images to Cloudinary for optimized delivery.
              At least one image is required.
            </p>
            <CloudinaryUploadWidget
              buttonText="Upload Product Images"
              onUploadSuccess={handleCloudinaryUpload}
              onRemove={handleRemoveCloudinaryImage}
              currentImages={cloudinaryImages}
              multiple={true}
              onUploadError={(err) => {
                toast({
                  title: "Upload failed",
                  description: err.message || "Failed to upload image to Cloudinary",
                  variant: "destructive",
                });
              }}
            />
          </div>

          {/* Fallback image URL section */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Fallback Image URLs (Optional)</Label>
            <p className="text-sm text-gray-500">
              If you have direct image URLs, you can add them as fallback images.
              Cloudinary images are preferred.
            </p>
            <div className="flex items-center space-x-2">
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <Button type="button" variant="outline" onClick={handleAddImageUrl}>
                Add
              </Button>
            </div>
            {imageUrls.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-sm font-medium">Added Image URLs:</p>
                <div className="flex flex-wrap gap-2">
                  {imageUrls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-gray-100 rounded-md px-3 py-2"
                    >
                      <span className="text-sm truncate max-w-[200px]">{url}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
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

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/products")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
 