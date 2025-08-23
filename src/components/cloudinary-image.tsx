;

import React, { useState } from "react";
;
import { buildImageUrl, buildSrcSet } from "@/lib/cloudinary-client";

interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  /**
   * Array of widths (px) for srcSet generation. Eg [200,400,800]
   */
  widths?: number[];
  /** Fallback size if widths not provided */
  size?: "thumbnail" | "small" | "medium" | "large";
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const CloudinaryImage = ({
  publicId,
  alt,
  width,
  height,
  widths = [200, 400, 800],
  size = "medium",
  className = '',
  priority = false,
  onLoad,
  onError,
}: CloudinaryImageProps) => {
  const [imgSrc, setImgSrc] = useState<string>(buildImageUrl(publicId, { width: 400, quality: "auto" }));
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const srcSet = buildSrcSet(publicId, widths, { quality: "auto", crop: "scale" });

  // Generate a tiny blurred version for placeholder
  const blurDataURL = buildImageUrl(publicId, { width: 20, quality: "auto", effect: "blur:2000" });

  // Handle image loading error
  const handleError = () => {
    setIsError(true);
    setImgSrc('/product_images/unknown-product.jpg');
    if (onError) onError();
  };

  // Handle successful image load
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  return (
    <div className={`relative ${className} ${isLoading ? 'bg-gray-100 animate-pulse' : ''}`}>
      <Image
        src={imgSrc}
        srcSet={srcSet}
        sizes="(max-width: 640px) 200px, (max-width: 1024px) 400px, 800px"
        alt={alt}
        width={width || (size === 'thumbnail' ? 150 : size === 'small' ? 250 : size === 'medium' ? 500 : 800)}
        height={height || (size === 'thumbnail' ? 150 : size === 'small' ? 250 : size === 'medium' ? 500 : 800)}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 object-contain`}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        placeholder="blur"
        blurDataURL={blurDataURL}
      />
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
          Image not available
        </div>
      )}
    </div>
  );
};

export default CloudinaryImage; 