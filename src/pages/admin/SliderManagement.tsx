import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Trash2, PlusCircle, Save, RotateCcw, AlertTriangle, Database } from "lucide-react"
import { 
  getAllSliderItems, 
  createSliderItemWithAutoId, 
  updateSliderItem, 
  deleteSliderItem,
  initializeDefaultSliderItems
} from "@/lib/firebase-slider"
import { useAdmin } from "@/hooks/use-admin"

// Updated interface to match the Hero component's expected structure
interface SliderItem {
  id?: string
  title: string
  subtitle: string
  description: string
  image: string
  cta: string
  ctaLink: string
}

export default function SliderManagement() {
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const [permissionError, setPermissionError] = useState(false)
  const [usingLocalStorage, setUsingLocalStorage] = useState(false)
  const { toast } = useToast()
  const { isAdmin, loading: adminLoading } = useAdmin()

  useEffect(() => {
    if (!adminLoading) {
      fetchSliderItems()
    }
  }, [adminLoading])

  const fetchSliderItems = async () => {
    try {
      setLoading(true)
      setPermissionError(false)
      const items = await getAllSliderItems()
      setSliderItems(items)
      
      // Check if we're using local storage fallback
      if (items.length > 0 && items[0].id?.startsWith('local_')) {
        setUsingLocalStorage(true)
        toast({
          title: "Local Storage Mode",
          description: "Using local storage as temporary data storage. Changes will not persist across devices or browser sessions.",
          variant: "default",
        })
      } else {
        setUsingLocalStorage(false)
      }
    } catch (error: any) {
      console.error("Error in fetchSliderItems:", error)
      console.log("Error details:", {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      })
      
      if (error.message.includes("Permission denied") || 
          error.code === 'PERMISSION_DENIED' ||
          error.message.includes("PERMISSION_DENIED")) {
        setPermissionError(true)
        toast({
          title: "Permission Error",
          description: "You don't have permission to view slider items. Please contact an administrator.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to fetch slider items: ${error.message}`,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    setSliderItems([
      ...sliderItems,
      {
        title: "",
        subtitle: "",
        description: "",
        image: "",
        cta: "",
        ctaLink: "",
      }
    ])
  }

  const handleRemoveItem = async (index: number, id?: string) => {
    // If item has an ID, delete from Firebase
    if (id) {
      try {
        await deleteSliderItem(id)
        if (!usingLocalStorage) {
          toast({
            title: "Success",
            description: "Slider item deleted successfully",
          })
        }
      } catch (error: any) {
        console.error("Error in handleRemoveItem:", error)
        if (error.message.includes("Permission denied") || 
            error.code === 'PERMISSION_DENIED' ||
            error.message.includes("PERMISSION_DENIED")) {
          toast({
            title: "Permission Error",
            description: "You don't have permission to delete slider items.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: `Failed to delete slider item: ${error.message}`,
            variant: "destructive",
          })
        }
        return
      }
    }

    // Remove from local state
    const newItems = [...sliderItems]
    newItems.splice(index, 1)
    setSliderItems(newItems)
  }

  const handleChange = (index: number, field: keyof SliderItem, value: string) => {
    const newItems = [...sliderItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setSliderItems(newItems)
  }

  const handleSave = async () => {
    if (!isAdmin) {
      toast({
        title: "Permission Error",
        description: "You must be an administrator to save slider items.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      // Save all items
      for (const item of sliderItems) {
        if (item.id && !item.id.startsWith('local_')) {
          // Update existing item in Firebase
          await updateSliderItem(item.id, {
            title: item.title,
            subtitle: item.subtitle,
            description: item.description,
            image: item.image,
            cta: item.cta,
            ctaLink: item.ctaLink,
          })
        } else if (item.id?.startsWith('local_')) {
          // Update existing item in local storage
          await updateSliderItem(item.id, {
            title: item.title,
            subtitle: item.subtitle,
            description: item.description,
            image: item.image,
            cta: item.cta,
            ctaLink: item.ctaLink,
          })
        } else {
          // Create new item
          await createSliderItemWithAutoId({
            title: item.title,
            subtitle: item.subtitle,
            description: item.description,
            image: item.image,
            cta: item.cta,
            ctaLink: item.ctaLink,
          })
        }
      }

      if (!usingLocalStorage) {
        toast({
          title: "Success",
          description: "Slider items saved successfully",
        })
      } else {
        toast({
          title: "Saved Locally",
          description: "Slider items saved to local storage. Note: Changes will not persist across devices or browser sessions.",
        })
      }

      // Refresh the list
      await fetchSliderItems()
    } catch (error: any) {
      console.error("Error in handleSave:", error)
      if (error.message.includes("Permission denied") || 
          error.code === 'PERMISSION_DENIED' ||
          error.message.includes("PERMISSION_DENIED")) {
        toast({
          title: "Permission Error",
          description: "You don't have permission to save slider items.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to save slider items: ${error.message}`,
          variant: "destructive",
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleInitializeDefault = async () => {
    if (!isAdmin) {
      toast({
        title: "Permission Error",
        description: "You must be an administrator to initialize slider items.",
        variant: "destructive",
      })
      return
    }

    setInitializing(true)
    try {
      await initializeDefaultSliderItems()
      toast({
        title: "Success",
        description: "Default slider items initialized successfully",
      })
      // Refresh the list
      await fetchSliderItems()
    } catch (error: any) {
      console.error("Error in handleInitializeDefault:", error)
      if (error.message.includes("Permission denied") || 
          error.code === 'PERMISSION_DENIED' ||
          error.message.includes("PERMISSION_DENIED")) {
        toast({
          title: "Permission Error",
          description: "You don't have permission to initialize slider items.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to initialize default slider items: ${error.message}`,
          variant: "destructive",
        })
      }
    } finally {
      setInitializing(false)
    }
  }

  if (adminLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4">Checking permissions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-red-50 rounded-lg border border-red-200 p-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600 text-center mb-6">
            You must be an administrator to access the slider management page.
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4">Loading slider items...</p>
          </div>
        </div>
      </div>
    )
  }

  if (permissionError) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-red-50 rounded-lg border border-red-200 p-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Permission Error</h2>
          <p className="text-red-600 text-center mb-6">
            You don't have permission to view slider items in the database.
          </p>
          <p className="text-red-500 text-center mb-6">
            Please contact your Firebase administrator to grant read permissions to the "slider" path.
          </p>
          <div className="flex gap-3">
            <Button onClick={fetchSliderItems} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        {usingLocalStorage && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
              <h3 className="text-yellow-800 font-medium">Temporary Local Storage Mode</h3>
            </div>
            <p className="text-yellow-700 mt-1 text-sm">
              Using local storage as temporary data storage. Changes will not persist across devices or browser sessions.
              Contact your administrator to fix Firebase permissions for full functionality.
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Slider Management</h1>
            <p className="text-gray-500">Manage your homepage slider content</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleInitializeDefault} 
              disabled={initializing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className={`h-4 w-4 ${initializing ? "animate-spin" : ""}`} />
              {initializing ? "Initializing..." : "Load Defaults"}
            </Button>
            <Button onClick={handleAddItem} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Slide
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save All"}
            </Button>
          </div>
        </div>

        {sliderItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No slider items found</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={handleInitializeDefault} disabled={initializing} className="flex items-center gap-2">
                <RotateCcw className={`h-4 w-4 ${initializing ? "animate-spin" : ""}`} />
                {initializing ? "Initializing..." : "Load Default Slides"}
              </Button>
              <span className="text-gray-400">or</span>
              <Button onClick={handleAddItem} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Your First Slide
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sliderItems.map((item, index) => (
              <Card key={item.id || `new-${index}`}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      Slide {index + 1}
                      {item.id?.startsWith('local_') && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Database className="h-3 w-3 mr-1" />
                          Local
                        </span>
                      )}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveItem(index, item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Configure the content for this slider item
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${index}`}>Title</Label>
                    <Input
                      id={`title-${index}`}
                      value={item.title}
                      onChange={(e) => handleChange(index, "title", e.target.value)}
                      placeholder="Enter slide title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`subtitle-${index}`}>Subtitle</Label>
                    <Input
                      id={`subtitle-${index}`}
                      value={item.subtitle}
                      onChange={(e) => handleChange(index, "subtitle", e.target.value)}
                      placeholder="Enter slide subtitle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => handleChange(index, "description", e.target.value)}
                      placeholder="Enter slide description"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`image-${index}`}>Image URL</Label>
                    <Input
                      id={`image-${index}`}
                      value={item.image}
                      onChange={(e) => handleChange(index, "image", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`cta-${index}`}>CTA Text</Label>
                      <Input
                        id={`cta-${index}`}
                        value={item.cta}
                        onChange={(e) => handleChange(index, "cta", e.target.value)}
                        placeholder="Button text"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`ctaLink-${index}`}>CTA Link</Label>
                      <Input
                        id={`ctaLink-${index}`}
                        value={item.ctaLink}
                        onChange={(e) => handleChange(index, "ctaLink", e.target.value)}
                        placeholder="/products"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}