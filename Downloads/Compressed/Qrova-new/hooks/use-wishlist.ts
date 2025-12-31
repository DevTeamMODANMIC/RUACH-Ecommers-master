"use client"

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'

export interface WishlistItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category?: string
  inStock: boolean
}

const WISHLIST_STORAGE_KEY = 'heritage-wishlist'

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()

  // Load wishlist from localStorage on client side
  useEffect(() => {
    setIsClient(true)
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY)
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist))
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error)
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))
      } catch (error) {
        console.error('Error saving wishlist to localStorage:', error)
      }
    }
  }, [wishlist, isClient])

  const addToWishlist = (item: WishlistItem) => {
    setWishlist(prev => {
      const exists = prev.find(wishlistItem => wishlistItem.id === item.id)
      if (exists) {
        return prev
      }
      
      toast({
        title: "Added to wishlist",
        description: `${item.name} has been added to your wishlist.`,
      })
      
      return [...prev, item]
    })
  }

  const removeFromWishlist = (itemId: string) => {
    setWishlist(prev => {
      const item = prev.find(wishlistItem => wishlistItem.id === itemId)
      if (item) {
        toast({
          title: "Removed from wishlist",
          description: `${item.name} has been removed from your wishlist.`,
        })
      }
      return prev.filter(wishlistItem => wishlistItem.id !== itemId)
    })
  }

  const toggleWishlist = (item: WishlistItem) => {
    const exists = wishlist.find(wishlistItem => wishlistItem.id === item.id)
    if (exists) {
      removeFromWishlist(item.id)
    } else {
      addToWishlist(item)
    }
  }

  const isInWishlist = (itemId: string) => {
    return wishlist.some(item => item.id === itemId)
  }

  const clearWishlist = () => {
    setWishlist([])
    toast({
      title: "Wishlist cleared",
      description: "All items have been removed from your wishlist.",
    })
  }

  const wishlistCount = wishlist.length

  return {
    wishlist,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    isClient
  }
}