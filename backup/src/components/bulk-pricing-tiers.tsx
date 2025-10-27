

import { Card, CardContent } from "../../src/components/ui/card"
import { Badge } from "../../src/components/ui/badge"
import { useCurrency } from "../../src/components/currency-provider"

interface BulkPricingTiersProps {
  basePrice: number
  selectedQuantity: number
  onQuantitySelect: (quantity: number) => void
}

export function BulkPricingTiers({ basePrice, selectedQuantity, onQuantitySelect }: BulkPricingTiersProps) {
  const { formatPrice } = useCurrency()

  const tiers = [
    { quantity: 10, discount: 10 },
    { quantity: 25, discount: 15 },
    { quantity: 50, discount: 20 },
    { quantity: 100, discount: 25 },
  ]

  const getDiscountedPrice = (discount: number) => {
    return basePrice * (1 - discount / 100)
  }

  const isSelected = (quantity: number) => {
    if (selectedQuantity === quantity) return true

    // Check if we're between tiers
    const tierIndex = tiers.findIndex((tier) => tier.quantity === quantity)
    if (tierIndex < tiers.length - 1) {
      const nextTier = tiers[tierIndex + 1]
      return selectedQuantity >= quantity && selectedQuantity < nextTier.quantity
    }

    return selectedQuantity >= quantity
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {tiers.map((tier) => (
        <Card
          key={tier.quantity}
          className={`cursor-pointer transition-all ${
            isSelected(tier.quantity)
              ? "border-green-500 dark:border-green-700 shadow-md"
              : "hover:border-green-200 dark:hover:border-green-800"
          }`}
          onClick={() => onQuantitySelect(tier.quantity)}
        >
          <CardContent className="p-4 text-center">
            <div className="font-medium text-lg mb-1">{tier.quantity}+ units</div>
            <Badge className="mb-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {tier.discount}% OFF
            </Badge>
            <div className="text-sm text-muted-foreground mb-1">Unit Price</div>
            <div className="font-bold text-green-600">{formatPrice(getDiscountedPrice(tier.discount))}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <s>{formatPrice(basePrice)}</s>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
