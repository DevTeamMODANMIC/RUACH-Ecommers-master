import cloudinary from './cloudinary';
import fs from 'fs';
import path from 'path';
import { products } from './product-data';
import { updateProduct } from './firebase-products';
import { promises as fsPromises } from 'fs';

// Flag the file as server-only by exporting a constant
export const runtime = 'nodejs';

/**
 * Uploads a local file to Cloudinary
 */
export const uploadLocalFileToCloudinary = async (filePath: string, options: any = {}) => {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return null;
  }

  const defaultOptions = {
    folder: 'borderlessbuy_products',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    resource_type: 'auto',
  };

  const mergedOptions = { ...defaultOptions, ...options };
  return cloudinary.uploader.upload(filePath, mergedOptions);
};

/**
 * Uploads a remote image URL to Cloudinary
 */
export const uploadRemoteImageToCloudinary = async (imageUrl: string, options: any = {}) => {
  if (!imageUrl) {
    throw new Error('Image URL is required for upload');
  }
  
  let finalUrl = imageUrl;
  
  // Ensure URL is properly formatted for Cloudinary
  if (imageUrl.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    try {
      finalUrl = new URL(imageUrl, baseUrl).toString();
    } catch (urlError) {
      console.error(`Invalid URL format: ${imageUrl}`, urlError);
      throw new Error(`Invalid URL format: ${imageUrl}`);
    }
  }
  
  console.log(`Uploading remote image: ${finalUrl}`);
  
  // Use default options if none provided
  const defaultOptions = {
    folder: 'borderlessbuy_products',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    timeout: 60000, // 60 second timeout
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    const result = await cloudinary.uploader.upload(finalUrl, mergedOptions);
    return result;
  } catch (error) {
    console.error(`Cloudinary upload failed for ${finalUrl}:`, error);
    throw error;
  }
};

/**
 * Migrates all product images to Cloudinary
 */
export const migrateProductImagesToCloudinary = async (updateDatabase = false) => {
  const results: Record<string, any> = {};
  
  try {
    // Import Firebase functions
    const { getProducts } = await import('./firebase-products');
    
    // Get all products from Firebase
    console.log("Fetching all products from Firebase...");
    const productsData = await getProducts({}, 100);
    const products = productsData.products;
    
    console.log(`Found ${products.length} products to process`);
    
    for (const product of products) {
      try {
        console.log(`Processing product ${product.id}: ${product.name}`);
        
        // Skip products without images
        if (!product.images || product.images.length === 0) {
          console.log(`Skipping product ${product.id}: No images found`);
          results[product.id] = { 
            skipped: true, 
            reason: 'No images',
            name: product.name
          };
          continue;
        }
        
        // Skip already migrated products unless forced
        if (product.cloudinaryMigrated) {
          console.log(`Skipping product ${product.id}: Already migrated to Cloudinary`);
          results[product.id] = { 
            skipped: true, 
            reason: 'Already migrated',
            name: product.name
          };
          continue;
        }
        
        // Call the single product migration for each product
        const migrationResult = await migrateProductToCloudinary(product.id, updateDatabase);
        
        results[product.id] = {
          ...migrationResult,
          name: product.name
        };
        
        console.log(`Completed processing product ${product.id}`);
      } catch (productError) {
        console.error(`Error processing product ${product.id}:`, productError);
        results[product.id] = {
          error: String(productError),
          name: product.name || 'Unknown product'
        };
      }
    }
    
    console.log("All products processed");
    return results;
  } catch (error) {
    console.error("Failed to migrate products:", error);
    throw error;
  }
};

/**
 * Migrates a single product's images
 */
export const migrateProductToCloudinary = async (productId: string, updateDatabase = false) => {
  try {
    // Fetch product from Firebase instead of using the static products array
    const { getProduct } = await import('./firebase-products');
    const product = await getProduct(productId);
    
    if (!product) {
      console.error(`Product not found: ${productId}`);
      return { error: 'Product not found' };
    }

    console.log(`Migrating product ${productId}: ${product.name}`);
    const cloudinaryImages = [] as any[];

    if (!product.images || product.images.length === 0) {
      console.error(`No images found for product: ${productId}`);
      return { error: 'Product has no images' };
    }

    for (const imageUrl of product.images) {
      let fullUrl = imageUrl;
      
      if (!imageUrl) {
        console.log(`Skipping empty image URL in product ${productId}`);
        continue;
      }
      
      // Add domain for relative URLs
      if (imageUrl.startsWith('/')) {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        fullUrl = new URL(imageUrl, baseUrl).toString();
      }
      
      const localPath = imageUrl.startsWith('/') ? urlToLocalPath(imageUrl) : null;

      let uploadRes;
      let fileExists = false;
      
      // Safely check if the file exists
      if (localPath) {
        try {
          fileExists = fs.existsSync(localPath);
          if (fileExists) {
            console.log(`Found local file for ${product.name}: ${localPath}`);
          } else {
            console.log(`Local file not found for ${product.name}: ${localPath}`);
          }
        } catch (fsError) {
          console.error(`Error checking file existence for ${localPath}:`, fsError);
          fileExists = false;
        }
      }
      
      try {
        // Try uploading from local file if it exists
        if (localPath && fileExists) {
          try {
            console.log(`Uploading local file for ${product.name}: ${localPath}`);
            uploadRes = await uploadLocalFileToCloudinary(localPath, {
              public_id: `product_${productId}_${path.basename(imageUrl, path.extname(imageUrl))}`,
              tags: [product.category || 'uncategorized', product.origin || 'unknown'],
            });
          } catch (uploadError) {
            console.error(`Local file upload failed for ${localPath}:`, uploadError);
            // Fall back to remote upload if local fails
            console.log(`Falling back to remote upload after local error: ${fullUrl}`);
            uploadRes = await uploadRemoteImageToCloudinary(fullUrl, {
              public_id: `product_${productId}_${path.basename(imageUrl, path.extname(imageUrl))}`,
              tags: [product.category || 'uncategorized', product.origin || 'unknown'],
            });
          }
        } else {
          // Try remote upload if file doesn't exist locally
          console.log(`Trying remote upload for ${product.name}: ${fullUrl}`);
          uploadRes = await uploadRemoteImageToCloudinary(fullUrl, {
            public_id: `product_${productId}_${path.basename(imageUrl, path.extname(imageUrl))}`,
            tags: [product.category || 'uncategorized', product.origin || 'unknown'],
          });
        }
        
        cloudinaryImages.push({
          publicId: uploadRes.public_id,
          url: uploadRes.secure_url,
          alt: product.name,
        });
        console.log(`Successfully uploaded ${imageUrl} to Cloudinary: ${uploadRes.secure_url}`);
      } catch (err) {
        console.error(`Upload failed for ${imageUrl} in product ${productId}:`, err);
      }
    }

    if (updateDatabase && cloudinaryImages.length) {
      try {
        console.log(`Updating product ${productId} with ${cloudinaryImages.length} Cloudinary images`);
        await updateProduct(productId, { 
          cloudinaryImages,
          cloudinaryMigrated: true,
          updatedAt: new Date()
        });
        console.log(`Database updated for product ${productId}`);
      } catch (err) {
        console.error(`Database update failed for product ${productId}:`, err);
        return { error: String(err) };
      }
    }

    return { 
      productId,
      productName: product.name,
      cloudinaryImages,
      imagesCount: cloudinaryImages.length
    };
  } catch (error) {
    console.error(`Migration failed for product ${productId}:`, error);
    return { error: String(error) };
  }
};

// Helper to map a site-relative URL ("/product_images/..." or "/public/..." ) to an absolute local file path inside the repo's "public" folder
const urlToLocalPath = (url: string): string | null => {
  if (!url.startsWith('/')) return null;
  // Remove leading slash and normalise windows paths
  const relative = url.replace(/^\//, '');
  // If the original path already starts with 'public/', strip it so we don't duplicate
  const cleaned = relative.startsWith('public/') ? relative.slice('public/'.length) : relative;
  return path.join(process.cwd(), 'public', cleaned);
}; 