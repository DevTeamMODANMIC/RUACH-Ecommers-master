// Mock implementation for environments without Firebase Storage

// Generate a placeholder image URL based on the file name
const generatePlaceholderUrl = (file: File): string => {
  const timestamp = new Date().getTime()
  const randomString = Math.random().toString(36).substring(2, 15)
  // Use placeholder.com for demo purposes
  return `/product_images/placeholder-${timestamp}-${randomString}.jpg`
}

// Mock upload a single image and return a placeholder URL
export const uploadImage = async (file: File, folder = "products"): Promise<string> => {
  try {
    // For demo purposes, just return a placeholder URL
    // In a real app, you would upload to Firebase Storage
    return generatePlaceholderUrl(file)
  } catch (error: any) {
    console.error("Error generating placeholder image URL:", error)
    throw new Error(error.message)
  }
}

// Mock upload multiple images and return an array of placeholder URLs
export const uploadImages = async (files: File[], folder = "products"): Promise<string[]> => {
  try {
    // For demo purposes, just return placeholder URLs
    return Array.from(files).map(file => generatePlaceholderUrl(file))
  } catch (error: any) {
    console.error("Error generating placeholder image URLs:", error)
    throw new Error(error.message)
  }
}

// Mock delete an image (no-op)
export const deleteImage = async (imageUrl: string): Promise<void> => {
  // In a real app, you would delete from Firebase Storage
  console.log(`Mock delete image: ${imageUrl}`)
  return Promise.resolve()
} 