"use client"

import { useState, useCallback, useEffect } from "react"
import { useLocalStorage } from "./use-local-storage"
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, doc, increment } from "firebase/firestore"
import { db } from "../lib/firebase"

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

      try {
        // Build the query
        let q = query(collection(db, "reviews"), where("productId", "==", productId))
        
        // Filter by country
        if (country !== "all") {
          q = query(q, where("country", "==", country))
        }

        // Filter by rating
        if (filterRating !== "all") {
          const rating = Number.parseInt(filterRating)
          q = query(q, where("rating", "==", rating))
        }

        // Sort reviews
        switch (sortBy) {
          case "newest":
            q = query(q, orderBy("date", "desc"))
            break
          case "oldest":
            q = query(q, orderBy("date", "asc"))
            break
          case "highest":
            q = query(q, orderBy("rating", "desc"))
            break
          case "lowest":
            q = query(q, orderBy("rating", "asc"))
            break
          case "helpful":
            q = query(q, orderBy("helpfulVotes", "desc"))
            break
        }

        // Limit results
        q = query(q, limit(50))

        const querySnapshot = await getDocs(q)
        const reviewsData: Review[] = []
        
        querySnapshot.forEach((doc) => {
          reviewsData.push({
            id: doc.id,
            ...doc.data()
          } as Review)
        })

        setReviews(reviewsData)
        setReviewStats(calculateStats(reviewsData))
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
      try {
        // Add the review to Firestore
        const newReview = {
          ...reviewData,
          helpfulVotes: 0,
          notHelpfulVotes: 0,
          reported: false,
        }

        const docRef = await addDoc(collection(db, "reviews"), newReview)
        
        // Update local state
        const reviewWithId: Review = {
          ...newReview,
          id: docRef.id
        }
        
        setReviews(prev => [reviewWithId, ...prev])
        setReviewStats(prev => calculateStats([reviewWithId, ...reviews]))
        
        console.log("Review submitted:", reviewWithId)
      } catch (error) {
        console.error("Error submitting review:", error)
        throw error
      }
    },
    [],
  )

  const voteOnReview = useCallback(
    async (reviewId: string, voteType: "helpful" | "not-helpful") => {
      // Check if user has already voted on this review
      if (userVotes[reviewId]) {
        return // User has already voted
      }

      try {
        // Update local vote tracking
        setUserVotes((prev) => ({
          ...prev,
          [reviewId]: voteType,
        }))

        // Update review votes in Firestore
        const reviewRef = doc(db, "reviews", reviewId)
        if (voteType === "helpful") {
          await updateDoc(reviewRef, {
            helpfulVotes: increment(1)
          })
        } else {
          await updateDoc(reviewRef, {
            notHelpfulVotes: increment(1)
          })
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
      } catch (error) {
        console.error("Error voting on review:", error)
        // Revert local vote tracking on error
        setUserVotes((prev) => {
          const newVotes = { ...prev }
          delete newVotes[reviewId]
          return newVotes
        })
      }
    },
    [userVotes, setUserVotes],
  )

  const reportReview = useCallback(async (reviewId: string) => {
    try {
      // Update review reported status in Firestore
      const reviewRef = doc(db, "reviews", reviewId)
      await updateDoc(reviewRef, {
        reported: true
      })
      
      console.log("Review reported:", reviewId)
      // In a real app, this would flag the review for moderation
    } catch (error) {
      console.error("Error reporting review:", error)
    }
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