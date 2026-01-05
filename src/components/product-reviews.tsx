import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  MapPin, 
  Filter, 
  MessageSquare,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Clock,
  ShieldCheck
} from "lucide-react"
import { ReviewForm } from "@/components/review-form"
import { useReviews } from "@/hooks/use-reviews"
import { useAuth } from "@/components/auth-provider"
import { useVendor } from "@/hooks/use-vendor"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { cn } from "@/lib/utils"

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
  const [expandedReviews, setExpandedReviews] = useState<string[]>([])
  const { user } = useAuth()
  const { isVendor, loading: vendorLoading } = useVendor()
  const [userVotes] = useLocalStorage<Record<string, "helpful" | "not-helpful">>("review-votes", {})

  const { reviews, reviewStats, loading, submitReview, voteOnReview, reportReview, getReviews } = useReviews()

  useEffect(() => {
    const productIdNum = parseInt(productId, 10) || 0
    getReviews(productIdNum, selectedCountry, sortBy, filterRating)
  }, [productId, selectedCountry, sortBy, filterRating, getReviews])

  const countryNames: Record<string, string> = {
    nigeria: "🇳🇬 Nigeria",
    india: "🇮🇳 India",
    ghana: "🇬🇭 Ghana",
    jamaica: "🇯🇲 Jamaica",
    uk: "🇬🇧 United Kingdom",
    all: "🌍 All Countries"
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" }
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
            )}
          />
        ))}
      </div>
    )
  }

  const getRatingLabel = (rating: number) => {
    const labels: Record<number, { text: string; color: string }> = {
      5: { text: "Excellent", color: "text-green-600" },
      4: { text: "Good", color: "text-green-500" },
      3: { text: "Average", color: "text-yellow-600" },
      2: { text: "Poor", color: "text-orange-500" },
      1: { text: "Terrible", color: "text-red-500" },
    }
    return labels[rating] || { text: "", color: "" }
  }

  const toggleExpandReview = (reviewId: string) => {
    setExpandedReviews(prev => 
      prev.includes(reviewId) ? prev.filter(id => id !== reviewId) : [...prev, reviewId]
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Only customers can write reviews (logged in AND not a vendor)
  const canWriteReview = user && !isVendor && !vendorLoading

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-48 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="md:col-span-2 h-32 bg-gray-200 rounded-xl"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
    )
  }

  const ratingDistribution = getRatingDistribution()
  const totalReviews = reviews.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-xl">
            <MessageSquare className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
            <p className="text-sm text-gray-500">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        {canWriteReview ? (
          <Button 
            onClick={() => setShowReviewForm(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
          >
            <Star className="h-4 w-4 mr-2" />
            Write a Review
          </Button>
        ) : isVendor ? (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            Vendors cannot write reviews
          </div>
        ) : !user ? (
          <Button variant="outline" onClick={() => window.location.href = '/login'}>
            Login to Review
          </Button>
        ) : null}
      </div>

      {/* Summary Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Overall Rating */}
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-amber-100">
              <div className="relative">
                <span className="text-6xl font-bold text-gray-900">{reviewStats.averageRating.toFixed(1)}</span>
                <Sparkles className="absolute -top-2 -right-4 h-5 w-5 text-amber-400" />
              </div>
              <div className="mt-2 mb-1">{renderStars(Math.round(reviewStats.averageRating), "lg")}</div>
              <p className="text-sm text-gray-600">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
            </div>

            {/* Rating Distribution */}
            <div className="md:col-span-2 p-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Rating Breakdown
              </h4>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingDistribution[rating as keyof typeof ratingDistribution]
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                  const label = getRatingLabel(rating)
                  
                  return (
                    <button
                      key={rating}
                      onClick={() => setFilterRating(filterRating === String(rating) ? "all" : String(rating))}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg p-1.5 -m-1.5 transition-all",
                        filterRating === String(rating) ? "bg-amber-50" : "hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      </div>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            rating >= 4 ? "bg-green-500" : rating === 3 ? "bg-yellow-500" : "bg-red-500"
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                      <span className={cn("text-xs font-medium w-16 text-right", label.color)}>{label.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center p-4 bg-gray-50 rounded-xl">
        <Filter className="h-4 w-4 text-gray-500" />
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-44 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">🌍 All Countries</SelectItem>
            {availableCountries.map((c) => <SelectItem key={c} value={c}>{countryNames[c]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-32 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            {[5,4,3,2,1].map(r => <SelectItem key={r} value={String(r)}>{r} Star{r!==1?'s':''}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="highest">Highest Rated</SelectItem>
            <SelectItem value="lowest">Lowest Rated</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">No Reviews Yet</h4>
              <p className="text-gray-500 mb-6">Be the first to review "{productName}"</p>
              {canWriteReview && (
                <Button onClick={() => setShowReviewForm(true)} className="bg-green-600 hover:bg-green-700">
                  Write the First Review
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => {
            const isExpanded = expandedReviews.includes(review.id)
            const isLong = review.content.length > 300
            const content = isLong && !isExpanded ? review.content.slice(0, 300) + "..." : review.content
            const label = getRatingLabel(review.rating)

            return (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12 border-2 border-gray-100">
                      <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-500 text-white font-semibold">
                        {getInitials(review.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{review.userName}</h4>
                            {review.verifiedPurchase && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                <ShieldCheck className="h-3 w-3 mr-1" />Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating, "sm")}
                            <span className={cn("text-xs font-medium", label.color)}>{label.text}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{formatDate(review.date)}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => reportReview(review.id)} className="text-gray-400 hover:text-red-500">
                          <Flag className="h-4 w-4" />
                        </Button>
                      </div>

                      {review.title && <h5 className="font-medium mb-2">{review.title}</h5>}
                      <p className="text-gray-600">{content}</p>
                      {isLong && (
                        <button onClick={() => toggleExpandReview(review.id)} className="text-green-600 text-sm font-medium mt-1">
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}

                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-4 flex-wrap">
                          {review.images.map((img, idx) => (
                            <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      {review.countrySpecificNotes && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-1">
                            <MapPin className="h-4 w-4" />
                            Notes for {countryNames[review.country] || review.country}
                          </div>
                          <p className="text-sm text-blue-600">{review.countrySpecificNotes}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        <span className="text-xs text-gray-500 mr-2">Helpful?</span>
                        <Button 
                          variant={userVotes[review.id] === "helpful" ? "default" : "outline"}
                          size="sm"
                          onClick={() => voteOnReview(review.id, "helpful")}
                          disabled={!!userVotes[review.id]}
                          className={cn("h-8 text-xs", userVotes[review.id] === "helpful" && "bg-green-600")}
                        >
                          <ThumbsUp className="h-3.5 w-3.5 mr-1" />Yes ({review.helpfulVotes})
                        </Button>
                        <Button 
                          variant={userVotes[review.id] === "not-helpful" ? "default" : "outline"}
                          size="sm"
                          onClick={() => voteOnReview(review.id, "not-helpful")}
                          disabled={!!userVotes[review.id]}
                          className={cn("h-8 text-xs", userVotes[review.id] === "not-helpful" && "bg-gray-600")}
                        >
                          <ThumbsDown className="h-3.5 w-3.5 mr-1" />No ({review.notHelpfulVotes})
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
      
      {showReviewForm && canWriteReview && (
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
