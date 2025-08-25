import { ReactNode } from "react"
import { useServiceProvider } from "../hooks/use-service-provider"
import { ServiceProviderSidebar } from "./service-provider-sidebar"
import { Navigate } from "react-router-dom"

interface ServiceProviderLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function ServiceProviderLayout({ children, title, description }: ServiceProviderLayoutProps) {
  const { isServiceProvider, serviceProvider, loading } = useServiceProvider()

  // Show loading state while checking service provider status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-t-green-500 border-l-green-600 border-r-green-600 border-b-green-700 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect non-service providers to registration page (could be vendor register for now)
  if (!isServiceProvider) {
    return <Navigate to="/vendor/register" replace />
  }

  // For now, allow service providers without complete profiles to access dashboard
  // In the future, you might want to redirect to profile completion
  if (!serviceProvider) {
    return <Navigate to="/vendor/register" replace />
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ServiceProviderSidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64">
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