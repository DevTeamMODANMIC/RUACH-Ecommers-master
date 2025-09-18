"use client"

import { useState, useEffect } from "react"
import { useVendor } from "@/hooks/use-vendor"
import { updateVendorStore, deactivateVendorStore } from "@/lib/firebase-vendors"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Store, 
  Save, 
  Trash2, 
  AlertTriangle,
  Eye,
  Edit3
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import CloudinaryUploadWidget from "@/components/cloudinary-upload-widget"
import { Link } from "react-router-dom"
// ... existing code ...
import { useAuth } from "@/components/auth-provider"

export default function StoreSettingsPage() {
  const { activeStore, allStores, refreshStores } = useVendor()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [formData, setFormData] = useState({
    shopName: "",
    bio: "",
    logoUrl: "",
  })

  useEffect(() => {
    if (activeStore) {
      setFormData({
        shopName: activeStore.shopName,
        bio: activeStore.bio,
        logoUrl: activeStore.logoUrl,
      })
    }
  }, [activeStore])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleLogoUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      logoUrl: url
    }))
  }

  const handleSave = async () => {
    if (!activeStore) return

    setIsSaving(true)
    try {
      await updateVendorStore(activeStore.id, formData)
      await refreshStores()
      setIsEditing(false)
      alert("Store settings updated successfully!")
    } catch (error) {
      console.error("Error updating store:", error)
      alert("Failed to update store settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!activeStore || !user) return

    if (allStores.length === 1) {
      alert("Cannot deactivate your only store. You must have at least one active store.")
      return
    }

    setIsDeactivating(true)
    try {
      await deactivateVendorStore(activeStore.id)
      await refreshStores()
      alert("Store has been deactivated successfully")
    } catch (error) {
      console.error("Error deactivating store:", error)
      alert("Failed to deactivate store")
    } finally {
      setIsDeactivating(false)
    }
  }

  const handleCancel = () => {
    if (activeStore) {
      setFormData({
        shopName: activeStore.shopName,
        bio: activeStore.bio,
        logoUrl: activeStore.logoUrl,
      })
    }
    setIsEditing(false)
  }

  if (!activeStore) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Store Selected</h3>
          <p className="text-gray-600">Please select a store to manage its settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your store information and preferences
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button asChild variant="outline">
            <Link to={`/vendor/${activeStore.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Storefront
            </Link>
          </Button>
        </div>
      </div>

      {/* Store Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Store Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-medium">{activeStore.shopName}</h3>
                <p className="text-sm text-gray-600">Store ID: {activeStore.id}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={activeStore.approved ? "default" : "secondary"}>
                  {activeStore.approved ? "Approved" : "Pending Approval"}
                </Badge>
                <Badge variant={activeStore.isActive ? "default" : "destructive"}>
                  {activeStore.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Created: {new Date(activeStore.createdAt.toDate()).toLocaleDateString()}</p>
              <p>Store {allStores.findIndex(s => s.id === activeStore.id) + 1} of {allStores.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Store Information
            </CardTitle>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Store Logo */}
          <div>
            <Label>Store Logo</Label>
            <div className="mt-2 flex items-center gap-4">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Store logo"
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <Store className="h-8 w-8 text-gray-400" />
                </div>
              )}
              {isEditing && (
                <CloudinaryUploadWidget
                  onUploadSuccess={handleLogoUpload}
                  buttonText="Upload New Logo"
                  multiple={false}
                />
              )}
            </div>
          </div>

          {/* Store Name */}
          <div>
            <Label htmlFor="shopName">Store Name</Label>
            <Input
              id="shopName"
              name="shopName"
              value={formData.shopName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>

          {/* Store Description */}
          <div>
            <Label htmlFor="bio">Store Description</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={4}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Deactivate Store</h4>
              <p className="text-sm text-gray-600 mb-4">
                Deactivating your store will hide it from customers and stop all sales. 
                You can reactivate it later from your store list.
                {allStores.length === 1 && (
                  <span className="block mt-2 text-amber-600 font-medium">
                    ⚠️ You cannot deactivate your only store. Create another store first.
                  </span>
                )}
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={allStores.length === 1 || isDeactivating}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeactivating ? "Deactivating..." : "Deactivate Store"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deactivate Store</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to deactivate "{activeStore.shopName}"? 
                      This will hide your store from customers and stop all sales. 
                      You can reactivate it later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeactivate}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Deactivate Store
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Store Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Total Products</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">₦0.00</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}