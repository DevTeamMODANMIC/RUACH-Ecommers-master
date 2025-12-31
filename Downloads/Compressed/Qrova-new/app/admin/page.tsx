"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, PlusCircle, ShoppingCart, Users, CloudUpload, Mail, TestTube } from "lucide-react"
import { useAdmin } from "@/hooks/use-admin"

export default function AdminDashboard() {
  const { isAdmin, loading } = useAdmin()

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your products, orders, and users</p>
        </div>

        {/* Admin navigation for smaller screens - with better contrast */}
        <div className="md:hidden mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium mb-3 text-slate-800">Quick Navigation</h3>
            <div className="flex flex-col gap-2">
              <Link href="/admin" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Dashboard
              </Link>
              <Link href="/admin/products" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Products
              </Link>
              <Link href="/admin/orders" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Orders
              </Link>
              <Link href="/admin/products/cloudinary-migration" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Cloudinary Migration
              </Link>
              <Link href="/admin/products/import" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Import Products
              </Link>
              <Link href="/admin/email-test" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Email Testing
              </Link>
              <Link href="/" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Back to Site
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Product Management Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <span>Products</span>
              </CardTitle>
              <CardDescription>
                Add, edit, or remove products from your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Manage your product catalog, update prices, descriptions and more.</p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/admin/products">
                  View All Products
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/admin/products/add">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Cloudinary Image Management Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudUpload className="h-5 w-5" />
                <span>Image Management</span>
              </CardTitle>
              <CardDescription>
                Optimize product images with Cloudinary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Migrate your product images to Cloudinary for better performance, responsive sizing, and easier management.</p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/admin/products/cloudinary-migration">
                  Migrate Images
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Orders Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Orders</span>
              </CardTitle>
              <CardDescription>
                View and manage customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Process orders, update shipping status, and handle returns.</p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/admin/orders">
                  Manage Orders
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Users Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Users</span>
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">View customer accounts, update information, and manage access.</p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/admin/users">
                  Manage Users
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Email Testing Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <span>Email Testing</span>
              </CardTitle>
              <CardDescription>
                Test your email system and templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Test different email templates, verify SMTP settings, and ensure your email system is working correctly.</p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/admin/email-test">
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Emails
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 