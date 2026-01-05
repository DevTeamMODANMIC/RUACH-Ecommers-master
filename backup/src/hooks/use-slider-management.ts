import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  getAllSliderItems, 
  createSliderItemWithAutoId, 
  updateSliderItem, 
  deleteSliderItem,
  initializeDefaultSliderItems
} from "@/lib/firebase-slider";

// Local storage key for temporary slider data
const LOCAL_STORAGE_KEY = "ruach_slider_items";

// Updated interface to match the Hero component's expected structure
export interface SliderItem {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: string;
  ctaLink: string;
}

export const useSliderManagement = () => {
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);
  const [useLocalStorageMode, setUseLocalStorageMode] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSliderItems();
  }, [useLocalStorageMode]);

  const fetchSliderItems = async () => {
    try {
      setLoading(true);
      setPermissionError(false);
      
      // If explicitly using local storage mode, skip Firebase entirely
      if (useLocalStorageMode) {
        const items = getSliderItemsFromLocalStorage();
        setSliderItems(items);
        setUsingLocalStorage(true);
        setUseLocalStorageMode(true);
        if (items.length === 0) {
          // Show info toast about local storage mode
          toast({
            title: "Local Storage Mode",
            description: "Using local storage for slider management. Changes will be saved locally in your browser.",
            variant: "default",
          });
        }
        return;
      }
      
      // Try Firebase first
      const items = await getAllSliderItems();
      setSliderItems(items);
      
      // Check if we're using local storage fallback
      if (items.length > 0 && items[0].id?.startsWith('local_')) {
        setUsingLocalStorage(true);
        setUseLocalStorageMode(true);
        toast({
          title: "Local Storage Mode",
          description: "Using local storage as temporary data storage. Changes will not persist across devices or browser sessions.",
          variant: "default",
        });
      } else {
        setUsingLocalStorage(false);
        setUseLocalStorageMode(false);
      }
    } catch (error: any) {
      console.error("Error in fetchSliderItems:", error);
      console.log("Error details:", {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      });
      
      // Switch to local storage mode on permission error
      if (error.message.includes("Permission denied") || 
          error.code === 'PERMISSION_DENIED' ||
          error.message.includes("PERMISSION_DENIED")) {
        setPermissionError(true);
        setUseLocalStorageMode(true);
        // Try local storage as fallback
        const items = getSliderItemsFromLocalStorage();
        setSliderItems(items);
        setUsingLocalStorage(true);
        toast({
          title: "Switched to Local Storage Mode",
          description: "Permission denied for Firebase. Switching to local storage mode for slider management.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to fetch slider items: ${error.message}`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

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
    ]);
  };

  const handleRemoveItem = async (index: number, id?: string) => {
    // If item has an ID, delete from Firebase
    if (id) {
      try {
        await deleteSliderItem(id);
        if (!usingLocalStorage) {
          toast({
            title: "Success",
            description: "Slider item deleted successfully",
          });
        }
      } catch (error: any) {
        console.error("Error in handleRemoveItem:", error);
        if (error.message.includes("Permission denied") || 
            error.code === 'PERMISSION_DENIED' ||
            error.message.includes("PERMISSION_DENIED")) {
          toast({
            title: "Permission Error",
            description: "You don't have permission to delete slider items.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to delete slider item: ${error.message}`,
            variant: "destructive",
          });
        }
        return;
      }
    }

    // Remove from local state
    const newItems = [...sliderItems];
    newItems.splice(index, 1);
    setSliderItems(newItems);
  };

  const handleChange = (index: number, field: keyof SliderItem, value: string) => {
    const newItems = [...sliderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setSliderItems(newItems);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (useLocalStorageMode || usingLocalStorage) {
        // Save to local storage
        saveSliderItemsToLocalStorage(sliderItems);
        toast({
          title: "Saved Locally",
          description: "Slider items saved to local storage. Note: Changes will not persist across devices or browser sessions.",
        });
      } else {
        // Save to Firebase (existing logic)
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
            });
          } else if (item.id?.startsWith('local_')) {
            // Update existing item in local storage
            await updateSliderItem(item.id, {
              title: item.title,
              subtitle: item.subtitle,
              description: item.description,
              image: item.image,
              cta: item.cta,
              ctaLink: item.ctaLink,
            });
          } else {
            // Create new item
            await createSliderItemWithAutoId({
              title: item.title,
              subtitle: item.subtitle,
              description: item.description,
              image: item.image,
              cta: item.cta,
              ctaLink: item.ctaLink,
            });
          }
        }
        toast({
          title: "Success",
          description: "Slider items saved successfully",
        });
      }

      // Refresh the list
      await fetchSliderItems();
    } catch (error: any) {
      console.error("Error in handleSave:", error);
      if (error.message.includes("Permission denied") || 
          error.code === 'PERMISSION_DENIED' ||
          error.message.includes("PERMISSION_DENIED")) {
        toast({
          title: "Permission Error",
          description: "You don't have permission to save slider items to Firebase. Switching to local storage mode.",
          variant: "destructive",
        });
        // Fallback to local storage
        saveSliderItemsToLocalStorage(sliderItems);
        setUseLocalStorageMode(true);
      } else {
        toast({
          title: "Error",
          description: `Failed to save slider items: ${error.message}`,
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeDefault = async () => {
    setInitializing(true);
    try {
      await initializeDefaultSliderItems();
      toast({
        title: "Success",
        description: "Default slider items initialized successfully",
      });
      // Refresh the list
      await fetchSliderItems();
    } catch (error: any) {
      console.error("Error in handleInitializeDefault:", error);
      if (error.message.includes("Permission denied") || 
          error.code === 'PERMISSION_DENIED' ||
          error.message.includes("PERMISSION_DENIED")) {
        toast({
          title: "Permission Error",
          description: "You don't have permission to initialize slider items.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to initialize default slider items: ${error.message}`,
          variant: "destructive",
        });
      }
    } finally {
      setInitializing(false);
    }
  };

  // Utility functions for local storage management
  const getSliderItemsFromLocalStorage = (): SliderItem[] => {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading from local storage:", error);
      return [];
    }
  };

  const saveSliderItemsToLocalStorage = (items: SliderItem[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error("Error saving to local storage:", error);
      return false;
    }
  };

  const toggleLocalStorageMode = () => {
    const newMode = !useLocalStorageMode;
    setUseLocalStorageMode(newMode);
    if (newMode) {
      toast({
        title: "Local Storage Mode Enabled",
        description: "Slider management will now use local storage. Changes will be saved locally in your browser.",
      });
    } else {
      toast({
        title: "Firebase Mode",
        description: "Attempting to use Firebase for slider management.",
      });
    }
  };

  // Export slider data
  const exportSliderData = () => {
    const dataStr = JSON.stringify(sliderItems, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `slider-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Export Successful",
      description: "Slider data has been exported successfully.",
    });
  };

  // Import slider data
  const importSliderData = (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData)) {
        setSliderItems(parsedData);
        toast({
          title: "Import Successful",
          description: `Imported ${parsedData.length} slider items.`,
        });
        return true;
      } else {
        toast({
          title: "Import Error",
          description: "Invalid data format. Please provide a valid JSON array.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Import Error",
        description: `Failed to parse JSON data: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    // State
    sliderItems,
    loading,
    saving,
    initializing,
    permissionError,
    usingLocalStorage,
    useLocalStorageMode,
    
    // Actions
    fetchSliderItems,
    handleAddItem,
    handleRemoveItem,
    handleChange,
    handleSave,
    handleInitializeDefault,
    toggleLocalStorageMode,
    exportSliderData,
    importSliderData,
  };
};