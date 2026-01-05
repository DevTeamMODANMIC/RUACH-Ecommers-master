import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { ArrowLeft, X, Loader2 } from "lucide-react";

import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useToast } from "../hooks/use-toast";
import { useCurrency } from "../hooks/use-currency";
import CloudinaryUploadWidget from "../components/cloudinary-upload-widget";
import { MAIN_CATEGORIES } from "../lib/categories";

const countries = [
  "All", "United Kingdom", "Nigeria", "Ghana", "South Africa", "Kenya", 
  "Cameroon", "Zimbabwe", "Uganda", "Tanzania", "United States"
];

export default function AddProduct() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [cloudinaryImages, setCloudinaryImages] = useState<Array<{publicId: string, url: string, alt?: string}>>([]);

  const categories = MAIN_CATEGORIES.filter(c => c.id !== "all" && c.subcategories && c.subcategories.length > 0);

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
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (user) {
        setIsAdmin(true);
      } else {
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      inStock: checked,
    });
  };

  const handleCountrySelect = (country: string) => {
    let newCountries;
    if (country === "All") {
      newCountries = countries.filter(c => c !== "All");
    } else {
      if (formData.availableCountries.includes(country)) {
        newCountries = formData.availableCountries.filter(c => c !== country);
      } else {
        newCountries = [...formData.availableCountries, country];
      }
    }
    setFormData({
      ...formData,
      availableCountries: newCountries,
    });
  };

  const handleAddImageUrl = () => {
    if (imageUrl && !imageUrls.includes(imageUrl)) {
      setImageUrls([...imageUrls, imageUrl]);
      setImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    const newUrls = [...imageUrls];
    newUrls.splice(index, 1);
    setImageUrls(newUrls);
  };

  const handleCloudinaryUpload = (publicId: string, url: string, alt?: string) => {
    setCloudinaryImages(prev => {
      if (prev.some(img => img.publicId === publicId)) {
        return prev;
      }
      return [...prev, { publicId, url, alt: alt || formData.name }];
    });

    if (url && !imageUrls.includes(url)) {
      setImageUrls(prev => [...prev, url]);
    }
  };

  const handleRemoveCloudinaryImage = (publicId: string) => {
    setCloudinaryImages(prev => prev.filter(img => img.publicId !== publicId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (cloudinaryImages.length === 0) {
      toast({
        title: "Image required",
        description: "Please upload at least one product image via Cloudinary before saving.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

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

    const selectedCategory = categories.find(cat => cat.id === formData.category);
    if (!selectedCategory?.subcategories?.find(sub => sub.id === formData.subcategory)) {
      toast({
        title: "Invalid subcategory",
        description: "The selected subcategory is not valid for the selected category.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    try {
      const productImages = imageUrls.length > 0 ? imageUrls : ["/product_images/unknown-product.jpg"];
      const selectedSubcategory = selectedCategory?.subcategories?.find(sub => sub.id === formData.subcategory);
      const finalDisplayCategory = selectedSubcategory ? selectedSubcategory.name : formData.subcategory;

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.subcategory,
        displayCategory: finalDisplayCategory,
        images: productImages,
        cloudinaryImages,
        cloudinaryMigrated: true,
        inStock: formData.inStock,
        stockQuantity: parseInt(formData.stockQuantity),
        origin: formData.origin,
        availableCountries: formData.availableCountries,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
        reviews: {
          average: 0,
          count: 0,
        },
      };

      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be logged in to add products");
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch("/api/products/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add product");
      }

      toast({
        title: "Product added",
        description: "The product has been successfully added.",
      });
      navigate("/admin/products");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product. Please try again.",
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
    );
  }

  if (!isAdmin) {
    return null;
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
          <p className="text-gray-500 mt-2">Create a new product in your inventory</p>
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
              <Label htmlFor="category">Main Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  handleSelectChange("category", value);
                  handleSelectChange("subcategory", "");
                }}
                required
              >
                <SelectTrigger className="w-full">
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

          {formData.category && (
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
                  {categories.find(cat => cat.id === formData.category)?.subcategories?.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Product Images (via Cloudinary)</Label>
            <CloudinaryUploadWidget
              buttonText="Upload Product Images"
              onUploadSuccess={handleCloudinaryUpload}
              onRemove={handleRemoveCloudinaryImage}
              currentImages={cloudinaryImages}
              multiple={true}
              onUploadError={(err) => {
                toast({
                  title: "Upload failed",
                  description: err.message || "Failed to upload image",
                  variant: "destructive",
                });
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Fallback Image URLs (Optional)</Label>
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
              <div className="mt-2 flex flex-wrap gap-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-100 rounded-md px-3 py-2">
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
  );
}
