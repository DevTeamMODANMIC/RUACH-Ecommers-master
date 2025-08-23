import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Test environment variables
    const envVars = {
      CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'not set',
      API_KEY: process.env.CLOUDINARY_API_KEY ? 'set' : 'not set',
      API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'set' : 'not set',
      UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'not set',
      CWD: process.cwd()
    };
    
    // Test Cloudinary API access
    let cloudinaryStatus = 'failed';
    try {
      const pingResult = await cloudinary.api.ping();
      cloudinaryStatus = 'connected';
    } catch (cloudinaryError) {
      cloudinaryStatus = `Error: ${String(cloudinaryError)}`;
    }
    
    // Test file system access
    let fileSystemStatus = 'unknown';
    let files = [];
    const publicDir = path.join(process.cwd(), 'public');
    
    try {
      if (fs.existsSync(publicDir)) {
        fileSystemStatus = 'accessible';
        files = fs.readdirSync(publicDir).slice(0, 5); // First 5 files
      } else {
        fileSystemStatus = 'public directory not found';
      }
    } catch (fsError) {
      fileSystemStatus = `Error: ${String(fsError)}`;
    }
    
    // Return diagnostic info
    return NextResponse.json({
      success: true,
      cloudinaryStatus,
      fileSystemStatus,
      environment: envVars,
      files
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false, 
      error: String(error)
    }, { status: 500 });
  }
} 