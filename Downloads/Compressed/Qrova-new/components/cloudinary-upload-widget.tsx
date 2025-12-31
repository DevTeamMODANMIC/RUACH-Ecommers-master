"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, AlertCircle, Loader2, Upload as UploadIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase";

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
      for (const file of selectedFiles) {
        // Convert file to base64
        const base64 = await convertFileToBase64(file);
        
        // Upload to our API endpoint
        const response = await fetch('/api/cloudinary/upload', {
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
              folder: 'borderlessbuy_products'
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const data = await response.json();
        
        if (data.success && data.result) {
          const { public_id, secure_url, original_filename } = data.result;
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
      
    } catch (error: any) {
      console.error("Upload error:", error);
      setError(error.message || "Failed to upload image");
      if (onUploadError) onUploadError(error);
    } finally {
      setIsUploading(false);
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
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          ref={fileInputRef}
          className="border border-gray-300 rounded-md w-full"
        />
        
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