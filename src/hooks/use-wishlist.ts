"use client"

import { useCallback, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"

// Define a type for wishlist items
export interface WishlistItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category?: string
  inStock?: boolean
}

export function useWishlist() {
  const { toast } = useToast()
  const [items, setItems] = useLocalStorage<WishlistItem[]>("wishlist-items", [])

  // Add item to wishlist
  const addToWishlist = useCallback((item: WishlistItem) => {
    setItems((currentItems) => {
      // Check if item already exists
      if (currentItems.some((existingItem) => existingItem.id === item.id)) {
        return currentItems
      }
      
      // Show toast notification
      toast({
        title: "Added to Wishlist",
        description: `${item.name} has been added to your wishlist`,
      })
      
      return [...currentItems, item]
    })
  }, [setItems, toast])

  // Remove item from wishlist
  const removeFromWishlist = useCallback((id: string) => {
    setItems((currentItems) => {
      const itemToRemove = currentItems.find(item => item.id === id)
      const newItems = currentItems.filter(item => item.id !== id)
      
      // Show toast notification if an item was actually removed
      if (itemToRemove) {
        toast({
          title: "Removed from Wishlist",
          description: `${itemToRemove.name} has been removed from your wishlist`,
        })
      }
      
      return newItems
    })
  }, [setItems, toast])

  // Toggle item in wishlist (add if not present, remove if present)
  const toggleWishlist = useCallback((item: WishlistItem) => {
    setItems((currentItems) => {
      const exists = currentItems.some((existingItem) => existingItem.id === item.id)
      
      if (exists) {
        // Show toast notification for removal
        toast({
          title: "Removed from Wishlist",
          description: `${item.name} has been removed from your wishlist`,
        })
        
        return currentItems.filter((existingItem) => existingItem.id !== item.id)
      } else {
        // Show toast notification for addition
        toast({
          title: "Added to Wishlist",
          description: `${item.name} has been added to your wishlist`,
        })
        
        return [...currentItems, item]
      }
    })
  }, [setItems, toast])

  // Check if item is in wishlist
  const isInWishlist = useCallback((id: string) => {
    return items.some((item) => item.id === id)
  }, [items])

  // Clear all items from wishlist
  const clearWishlist = useCallback(() => {
    setItems([])
    
    toast({
      title: "Wishlist Cleared",
      description: "All items have been removed from your wishlist",
    })
  }, [setItems, toast])

  return {
    wishlistItems: items,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: items.length,
  }
} 