import { ReactNode } from "react"
import { useVendor } from "../hooks/use-vendor"
import { VendorSidebar } from "./vendor-sidebar"
import { Navigate } from "react-router-dom"

interface VendorLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function VendorLayout({ children, title, description }: VendorLayoutProps) {
  const { isVendor, activeStore, allStores, loading } = useVendor()

  // Show loading state while checking vendor status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-t-green-500 border-l-green-600 border-r-green-600 border-b-green-700 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking vendor status...</p>
        </div>
      </div>
    )
  }

  // Check if user is actually a registered vendor (has stores)
  const hasVendorStores = allStores && allStores.length > 0
  
  // Redirect non-vendors to vendor/service provider registration
  if (!isVendor || !hasVendorStores) {
    return <Navigate to="/vendor/register" replace />
  }

  // Redirect vendors without active store to store selection
  if (!activeStore) {
    return <Navigate to="/vendor/stores" replace />
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <VendorSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Page Header */}
        {(title || description) && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-7xl mx-auto">
              {title && (
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              )}
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Page Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}