import { useState } from "react"
import { useVendor } from "../hooks/use-vendor"
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
  Loader2,
  ShoppingBag,
  TrendingUp
} from "lucide-react"
import { Link } from "react-router-dom"

export function StoreSwitcher() {
  const { activeStore, allStores, switchStore, canCreateMoreStores } = useVendor()
  const [isLoading, setIsLoading] = useState(false)

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

  if (!activeStore || allStores.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between h-auto py-3 px-4 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
          disabled={isLoading}
        >
          <div className="flex items-center gap-3 min-w-0">
            {activeStore.logoUrl ? (
              <img
                src={activeStore.logoUrl}
                alt={activeStore.shopName}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <Store className="h-5 w-5 text-white" />
              </div>
            )}
            <div className="text-left min-w-0 flex-1">
              <p className="font-semibold text-sm truncate text-gray-900">{activeStore.shopName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge 
                  variant={activeStore.approved ? "default" : "secondary"}
                  className={`text-xs px-1.5 py-0 ${activeStore.approved ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}`}
                >
                  {activeStore.approved ? "✓ Active" : "Pending"}
                </Badge>
              </div>
            </div>
          </div>
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin flex-shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-72" align="start" sideOffset={8}>
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Your Stores
            </p>
            <Badge variant="outline" className="text-xs">
              {allStores.length}/3
            </Badge>
          </div>
        </div>
        
        {/* Store List */}
        <div className="py-1">
          {allStores.map((store) => (
            <DropdownMenuItem
              key={store.id}
              className={`mx-1 my-0.5 p-2.5 cursor-pointer rounded-lg transition-colors ${
                store.id === activeStore.id 
                  ? 'bg-green-50 border border-green-200' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleStoreSwitch(store.id)}
            >
              <div className="flex items-center gap-3 w-full">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.shopName}
                    className="w-9 h-9 rounded-lg object-cover border border-gray-100"
                  />
                ) : (
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    store.id === activeStore.id 
                      ? 'bg-gradient-to-br from-green-500 to-green-600' 
                      : 'bg-gray-100'
                  }`}>
                    <Store className={`h-4 w-4 ${
                      store.id === activeStore.id ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium text-sm truncate ${
                      store.id === activeStore.id ? 'text-green-700' : 'text-gray-900'
                    }`}>
                      {store.shopName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {store.approved ? (
                      <span className="text-xs text-green-600">Active</span>
                    ) : (
                      <span className="text-xs text-amber-600">Pending approval</span>
                    )}
                    {!store.isActive && (
                      <span className="text-xs text-gray-400">• Inactive</span>
                    )}
                  </div>
                </div>
                
                {store.id === activeStore.id && (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Actions */}
        <div className="py-1">
          {canCreateMoreStores && (
            <DropdownMenuItem asChild>
              <Link 
                to="/vendor/register" 
                className="mx-1 p-2.5 cursor-pointer rounded-lg flex items-center gap-3 hover:bg-gray-50"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Create New Store</p>
                  <p className="text-xs text-gray-500">{3 - allStores.length} slots remaining</p>
                </div>
              </Link>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem asChild>
            <Link 
              to={`/vendor/${activeStore.id}`} 
              className="mx-1 p-2.5 cursor-pointer rounded-lg flex items-center gap-3 hover:bg-gray-50"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <Eye className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">View Storefront</p>
                <p className="text-xs text-gray-500">See your public store</p>
              </div>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link 
              to="/vendor/dashboard/settings" 
              className="mx-1 p-2.5 cursor-pointer rounded-lg flex items-center gap-3 hover:bg-gray-50"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                <Settings className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Store Settings</p>
                <p className="text-xs text-gray-500">Manage your store</p>
              </div>
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
