import { useState } from "react"
import { useServiceProvider } from "../../src/hooks/use-service-provider"
import { useVendor } from "../../src/hooks/use-vendor"
import { Button } from "../../src/components/ui/button"
import { Badge } from "../../src/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../src/components/ui/dropdown-menu"
import { 
  Briefcase, 
  ChevronDown, 
  Settings,
  User,
  Calendar
} from "lucide-react"
import { Link } from "react-router-dom"

export function ServiceProviderHeaderSwitcher() {
  const { serviceProvider, isServiceProvider } = useServiceProvider()
  const { isVendor } = useVendor()
  const [isLoading, setIsLoading] = useState(false)

  // Don't show if user is a vendor (mutual exclusivity)
  if (isVendor) {
    return null
  }

  // Don't show if not a service provider
  if (!isServiceProvider || !serviceProvider) {
    return null
  }

  const getStatusBadge = () => {
    if (!serviceProvider.isApproved) {
      return <Badge variant="secondary" className="text-xs h-4 px-1">Pending</Badge>
    }
    if (serviceProvider.isApproved && serviceProvider.isActive) {
      return <Badge variant="default" className="text-xs h-4 px-1">Active</Badge>
    }
    return <Badge variant="outline" className="text-xs h-4 px-1">Inactive</Badge>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 gap-2 border-gray-200 hover:bg-gray-50"
          disabled={isLoading}
        >
          {serviceProvider?.profileImage?.url ? (
            <img
              src={serviceProvider.profileImage.url}
              alt={serviceProvider.name}
              className="w-4 h-4 rounded-full object-cover"
            />
          ) : (
            <Briefcase className="h-4 w-4 text-gray-600" />
          )}
          <span className="hidden sm:inline-block max-w-[100px] truncate">
            {serviceProvider.name}
          </span>
          <ChevronDown className="h-3 w-3 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end">
        <div className="p-2">
          <div className="flex items-center gap-2 w-full mb-3">
            {serviceProvider.profileImage?.url ? (
              <img
                src={serviceProvider.profileImage.url}
                alt={serviceProvider.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-gray-500" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{serviceProvider.name}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {getStatusBadge()}
                <span className="text-xs text-gray-500 capitalize">
                  {serviceProvider.category.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>
          
          <DropdownMenuSeparator className="my-2" />
          
          <DropdownMenuItem asChild>
            <Link to="/service-provider/dashboard" className="p-2 cursor-pointer">
              <Briefcase className="h-4 w-4 mr-2" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link to="/service-provider/dashboard/services" className="p-2 cursor-pointer">
              <Calendar className="h-4 w-4 mr-2" />
              <span>My Services</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link to="/service-provider/dashboard/settings" className="p-2 cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              <span>Profile Settings</span>
            </Link>
          </DropdownMenuItem>
          
          {!serviceProvider.isApproved && (
            <>
              <DropdownMenuSeparator className="my-2" />
              <div className="px-2 py-1">
                <p className="text-xs text-amber-600 font-medium">Pending Approval</p>
                <p className="text-xs text-gray-500 mt-1">
                  Your application is being reviewed. You'll be notified once approved.
                </p>
              </div>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}