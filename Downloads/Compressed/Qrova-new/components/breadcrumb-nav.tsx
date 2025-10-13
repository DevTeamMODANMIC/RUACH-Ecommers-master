"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { Fragment } from "react"
import { useEffect, useState } from "react"

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbNavProps {
  items?: BreadcrumbItem[]
  className?: string
}

export default function BreadcrumbNav({ items, className = "" }: BreadcrumbNavProps) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Generate breadcrumbs from pathname if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items
    
    const pathSegments = pathname.split('/').filter(segment => segment !== '')
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ]
    
    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Convert segment to readable label
      let label = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
      
      // Special cases for common routes
      switch (segment) {
        case 'shop':
          label = 'Shop'
          break
        case 'products':
          label = 'Products'
          break
        case 'cart':
          label = 'Shopping Cart'
          break
        case 'checkout':
          label = 'Checkout'
          break
        case 'profile':
          label = 'My Account'
          break
        case 'admin':
          label = 'Admin Dashboard'
          break
        case 'bulk-order':
          label = 'Bulk Orders'
          break
        case 'about':
          label = 'About Us'
          break
        case 'contact':
          label = 'Contact Us'
          break
      }
      
      breadcrumbs.push({
        label,
        href: currentPath
      })
    })
    
    return breadcrumbs
  }
  
  const breadcrumbs = generateBreadcrumbs()
  
  // Don't show breadcrumbs on homepage or when not on client
  if (!isClient || pathname === '/' || breadcrumbs.length <= 1) {
    return null
  }
  
  return (
    <nav 
      className={`bg-gray-50 border-b border-gray-200 py-2 ${className}`}
      aria-label="Breadcrumb"
    >
      <div className="container mx-auto px-4">
        <ol className="flex items-center space-x-2 text-xs">
          {breadcrumbs.map((breadcrumb, index) => (
            <Fragment key={breadcrumb.href}>
              <li className="flex items-center">
                {index === 0 ? (
                  <Link 
                    href={breadcrumb.href}
                    className="flex items-center text-gray-500 hover:text-green-600 transition-colors"
                  >
                    <Home className="h-3 w-3 mr-1" />
                    <span className="sr-only">{breadcrumb.label}</span>
                  </Link>
                ) : index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-800 font-medium" aria-current="page">
                    {breadcrumb.label}
                  </span>
                ) : (
                  <Link 
                    href={breadcrumb.href}
                    className="text-gray-500 hover:text-green-600 transition-colors"
                  >
                    {breadcrumb.label}
                  </Link>
                )}
              </li>
              
              {index < breadcrumbs.length - 1 && (
                <li>
                  <ChevronRight className="h-3 w-3 text-gray-400" />
                </li>
              )}
            </Fragment>
          ))}
        </ol>
      </div>
    </nav>
  )
}