import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Package } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function OrdersLoading() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/profile">My Account</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Skeleton className="h-4 w-20" />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Orders</h1>
              <p className="text-gray-600">View and track your order history</p>
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <Skeleton className="h-10 w-full md:w-80" />
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20 ml-0 sm:ml-2" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Skeleton className="h-5 w-20 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex flex-col sm:flex-row justify-between">
                  <Skeleton className="h-4 w-48 mb-2 sm:mb-0" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 