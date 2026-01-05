"use client"

import { Button } from "./ui/button"
// import Link from "next/link"
import {Link} from "react-router-dom"
import { 
  Plus, 
  Eye, 
  Wrench, 
  Store,
  Calendar,
  BarChart3,
  Package
} from "lucide-react"

interface DashboardHeaderProps {
  title: string
  subtitle: string
  userType: "vendor" | "service-provider"
  storeName?: string
  showAddButton?: boolean
  showAnalyticsButton?: boolean
  addButtonText?: string
  addButtonLink?: string
  analyticsButtonLink?: string
}

export function DashboardHeader({
  title,
  subtitle,
  userType,
  storeName,
  showAddButton = true,
  showAnalyticsButton = true,
  addButtonText,
  addButtonLink,
  analyticsButtonLink
}: DashboardHeaderProps) {
  // Determine button text and links based on user type
  const defaultAddButtonText = userType === "vendor" ? "Add Product" : "Add Service"
  const defaultAddButtonLink = userType === "vendor" ? "/vendor/dashboard/products/new" : "/service-provider/dashboard/services/add"
  const defaultAnalyticsButtonLink = userType === "vendor" ? "/vendor/dashboard/analytics" : "/service-provider/dashboard/analytics"
  
  const addText = addButtonText || defaultAddButtonText
  const addLink = addButtonLink || defaultAddButtonLink
  const analyticsLink = analyticsButtonLink || defaultAnalyticsButtonLink

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {title}
        </h1>
        <p className="text-gray-600 mt-1">
          {subtitle}
        </p>
      </div>
      <div className="mt-4 sm:mt-0 flex gap-3">
        {showAnalyticsButton && (
          <Button asChild variant="outline">
            <Link to={analyticsLink}>
              <Eye className="h-4 w-4 mr-2" />
              View Analytics
            </Link>
          </Button>
        )}
        {showAddButton && (
          <Button asChild>
            <Link to={addLink}>
              <Plus className="h-4 w-4 mr-2" />
              {addText}
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}