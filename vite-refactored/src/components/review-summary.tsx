

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin } from "lucide-react"
import { useReviews } from "@/hooks/use-reviews"
import { useEffect } from "react"

interface ReviewSummaryProps {
  productId: number
  compact?: boolean
}

export function ReviewSummary({ productId, compact = false }: ReviewSummaryProps) {
  const { reviewStats, getReviews } = useReviews()

  useEffect(() => {
    getReviews(productId)
  }, [productId, getReviews])

  if (reviewStats.totalReviews === 0) {
    return <div className="text-sm text-muted-foreground">No reviews yet</div>
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {renderStars(reviewStats.averageRating)}
        <span className="text-sm text-muted-foreground">
          {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews})
        </span>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {renderStars(reviewStats.averageRating)}
            <div>
              <div className="font-semibold">{reviewStats.averageRating.toFixed(1)} out of 5</div>
              <div className="text-sm text-muted-foreground">
                {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          <Badge variant="outline">
            <MapPin className="h-3 w-3 mr-1" />
            Global Reviews
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
