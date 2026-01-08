import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminApp, auth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // This should be protected in a real application
    // For now, we're using a secret key for demonstration
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.ADMIN_SECRET_KEY;
    
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split('Bearer ')[1] !== secretKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Initialize Firebase Admin
    getFirebaseAdminApp();
    
    // Find user by email
    let userRecord;
    try {
      userRecord = await auth().getUserByEmail(email);
    } catch (error) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update user's custom claims to include admin role
    await auth().setCustomUserClaims(userRecord.uid, { admin: true });
    
    return NextResponse.json({ 
      success: true, 
      message: `User ${email} has been granted admin privileges` 
    });
  } catch (error) {
    console.error('Error setting admin role:', error);
    return NextResponse.json(
      { error: 'Failed to set admin role', details: (error as Error).message }, 
      { status: 500 }
    );
  }
}