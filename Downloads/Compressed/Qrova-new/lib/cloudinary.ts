import { v2 as cloudinary } from 'cloudinary';
import { updateProduct } from './firebase-products';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true
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
