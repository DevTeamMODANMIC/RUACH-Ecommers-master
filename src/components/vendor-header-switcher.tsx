import { useState } from "react"
import { useVendor } from "../hooks/use-vendor"
import { useServiceProvider } from "../hooks/use-service-provider"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { 
  Store, 
  ChevronDown, 
  Plus, 
  Check,
  Settings,
  Eye,
  LayoutDashboard,
  Package,
  Loader2,
  TrendingUp
} from "lucide-react"
import { Link } from "react-router-dom"

export function VendorHeaderSwitcher() {
  const { activeStore, allStores, switchStore, canCreateMoreStores, isVendor } = useVendor()
  const { isServiceProvider } = useServiceProvider()
  const [isLoading, setIsLoading] = useState(false)

  // Don't show if user is a service provider (mutual exclusivity)
  if (isServiceProvider) {
    return null
  }

  if (!isVendor || allStores.length === 0) {
    return null
  }

  const handleStoreSwitch = async (storeId: string) => {
    if (storeId === activeStore?.id) return
    
    setIsLoading(true)
    try {
      await switchStore(storeId)
    } catch (error) {
      console.error("Failed to switch store:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-9 gap-2 px-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
          disabled={isLoading}
        >
          {activeStore?.logoUrl ? (
            <img
              src={activeStore.logoUrl}
              alt={activeStore.shopName}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-gray-200"
            />
          ) : (
            <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <Store className="h-3 w-3 text-white" />
            </div>
          )}
          <span className="hidden sm:inline-block max-w-[120px] truncate font-medium text-gray-700">
            {activeStore?.shopName || 'My Store'}
          </span>
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 text-gray-400 animate-spin" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-72" align="end" sideOffset={8}>
        {/* Header */}
        <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-900">
                {allStores.length > 1 ? 'Switch Store' : 'Your Store'}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {allStores.length}/3 stores created
              </p>
            </div>
            {activeStore?.approved && (
              <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0 hover:bg-green-100">
                Live
              </Badge>
            )}
          </div>
        </div>
        
        {/* Store List */}
        <div className="py-1 max-h-[200px] overflow-y-auto">
          {allStores.map((store) => (
            <DropdownMenuItem
              key={store.id}
              className={`mx-1 my-0.5 p-2 cursor-pointer rounded-md transition-colors ${
                store.id === activeStore?.id 
                  ? 'bg-green-50 border border-green-200' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleStoreSwitch(store.id)}
            >
              <div className="flex items-center gap-2.5 w-full">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.shopName}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-gray-200"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    store.id === activeStore?.id 
                      ? 'bg-gradient-to-br from-green-500 to-green-600' 
                      : 'bg-gray-100'
                  }`}>
                    <Store className={`h-4 w-4 ${
                      store.id === activeStore?.id ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    store.id === activeStore?.id ? 'text-green-700' : 'text-gray-900'
                  }`}>
                    {store.shopName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] ${
                      store.approved ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {store.approved ? '● Active' : '○ Pending'}
                    </span>
                    {!store.isActive && (
                      <span className="text-[10px] text-gray-400">• Paused</span>
                    )}
                  </div>
                </div>
                
                {store.id === activeStore?.id && (
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Quick Actions */}
        <div className="py-1">
          <DropdownMenuItem asChild>
            <Link 
              to="/vendor/dashboard" 
              className="mx-1 p-2 cursor-pointer rounded-md flex items-center gap-2.5 hover:bg-gray-50"
            >
              <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center">
                <LayoutDashboard className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-700">Dashboard</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link 
              to="/vendor/dashboard/products" 
              className="mx-1 p-2 cursor-pointer rounded-md flex items-center gap-2.5 hover:bg-gray-50"
            >
              <div className="w-7 h-7 rounded-md bg-purple-50 flex items-center justify-center">
                <Package className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-700">Products</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link 
              to="/vendor/dashboard/orders" 
              className="mx-1 p-2 cursor-pointer rounded-md flex items-center gap-2.5 hover:bg-gray-50"
            >
              <div className="w-7 h-7 rounded-md bg-orange-50 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-orange-600" />
              </div>
              <span className="text-sm text-gray-700">Orders</span>
            </Link>
          </DropdownMenuItem>
          
          {activeStore && (
            <DropdownMenuItem asChild>
              <Link 
                to={`/vendor/${activeStore.id}`} 
                className="mx-1 p-2 cursor-pointer rounded-md flex items-center gap-2.5 hover:bg-gray-50"
              >
                <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center">
                  <Eye className="h-3.5 w-3.5 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700">View Storefront</span>
              </Link>
            </DropdownMenuItem>
          )}
        </div>
        
        {canCreateMoreStores && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link 
                to="/vendor/register" 
                className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create New Store
                <Badge variant="secondary" className="ml-auto bg-green-500 text-white text-[10px] px-1.5">
                  {3 - allStores.length} left
                </Badge>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
