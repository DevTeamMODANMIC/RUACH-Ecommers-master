import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  getAllSliderItems,
  createSliderItem,
  updateSliderItem,
  deleteSliderItem,
  initializeDefaultSliderItems,
  migrateFromLocalStorage
} from "@/lib/indexeddb-slider";
import { SliderItem } from "@/hooks/use-slider-management";

export const useIndexedDBSlider = () => {
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [migrationInProgress, setMigrationInProgress] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSliderItems();
  }, []);

  const fetchSliderItems = async () => {
    try {
      setLoading(true);
      const items = await getAllSliderItems();
      setSliderItems(items);
      
      // Show info toast about IndexedDB mode
      if (items.length === 0) {
        toast({
          title: "IndexedDB Mode",
          description: "Using IndexedDB for slider management. Changes will be saved locally in your browser with better performance.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("Error in fetchSliderItems:", error);
      toast({
        title: "Error",
        description: `Failed to fetch slider items: ${error.message}`,
        variant: "destructive",
      });
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
    // If item has an ID, delete from IndexedDB
    if (id) {
      try {
        await deleteSliderItem(id);
        toast({
          title: "Success",
          description: "Slider item deleted successfully",
        });
      } catch (error: any) {
        console.error("Error in handleRemoveItem:", error);
        toast({
          title: "Error",
          description: `Failed to delete slider item: ${error.message}`,
          variant: "destructive",
        });
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
      // Save all items to IndexedDB
      for (const item of sliderItems) {
        if (item.id) {
          // Update existing item
          await updateSliderItem(item.id, item);
        } else {
          // Create new item
          await createSliderItem(item);
        }
      }
      
      toast({
        title: "Success",
        description: "Slider items saved successfully to IndexedDB",
      });

      // Refresh the list
      await fetchSliderItems();
    } catch (error: any) {
      console.error("Error in handleSave:", error);
      toast({
        title: "Error",
        description: `Failed to save slider items: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeDefault = async () => {
    setInitializing(true);
    try {
      const result = await initializeDefaultSliderItems();
      if (result) {
        toast({
          title: "Success",
          description: "Default slider items initialized successfully",
        });
      } else {
        toast({
          title: "Info",
          description: "Slider items already exist, skipping initialization",
        });
      }
      // Refresh the list
      await fetchSliderItems();
    } catch (error: any) {
      console.error("Error in handleInitializeDefault:", error);
      toast({
        title: "Error",
        description: `Failed to initialize default slider items: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleMigrateFromLocalStorage = async () => {
    setMigrationInProgress(true);
    try {
      const result = await migrateFromLocalStorage();
      if (result) {
        toast({
          title: "Migration Successful",
          description: "Slider data migrated from localStorage to IndexedDB",
        });
        // Refresh the list
        await fetchSliderItems();
      } else {
        toast({
          title: "No Data to Migrate",
          description: "No slider data found in localStorage",
        });
      }
    } catch (error: any) {
      console.error("Error in handleMigrateFromLocalStorage:", error);
      toast({
        title: "Migration Error",
        description: `Failed to migrate data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setMigrationInProgress(false);
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
    migrationInProgress,
    
    // Actions
    fetchSliderItems,
    handleAddItem,
    handleRemoveItem,
    handleChange,
    handleSave,
    handleInitializeDefault,
    handleMigrateFromLocalStorage,
    exportSliderData,
    importSliderData,
  };
};