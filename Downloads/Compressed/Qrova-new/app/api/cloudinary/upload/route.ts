import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { verifyAuth } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

// Create a server-side API endpoint for authenticated Cloudinary uploads
export async function POST(request: NextRequest) {
  try {
    // Verify Firebase auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const authUser = await verifyAuth(token);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get image data from request
    const data = await request.json();
    const { file, options } = data;

    if (!file || !file.base64) {
      return NextResponse.json({ error: 'Missing file data' }, { status: 400 });
    }

    // Upload to Cloudinary using the server-side SDK
    const uploadOptions = {
      folder: 'borderlessbuy_products',
      ...options
    };

    const result = await cloudinary.uploader.upload(file.base64, uploadOptions);

    return NextResponse.json({
      success: true,
      result: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        original_filename: file.name || 'product-image'
      }
    });
    
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to upload image' 
    }, { status: 500 });
  }
} 