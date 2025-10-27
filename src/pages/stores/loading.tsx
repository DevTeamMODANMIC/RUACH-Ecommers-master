import { Loader2 } from "lucide-react"

export default function StoresLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="h-10 bg-gray-200 rounded-md w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-md w-96 mx-auto animate-pulse"></div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 bg-gray-200 rounded-md w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading stores...</p>
          </div>
        </div>
      </div>
    </div>
  )
}