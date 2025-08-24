;

import { useEffect, useRef, useState } from "react";
import { Button } from "../../src/components/ui/button";
import { Upload, X, AlertCircle, Loader2, Upload as UploadIcon } from "lucide-react";
import { Alert, AlertDescription } from "../../src/components/ui/alert";
import { Input } from "../../src/components/ui/input";
import { auth } from "../../src/lib/firebase";

interface CloudinaryUploadWidgetProps {
  onUploadSuccess: (publicId: string, url: string, alt?: string) => void;
  onUploadError?: (error: any) => void;
  buttonText?: string;
  currentImages?: Array<{publicId: string, url: string, alt?: string}>;
  onRemove?: (publicId: string) => void;
  multiple?: boolean;
}

export default function CloudinaryUploadWidget({
  onUploadSuccess,
  onUploadError,
  buttonText = "Upload Image",
  currentImages = [],
  onRemove,
  multiple = false,
}: CloudinaryUploadWidgetProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<Array<{publicId: string, url: string, alt?: string}>>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle changes to currentImages prop with a ref to prevent infinite loops
  const prevImagesRef = useRef<Array<{publicId: string, url: string, alt?: string}>>([]);
  
  useEffect(() => {
    // Function to compare arrays by publicId
    const areArraysDifferentByPublicId = (
      arr1: Array<{publicId: string, url: string, alt?: string}>, 
      arr2: Array<{publicId: string, url: string, alt?: string}>
    ) => {
      if (arr1.length !== arr2.length) return true;
      
      return arr1.some((item1, index) => {
        const item2 = arr2[index];
        return item1.publicId !== item2.publicId;
      });
    };
    
    // Only update state if there's a meaningful difference
    if (areArraysDifferentByPublicId(currentImages, prevImagesRef.current)) {
      setImagePreviews(currentImages);
      prevImagesRef.current = [...currentImages];
    }
  }, [currentImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Validate file sizes (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const invalidFiles = files.filter(file => file.size > maxSize);
      
      if (invalidFiles.length > 0) {
        setError(`Some files are too large. Maximum file size is 10MB. Large files: ${invalidFiles.map(f => f.name).join(', ')}`);
        return;
      }
      
      // Validate file types
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      const invalidTypes = files.filter(file => !validTypes.includes(file.type));
      
      if (invalidTypes.length > 0) {
        setError(`Invalid file types. Only JPEG, PNG, WebP, and GIF images are allowed. Invalid files: ${invalidTypes.map(f => f.name).join(', ')}`);
        return;
      }
      
      setError(null);
      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be logged in to upload images");
      }

      const idToken = await currentUser.getIdToken();

      // Upload each file
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(`Uploading ${file.name} (${i + 1}/${selectedFiles.length})...`);
        
        // Convert file to base64
        const base64 = await convertFileToBase64(file);
        
        // Upload to our API endpoint with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout
        
        let response;
        try {
          response = await fetch('/api/cloudinary/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
              file: {
                base64,
                name: file.name,
                type: file.type
              },
              options: {
                folder: 'ruach_ecommerce_products' // Updated folder name
              }
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            throw new Error(`Upload timeout for ${file.name}. Please try again with a smaller file or check your internet connection.`);
          }
          throw fetchError;
        }

        console.log("Cloudinary Upload Response:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });

        let responseData;
        try {
          responseData = await response.json();
          console.log("Response JSON:", responseData);
        } catch (jsonError) {
          console.error("Failed to parse response JSON:", jsonError);
          responseData = await response.text();
          console.log("Response Text:", responseData);
        }

        if (!response.ok) {
          // Extract error message from the detailed error response
          const errorMessage = responseData?.error?.message || 
            responseData?.error?.details || 
            responseData?.error || 
            responseData || 
            'Upload failed with unknown error';

          console.error("Upload Error Details:", {
            status: response.status,
            errorMessage: errorMessage,
            fullResponse: responseData
          });

          // Try to parse and stringify the error to avoid [object Object]
          const formattedError = typeof errorMessage === 'object' 
            ? JSON.stringify(errorMessage) 
            : errorMessage;

          throw new Error(formattedError);
        }

        if (responseData.success && responseData.result) {
          const { public_id, secure_url, original_filename } = responseData.result;
          const alt = original_filename || file.name || "Product image";
          
          // Add to previews if not already there
          if (!imagePreviews.some(img => img.publicId === public_id)) {
            setImagePreviews(prev => [...prev, { publicId: public_id, url: secure_url, alt }]);
          }
          
          // Trigger parent callback
          onUploadSuccess(public_id, secure_url, alt);
        }
      }

      // Clear the file input and selected files
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFiles([]);
      setUploadProgress('Upload completed successfully!');
      
      // Clear progress message after 2 seconds
      setTimeout(() => setUploadProgress(''), 2000);
      
    } catch (error: any) {
      console.error("Full Upload Error:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        errorObject: error
      });
      
      // Ensure error is a string and not [object Object]
      const errorMessage = error.message || 
        (typeof error === 'object' ? JSON.stringify(error) : String(error));
      
      setError(errorMessage);
      
      if (onUploadError) onUploadError(error);
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleRemoveImage = (publicId: string) => {
    setImagePreviews(prev => prev.filter(img => img.publicId !== publicId));
    if (onRemove) onRemove(publicId);
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {uploadProgress && (
        <Alert className="mb-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>{uploadProgress}</AlertDescription>
        </Alert>
      )}
      
      {imagePreviews.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-4">
          {imagePreviews.map((image) => (
            <div key={image.publicId} className="relative">
              <img
                src={image.url}
                alt={image.alt || "Product preview"}
                className="w-24 h-24 object-cover rounded-md border border-gray-200"
              />
              <button
                onClick={() => handleRemoveImage(image.publicId)}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                aria-label="Remove image"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <Input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          multiple={multiple}
          onChange={handleFileChange}
          ref={fileInputRef}
          className="border border-gray-300 rounded-md w-full"
        />
        <p className="text-sm text-gray-500 mt-1">
          Accepted formats: JPEG, PNG, WebP, GIF. Maximum size: 10MB per file.
        </p>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleUpload}
          className="flex items-center gap-2"
          disabled={isUploading || selectedFiles.length === 0}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <UploadIcon className="h-4 w-4" />
              {buttonText}
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 