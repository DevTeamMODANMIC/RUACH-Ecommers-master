import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useVendor } from "../hooks/use-vendor"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { cn } from "../lib/utils"
import {
  Store,
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  Star,
  Settings,
  Plus,
  Menu,
  Eye,
  ArrowLeft,
  Layers,
  DollarSign,
  Package2,
  Ticket
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

export function VendorSidebar() {
  const { activeStore, isVendor } = useVendor()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  if (!isVendor || !activeStore) {
    return null
  }

  const navigationSections: NavSection[] = [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/vendor/dashboard",
          icon: LayoutDashboard
        },
        {
          title: "Analytics",
          href: "/vendor/dashboard/analytics",
          icon: BarChart3
        }
      ]
    },
    {
      title: "Store Management",
      items: [
        {
          title: "My Stores",
          href: "/vendor/stores",
          icon: Layers
        },
        {
          title: "Products",
          href: "/vendor/dashboard/products",
          icon: Package
        },
        {
          title: "Add Product",
          href: "/vendor/dashboard/products/new",
          icon: Plus
        },
        {
          title: "Orders",
          href: "/vendor/dashboard/orders",
          icon: ShoppingCart
        },
        {
          title: "Bulk Orders",
          href: "/vendor/dashboard/bulk-orders",
          icon: Package2
        },
        {
          title: "Promo Codes",
          href: "/vendor/dashboard/promo-codes",
          icon: Ticket
        }
      ]
    },
    {
      title: "Customer Relations",
      items: [
        {
          title: "Customers",
          href: "/vendor/dashboard/customers",
          icon: Users
        },
        {
          title: "Reviews",
          href: "/vendor/dashboard/reviews",
          icon: Star
        }
      ]
    },
    {
      title: "Account",
      items: [
        {
          title: "Profile",
          href: "/vendor/dashboard/profile",
          icon: Users
        },
        {
          title: "Settings",
          href: "/vendor/dashboard/settings",
          icon: Settings
        },
        {
          title: "Payouts",
          href: "/vendor/dashboard/payouts",
          icon: DollarSign
        }
      ]
    }
  ]

  const isActive = (href: string) => {
    if (href === "/vendor/dashboard") {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Store Info Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          {activeStore.logoUrl ? (
            <img
              src={activeStore.logoUrl}
              alt={activeStore.shopName}
              className="w-10 h-10 rounded-lg object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-sm text-gray-900 truncate">
              {activeStore.shopName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={activeStore.approved ? "default" : "secondary"}
                className="text-xs h-4 px-1"
              >
                {activeStore.approved ? "Live" : "Pending"}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Quick Store Actions */}
        <div className="mt-3 flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1 text-xs h-7">
            <Link to={`/vendor/${activeStore.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              View Store
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1 text-xs h-7">
            <Link to="/vendor/stores">
              <Layers className="h-3 w-3 mr-1" />
              Switch
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
                return (
                  <Link
                    key={itemIndex}
                    to={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                      active
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", active ? "text-blue-700" : "text-gray-500")} />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs h-4 px-1">
                        {item.badge}
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
        <Button asChild variant="outline" size="sm" className="w-full">
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
      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-white">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 bg-white border-r border-gray-200 flex-col">
        <SidebarContent />
      </div>
    </>
  )
}