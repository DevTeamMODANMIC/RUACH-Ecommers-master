import { useState } from "react"
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
  Store, 
  ChevronDown, 
  Plus, 
  Check,
  Settings
} from "lucide-react"

// Import removed - using regular img tag instead
import { Link } from "react-router-dom"

export function VendorHeaderSwitcher() {
  const { activeStore, allStores, switchStore, canCreateMoreStores, isVendor } = useVendor()
  const [isLoading, setIsLoading] = useState(false)

  // Debug logging
  console.log('VendorHeaderSwitcher Debug:', {
    isVendor,
    hasActiveStore: !!activeStore,
    storeCount: allStores.length,
    activeStoreName: activeStore?.shopName,
    canCreateMore: canCreateMoreStores
  })

  if (!isVendor || allStores.length === 0) {
    console.log('VendorHeaderSwitcher hidden - no vendor status or stores')
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

  // Show vendor controls even with single store
  // Vendors should always see their store management options

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 gap-2 border-gray-200 hover:bg-gray-50"
          disabled={isLoading}
        >
          {activeStore?.logoUrl ? (
            <img
              src={activeStore.logoUrl}
              alt={activeStore.shopName}
              className="w-4 h-4 rounded-full object-cover"
            />
          ) : (
            <Store className="h-4 w-4 text-gray-600" />
          )}
          <span className="hidden sm:inline-block max-w-[100px] truncate">
            {activeStore?.shopName || 'My Store'}
          </span>
          <ChevronDown className="h-3 w-3 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end">
        <div className="p-2">
          <p className="text-xs font-medium text-gray-500 mb-2 px-2">
            {allStores.length > 1 ? `Switch Store (${allStores.length}/3)` : 'Store Management'}
          </p>
          
          {allStores.map((store) => (
            <DropdownMenuItem
              key={store.id}
              className="p-2 cursor-pointer"
              onClick={() => handleStoreSwitch(store.id)}
            >
              <div className="flex items-center gap-2 w-full">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.shopName}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                    <Store className="h-3 w-3 text-gray-500" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{store.shopName}</span>
                    {(store.id === activeStore?.id || allStores.length === 1) && (
                      <Check className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Badge 
                      variant={store.approved ? "default" : "secondary"}
                      className="text-xs h-4 px-1"
                    >
                      {store.approved ? "Live" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator className="my-2" />
          
          <DropdownMenuItem asChild>
            <Link to="/vendor/stores" className="p-2 cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              <span>Manage Stores</span>
            </Link>
          </DropdownMenuItem>
          
          {canCreateMoreStores && (
            <DropdownMenuItem asChild>
              <Link to="/vendor/register" className="p-2 cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                <span>Create New Store</span>
                <Badge variant="outline" className="ml-auto text-xs h-4 px-1">
                  {3 - allStores.length} left
                </Badge>
              </Link>
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}