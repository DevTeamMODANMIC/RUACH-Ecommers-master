import { useState, useEffect } from "react"

import { Button } from "../../src/components/ui/button"
import { Card, CardContent } from "../../src/components/ui/card"
import { Badge } from "../../src/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../src/components/ui/select"
import { Progress } from "../../src/components/ui/progress"
import { Separator } from "../../src/components/ui/separator"
import { Star, ThumbsUp, ThumbsDown, Flag, MapPin, CheckCircle, Filter } from "lucide-react"
import { ReviewForm } from "../../src/components/review-form"
import { useReviews } from "../../src/hooks/use-reviews"
import { useCurrency } from "../../src/components/currency-provider"
import { useAuth } from "../../src/components/auth-provider"
import { useLocalStorage } from "../../src/hooks/use-local-storage"

interface ProductReviewsProps {
  productId: string
  productName: string
  availableCountries: string[]
}

export function ProductReviews({ productId, productName, availableCountries }: ProductReviewsProps) {
  const [selectedCountry, setSelectedCountry] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [filterRating, setFilterRating] = useState("all")
  const [showReviewForm, setShowReviewForm] = useState(false)
  const { user } = useAuth()
  const { formatPrice } = useCurrency()
  const [userVotes, setUserVotes] = useLocalStorage<Record<string, "helpful" | "not-helpful">>("review-votes", {})

  const { reviews, reviewStats, loading, submitReview, voteOnReview, reportReview, getReviews } = useReviews()

  useEffect(() => {
    // Convert string productId to number for the hook
    const productIdNum = parseInt(productId, 10) || 0
    getReviews(productIdNum, selectedCountry, sortBy, filterRating)
  }, [productId, selectedCountry, sortBy, filterRating, getReviews])

  const countryNames = {
    nigeria: "Nigeria",
    india: "India",
    ghana: "Ghana",
    jamaica: "Jamaica",
    uk: "United Kingdom",
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    }

    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const ratingDistribution = getRatingDistribution()
  const totalReviews = reviews.length

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Customer Reviews</h3>
        {user && <Button onClick={() => setShowReviewForm(true)}>Write a Review</Button>}
      </div>

      {/* Review Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{reviewStats.averageRating.toFixed(1)}</div>
              <div className="mb-2">{renderStars(Math.round(reviewStats.averageRating), "lg")}</div>
              <p className="text-muted-foreground">
                Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </p>
              {selectedCountry !== "all" && (
                <Badge variant="outline" className="mt-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  {countryNames[selectedCountry as keyof typeof countryNames]}
                </Badge>
              )}
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm w-8">{rating} ★</span>
                  <Progress
                    value={
                      totalReviews > 0
                        ? (ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100
                        : 0
                    }
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-muted-foreground w-8">
                    {ratingDistribution[rating as keyof typeof ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sorting */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter by:</span>
        </div>

        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {availableCountries.map((country) => (
              <SelectItem key={country} value={country}>
                {countryNames[country as keyof typeof countryNames]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="highest">Highest Rated</SelectItem>
            <SelectItem value="lowest">Lowest Rated</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No reviews yet. Be the first to review "{productName}"!
              </p>
              {user && (
                <Button onClick={() => setShowReviewForm(true)}>
                  Write a Review
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{review.userName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.date)}
                          </span>
                          {review.verifiedPurchase && (
                            <Badge variant="secondary" className="ml-2">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="mt-3">
                      <h5 className="font-medium">{review.title}</h5>
                      <p className="text-muted-foreground mt-1">
                        {review.content}
                      </p>
                    </div>
                    
                    {review.countrySpecificNotes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                          <span className="font-medium">Notes for {countryNames[review.country as keyof typeof countryNames] || review.country}:</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {review.countrySpecificNotes}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => voteOnReview(review.id, "helpful")}
                        disabled={!!userVotes[review.id]}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Helpful ({review.helpfulVotes})
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => voteOnReview(review.id, "not-helpful")}
                        disabled={!!userVotes[review.id]}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Not Helpful ({review.notHelpfulVotes})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {showReviewForm && (
        <ReviewForm 
          productId={parseInt(productId, 10) || 0}
          productName={productName}
          availableCountries={availableCountries}
          onClose={() => setShowReviewForm(false)}
          onSubmit={submitReview}
        />
      )}
    </div>
  )
}