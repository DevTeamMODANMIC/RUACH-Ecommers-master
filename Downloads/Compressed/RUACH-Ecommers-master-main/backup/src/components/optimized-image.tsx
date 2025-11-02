

import { useState } from 'react'

interface OptimizedImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  showLoadingState?: boolean;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
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
      
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 w-full h-full object-contain`}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        style={fill ? { position: 'absolute', inset: 0 } : undefined}
      />
    </div>
  )
}

// Also export as default for compatibility
export default OptimizedImage; 