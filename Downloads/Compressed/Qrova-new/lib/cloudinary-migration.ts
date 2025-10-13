import cloudinary from './cloudinary';
import fs from 'fs';
import path from 'path';
import { Product } from '@/types';
import { products } from './product-data';
import { updateProduct } from './firebase-products';

/**
 * Uploads a local file to Cloudinary
 * @param filePath Path to the local file
 * @param options Additional Cloudinary upload options
 * @returns Promise with upload result
 */
export const uploadLocalFileToCloudinary = async (filePath: string, options: any = {}) => {
  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return null;
    }

    // Set default options
    const defaultOptions = {
      folder: 'borderlessbuy_products',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      resource_type: 'auto'
    };

    const mergedOptions = { ...defaultOptions, ...options };
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, mergedOptions);
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
};

/**
 * Uploads a remote image URL to Cloudinary
 * @param imageUrl URL of the image to upload
 * @param options Additional Cloudinary upload options
 * @returns Promise with upload result
 */
export const uploadRemoteImageToCloudinary = async (imageUrl: string, options: any = {}) => {
  try {
    // Set default options
    const defaultOptions = {
      folder: 'borderlessbuy_products',
      use_filename: true,
      unique_filename: true,
      overwrite: false
    };

    const mergedOptions = { ...defaultOptions, ...options };
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageUrl, mergedOptions);
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
};

/**
 * Migrates all product images to Cloudinary
 * @param updateDatabase Whether to update the Firebase database with new Cloudinary URLs
 * @returns Promise with migration results
 */
export const migrateProductImagesToCloudinary = async (updateDatabase = false) => {
  const results: Record<string, any> = {};
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  for (const product of products) {
    results[product.id] = {
      name: product.name,
      originalImages: product.images,
      cloudinaryImages: []
    };
    
    const cloudinaryImages = [];
    
    for (const imageUrl of product.images) {
      let fullUrl = imageUrl;
      
      // If the image URL is relative, make it absolute
      if (imageUrl.startsWith('/')) {
        fullUrl = `${baseUrl}${imageUrl}`;
      }
      
      // Upload to Cloudinary
      const result = await uploadRemoteImageToCloudinary(fullUrl, {
        public_id: `${product.id}_${path.basename(imageUrl, path.extname(imageUrl))}`,
        tags: [product.category, product.origin, 'migration']
      });
      
      if (result) {
        cloudinaryImages.push({
          publicId: result.public_id,
          url: result.secure_url,
          alt: product.name
        });
      }
    }
    
    results[product.id].cloudinaryImages = cloudinaryImages;
    
    // Update the product in Firebase if requested
    if (updateDatabase && cloudinaryImages.length > 0) {
      try {
        await updateProduct(product.id, {
          ...product,
          cloudinaryImages
        });
        results[product.id].updated = true;
      } catch (error) {
        console.error(`Error updating product ${product.id}:`, error);
        results[product.id].updated = false;
        results[product.id].error = error;
      }
    }
  }
  
  return results;
};

/**
 * Migrates a single product's images to Cloudinary
 * @param productId ID of the product to migrate
 * @param updateDatabase Whether to update the Firebase database with new Cloudinary URLs
 * @returns Promise with migration results
 */
export const migrateProductToCloudinary = async (productId: string, updateDatabase = false) => {
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return { error: 'Product not found' };
  }
  
  const result = {
    name: product.name,
    originalImages: product.images,
    cloudinaryImages: []
  };
  
  const cloudinaryImages = [];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  for (const imageUrl of product.images) {
    let fullUrl = imageUrl;
    
    // If the image URL is relative, make it absolute
    if (imageUrl.startsWith('/')) {
      fullUrl = `${baseUrl}${imageUrl}`;
    }
    
    // Upload to Cloudinary
    const uploadResult = await uploadRemoteImageToCloudinary(fullUrl, {
      public_id: `${product.id}_${path.basename(imageUrl, path.extname(imageUrl))}`,
      tags: [product.category, product.origin]
    });
    
    if (uploadResult) {
      cloudinaryImages.push({
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        alt: product.name
      });
    }
  }
  
  result.cloudinaryImages = cloudinaryImages;
  
  // Update the product in Firebase if requested
  if (updateDatabase && cloudinaryImages.length > 0) {
    try {
      await updateProduct(productId, {
        ...product,
        cloudinaryImages
      });
      result.updated = true;
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
      result.updated = false;
      result.error = error;
    }
  }
  
  return result;
}; 