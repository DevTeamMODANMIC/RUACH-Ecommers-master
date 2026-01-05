import { NextRequest, NextResponse } from 'next/server';
import { migrateProductImagesToCloudinary } from '@/lib/cloudinary-migration.server';
import { auth, getFirebaseAdminApp } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
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

    console.log('Starting Cloudinary migration for all products...');
    const migrationResults = await migrateProductImagesToCloudinary(updateDatabase);
    console.log('Migration completed');

    // Count migration statistics
    const stats = {
      total: Object.keys(migrationResults).length,
      success: 0,
      skipped: 0,
      failed: 0
    };

    for (const id in migrationResults) {
      const result = migrationResults[id];
      if (result.error) {
        stats.failed++;
      } else if (result.skipped) {
        stats.skipped++;
      } else {
        stats.success++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed',
      stats,
      results: migrationResults
    });
  } catch (error: any) {
    console.error('Error during migration:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
} 