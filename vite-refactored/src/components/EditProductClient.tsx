;

import { useState, useEffect } from "react";
import { useNavigate } from "next/navigation";
import Link from "next/link";
;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, X, Plus } from "lucide-react";
import { getProduct, updateProduct, type Product } from "@/lib/firebase-products";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/use-currency";
import CloudinaryUploadWidget from "@/components/cloudinary-upload-widget";
import { MAIN_CATEGORIES } from "@/lib/categories";

const categories = MAIN_CATEGORIES.filter(c => c.id !== "all").map(c => ({
  id: c.id,
  name: c.name,
}));

const countries = [
  "All", "United Kingdom", "Nigeria", "Ghana", "South Africa", "Kenya",
  "Cameroon", "Zimbabwe", "Uganda", "Tanzania", "United States",
];

interface EditProductClientProps {
  id: string;
}

export default function EditProductClient({ id }: EditProductClientProps) {
  const router = useNavigate();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [cloudinaryImages, setCloudinaryImages] = useState<
    Array<{ publicId: string; url: string; alt?: string }>
  >([]);
  const [product, setProduct] = useState<Product | null>(null);

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
  });

  useEffect(() => {
    const checkAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAdmin(true);
        fetchProduct();
      } else {
        navigate("/login");
      }
    });

    return () => checkAuth();
  }, [router, id]);

  const fetchProduct = async () => {
    try {
      const productData = await getProduct(id);
      if (productData) {
        setProduct(productData);
        setExistingImages(productData.images || []);
        if (productData.cloudinaryImages && productData.cloudinaryImages.length > 0) {
          setCloudinaryImages(productData.cloudinaryImages);
        }

        let categoryId = productData.category;
        const normalize = (str: string) => str.toLowerCase().replace(/[\s/_-]+/g, "");
        if (productData.category && !categories.some(cat => cat.id === productData.category)) {
          const normalizedProductCat = normalize(productData.category);
          const matchingCategory = categories.find(cat =>
            normalize(cat.id) === normalizedProductCat || normalize(cat.name) === normalizedProductCat
          );
          categoryId = matchingCategory ? matchingCategory.id : "other";
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
        });
      } else {
        toast({
          title: "Product not found",
          description: "The product you are trying to edit does not exist.",
          variant: "destructive",
        });
        navigate("/admin/products");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to load product data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    if (imageUrl && !existingImages.includes(imageUrl)) {
      setExistingImages([...existingImages, imageUrl]);
      setImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    const newUrls = [...existingImages];
    newUrls.splice(index, 1);
    setExistingImages(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const hasExistingCloudinaryImages = cloudinaryImages.length > 0;
      const hasLegacyImages = existingImages.length > 0;

      if (!hasExistingCloudinaryImages && !hasLegacyImages) {
        toast({
          title: "Image required",
          description: "Please upload at least one product image before saving.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const allImages = existingImages.length > 0 ? existingImages : ["/product_images/unknown-product.jpg"];
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      const displayCategory = selectedCategory ? selectedCategory.name : formData.category;

      const productData = {
        ...(product && {
          createdAt: product.createdAt,
          reviews: product.reviews,
          weight: product.weight,
          dimensions: product.dimensions,
          subcategory: product.subcategory,
          originalPrice: product.originalPrice,
          rating: product.rating,
          reviewCount: product.reviewCount,
          bestseller: product.bestseller,
          new: product.new,
          popular: product.popular,
          isNew: product.isNew,
          isBulk: product.isBulk,
          discount: product.discount,
        }),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        displayCategory,
        images: allImages,
        ...(cloudinaryImages.length > 0 && { cloudinaryImages }),
        inStock: formData.inStock,
        stockQuantity: parseInt(formData.stockQuantity),
        origin: formData.origin,
        availableCountries: formData.availableCountries,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
        ...(cloudinaryImages.length > 0 && { cloudinaryMigrated: true }),
      };

      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("You must be logged in to update products");

      const idToken = await currentUser.getIdToken();
      const response = await fetch(`/api/products/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(productData),
      });

      if (response.status === 404) {
        await updateProduct(id, productData);
      } else if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Failed to update product");
      }

      toast({
        title: "Product updated",
        description: "The product has been successfully updated.",
      });
      navigate("/admin/products");
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product. Please try again.",
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

  if (!isAdmin || !product) {
    return null;
  }

  return (
    <div className="container py-10">
      {/* Keep the rest of your UI exactly as before */}
    </div>
  );
}
