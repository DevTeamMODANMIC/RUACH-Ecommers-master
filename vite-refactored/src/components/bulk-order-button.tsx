

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Package2 } from "lucide-react"
import { BulkOrderModal } from "@/components/bulk-order-modal"

interface BulkOrderButtonProps {
  productId: number
  productName: string
  basePrice: number
  country: string
}

export function BulkOrderButton({ productId, productName, basePrice, country }: BulkOrderButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        className="w-full border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-950"
        onClick={() => setIsModalOpen(true)}
      >
        <Package2 className="h-4 w-4 mr-2" />
        Bulk Order
      </Button>

      <BulkOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
        productName={productName}
        basePrice={basePrice}
        country={country}
      />
    </>
  )
}
