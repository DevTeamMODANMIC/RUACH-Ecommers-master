import { ReactNode, useState } from "react"
import { useServiceProvider } from "../hooks/use-service-provider"
import { ServiceProviderSidebar } from "./service-provider-sidebar"
import { Navigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"

interface ServiceProviderLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function ServiceProviderLayout({ children, title, description }: ServiceProviderLayoutProps) {
  const { isServiceProvider, serviceProvider, loading } = useServiceProvider()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Show loading state while checking service provider status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-t-green-500 border-l-green-600 border-r-green-600 border-b-green-700 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking service provider status...</p>
        </div>
      </div>
    )
  }

  // Redirect non-service providers to registration page
  if (!isServiceProvider || !serviceProvider) {
    return <Navigate to="/vendor/register" replace />
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ServiceProviderSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-white">
                <ServiceProviderSidebar />
              </SheetContent>
            </Sheet>
            <h1 className="font-semibold text-gray-900">{title || "Dashboard"}</h1>
            <div></div> {/* Spacer for center alignment */}
          </div>
        </div>
        
        {/* Page Header */}
        {(title || description) && (
          <div className="hidden md:block bg-white border-b border-gray-200 px-6 py-4">
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