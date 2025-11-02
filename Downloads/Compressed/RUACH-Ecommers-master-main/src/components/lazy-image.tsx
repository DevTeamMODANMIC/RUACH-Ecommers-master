import { useState, useRef, useEffect } from "react"

interface LazyImageProps {
  src?: string
  alt: string
  className?: string
  placeholderClassName?: string
  fallback?: React.ReactNode
  onLoad?: () => void
  onError?: () => void
}

export default function LazyImage({
  src,
  alt,
  className = "",
  placeholderClassName = "bg-gray-200 animate-pulse",
  fallback,
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!src) {
      setHasError(true)
      return
    }

    const img = new Image()
    img.onload = () => {
      setIsLoaded(true)
      onLoad?.()
    }
    img.onerror = () => {
      setHasError(true)
      onError?.()
    }
    img.src = src
  }, [src, onLoad, onError])

  if (hasError || !src) {
    return fallback ? (
      <div className={className}>{fallback}</div>
    ) : (
      <div className={`${className} ${placeholderClassName}`} />
    )
  }

  return (
    <>
      {!isLoaded && <div className={`${className} ${placeholderClassName}`} />}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? 'block' : 'hidden'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </>
  )
}