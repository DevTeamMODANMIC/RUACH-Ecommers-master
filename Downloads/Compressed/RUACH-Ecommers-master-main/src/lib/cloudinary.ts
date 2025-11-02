import { v2 as cloudinary } from 'cloudinary';
import { updateProduct } from './firebase-products';

// Configure Cloudinary
const cloudinaryConfig = cloudinary.config({
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
  api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET || '',
  secure: true
});

// Log Cloudinary configuration for debugging
console.log('Cloudinary Configuration:', {
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY ? 
    import.meta.env.VITE_CLOUDINARY_API_KEY.substring(0, 4) + '...' : 'MISSING',
  upload_preset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  full_config: {
    cloud_name: cloudinaryConfig.cloud_name || 'UNDEFINED',
    api_key: cloudinaryConfig.api_key ? 
      cloudinaryConfig.api_key.substring(0, 4) + '...' : 'MISSING'
  }
});

export default cloudinary;

/**
 * Updates a product in Firebase with Cloudinary images
 */
export const updateProductWithCloudinaryImages = async (
  productId: string,
  cloudinaryImages: Array<{publicId: string, url: string, alt?: string}>
) => {
  try {
    if (!productId || !cloudinaryImages || cloudinaryImages.length === 0) {
      throw new Error('Product ID and Cloudinary images are required');
    }
    
    await updateProduct(productId, {
      cloudinaryImages,
      cloudinaryMigrated: true,
      updatedAt: new Date()
    });
    
    return { success: true, productId };
  } catch (error: any) {
    throw new Error(`Failed to update product ${productId}: ${error.message}`);
  }
};
