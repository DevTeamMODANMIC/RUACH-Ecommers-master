import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Trash2, PlusCircle, Save, RotateCcw, AlertTriangle, Database, Download, Upload, ArrowRightLeft } from "lucide-react"
import { useAdmin } from "@/hooks/use-admin"
import CloudinaryUploadWidget from "@/components/cloudinary-upload-widget"
import { useIndexedDBSlider } from "@/hooks/use-indexeddb-slider"
import { SliderItem } from "@/hooks/use-slider-management"

export default function IndexedDBSliderManagement() {
  const [importData, setImportData] = useState<string>("");
  const [showImportModal, setShowImportModal] = useState(false);
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const {
    // State
    sliderItems,
    loading,
    saving,
    initializing,
    migrationInProgress,
    
    // Actions
    handleAddItem,
    handleRemoveItem,
    handleChange,
    handleSave,
    handleInitializeDefault,
    handleMigrateFromLocalStorage,
    exportSliderData,
    importSliderData,
  } = useIndexedDBSlider();

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

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-blue-400 mr-2" />
              <h3 className="text-blue-800 font-medium">IndexedDB Mode</h3>
            </div>
          </div>
          <p className="text-blue-700 mt-1 text-sm">
            Using IndexedDB for slider management. Better performance and larger storage limits than localStorage.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">IndexedDB Slider Management</h1>
            <p className="text-gray-500">Manage your homepage slider content with IndexedDB</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleMigrateFromLocalStorage} 
              disabled={migrationInProgress}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowRightLeft className={`h-4 w-4 ${migrationInProgress ? "animate-spin" : ""}`} />
              {migrationInProgress ? "Migrating..." : "Migrate from localStorage"}
            </Button>
            <Button 
              onClick={handleInitializeDefault} 
              disabled={initializing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className={`h-4 w-4 ${initializing ? "animate-spin" : ""}`} />
              {initializing ? "Initializing..." : "Load Defaults"}
            </Button>
            <Button 
              onClick={exportSliderData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              onClick={() => setShowImportModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
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
                      {item.id && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Database className="h-3 w-3 mr-1" />
                          IndexedDB
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
                    <Label htmlFor={`image-${index}`}>Image</Label>
                    <CloudinaryUploadWidget
                      onUploadSuccess={(publicId, url) => {
                        handleChange(index, "image", url);
                        toast({
                          title: "Image uploaded successfully",
                          description: "The image has been uploaded and applied to this slide.",
                        });
                      }}
                      onUploadError={(error) => {
                        toast({
                          title: "Image upload failed",
                          description: error.message || "Failed to upload image. Please try again.",
                          variant: "destructive",
                        });
                      }}
                      buttonText="Upload Image"
                      currentImages={item.image ? [{ publicId: `slide-${index}`, url: item.image }] : []}
                      onRemove={() => {
                        handleChange(index, "image", "");
                      }}
                      multiple={false}
                    />
                    {item.image && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Current image URL:</p>
                        <Input
                          id={`image-${index}`}
                          value={item.image}
                          onChange={(e) => handleChange(index, "image", e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    )}
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

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Import Slider Data</h2>
              <p className="text-gray-600 mb-4">
                Paste your slider data JSON below. This will replace your current slider items.
              </p>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder='[{"id":"1","title":"Example Slide","subtitle":"This is an example","description":"Example description","image":"https://example.com/image.jpg","cta":"Click Me","ctaLink":"/shop"}]'
                rows={10}
                className="font-mono text-sm"
              />
              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (importSliderData(importData)) {
                      setShowImportModal(false);
                      setImportData("");
                    }
                  }}
                  disabled={!importData.trim()}
                >
                  Import Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}