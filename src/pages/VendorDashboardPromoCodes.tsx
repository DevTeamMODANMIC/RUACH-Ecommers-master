import { useState, useEffect } from "react";
import { useVendor } from "../hooks/use-vendor";
import { VendorLayout } from "../components/vendor-layout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "../components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { Plus, Edit, Eye, Calendar, Users, Ticket, AlertCircle, Info, Trash2 } from "lucide-react";
import { 
  createPromoCode, 
  getVendorPromoCodes, 
  updatePromoCode, 
  listenToVendorPromoCodes,
  deletePromoCode
} from "../lib/firebase-promo-codes";
import { PromoCode } from "../types";

// Simple date formatting function
const formatDate = (date?: Date) => {
  if (!date) return "No expiration";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

// Helper function to explain discount calculation
const explainDiscount = (type: string, value: number, orderAmount: number = 10000) => {
  if (type === "percentage") {
    return `Customers will get ${value}% off their order. For example, on a ₦${orderAmount.toLocaleString()} order, they'll save ₦${(orderAmount * value / 100).toLocaleString()}.`;
  } else {
    return `Customers will get ₦${value.toLocaleString()} off their order. For example, on a ₦${(orderAmount + value).toLocaleString()} order, they'll pay only ₦${orderAmount.toLocaleString()}.`;
  }
};

export default function VendorDashboardPromoCodes() {
  const { activeStore } = useVendor();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    minimumOrderAmount: 0,
    maxUses: 0,
    expirationDate: "",
    isActive: true,
    customerId: ""
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeStore) return;

    const unsubscribe = listenToVendorPromoCodes(activeStore.id, (promoCodes) => {
      setPromoCodes(promoCodes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeStore]);

  const handleDeletePromoCode = async (promoCodeId: string) => {
    if (!activeStore) return;
    
    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this promo code? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deletePromoCode(promoCodeId);
      // The real-time listener will automatically update the UI
    } catch (error: any) {
      console.error("Error deleting promo code:", error);
      setError("Failed to delete promo code. Please try again.");
    }
  };

  const handleCreatePromoCode = async () => {
    if (!activeStore) return;

    try {
      // Prepare promo code data, omitting empty optional fields
      const newPromoCode: any = {
        code: formData.code,
        vendorId: activeStore.id,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        isActive: formData.isActive,
      };

      // Only add optional fields if they have values
      if (formData.minimumOrderAmount > 0) {
        newPromoCode.minimumOrderAmount = formData.minimumOrderAmount;
      }
      
      if (formData.maxUses > 0) {
        newPromoCode.maxUses = formData.maxUses;
      }
      
      if (formData.expirationDate) {
        newPromoCode.expirationDate = new Date(formData.expirationDate);
      }
      
      if (formData.customerId.trim()) {
        newPromoCode.customerId = formData.customerId.trim();
      }

      if (editingPromoCode) {
        // Update existing promo code
        await updatePromoCode(editingPromoCode.id, newPromoCode);
      } else {
        // Create new promo code
        await createPromoCode(newPromoCode);
      }

      // Reset form
      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: 0,
        minimumOrderAmount: 0,
        maxUses: 0,
        expirationDate: "",
        isActive: true,
        customerId: ""
      });
      setEditingPromoCode(null);
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving promo code:", error);
      setError("Failed to save promo code. Please try again.");
    }
  };

  const handleEditPromoCode = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    setFormData({
      code: promoCode.code,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      minimumOrderAmount: promoCode.minimumOrderAmount || 0,
      maxUses: promoCode.maxUses || 0,
      expirationDate: promoCode.expirationDate ? 
        new Date(promoCode.expirationDate).toISOString().split('T')[0] : "",
      isActive: promoCode.isActive,
      customerId: promoCode.customerId || ""
    });
    setIsDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingPromoCode(null);
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: 0,
      minimumOrderAmount: 0,
      maxUses: 0,
      expirationDate: "",
      isActive: true,
      customerId: ""
    });
    setIsDialogOpen(true);
    setError(null);
  };

  const getStatusBadge = (promoCode: PromoCode) => {
    if (!promoCode.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    if (promoCode.expirationDate && new Date() > promoCode.expirationDate) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return <Badge variant="destructive">Max used</Badge>;
    }
    
    return <Badge>Active</Badge>;
  };

  if (!activeStore) {
    return (
      <VendorLayout title="Promo Codes" description="Manage your promo codes">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-t-green-500 border-l-green-600 border-r-green-600 border-b-green-700 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading store information...</p>
          </div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout title="Promo Codes" description="Create and manage promo codes for your customers">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Promo Codes</h1>
            <p className="text-muted-foreground">
              Create and manage discount codes for your customers
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Create Promo Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingPromoCode ? "Edit Promo Code" : "Create Promo Code"}
                </DialogTitle>
                <p className="text-muted-foreground">
                  Create discount codes to attract more customers and increase sales
                </p>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor="code" className="text-base">Promo Code *</Label>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="e.g. SAVE10, WELCOME20"
                      required
                      className="text-lg py-6"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter a unique code that customers will use at checkout. Use letters, numbers, and underscores only.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="discountType" className="text-base">Discount Type</Label>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Select 
                        value={formData.discountType} 
                        onValueChange={(value: "percentage" | "fixed") => 
                          setFormData({...formData, discountType: value})
                        }
                      >
                        <SelectTrigger className="text-lg py-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage Off</SelectItem>
                          <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose how the discount is calculated.
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="discountValue" className="text-base">Discount Value</Label>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="discountValue"
                        type="number"
                        min="0"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                        placeholder={formData.discountType === "percentage" ? "10" : "1000"}
                        required
                        className="text-lg py-6"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.discountType === "percentage" ? "Enter percentage (e.g., 10 for 10% off)" : "Enter amount in ₦ (e.g., 1000 for ₦1000 off)"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      How this discount works
                    </h3>
                    <p className="text-sm">
                      {explainDiscount(formData.discountType, formData.discountValue)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="minimumOrderAmount" className="text-base">Minimum Order Amount (₦)</Label>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="minimumOrderAmount"
                        type="number"
                        min="0"
                        value={formData.minimumOrderAmount}
                        onChange={(e) => setFormData({...formData, minimumOrderAmount: Number(e.target.value)})}
                        placeholder="0"
                        className="text-lg py-6"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Customers must spend at least this amount to use the promo code. Leave as 0 for no minimum.
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="maxUses" className="text-base">Maximum Uses</Label>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="maxUses"
                        type="number"
                        min="0"
                        value={formData.maxUses}
                        onChange={(e) => setFormData({...formData, maxUses: Number(e.target.value)})}
                        placeholder="Unlimited"
                        className="text-lg py-6"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        How many times this promo code can be used. Leave as 0 for unlimited uses.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor="expirationDate" className="text-base">Expiration Date</Label>
                        <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="expirationDate"
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                      className="text-lg py-6"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      The promo code will no longer work after this date. Leave blank for no expiration.
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor="customerId" className="text-base">Customer ID (Optional)</Label>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="customerId"
                      value={formData.customerId}
                      onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                      placeholder="For specific customer only"
                      className="text-lg py-6"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Restrict this promo code to a specific customer. Leave blank for all customers.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <Label htmlFor="isActive" className="text-base">Active Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle to activate or deactivate this promo code
                      </p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                      className="scale-125"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleCreatePromoCode} 
                    className="flex-1 text-lg py-6"
                    disabled={!formData.code || formData.discountValue <= 0}
                  >
                    {editingPromoCode ? "Update Promo Code" : "Create Promo Code"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="text-lg py-6"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Promo Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 border-4 border-t-green-500 border-l-green-600 border-r-green-600 border-b-green-700 rounded-full animate-spin" />
              </div>
            ) : promoCodes.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                  <Ticket className="h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium mb-1">No promo codes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first promo code to offer discounts to your customers.
                </p>
                <Button onClick={handleOpenDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Promo Code
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Expiration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoCodes.map((promoCode) => (
                      <TableRow key={promoCode.id}>
                        <TableCell className="font-medium">{promoCode.code}</TableCell>
                        <TableCell>
                          {promoCode.discountType === "percentage" 
                            ? `${promoCode.discountValue}%` 
                            : `₦${promoCode.discountValue.toLocaleString()}`}
                        </TableCell>
                        <TableCell>{getStatusBadge(promoCode)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                            {promoCode.usedCount}
                            {promoCode.maxUses && `/${promoCode.maxUses}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            {formatDate(promoCode.expirationDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditPromoCode(promoCode)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeletePromoCode(promoCode.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}