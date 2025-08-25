import { useState } from "react"
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

// Mock reviews data
const mockReviews = [
  {
    id: "1",
    customer: {
      name: "John Doe", 
      avatar: null,
      verified: true
    },
    service: "Home Plumbing Repair",
    rating: 5,
    title: "Excellent service and very professional",
    review: "The plumber arrived on time and quickly diagnosed the problem. He explained everything clearly and completed the work efficiently. Very satisfied with the service quality and would definitely book again.",
    date: "2024-03-22",
    booking: {
      id: "1",
      amount: 15000
    },
    helpful: 3,
    response: null
  },
  {
    id: "2",
    customer: {
      name: "Sarah Johnson",
      avatar: null, 
      verified: true
    },
    service: "Emergency Leak Fix",
    rating: 5,
    title: "Quick response and great work",
    review: "Had an emergency leak in my bathroom at 8pm. The technician came within 30 minutes and fixed it perfectly. Saved my weekend! Highly recommend this service.",
    date: "2024-03-23",
    booking: {
      id: "2", 
      amount: 8000
    },
    helpful: 5,
    response: {
      text: "Thank you Sarah! We're always here for emergencies. Glad we could help save your weekend.",
      date: "2024-03-23"
    }
  },
  {
    id: "3",
    customer: {
      name: "Mike Wilson",
      avatar: null,
      verified: true
    },
    service: "Bathroom Renovation", 
    rating: 4,
    title: "Good work but took longer than expected",
    review: "The quality of work was excellent and I'm happy with the final result. However, the job took 2 days longer than initially quoted. Better communication about delays would be appreciated.",
    date: "2024-03-20",
    booking: {
      id: "3",
      amount: 45000
    },
    helpful: 2,
    response: {
      text: "Thank you for the feedback Mike. We apologize for the delay - we encountered some unexpected plumbing issues that required additional time to fix properly. We'll improve our communication in future projects.",
      date: "2024-03-21"
    }
  },
  {
    id: "4",
    customer: {
      name: "Lisa Brown",
      avatar: null,
      verified: false
    },
    service: "Home Plumbing Repair",
    rating: 3, 
    title: "Average service",
    review: "The work was done correctly but the technician was quite late and didn't communicate well. The price was fair though.",
    date: "2024-03-18",
    booking: {
      id: "4",
      amount: 12000
    },
    helpful: 1,
    response: null
  }
]

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState(mockReviews)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRating, setSelectedRating] = useState("all")
  const [showResponseForm, setShowResponseForm] = useState<string | null>(null)
  const [responseText, setResponseText] = useState("")

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.review.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleResponseSubmit = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            response: { 
              text: responseText, 
              date: new Date().toISOString().split('T')[0]
            }
          }
        : review
    ))
    setResponseText("")
    setShowResponseForm(null)
  }

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  const totalReviews = reviews.length
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / totalReviews) * 100
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h1>
          <p className="text-gray-600">Monitor and respond to customer feedback</p>
        </div>
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
                  {Math.round((reviews.filter(r => r.response).length / totalReviews) * 100)}%
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
                        <h4 className="font-semibold">{review.customer.name}</h4>
                        {review.customer.verified && (
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
                  <h5 className="font-medium mb-2">{review.title}</h5>
                  <p className="text-gray-700">{review.review}</p>
                </div>

                {/* Review Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{review.helpful} helpful</span>
                    </div>
                  </div>
                  
                  {!review.response && (
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
                {review.response && (
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">R</span>
                      </div>
                      <span className="font-medium text-blue-900">Your Response</span>
                      <span className="text-sm text-blue-600">• {formatDate(review.response.date)}</span>
                    </div>
                    <p className="text-blue-800">{review.response.text}</p>
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
    </div>
  )
}