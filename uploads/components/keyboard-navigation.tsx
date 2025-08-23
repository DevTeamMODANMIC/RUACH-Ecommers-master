"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useVendor } from "@/hooks/use-vendor"

export default function KeyboardNavigation() {
  const router = useRouter()
  const { user } = useAuth()
  const { isVendor } = useVendor()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+A (or Cmd+Shift+A on Mac)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault()
        
        if (user) {
          // Allow any logged-in user to access vendor dashboard
          router.push('/vendor/dashboard')
        } else {
          // Redirect to login
          router.push('/login?redirect=/vendor/dashboard')
        }
        return
      }

      // Additional keyboard shortcuts
      if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
        switch (event.key) {
          case 'H': // Home
            event.preventDefault()
            router.push('/')
            break
          case 'S': // Shop
            event.preventDefault()
            router.push('/shop')
            break
          case 'C': // Cart
            event.preventDefault()
            router.push('/cart')
            break
          case 'P': // Profile (if logged in)
            event.preventDefault()
            if (user) {
              router.push('/profile')
            } else {
              router.push('/login')
            }
            break
          case 'V': // Vendor Registration
            event.preventDefault()
            if (user && !isVendor) {
              router.push('/vendor/register')
            } else if (user && isVendor) {
              router.push('/vendor/dashboard')
            } else {
              router.push('/login?redirect=/vendor/register')
            }
            break
          case 'D': // Admin Dashboard (for admins)
            event.preventDefault()
            router.push('/admin')
            break
        }
      }

      // Quick search with Ctrl+K (or Cmd+K)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        // Focus on search input if it exists
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        } else {
          router.push('/shop')
        }
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [router, user, isVendor])

  return null // This component doesn't render anything
}