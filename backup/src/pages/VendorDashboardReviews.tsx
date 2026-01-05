import { useState, useEffect } from "react"
import { VendorLayout } from "../components/vendor-layout"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { 
  Star,
  Search,
  Filter,
  MessageCircle,
  ThumbsUp,
  Calendar,
  User,
  TrendingUp,
  BarChart3,
  Award
} from "lucide-react"
import { collection, query, where, orderBy, getDocs, updateDoc, doc, addDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useVendor } from "../hooks/use-vendor"

// Remove mock reviews data - we'll load from database
// const mockReviews = [ ... ]

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRating, setSelectedRating] = useState("all")
  const [showResponseForm, setShowResponseForm] = useState<string | null>(null)
  const [responseText, setResponseText] = useState("")
  const { activeStore } = useVendor()

  // Fetch reviews from Firebase
  useEffect(() => {
    const fetchReviews = async () => {
      if (!activeStore) return
      
      try {
        setLoading(true)
        // Get products for this vendor
        const productsQuery = query(
          collection(db, "products"),
          where("vendorId", "==", activeStore.id)
        )
        
        const productsSnapshot = await getDocs(productsQuery)
        const productIds = productsSnapshot.docs.map(doc => doc.id)
        
        if (productIds.length === 0) {
          setReviews([])
          setLoading(false)
          return
        }
        
        // Get reviews for these products
        // NOTE: Sorting by date with other filters requires a composite index in Firestore
        // For development, we're temporarily removing date sorting to avoid the index requirement
        // For production, create the composite index using the link in the Firebase error message
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("productId", "in", productIds)
          // orderBy("date", "desc")  // Commented out to avoid composite index requirement
        )
        
        const reviewsSnapshot = await getDocs(reviewsQuery)
        const reviewsData: any[] = []
        
        reviewsSnapshot.forEach((doc) => {
          const reviewData = doc.data()
          // Get product info for this review
          const productDoc = productsSnapshot.docs.find(p => p.id === reviewData.productId)
          const productData = productDoc ? productDoc.data() : null
          
          reviewsData.push({
            id: doc.id,
            ...reviewData,
            service: productData ? productData.name : "Unknown Product",
            booking: {
              amount: reviewData.purchasePrice || 0
            }
          })
        })
        
        setReviews(reviewsData)
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchReviews()
  }, [activeStore])

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRating = selectedRating === "all" || review.rating.toString() === selectedRating
    return matchesSearch && matchesRating
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleResponseSubmit = async (reviewId: string) => {
    if (!responseText.trim()) return
    
    try {
      // Add response to Firestore
      const response = {
        text: responseText,
        date: new Date().toISOString().split('T')[0],
        vendorId: activeStore?.id
      }
      
      // In a real implementation, you might want to store responses in a separate collection
      // For now, we'll just update the local state
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              vendorResponse: response
            }
          : review
      ))
      
      setResponseText("")
      setShowResponseForm(null)
    } catch (error) {
      console.error("Error submitting response:", error)
    }
  }

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
  const totalReviews = reviews.length
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === rating).length / totalReviews) * 100 : 0
  }))

  if (loading) {
    return (
      <VendorLayout 
        title="Reviews & Ratings" 
        description="Monitor and respond to customer feedback"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout 
      title="Reviews & Ratings" 
      description="Monitor and respond to customer feedback"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <BarChart3 className="h-4 w-4 mr-2" />
          Review Analytics
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.round(averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold">{totalReviews}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">5-Star Reviews</p>
                <p className="text-2xl font-bold text-green-600">
                  {reviews.filter(r => r.rating === 5).length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold">
                  {totalReviews > 0 ? Math.round((reviews.filter(r => r.vendorResponse).length / totalReviews) * 100) : 0}%
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{review.userName || "Anonymous"}</h4>
                        {review.verifiedPurchase && (
                          <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{formatDate(review.date)}</span>
                        <span>•</span>
                        <span>{review.service}</span>
                        <span>•</span>
                        <span>₦{review.booking.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="ml-1 text-sm font-medium">{review.rating}.0</span>
                  </div>
                </div>

                {/* Review Content */}
                <div>
                  <h5 className="font-medium mb-2">{review.title || "No title"}</h5>
                  <p className="text-gray-700">{review.content}</p>
                </div>

                {/* Review Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{review.helpfulVotes || 0} helpful</span>
                    </div>
                  </div>
                  
                  {!review.vendorResponse && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowResponseForm(review.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Respond
                    </Button>
                  )}
                </div>

                {/* Response Form */}
                {showResponseForm === review.id && (
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <h6 className="font-medium mb-3">Respond to this review</h6>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Thank you for your review..."
                      className="w-full p-3 border border-gray-300 rounded-md resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        onClick={() => handleResponseSubmit(review.id)}
                        disabled={!responseText.trim()}
                      >
                        Submit Response
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setShowResponseForm(null)
                          setResponseText("")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Existing Response */}
                {review.vendorResponse && (
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">R</span>
                      </div>
                      <span className="font-medium text-blue-900">Your Response</span>
                      <span className="text-sm text-blue-600">• {formatDate(review.vendorResponse.date)}</span>
                    </div>
                    <p className="text-blue-800">{review.vendorResponse.text}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedRating !== "all"
                ? "Try adjusting your search or filters" 
                : "Reviews from your customers will appear here"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </VendorLayout>
  )
}