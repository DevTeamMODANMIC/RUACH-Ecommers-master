"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import {Link} from "react-router-dom"
import { 
  Plus, 
  Eye, 
  Calendar, 
  Wrench, 
  BarChart3, 
  Package,
  MessageSquare,
  Settings,
  ArrowUpRight
} from "lucide-react"

interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  link: string
  color?: string
}

interface DashboardQuickActionsProps {
  userType: "vendor" | "service-provider"
  showViewAll?: boolean
}

export function DashboardQuickActions({ userType, showViewAll = false }: DashboardQuickActionsProps) {
  const actions: QuickAction[] = userType === "vendor" 
    ? [
        {
          title: "Add New Product",
          description: "Expand your inventory",
          icon: Plus,
          link: "/vendor/dashboard/products/new"
        },
        {
          title: "Manage Orders",
          description: "Process pending orders",
          icon: Package,
          link: "/vendor/dashboard/orders"
        },
        {
          title: "Update Inventory",
          description: "Manage stock levels",
          icon: Package,
          link: "/vendor/dashboard/products"
        },
        {
          title: "View Storefront",
          description: "See your public store",
          icon: Eye,
          link: "/vendor/dashboard"
        }
      ]
    : [
        {
          title: "Add New Service",
          description: "Expand your service offerings",
          icon: Plus,
          link: "/service-provider/dashboard/services/add"
        },
        {
          title: "Manage Bookings",
          description: "Process pending bookings",
          icon: Calendar,
          link: "/service-provider/dashboard/bookings"
        },
        {
          title: "Update Services",
          description: "Manage service listings",
          icon: Wrench,
          link: "/service-provider/dashboard/services"
        },
        {
          title: "View Profile",
          description: "See your public profile",
          icon: Eye,
          link: "/service-provider/dashboard/settings"
        }
      ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {userType === "vendor" ? <Package className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Button asChild variant="outline" className="h-auto p-4 justify-start" key={index}>
              <Link href={action.link}>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-gray-500">{action.description}</div>
                </div>
                {action.title === "View Storefront" && (
                  <ArrowUpRight className="h-4 w-4 ml-auto" />
                )}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}