"use client"

import { useState, useCallback } from "react"
import { useLocalStorage } from "./use-local-storage"

interface Review {
  id: string
  productId: number
  rating: number
  title: string
  content: string
  country: string
  countrySpecificNotes?: string
  images?: string[]
  userName: string
  userEmail?: string
  date: string
  verifiedPurchase: boolean
  purchasePrice?: number
  helpfulVotes: number
  notHelpfulVotes: number
  reported: boolean
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
}

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: "1",
    productId: 1,
    rating: 5,
    title: "Authentic taste, just like home!",
    content:
      "This jollof rice mix is absolutely fantastic! As someone from Lagos, I can confirm this tastes exactly like the traditional blend my grandmother used. The spices are well-balanced and the aroma is incredible. Perfect for making restaurant-quality jollof at home.",
    country: "nigeria",
    countrySpecificNotes:
      "In Nigeria, this is exactly what we expect from premium jollof seasoning. The tomato base is rich and the spice level is perfect for Nigerian palates.",
    images: ["/placeholder.svg?height=200&width=200"],
    userName: "Adebayo O.",
    date: "2024-01-15T10:30:00Z",
    verifiedPurchase: true,
    purchasePrice: 8.99,
    helpfulVotes: 23,
    notHelpfulVotes: 1,
    reported: false,
  },
  {
    id: "2",
    productId: 1,
    rating: 4,
    title: "Great flavor, but a bit salty for my taste",
    content:
      "The flavor profile is excellent and very authentic. However, I found it slightly saltier than what I'm used to. I had to adjust by adding less salt when cooking. Overall, still a great product that saves time in the kitchen.",
    country: "uk",
    countrySpecificNotes:
      "For UK customers, you might want to taste-test before adding additional salt as this blend is quite well-seasoned already.",
    userName: "Sarah M.",
    date: "2024-01-12T14:20:00Z",
    verifiedPurchase: true,
    purchasePrice: 8.99,
    helpfulVotes: 15,
    notHelpfulVotes: 3,
    reported: false,
  },
  {
    id: "3",
    productId: 1,
    rating: 5,
    title: "Perfect for busy weeknights",
    content:
      "As a working mother, this product is a lifesaver! I can make delicious jollof rice in half the time it usually takes. My kids love it and always ask for seconds. The packaging is also very convenient.",
    country: "nigeria",
    userName: "Fatima A.",
    date: "2024-01-10T09:15:00Z",
    verifiedPurchase: true,
    helpfulVotes: 18,
    notHelpfulVotes: 0,
    reported: false,
  },
  {
    id: "4",
    productId: 1,
    rating: 3,
    title: "Good but not exceptional",
    content:
      "It's a decent product that does the job. The taste is good but I've had better homemade blends. For the convenience factor, it's worth buying, but don't expect it to be exactly like your grandmother's recipe.",
    country: "ghana",
    countrySpecificNotes:
      "In Ghana, we're used to slightly different spice combinations, so this might taste a bit different from local jollof preparations.",
    userName: "Kwame D.",
    date: "2024-01-08T16:45:00Z",
    verifiedPurchase: false,
    helpfulVotes: 8,
    notHelpfulVotes: 5,
    reported: false,
  },
]

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {},
  })
  const [loading, setLoading] = useState(false)
  const [userVotes, setUserVotes] = useLocalStorage<Record<string, "helpful" | "not-helpful">>("review-votes", {})

  const calculateStats = (reviewList: Review[]): ReviewStats => {
    if (reviewList.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {},
      }
    }

    const totalRating = reviewList.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviewList.length

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviewList.forEach((review) => {
      ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1
    })

    return {
      averageRating,
      totalReviews: reviewList.length,
      ratingDistribution,
    }
  }

  const getReviews = useCallback(
    async (productId: number, country = "all", sortBy = "newest", filterRating = "all") => {
      setLoading(true)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      try {
        let filteredReviews = mockReviews.filter((review) => review.productId === productId)

        // Filter by country
        if (country !== "all") {
          filteredReviews = filteredReviews.filter((review) => review.country === country)
        }

        // Filter by rating
        if (filterRating !== "all") {
          const rating = Number.parseInt(filterRating)
          filteredReviews = filteredReviews.filter((review) => review.rating === rating)
        }

        // Sort reviews
        filteredReviews.sort((a, b) => {
          switch (sortBy) {
            case "newest":
              return new Date(b.date).getTime() - new Date(a.date).getTime()
            case "oldest":
              return new Date(a.date).getTime() - new Date(b.date).getTime()
            case "highest":
              return b.rating - a.rating
            case "lowest":
              return a.rating - b.rating
            case "helpful":
              return b.helpfulVotes - a.helpfulVotes
            default:
              return 0
          }
        })

        setReviews(filteredReviews)
        setReviewStats(calculateStats(filteredReviews))
      } catch (error) {
        console.error("Error fetching reviews:", error)
        setReviews([])
        setReviewStats({ averageRating: 0, totalReviews: 0, ratingDistribution: {} })
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const submitReview = useCallback(
    async (reviewData: Omit<Review, "id" | "helpfulVotes" | "notHelpfulVotes" | "reported">) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newReview: Review = {
        ...reviewData,
        id: Date.now().toString(),
        helpfulVotes: 0,
        notHelpfulVotes: 0,
        reported: false,
      }

      // In a real app, this would be sent to the server
      mockReviews.unshift(newReview)

      // Refresh reviews for the current product
      // This would typically be handled by refetching from the server
      console.log("Review submitted:", newReview)
    },
    [],
  )

  const voteOnReview = useCallback(
    async (reviewId: string, voteType: "helpful" | "not-helpful") => {
      // Check if user has already voted on this review
      if (userVotes[reviewId]) {
        return // User has already voted
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Update local vote tracking
      setUserVotes((prev) => ({
        ...prev,
        [reviewId]: voteType,
      }))

      // Update review votes (in a real app, this would be handled by the server)
      const reviewIndex = mockReviews.findIndex((r) => r.id === reviewId)
      if (reviewIndex !== -1) {
        if (voteType === "helpful") {
          mockReviews[reviewIndex].helpfulVotes++
        } else {
          mockReviews[reviewIndex].notHelpfulVotes++
        }
      }

      // Update local state
      setReviews((prev) =>
        prev.map((review) => {
          if (review.id === reviewId) {
            return {
              ...review,
              helpfulVotes: voteType === "helpful" ? review.helpfulVotes + 1 : review.helpfulVotes,
              notHelpfulVotes: voteType === "not-helpful" ? review.notHelpfulVotes + 1 : review.notHelpfulVotes,
            }
          }
          return review
        }),
      )
    },
    [userVotes, setUserVotes],
  )

  const reportReview = useCallback(async (reviewId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))

    console.log("Review reported:", reviewId)
    // In a real app, this would flag the review for moderation
  }, [])

  return {
    reviews,
    reviewStats,
    loading,
    getReviews,
    submitReview,
    voteOnReview,
    reportReview,
  }
}
