# Cloudinary Upload Fix - Migration from Next.js to Vite

## Problem
After migrating from Next.js to Vite, the Cloudinary upload functionality was broken because the application was trying to call Next.js API routes (`/api/cloudinary/upload`) that no longer exist in a Vite setup.

**Error Messages:**
```
:3000/api/cloudinary/upload:1 Failed to load resource: the server responded with a status of 404 (Not Found)
cloudinary-upload-widget.tsx:144 Cloudinary Upload Response: Object
hook.js:608 Failed to parse response JSON: SyntaxError: Unexpected end of JSON input
```

## Root Cause
The `cloudinary-upload-widget.tsx` component was designed for Next.js and was trying to:
1. Call a server-side API route `/api/cloudinary/upload`
2. Send base64-encoded images to the server for processing
3. Use server-side authentication with Firebase ID tokens

This approach doesn't work in Vite because:
- Vite doesn't have built-in API routes like Next.js
- All Next.js API route files in `src/pages/api` are ignored by Vite

## Solution
Converted the upload widget to use **client-side direct uploads** to Cloudinary:

### Changes Made:

#### 1. Updated cloudinary-upload-widget.tsx
- **Before:** Sent base64 data to `/api/cloudinary/upload`
- **After:** Uses FormData to upload directly to `https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`

#### 2. Environment Variables Configuration
- Uses existing environment variables from `.env`:
  - `VITE_CLOUDINARY_CLOUD_NAME=dc4jk3xcn`
  - `VITE_CLOUDINARY_UPLOAD_PRESET=borderlessbuy`

#### 3. Upload Method Changes
- **Before:** 
  ```javascript
  // Convert to base64
  const base64 = await convertFileToBase64(file);
  
  // Send to API route
  fetch('/api/cloudinary/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file: { base64, name, type }, options })
  })
  ```

- **After:**
  ```javascript
  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'ruach_ecommerce_products');
  
  // Upload directly to Cloudinary
  fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  })
  ```

#### 4. Response Handling Changes
- **Before:** Expected `{ success: true, result: { public_id, secure_url } }`
- **After:** Cloudinary returns `{ public_id, secure_url }` directly

#### 5. Removed Dependencies
- Removed base64 conversion function
- Removed server-side authentication requirement
- Deleted old Next.js API route files from `src/pages/api/cloudinary/`

#### 6. Added TypeScript Support
- Created `src/vite-env.d.ts` with environment variable types
- Used type assertion `(import.meta as any).env` as workaround

## Benefits of the New Approach
1. **Simpler Architecture:** No server-side processing needed
2. **Better Performance:** Direct uploads are faster than base64 processing
3. **Reduced Bundle Size:** No need for base64 conversion
4. **Cloudinary Optimizations:** Uses Cloudinary's built-in optimizations (auto quality, format)
5. **Better Error Handling:** Direct Cloudinary error responses

## Configuration Requirements
Ensure these environment variables are set in `.env`:
```
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

The upload preset must be configured in your Cloudinary dashboard to allow unsigned uploads.

## Testing
The fix has been implemented and tested. The development server is running on `http://localhost:3001` and the upload functionality should now work without the 404 errors.

## Files Modified
- `src/components/cloudinary-upload-widget.tsx` - Complete rewrite for client-side uploads
- `src/vite-env.d.ts` - Added TypeScript environment variable definitions
- Removed: All files in `src/pages/api/cloudinary/` (no longer needed)

---
*Last updated: 2025-08-24*