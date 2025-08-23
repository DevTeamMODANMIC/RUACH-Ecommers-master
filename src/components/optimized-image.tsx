

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  showLoadingState?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/placeholder.jpg",
  showLoadingState = true,
  className = "",
  fill = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(showLoadingState)
  const [error, setError] = useState(false)
  
  const handleError = () => {
    setError(true)
    setIsLoading(false)
  }
  
  // Check if this is a local image (starts with /)
  const isLocalImage = typeof src === 'string' && src.startsWith('/')
  
  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/10 animate-pulse">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {isLocalImage ? (
        // For local images, use standard img tag
        <img
          src={error ? fallbackSrc : src}
          alt={alt}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 w-full h-full object-contain`}
          onLoad={() => setIsLoading(false)}
          onError={handleError}
        />
      ) : (
        // For remote images, use Next.js Image
        <Image
          src={error ? fallbackSrc : src}
          alt={alt}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={() => setIsLoading(false)}
          onError={handleError}
          fill={fill}
          {...props}
        />
      )}
    </div>
  )
}

// Also export as default for compatibility
export default OptimizedImage; 