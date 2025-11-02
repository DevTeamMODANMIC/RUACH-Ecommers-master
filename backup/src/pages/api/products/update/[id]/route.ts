import { NextRequest, NextResponse } from 'next/server';
import { updateProduct, getProduct } from '@/lib/firebase-products';
import { auth } from '@/lib/firebase-auth';

// Define category mapping to ensure consistency
const getCategoryId = (displayCategory: string): string => {
  const categoryMap: Record<string, string> = {
    "Beverages": "drinks",
    "Drinks & Beverages": "drinks",
    "Drinks": "drinks",
    "Food": "food",
    "Flour": "flour",
    "Rice": "rice",
    "Rice & Grains": "rice",
    "Pap/Custard": "pap-custard",
    "Spices": "spices",
    "Spices & Seasonings": "spices",
    "Dried Spices": "dried-spices",
    "Oil": "oil",
    "Provisions": "provisions",
    "Fresh Produce": "fresh-produce",
    "Fresh Vegetables": "fresh-vegetables",
    "Vegetables": "vegetables",
    "Vegetables & Fruits": "vegetables",
    "Meat": "meat",
    "Fish & Meat": "meat",
    "Meat & Fish": "meat"
  };
  return categoryMap[displayCategory] || "other";
};

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`API: Update product request received for id: ${id}`);
    
    // Verify admin authentication (you should implement proper auth validation)
    // This is a placeholder - in production, use proper auth middleware
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('API: Authentication failed - missing or invalid auth header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if product exists
    const existingProduct = await getProduct(id);
    if (!existingProduct) {
      console.log(`API: Product not found with id: ${id}`);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    console.log(`API: Found existing product: ${existingProduct.name}`);

    // Parse the request body
    const productData = await request.json();
    console.log('API: Received product data:', {
      name: productData.name,
      price: productData.price,
      category: productData.category,
      displayCategory: productData.displayCategory,
      hasCloudinaryImages: productData.cloudinaryImages?.length > 0,
      hasLegacyImages: productData.images?.length > 0,
    });

    // Validate required fields
    if (!productData.name || !productData.price || !productData.category) {
      console.log('API: Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: name, price, and category are required' },
        { status: 400 }
      );
    }

    // Ensure category consistency
    const originalCategory = productData.category;
    // If there's a displayCategory but no valid category ID mapping, fix it
    if (productData.displayCategory && 
        (!productData.category || productData.category === productData.displayCategory)) {
      productData.category = getCategoryId(productData.displayCategory);
    } 
    // If there's a valid category ID but no displayCategory, set it
    else if (!productData.displayCategory && productData.category) {
      // Set a suitable display name based on the category ID
      const displayNameMap: Record<string, string> = {
        "drinks": "Beverages",
        "food": "Food",
        "flour": "Flour",
        "rice": "Rice",
        "pap-custard": "Pap/Custard",
        "spices": "Spices",
        "dried-spices": "Dried Spices",
        "oil": "Oil",
        "provisions": "Provisions",
        "fresh-produce": "Fresh Produce",
        "fresh-vegetables": "Fresh Vegetables",
        "vegetables": "Vegetables",
        "meat": "Meat & Fish",
        "other": "Other"
      };
      productData.displayCategory = displayNameMap[productData.category] || productData.category;
    }

    // Log if category mapping was applied
    if (originalCategory !== productData.category) {
      console.log(`API: Mapped category from "${originalCategory}" to "${productData.category}" with display name "${productData.displayCategory}"`);
    }

    // Check that the product has at least one image (either Cloudinary or legacy)
    const hasCloudinaryImages = productData.cloudinaryImages && Array.isArray(productData.cloudinaryImages) && productData.cloudinaryImages.length > 0;
    const hasLegacyImages = productData.images && Array.isArray(productData.images) && productData.images.length > 0;
    
    if (!hasCloudinaryImages && !hasLegacyImages) {
      console.log('API: Validation failed - no images provided');
      return NextResponse.json(
        { error: 'At least one product image is required (either Cloudinary or URL-based)' },
        { status: 400 }
      );
    }

    // Ensure Cloudinary images are properly formatted if present
    if (productData.cloudinaryImages && Array.isArray(productData.cloudinaryImages)) {
      // Validate each cloudinary image has the required fields
      const validImages = productData.cloudinaryImages.every(
        (img: any) => img.publicId && img.url
      );
      
      if (!validImages) {
        console.log('API: Validation failed - invalid Cloudinary image format');
        return NextResponse.json(
          { error: 'Invalid Cloudinary image format. Each image must have publicId and url' },
          { status: 400 }
        );
      }
    }

    // Log before update
    console.log(`API: Updating product ${id} with new data`, {
      name: productData.name,
      category: productData.category,
      displayCategory: productData.displayCategory,
      hasCloudinaryImages: hasCloudinaryImages,
      cloudinaryImageCount: productData.cloudinaryImages?.length || 0,
      hasLegacyImages: hasLegacyImages,
      legacyImageCount: productData.images?.length || 0
    });

    // Update product in Firebase
    await updateProduct(id, {
      ...productData,
      updatedAt: new Date(),
      // Set Firebase sync flags
      firebaseSynced: true,
      lastSyncedAt: new Date()
    });
    
    // Verify the update was successful by fetching the updated product
    const updatedProduct = await getProduct(id);
    console.log(`API: Product ${id} updated successfully`, {
      name: updatedProduct?.name,
      category: updatedProduct?.category,
      displayCategory: (updatedProduct as any)?.displayCategory,
      updatedAt: updatedProduct?.updatedAt
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Product updated successfully',
      productId: id
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product', details: error.message },
      { status: 500 }
    );
  }
} 