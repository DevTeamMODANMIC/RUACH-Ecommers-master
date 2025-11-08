"use client"

import { useState, useRef } from "react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Camera, Upload, X, Loader2 } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string
  userInitials?: string
  onUploadSuccess: (photoUrl: string) => void
  onUploadError?: (error: string) => void
}

export default function ProfilePhotoUpload({
  currentPhotoUrl,
  userInitials = "U",
  onUploadSuccess,
  onUploadError,
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "your-cloud-name"
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "profile_photos"

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
      setSelectedFile(file)
      setDialogOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadToCloudinary = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)
      formData.append("folder", "profile_photos")
      formData.append("transformation", "c_fill,g_face,h_400,w_400,q_auto,f_auto")

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      const photoUrl = data.secure_url

      // Call success callback
      onUploadSuccess(photoUrl)

      toast({
        title: "Photo updated",
        description: "Your profile photo has been updated successfully",
      })

      // Reset state
      setDialogOpen(false)
      setPreviewUrl(null)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading photo:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload photo"

      if (onUploadError) {
        onUploadError(errorMessage)
      }

      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemovePhoto = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCancelUpload = () => {
    handleRemovePhoto()
    setDialogOpen(false)
  }

  return (
    <>
      <div className="relative inline-block">
        <Avatar className="h-24 w-24 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <AvatarImage src={currentPhotoUrl} alt="Profile photo" />
          <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
        </Avatar>

        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <Camera className="h-4 w-4" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Preview Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Photo</DialogTitle>
            <DialogDescription>
              Preview your new profile photo before uploading
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {previewUrl ? (
              <div className="relative">
                <Avatar className="h-48 w-48">
                  <AvatarImage src={previewUrl} alt="Preview" />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-0 right-0 rounded-full h-8 w-8"
                  onClick={handleRemovePhoto}
                  type="button"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Select an image to preview
                </p>
              </div>
            )}

            {selectedFile && (
              <div className="text-center text-sm text-muted-foreground">
                <p className="font-medium">{selectedFile.name}</p>
                <p>{(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelUpload}
              disabled={isUploading}
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadToCloudinary}
              disabled={!selectedFile || isUploading}
              type="button"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
