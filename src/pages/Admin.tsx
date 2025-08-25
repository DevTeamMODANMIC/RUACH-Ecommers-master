import { Link } from "react-router-dom";
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Package, PlusCircle, ShoppingCart, Users, CloudUpload } from "lucide-react"
import { useAdmin } from "../hooks/use-admin"

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
              <Link to="/admin" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Dashboard
              </Link>
              <Link to="/admin/products" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Products
              </Link>
              <Link to="/admin/orders" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Orders
              </Link>
              <Link to="/admin/vendors" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Vendors
              </Link>
              <Link to="/admin/products/cloudinary-migration" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Cloudinary Migration
              </Link>
              <Link to="/admin/migration" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Vendor Migration
              </Link>
              <Link to="/admin/products/import" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
                Import Products
              </Link>
              <Link to="/" className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium">
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
                <Link to="/admin/products">
                  View All Products
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link to="/admin/products/add">
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
                <Link to="/admin/products/cloudinary-migration">
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
                <Link to="/admin/orders">
                  Manage Orders
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Vendor Management Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Vendors</span>
              </CardTitle>
              <CardDescription>
                Approve vendor applications and manage vendor accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Review vendor applications, approve new vendors, and manage existing vendor accounts.</p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <Link to="/admin/vendors">
                  Manage Vendors
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Vendor Migration Card */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Package className="h-5 w-5" />
                <span>Data Migration</span>
              </CardTitle>
              <CardDescription className="text-amber-700">
                Migrate vendor data to multi-store structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-700">Convert existing single-store vendor data to support multiple stores per user.</p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row">
              <Button asChild className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700">
                <Link to="/admin/migration">
                  Run Migration
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
                <Link to="/admin/users">
                  Manage Users
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 