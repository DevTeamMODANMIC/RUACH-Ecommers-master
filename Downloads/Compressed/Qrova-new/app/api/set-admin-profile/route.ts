import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminApp, auth } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

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
    const app = getFirebaseAdminApp();
    const db = getFirestore(app);
    
    // Find user by email
    let userRecord;
    try {
      userRecord = await auth().getUserByEmail(email);
    } catch (error) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update user's profile in Firestore to include admin role
    const userDocRef = db.collection('users').doc(userRecord.uid);
    await userDocRef.update({ role: 'admin' });
    
    return NextResponse.json({ 
      success: true, 
      message: `User ${email} profile has been updated with admin role` 
    });
  } catch (error) {
    console.error('Error setting admin role in profile:', error);
    return NextResponse.json(
      { error: 'Failed to set admin role in profile', details: (error as Error).message }, 
      { status: 500 }
    );
  }
}