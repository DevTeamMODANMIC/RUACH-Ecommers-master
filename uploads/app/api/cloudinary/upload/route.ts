import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for large uploads

// File size limits (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks for large files

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to compress image if needed
async function compressImageIfNeeded(base64Data: string, maxSizeKB: number = 500): Promise<string> {
  // If the base64 is already small enough, return as is
  const sizeKB = (base64Data.length * 3) / 4 / 1024;
  if (sizeKB <= maxSizeKB) {
    return base64Data;
  }

  // For larger images, we'll let Cloudinary handle the compression
  // by adding transformation parameters
  return base64Data;
}

// Helper function to retry upload with exponential backoff
async function retryUpload(uploadFn: () => Promise<any>, maxRetries: number = MAX_RETRIES): Promise<any> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uploadFn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.http_code === 400 || error.http_code === 401 || error.http_code === 403) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`Upload attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Create a server-side API endpoint for authenticated Cloudinary uploads
export async function POST(request: NextRequest) {
  try {
    // Parse request with timeout
    const data = await Promise.race([
      request.json(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request parsing timeout')), 30000)
      )
    ]) as any;

    console.log('Incoming upload request:', {
      fileType: data.file?.type,
      fileSize: data.file?.base64?.length,
      options: data.options,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    });

    // Validate file data
    if (!data.file || !data.file.base64) {
      console.error('Missing file data in upload request');
      return NextResponse.json({ 
        error: {
          message: 'Missing file data',
          details: 'No base64 file data provided'
        }
      }, { status: 400 });
    }

    // Validate file size
    const fileSizeBytes = (data.file.base64.length * 3) / 4; // Approximate size from base64
    if (fileSizeBytes > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: {
          message: 'File too large',
          details: `File size (${Math.round(fileSizeBytes / 1024 / 1024)}MB) exceeds maximum allowed size (${MAX_FILE_SIZE / 1024 / 1024}MB)`
        }
      }, { status: 400 });
    }

    // Validate upload preset configuration
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!uploadPreset) {
      console.error('Upload preset is not configured');
      return NextResponse.json({ 
        error: {
          message: 'Upload configuration error',
          details: 'Upload preset is missing in environment configuration'
        }
      }, { status: 500 });
    }

    if (!cloudName) {
      console.error('Cloud name is not configured');
      return NextResponse.json({ 
        error: {
          message: 'Upload configuration error',
          details: 'Cloud name is missing in environment configuration'
        }
      }, { status: 500 });
    }

    // Compress image if needed
    const optimizedBase64 = await compressImageIfNeeded(data.file.base64);

    // Prepare upload options with optimized settings
    const uploadOptions = {
      folder: data.options?.folder || 'ruach_ecommerce_products',
      upload_preset: uploadPreset,
      timeout: 180000, // 3 minutes
      chunk_size: CHUNK_SIZE,
      quality: 'auto:good', // Automatic quality optimization
      fetch_format: 'auto', // Automatic format optimization
      flags: 'progressive', // Progressive JPEG for better loading
      ...data.options
    };

    console.log('Cloudinary upload options:', {
      folder: uploadOptions.folder,
      upload_preset: uploadOptions.upload_preset,
      cloud_name: cloudName,
      timeout: uploadOptions.timeout,
      chunk_size: uploadOptions.chunk_size
    });

    try {
      // Use retry mechanism for upload
      const result = await retryUpload(async () => {
        return new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload(
            optimizedBase64, 
            {
              ...uploadOptions,
              upload_preset: uploadOptions.upload_preset
            }, 
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload callback error:', {
                  error_code: error.http_code,
                  error_message: error.message,
                  error_details: JSON.stringify(error)
                });
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          // Set a timeout for the upload
          const timeoutId = setTimeout(() => {
            reject(new Error('Upload timeout - operation took too long'));
          }, uploadOptions.timeout);

          // Clear timeout if upload completes
          const originalResolve = resolve;
          const originalReject = reject;
          
          resolve = (value) => {
            clearTimeout(timeoutId);
            originalResolve(value);
          };
          
          reject = (reason) => {
            clearTimeout(timeoutId);
            originalReject(reason);
          };
        });
      });

      console.log('Cloudinary upload successful:', {
        public_id: result.public_id,
        secure_url: result.secure_url,
        original_filename: data.file.name || 'product-image',
        format: result.format,
        bytes: result.bytes
      });

      return NextResponse.json({
        success: true,
        result: {
          public_id: result.public_id,
          secure_url: result.secure_url,
          original_filename: data.file.name || 'product-image',
          format: result.format,
          bytes: result.bytes
        }
      });
    } catch (cloudinaryError: any) {
      console.error('Cloudinary upload error after retries:', {
        message: cloudinaryError.message,
        error_code: cloudinaryError.http_code,
        error_details: JSON.stringify(cloudinaryError.error || 'Unknown Cloudinary error'),
        full_error: JSON.stringify(cloudinaryError)
      });

      return NextResponse.json({ 
        error: {
          message: cloudinaryError.message || 'Cloudinary upload failed',
          code: cloudinaryError.http_code,
          details: JSON.stringify(cloudinaryError.error || 'Unknown Cloudinary error')
        }
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Server-side upload error:', {
      message: error.message,
      stack: error.stack,
      full_error: JSON.stringify(error)
    });

    return NextResponse.json({ 
      error: {
        message: error.message || 'Failed to process upload',
        details: JSON.stringify(error)
      }
    }, { status: 500 });
  }
}