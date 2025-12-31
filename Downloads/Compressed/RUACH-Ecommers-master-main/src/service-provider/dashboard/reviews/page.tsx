import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Badge } from "../../../components/ui/badge"
import { Textarea } from "../../../components/ui/textarea"
import { ServiceProviderLayout } from "../../../components/service-provider-layout"
import { 
  Search,
  Star,
  User,
  Calendar,
  MessageSquare,
  Reply,
  ThumbsUp,
  Download
} from "lucide-react"
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "../../../lib/firebase"
import { useAuth } from "../../../components/auth-provider"

// Remove mock data - we'll load from database
// const mockReviews: any[] = []

export default function ServiceProviderReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [filteredReviews, setFilteredReviews] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [ratingFilter, setRatingFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all")
  const [selectedReview, setSelectedReview] = useState<string | null>(null)
  const [responseText, setResponseText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Fetch reviews from Firebase
  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        const q = query(
          collection(db, "serviceReviews"),
          where("providerId", "==", user.uid),
          orderBy("createdAt", "desc")
        )
        
        const querySnapshot = await getDocs(q)
        const reviewsData: any[] = []
        
        querySnapshot.forEach((doc) => {
          reviewsData.push({
            id: doc.id,
            ...doc.data()
          })
        })
        
        setReviews(reviewsData)
        setFilteredReviews(reviewsData)
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchReviews()
  }, [user])

  useEffect(() => {
    let filtered = [...reviews]

    if (searchQuery) {
      filtered = filtered.filter(review =>
        review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (ratingFilter !== "all") {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter))
    }

    filtered.sort((a, b) => b.createdAt - a.createdAt)
    setFilteredReviews(filtered)
  }, [reviews, searchQuery, ratingFilter])

  const handleResponse = async (reviewId: string) => {
    if (!responseText.trim()) return

    try {
      // Update in Firebase
      const reviewRef = doc(db, "serviceReviews", reviewId)
      await updateDoc(reviewRef, {
        providerResponse: {
          message: responseText.trim(),
          createdAt: Date.now()
        }
      })

      // Update local state
      setReviews(reviews.map(review =>
        review.id === reviewId
          ? {
              ...review,
              providerResponse: {
                message: responseText.trim(),
                createdAt: Date.now()
              }
            }
          : review
      ))
      setResponseText("")
      setSelectedReview(null)
    } catch (error) {
      console.error("Error responding to review:", error)
    }
  }

  const getStarRating = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const stats = {
    totalReviews: reviews.length,
    averageRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0',
    pendingResponses: reviews.filter(r => !r.providerResponse).length,
    responseRate: reviews.length > 0 ? Math.round((reviews.filter(r => r.providerResponse).length / reviews.length) * 100) : 0
  }

  if (isLoading) {
    return (
      <ServiceProviderLayout title="Customer Reviews" description="Manage customer feedback and build your reputation">
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </ServiceProviderLayout>
    )
  }

  return (
    <ServiceProviderLayout title="Customer Reviews" description="Manage customer feedback and build your reputation">
      {/* Export Reviews Button */}
      <div className="flex justify-end mb-6">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Reviews
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.totalReviews}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
                <Star className="h-5 w-5 text-yellow-400 fill-current ml-1" />
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.pendingResponses}</div>
              <div className="text-sm text-gray-600">Pending Responses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.responseRate}%</div>
              <div className="text-sm text-gray-600">Response Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "5", label: "5★" },
                  { key: "4", label: "4★" },
                  { key: "3", label: "3★" },
                  { key: "2", label: "2★" },
                  { key: "1", label: "1★" }
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={ratingFilter === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRatingFilter(key as any)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{review.customerName}</span>
                        {review.isVerified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{review.serviceName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">{getStarRating(review.rating)}</div>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">{review.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    <span className="font-medium">Would recommend:</span>
                    <span className={`ml-2 ${review.wouldRecommend ? 'text-green-600' : 'text-red-600'}`}>
                      {review.wouldRecommend ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {review.helpfulVotes} helpful
                  </div>
                </div>

                {/* Provider Response */}
                {review.providerResponse ? (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">Your Response</span>
                      <span className="text-xs text-blue-600 ml-2">
                        {new Date(review.providerResponse.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">{review.providerResponse.message}</p>
                  </div>
                ) : (
                  <div className="border-t pt-4">
                    {selectedReview === review.id ? (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Write your response to this review..."
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedReview(null)
                              setResponseText("")
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleResponse(review.id)}
                            disabled={!responseText.trim()}
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Respond
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedReview(review.id)}
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Respond to Review
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredReviews.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <MessageSquare className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || ratingFilter !== "all" ? "No reviews found" : "No reviews yet"}
              </h3>
              <p className="text-gray-600">
                {searchQuery || ratingFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Customer reviews will appear here once you complete bookings"
                }
              </p>
            </CardContent>
          </Card>
        )}
    </ServiceProviderLayout>
  )
}