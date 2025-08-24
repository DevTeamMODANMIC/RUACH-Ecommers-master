import { NextRequest, NextResponse } from 'next/server';
import { addProduct } from '@/lib/firebase-products';
import { auth, getFirebaseAdminApp } from '@/lib/firebase-admin';

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

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      // Initialize Firebase Admin if needed
      getFirebaseAdminApp();
      // Verify the Firebase token
      decodedToken = await auth().verifyIdToken(idToken);
    } catch (authError) {
      console.error('Auth verification error:', authError);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // Parse the request body
    const productData = await request.json();

    // Validate required fields
    if (!productData.name || !productData.price || !productData.category) {
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

    // Log the incoming product data
    console.log('API: Creating new product:', {
      name: productData.name,
      originalCategory,
      category: productData.category,
      displayCategory: productData.displayCategory,
      hasCloudinaryImages: !!(productData.cloudinaryImages && productData.cloudinaryImages.length > 0),
      hasLegacyImages: !!(productData.images && productData.images.length > 0)
    });

    // Ensure Cloudinary images are properly formatted if provided
    if (productData.cloudinaryImages && Array.isArray(productData.cloudinaryImages)) {
      // Validate each cloudinary image has the required fields
      const validImages = productData.cloudinaryImages.every(
        (img: any) => img.publicId && img.url
      );
      
      if (!validImages) {
        return NextResponse.json(
          { error: 'Invalid Cloudinary image format. Each image must have publicId and url' },
          { status: 400 }
        );
      }
      
      // Mark the product as migrated to Cloudinary
      productData.cloudinaryMigrated = true;
    } else if (!productData.images || productData.images.length === 0) {
      // If no Cloudinary images and no regular images, use a default
      productData.images = ['/product_images/unknown-product.jpg'];
    }

    // Add product to Firebase
    const productId = await addProduct({
      ...productData,
      // Ensure all required fields have default values if not provided
      inStock: productData.inStock !== undefined ? productData.inStock : true,
      stockQuantity: productData.stockQuantity || 100,
      origin: productData.origin || '',
      availableCountries: productData.availableCountries || ['United Kingdom'],
      tags: productData.tags || [],
      reviews: productData.reviews || { average: 0, count: 0 },
      // Set Firebase sync flags
      firebaseSynced: true,
      lastSyncedAt: new Date()
    });

    console.log('API: Product created successfully:', {
      productId,
      name: productData.name,
      category: productData.category,
      displayCategory: productData.displayCategory
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Product added successfully',
      productId
    });
  } catch (error: any) {
    console.error('Error adding product:', error);
    return NextResponse.json(
      { error: 'Failed to add product', details: error.message },
      { status: 500 }
    );
  }
} 