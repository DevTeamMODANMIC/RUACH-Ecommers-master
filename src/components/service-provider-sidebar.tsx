import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useServiceProvider } from "../hooks/use-service-provider"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
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
  Menu,
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
  const { serviceProvider, isServiceProvider } = useServiceProvider()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  if (!isServiceProvider || !serviceProvider) {
    return null
  }

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
          icon: MessageSquare,
          disabled: true
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
      {/* Service Provider Info Header */}
      <div className="p-4 border-b bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center gap-3">
          {serviceProvider.profileImage?.url ? (
            <img
              src={serviceProvider.profileImage.url}
              alt={serviceProvider.name}
              className="w-10 h-10 rounded-lg object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Wrench className="h-6 w-6 text-white" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-sm text-gray-900 truncate">
              {serviceProvider.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={serviceProvider.isApproved ? "default" : "secondary"}
                className="text-xs h-4 px-1"
              >
                {serviceProvider.isApproved ? "Active" : "Pending"}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Quick Service Actions */}
        <div className="mt-3 flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1 text-xs h-7">
            <Link to={`/services/${serviceProvider.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              View Profile
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1 text-xs h-7">
            <Link to="/service-provider/dashboard/services/add">
              <Plus className="h-3 w-3 mr-1" />
              Add Service
            </Link>
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {navigationSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const active = isActive(item.href)
                const isDisabled = item.disabled
                return (
                  <Link
                    key={itemIndex}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                      isDisabled 
                        ? "opacity-50 cursor-not-allowed"
                        : active
                        ? "bg-green-100 text-green-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault()
                        return
                      }
                      setIsMobileOpen(false)
                    }}
                  >
                    <item.icon className={cn("h-4 w-4", active ? "text-green-700" : "text-gray-500")} />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs h-4 px-1">
                        {item.badge}
                      </Badge>
                    )}
                    {isDisabled && (
                      <Badge variant="outline" className="text-xs h-4 px-1">
                        Soon
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <Button asChild variant="ghost" size="sm" className="w-full justify-start">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Store
          </Link>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-200 z-40">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-20 left-4 z-50 bg-white shadow-md"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}