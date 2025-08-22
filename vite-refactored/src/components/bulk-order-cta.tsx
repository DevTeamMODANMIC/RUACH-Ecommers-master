

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package2, TrendingDown, Building2, Truck } from "lucide-react"

export function BulkOrderCTA() {
  return (
    <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 mb-16">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package2 className="h-5 w-5 text-green-600" />
          Bulk Orders & Special Pricing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              <h3 className="font-medium">Volume Discounts</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Save up to 25% on large orders with our tiered pricing structure. The more you order, the more you save.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              <h3 className="font-medium">Business Accounts</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Create a business account for streamlined ordering, invoicing, and special terms for regular customers.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-600" />
              <h3 className="font-medium">Free Shipping</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Qualify for free shipping on bulk orders. Express delivery available for urgent requirements.
            </p>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
            <Link to="/bulk-order">Learn More About Bulk Orders</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
