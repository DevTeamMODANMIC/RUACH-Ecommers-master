import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useServiceProvider } from "../hooks/use-service-provider"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { cn } from "../lib/utils"
import {
  Wrench,
  LayoutDashboard,
  Calendar,
  BarChart3,
  Users,
  Star,
  Settings,
  Plus,
  Eye,
  ArrowLeft,
  MessageSquare,
  Clock
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  disabled?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

export function ServiceProviderSidebar() {
  const { serviceProvider, isServiceProvider, loading } = useServiceProvider()
  const location = useLocation()

  // Show loading state instead of null to ensure sidebar container is always present
  const showLoadingState = !isServiceProvider || !serviceProvider

  const navigationSections: NavSection[] = [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/service-provider/dashboard",
          icon: LayoutDashboard
        },
        {
          title: "Analytics",
          href: "/service-provider/dashboard/analytics",
          icon: BarChart3
        }
      ]
    },
    {
      title: "Service Management",
      items: [
        {
          title: "My Services",
          href: "/service-provider/dashboard/services",
          icon: Wrench
        },
        {
          title: "Add Service",
          href: "/service-provider/dashboard/services/add",
          icon: Plus
        },
        {
          title: "Bookings",
          href: "/service-provider/dashboard/bookings",
          icon: Calendar
        }
      ]
    },
    {
      title: "Customer Relations",
      items: [
        {
          title: "Reviews",
          href: "/service-provider/dashboard/reviews",
          icon: Star
        },
        {
          title: "Messages",
          href: "/service-provider/dashboard/messages",
          icon: MessageSquare
        }
      ]
    },
    {
      title: "Account",
      items: [
        {
          title: "Settings",
          href: "/service-provider/dashboard/settings",
          icon: Settings
        }
      ]
    }
  ]

  const isActive = (href: string) => {
    if (href === "/service-provider/dashboard") {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Wrench className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold text-gray-900">Service Provider</h2>
            {serviceProvider && (
              <p className="text-sm text-gray-600 truncate">{serviceProvider.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navigationSections.map((section) => (
          <div key={section.title}>
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                if (item.disabled) {
                  return (
                    <div
                      key={item.title}
                      className="flex items-center px-2 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.title}
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                      active
                        ? "bg-green-100 text-green-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "mr-3 h-5 w-5",
                        active ? "text-green-500" : "text-gray-400 group-hover:text-gray-500"
                      )}
                    />
                    {item.title}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Service Provider Portal</span>
          <span>v1.0</span>
        </div>
      </div>
    </div>
  )

  if (showLoadingState) {
    return (
      <div className="w-64 h-full bg-white border-r border-gray-200">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="h-6 w-6 border-2 border-t-green-500 border-l-green-600 border-r-green-600 border-b-green-700 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200">
      <SidebarContent />
    </div>
  )
}