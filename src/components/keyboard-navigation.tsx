

import { useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../src/components/auth-provider"
import { useVendor } from "../../src/hooks/use-vendor"

export default function KeyboardNavigation() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isVendor } = useVendor()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+A (or Cmd+Shift+A on Mac)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault()
        
        if (user) {
          // Allow any logged-in user to access vendor dashboard
          navigate('/vendor/dashboard')
        } else {
          // Redirect to login
          navigate('/login?redirect=/vendor/dashboard')
        }
        return
      }

      // Additional keyboard shortcuts
      if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
        switch (event.key) {
          case 'H': // Home
            event.preventDefault()
            navigate('/')
            break
          case 'S': // Shop
            event.preventDefault()
            navigate('/shop')
            break
          case 'C': // Cart
            event.preventDefault()
            navigate('/cart')
            break
          case 'P': // Profile (if logged in)
            event.preventDefault()
            if (user) {
              navigate('/profile')
            } else {
              navigate('/login')
            }
            break
          case 'V': // Vendor Registration
            event.preventDefault()
            if (user && !isVendor) {
              navigate('/vendor/register')
            } else if (user && isVendor) {
              navigate('/vendor/dashboard')
            } else {
              navigate('/login?redirect=/vendor/register')
            }
            break
          case 'D': // Admin Dashboard (for admins)
            event.preventDefault()
            navigate('/admin')
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
          navigate('/shop')
        }
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [navigate, user, isVendor])

  return null // This component doesn't render anything
}