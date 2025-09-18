import { useState } from "react";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Heart, ShoppingCart, Minus, Plus } from "lucide-react";
import { useCart } from "../components/cart-provider";
import { formatCurrency } from "../lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "../components/ui/dialog";
import { useWishlist } from "../hooks/use-wishlist";
import { Separator } from "../components/ui/separator";
import CloudinaryImage from "../components/cloudinary-image";

// Types (If using TypeScript)
interface ProductDetailModalProps {
  product: any; // Replace 'any' with your Product type
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  // Calculate discounted price if applicable
  const discountedPrice =
    product.discount && product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : null;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: discountedPrice || product.price,
      image:
        product.cloudinaryImages?.[selectedImage]?.url ||
        product.images?.[selectedImage] ||
        product.images?.[0] ||
        "/placeholder.jpg",
      quantity,
      options: {},
    });
  };

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: discountedPrice || product.price,
      originalPrice: discountedPrice ? product.price : undefined,
      image:
        product.cloudinaryImages?.[0]?.url ||
        product.images?.[0] ||
        "/placeholder.jpg",
      category: product.category || product.displayCategory,
      inStock: !product.outOfStock,
    });
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          <DialogDescription>
            View detailed information about {product.name}
          </DialogDescription>
          <DialogClose />
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
              {product.cloudinaryImages && product.cloudinaryImages.length > 0 ? (
                <CloudinaryImage
                  publicId={product.cloudinaryImages[selectedImage].publicId}
                  alt={product.cloudinaryImages[selectedImage].alt || product.name}
                  size="medium"
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={
                    product.images?.[selectedImage] ||
                    "/product_images/unknown-product.jpg"
                  }
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/product_images/unknown-product.jpg";
                  }}
                />
              )}

              {product.outOfStock && (
                <div className="absolute top-4 left-0 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-r-lg shadow-md">
                  Out of Stock
                </div>
              )}

              {product.discount && product.discount > 0 && (
                <div className="absolute top-12 left-0 z-10 bg-red-500 text-white text-xs font-bold px-3 py-0.5 rounded-r-lg shadow-md">
                  -{product.discount}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{product.name}</h1>
                {product.bestseller && (
                  <Badge className="bg-amber-500 hover:bg-amber-600">Bestseller</Badge>
                )}
                {product.new && (
                  <Badge className="bg-blue-500 hover:bg-blue-600">New Arrival</Badge>
                )}
              </div>

              <p className="text-gray-600 mt-1">
                {product.displayCategory || product.category}
              </p>

              {/* Price */}
              <div className="mt-4">
                {discountedPrice ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(discountedPrice)}
                    </span>
                    <span className="text-gray-500 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mt-4 text-gray-600">
                  <p>{product.description}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Quantity */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-8 w-8 rounded-r-none"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="h-8 px-3 flex items-center justify-center border-y border-gray-200 bg-white">
                  {quantity}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  className="h-8 w-8 rounded-l-none"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2"
                disabled={product.outOfStock}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>

              <Button
                variant="outline"
                onClick={handleToggleWishlist}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Heart className="h-4 w-4" />
                {isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
