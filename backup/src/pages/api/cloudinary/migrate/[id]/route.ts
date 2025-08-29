import { NextRequest, NextResponse } from 'next/server';
import { migrateProductToCloudinary } from '@/lib/cloudinary-migration.server';
import { auth, getFirebaseAdminApp } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get product ID from params
    const productId = params.id;
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    try {
      // Initialize Firebase Admin
      getFirebaseAdminApp();
      // Verify the Firebase token
      const decodedToken = await auth().verifyIdToken(idToken);
      
      // In a production app, you would check if the user has admin privileges
      // For now, we're just verifying authentication
    } catch (authError) {
      console.error('Auth verification error:', authError);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // Parse the request body
    const { updateDatabase = true } = await request.json();

    console.log(`Starting Cloudinary migration for product ${productId}...`);
    const migrationResult = await migrateProductToCloudinary(productId, updateDatabase);
    console.log(`Migration for product ${productId} completed`);

    if (migrationResult.error) {
      return NextResponse.json({ 
        success: false, 
        message: `Migration for product ${productId} failed`,
        error: migrationResult.error
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Migration for product ${productId} completed`,
      productId,
      result: migrationResult
    });
  } catch (error: any) {
    console.error(`Error during migration of product ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
} 