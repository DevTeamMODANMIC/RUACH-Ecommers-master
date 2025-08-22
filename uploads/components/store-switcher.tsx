"use client"

import { useState } from "react"
import { useVendor } from "@/hooks/use-vendor"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Store, 
  ChevronDown, 
  Plus, 
  Check,
  Settings,
  Eye
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
          className="w-full justify-between h-auto p-3 border-gray-200 hover:bg-gray-50"
          disabled={isLoading}
        >
          <div className="flex items-center gap-3 min-w-0">
            {activeStore.logoUrl ? (
              <Image
                src={activeStore.logoUrl}
                alt={activeStore.shopName}
                width={32}
                height={32}
                className="rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Store className="h-4 w-4 text-green-600" />
              </div>
            )}
            <div className="text-left min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{activeStore.shopName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={activeStore.approved ? "default" : "secondary"}
                  className="text-xs"
                >
                  {activeStore.approved ? "Approved" : "Pending"}
                </Badge>
                {allStores.length > 1 && (
                  <span className="text-xs text-gray-500">
                    {allStores.findIndex(s => s.id === activeStore.id) + 1} of {allStores.length}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="start">
        <div className="p-2">
          <p className="text-xs font-medium text-gray-500 mb-2 px-2">
            Your Stores ({allStores.length}/3)
          </p>
          
          {allStores.map((store) => (
            <DropdownMenuItem
              key={store.id}
              className="p-3 cursor-pointer"
              onClick={() => handleStoreSwitch(store.id)}
            >
              <div className="flex items-center gap-3 w-full">
                {store.logoUrl ? (
                  <Image
                    src={store.logoUrl}
                    alt={store.shopName}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Store className="h-4 w-4 text-green-600" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{store.shopName}</p>
                    {store.id === activeStore.id && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={store.approved ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {store.approved ? "Approved" : "Pending"}
                    </Badge>
                    {!store.isActive && (
                      <Badge variant="outline" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator className="my-2" />
          
          {canCreateMoreStores && (
            <DropdownMenuItem asChild>
              <Link href="/vendor/register" className="p-3 cursor-pointer">
                <Plus className="h-4 w-4 mr-3" />
                <span>Create New Store</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {3 - allStores.length} left
                </Badge>
              </Link>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem asChild>
            <Link href={`/vendor/${activeStore.id}`} className="p-3 cursor-pointer">
              <Eye className="h-4 w-4 mr-3" />
              <span>View Storefront</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/vendor/dashboard/settings" className="p-3 cursor-pointer">
              <Settings className="h-4 w-4 mr-3" />
              <span>Store Settings</span>
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}