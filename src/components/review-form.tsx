

import type React from "react"

import { useState } from "react"

import { Button } from "../../src/components/ui/button"
import { Input } from "../../src/components/ui/input"
import { Label } from "../../src/components/ui/label"
import { Textarea } from "../../src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../src/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../../src/components/ui/card"
import { Checkbox } from "../../src/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../src/components/ui/dialog"
import { Star, Upload, X, MapPin } from "lucide-react"
import { useToast } from "../../src/hooks/use-toast"
import { useAuth } from "../../src/components/auth-provider"

interface ReviewFormProps {
  productId: number
  productName: string
  availableCountries: string[]
  onClose: () => void
  onSubmit: (review: any) => Promise<void>
}

export function ReviewForm({ productId, productName, availableCountries, onClose, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [countrySpecificNotes, setCountrySpecificNotes] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const [verifiedPurchase, setVerifiedPurchase] = useState(false)
  const [purchasePrice, setPurchasePrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const countryNames = {
    nigeria: "Nigeria",
    india: "India",
    ghana: "Ghana",
    jamaica: "Jamaica",
    uk: "United Kingdom",
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images per review.",
        variant: "destructive",
      })
      return
    }

    setImages((prev) => [...prev, ...files])

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreview((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating for your review.",
        variant: "destructive",
      })
      return
    }

    if (!selectedCountry) {
      toast({
        title: "Country required",
        description: "Please select which country's version of the product you're reviewing.",
        variant: "destructive",
      })
      return
    }

    if (content.trim().length < 10) {
      toast({
        title: "Review too short",
        description: "Please write at least 10 characters for your review.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const reviewData = {
        productId,
        rating,
        title: title.trim(),
        content: content.trim(),
        country: selectedCountry,
        countrySpecificNotes: countrySpecificNotes.trim(),
        images: imagePreview, // In a real app, you'd upload to a service
        verifiedPurchase,
        purchasePrice: purchasePrice ? Number.parseFloat(purchasePrice) : null,

        userName: user?.displayName || "Anonymous",

        userEmail: user?.email,
        date: new Date().toISOString(),
      }

      await onSubmit(reviewData)

      toast({
        title: "Review submitted!",
        description: "Thank you for your review. It will be published after moderation.",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error submitting review",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <p className="text-sm text-muted-foreground">{productName}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Country Selection */}
          <div className="space-y-2">
            <Label htmlFor="country">Which country's version are you reviewing? *</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry} required>
              <SelectTrigger>
                <SelectValue placeholder="Select the country where you purchased/used this product" />
              </SelectTrigger>
              <SelectContent>
                {availableCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {countryNames[country as keyof typeof countryNames]}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This helps other customers understand regional differences in quality, taste, or availability.
            </p>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Overall Rating *</Label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className="p-1"
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i + 1)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      i < (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 && (
                  <>
                    {rating} star{rating !== 1 ? "s" : ""} -{rating === 5 && " Excellent"}
                    {rating === 4 && " Good"}
                    {rating === 3 && " Average"}
                    {rating === 2 && " Poor"}
                    {rating === 1 && " Terrible"}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience in a few words"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">{title.length}/100 characters</p>
          </div>

          {/* Review Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Your Review *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell others about your experience with this product. What did you like or dislike? How was the quality, taste, packaging, etc.?"
              rows={5}
              required
              minLength={10}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">{content.length}/2000 characters (minimum 10)</p>
          </div>

          {/* Country-Specific Notes */}
          {selectedCountry && (
            <div className="space-y-2">
              <Label htmlFor="countryNotes">
                Country-Specific Notes ({countryNames[selectedCountry as keyof typeof countryNames]})
              </Label>
              <Textarea
                id="countryNotes"
                value={countrySpecificNotes}
                onChange={(e) => setCountrySpecificNotes(e.target.value)}
                placeholder={`Any specific observations about this product in ${countryNames[selectedCountry as keyof typeof countryNames]}? (e.g., local availability, price differences, taste variations, etc.)`}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{countrySpecificNotes.length}/500 characters</p>
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Add Photos (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Upload photos of the product (max 5 images)</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button type="button" variant="outline" size="sm" asChild>
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Images
                  </label>
                </Button>
              </div>
            </div>

            {/* Image Previews */}
            {imagePreview.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border">
                      <Image
                        src={preview || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Purchase Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Purchase Information (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={verifiedPurchase}
                  onCheckedChange={(checked) => setVerifiedPurchase(checked as boolean)}
                />
                <Label htmlFor="verified" className="text-sm">
                  I purchased this product from RUACH E-STORE
                </Label>
              </div>

              {verifiedPurchase && (
                <div className="space-y-2">
                  <Label htmlFor="price">Purchase Price (optional)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps other customers understand price variations
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
