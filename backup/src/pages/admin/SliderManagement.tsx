import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Trash2, PlusCircle, Save, RotateCcw, AlertTriangle, Database, Download, Upload, HardDrive, Cloud, FileJson } from "lucide-react"
import { useAdmin } from "@/hooks/use-admin"
import { useSliderManagement, SliderItem } from "@/hooks/use-slider-management"
import { useIndexedDBSlider } from "@/hooks/use-indexeddb-slider"
import CloudinaryUploadWidget from "@/components/cloudinary-upload-widget"

type StorageMode = 'localStorage' | 'firebase' | 'indexedDB' | 'static';

export default function SliderManagement() {
  const [importData, setImportData] = useState<string>("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [storageMode, setStorageMode] = useState<StorageMode>('localStorage');
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdmin();
  
  // Local Storage/Firebase mode
  const localStorageManagement = useSliderManagement();
  
  // IndexedDB mode
  const indexedDBManagement = useIndexedDBSlider();
  
  // Determine which management hook to use based on storage mode
  const currentManagement = storageMode === 'indexedDB' ? indexedDBManagement : localStorageManagement;
  
  const {
    // State
    sliderItems,
    loading,
    saving,
    initializing,
    permissionError,
    usingLocalStorage,
    useLocalStorageMode,
    
    // Actions (localStorage/firebase)
    handleAddItem: handleAddItemLS,
    handleRemoveItem: handleRemoveItemLS,
    handleChange: handleChangeLS,
    handleSave: handleSaveLS,
    handleInitializeDefault: handleInitializeDefaultLS,
    toggleLocalStorageMode,
    exportSliderData: exportSliderDataLS,
    importSliderData: importSliderDataLS,
  } = localStorageManagement;
  
  const {
    // State (IndexedDB)
    migrationInProgress,
    
    // Actions (IndexedDB)
    handleAddItem: handleAddItemIDB,
    handleRemoveItem: handleRemoveItemIDB,
    handleChange: handleChangeIDB,
    handleSave: handleSaveIDB,
    handleInitializeDefault: handleInitializeDefaultIDB,
    handleMigrateFromLocalStorage,
    exportSliderData: exportSliderDataIDB,
    importSliderData: importSliderDataIDB,
  } = indexedDBManagement;

  // Determine which functions to use based on storage mode
  const handleAddItem = storageMode === 'indexedDB' ? handleAddItemIDB : handleAddItemLS;
  const handleRemoveItem = storageMode === 'indexedDB' ? handleRemoveItemIDB : handleRemoveItemLS;
  const handleChange = storageMode === 'indexedDB' ? handleChangeIDB : handleChangeLS;
  const handleSave = storageMode === 'indexedDB' ? handleSaveIDB : handleSaveLS;
  const handleInitializeDefault = storageMode === 'indexedDB' ? handleInitializeDefaultIDB : handleInitializeDefaultLS;
  const exportSliderData = storageMode === 'indexedDB' ? exportSliderDataIDB : exportSliderDataLS;
  
  const importSliderData = (data: string) => {
    if (storageMode === 'indexedDB') {
      return importSliderDataIDB(data);
    } else {
      return importSliderDataLS(data);
    }
  };

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

  if (permissionError && !useLocalStorageMode && storageMode !== 'indexedDB') {
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
          
          {/* Enhanced instructions for local storage workaround */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6 w-full max-w-2xl">
            <h3 className="text-yellow-800 font-medium mb-2">Temporary Workaround Options</h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-yellow-700 mb-2">Option 1: Browser Developer Console</h4>
              <ol className="list-decimal list-inside text-yellow-700 text-sm space-y-1 mb-3">
                <li>Open your browser's developer console (F12 or Ctrl+Shift+J)</li>
                <li>Copy and paste the following command:</li>
              </ol>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto mb-2">
                {`localStorage.setItem("ruach_slider_items", '[{"id":"local_1","title":"Discover a World of Products","subtitle":"From fashion and electronics to handmade crafts, find it all on Ruach E-Store.","description":"Experience the tastes of home with our carefully curated selection of international Products.","image":"https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80","cta":"Shop Now","ctaLink":"/shop","createdAt":${Date.now()},"updatedAt":${Date.now()}}]')`}
              </pre>
              <p className="text-yellow-700 text-sm">3. Refresh this page after running the command</p>
            </div>
            
            <div>
              <h4 className="font-medium text-yellow-700 mb-2">Option 2: Local Development</h4>
              <p className="text-yellow-700 text-sm mb-2">
                For local development, a localStorage.json file has been created with default slider data.
              </p>
              <p className="text-yellow-700 text-sm">
                Path: localStorage.json in your project root
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={() => window.location.reload()} variant="outline">
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
        {/* Storage Mode Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {storageMode === 'localStorage' && <HardDrive className="h-5 w-5 text-blue-400 mr-2" />}
              {storageMode === 'firebase' && <Cloud className="h-5 w-5 text-blue-400 mr-2" />}
              {storageMode === 'indexedDB' && <Database className="h-5 w-5 text-blue-400 mr-2" />}
              {storageMode === 'static' && <FileJson className="h-5 w-5 text-blue-400 mr-2" />}
              <h3 className="text-blue-800 font-medium">
                {storageMode === 'localStorage' && 'Local Storage Mode'}
                {storageMode === 'firebase' && 'Firebase Mode'}
                {storageMode === 'indexedDB' && 'IndexedDB Mode'}
                {storageMode === 'static' && 'Static File Mode'}
              </h3>
            </div>
            <div className="flex gap-2">
              <select 
                value={storageMode}
                onChange={(e) => setStorageMode(e.target.value as StorageMode)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="localStorage">Local Storage</option>
                <option value="firebase">Firebase</option>
                <option value="indexedDB">IndexedDB</option>
                <option value="static">Static File</option>
              </select>
            </div>
          </div>
          <p className="text-blue-700 mt-1 text-sm">
            {storageMode === 'localStorage' && 'Using local storage for slider management. Changes are saved locally in your browser.'}
            {storageMode === 'firebase' && 'Using Firebase for slider management. Changes are saved to the database.'}
            {storageMode === 'indexedDB' && 'Using IndexedDB for slider management. Better performance and larger storage limits.'}
            {storageMode === 'static' && 'Using static files for slider management. Changes require deployment.'}
          </p>
        </div>
        
        {/* IndexedDB Migration Button */}
        {storageMode === 'indexedDB' && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-yellow-800">Migrate from localStorage</h4>
                <p className="text-yellow-700 text-sm">Transfer your existing slider data to IndexedDB for better performance</p>
              </div>
              <Button 
                onClick={handleMigrateFromLocalStorage}
                disabled={migrationInProgress}
                variant="outline"
                size="sm"
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              >
                {migrationInProgress ? "Migrating..." : "Migrate Data"}
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Slider Management</h1>
            <p className="text-gray-500">Manage your homepage slider content</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {storageMode !== 'static' && (
              <>
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
              </>
            )}
            {storageMode !== 'static' && (
              <Button onClick={handleAddItem} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Slide
              </Button>
            )}
            {storageMode !== 'static' && (
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save All"}
              </Button>
            )}
          </div>
        </div>

        {sliderItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No slider items found</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {storageMode !== 'static' && (
                <>
                  <Button onClick={handleInitializeDefault} disabled={initializing} className="flex items-center gap-2">
                    <RotateCcw className={`h-4 w-4 ${initializing ? "animate-spin" : ""}`} />
                    {initializing ? "Initializing..." : "Load Default Slides"}
                  </Button>
                  <span className="text-gray-400">or</span>
                </>
              )}
              {storageMode !== 'static' && (
                <Button onClick={handleAddItem} className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Your First Slide
                </Button>
              )}
              {storageMode === 'static' && (
                <p className="text-gray-500">Slider data is managed through static files.</p>
              )}
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
                      {item.id?.startsWith('local_') && storageMode !== 'indexedDB' && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <HardDrive className="h-3 w-3 mr-1" />
                          Local
                        </span>
                      )}
                      {storageMode === 'indexedDB' && item.id && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Database className="h-3 w-3 mr-1" />
                          IndexedDB
                        </span>
                      )}
                    </CardTitle>
                    {storageMode !== 'static' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(index, item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
                      disabled={storageMode === 'static'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`subtitle-${index}`}>Subtitle</Label>
                    <Input
                      id={`subtitle-${index}`}
                      value={item.subtitle}
                      onChange={(e) => handleChange(index, "subtitle", e.target.value)}
                      placeholder="Enter slide subtitle"
                      disabled={storageMode === 'static'}
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
                      disabled={storageMode === 'static'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`image-${index}`}>Image</Label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Handle file drop
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          // We'll implement the actual upload logic in a moment
                          console.log("Files dropped:", e.dataTransfer.files);
                        }
                      }}
                    >
                      {item.image ? (
                        <div className="flex flex-col items-center">
                          <img 
                            src={item.image} 
                            alt="Slider preview" 
                            className="max-h-40 rounded-md mb-2"
                          />
                          <Input
                            id={`image-${index}`}
                            value={item.image}
                            onChange={(e) => handleChange(index, "image", e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            disabled={storageMode === 'static'}
                            className="mb-2"
                          />
                          <p className="text-sm text-gray-500">Drag & drop a new image here to replace</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-gray-600 mb-1">Drag & drop an image here</p>
                          <p className="text-sm text-gray-500">or click to browse files</p>
                          <Input
                            id={`image-${index}`}
                            value={item.image}
                            onChange={(e) => handleChange(index, "image", e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            disabled={storageMode === 'static'}
                            className="mt-2"
                          />
                        </div>
                      )}
                    </div>
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
                          disabled={storageMode === 'static'}
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
                        disabled={storageMode === 'static'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`ctaLink-${index}`}>CTA Link</Label>
                      <Input
                        id={`ctaLink-${index}`}
                        value={item.ctaLink}
                        onChange={(e) => handleChange(index, "ctaLink", e.target.value)}
                        placeholder="/products"
                        disabled={storageMode === 'static'}
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