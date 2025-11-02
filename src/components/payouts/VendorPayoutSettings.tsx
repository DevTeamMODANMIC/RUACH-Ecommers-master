import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { updateVendorStore } from "@/lib/firebase-vendors"
import { useVendor } from "@/hooks/use-vendor"

interface PayoutSettings {
  bankName: string
  accountNumber: string
  accountName: string
  routingNumber?: string
  swiftCode?: string
  payoutFrequency: "weekly" | "biweekly" | "monthly"
  minimumPayout: number
}

export default function VendorPayoutSettings() {
  const { activeStore, refreshStores } = useVendor()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<PayoutSettings>({
    bankName: "",
    accountNumber: "",
    accountName: "",
    payoutFrequency: "weekly",
    minimumPayout: 5000, // Default minimum payout in NGN
  })

  useEffect(() => {
    if (activeStore?.payoutSettings) {
      setSettings(activeStore.payoutSettings)
    }
  }, [activeStore])

  const handleInputChange = (field: keyof PayoutSettings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!activeStore) return

    setIsSaving(true)
    try {
      // Validate required fields
      if (!settings.bankName || !settings.accountNumber || !settings.accountName) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required bank account information.",
          variant: "destructive",
        })
        return
      }

      // Validate account number (should be digits only)
      if (!/^\d+$/.test(settings.accountNumber)) {
        toast({
          title: "Validation Error",
          description: "Account number should contain digits only.",
          variant: "destructive",
        })
        return
      }

      await updateVendorStore(activeStore.id, {
        payoutSettings: settings
      })

      await refreshStores()
      setIsEditing(false)
      
      toast({
        title: "Success",
        description: "Payout settings updated successfully.",
      })
    } catch (error) {
      console.error("Error updating payout settings:", error)
      toast({
        title: "Error",
        description: "Failed to update payout settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (activeStore?.payoutSettings) {
      setSettings(activeStore.payoutSettings)
    }
    setIsEditing(false)
  }

  if (!activeStore) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No active store selected.</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Payout Settings</span>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Settings
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name *</Label>
            <Input
              id="bankName"
              value={settings.bankName}
              onChange={(e) => handleInputChange("bankName", e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your bank name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name *</Label>
            <Input
              id="accountName"
              value={settings.accountName}
              onChange={(e) => handleInputChange("accountName", e.target.value)}
              disabled={!isEditing}
              placeholder="Enter account holder name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input
              id="accountNumber"
              value={settings.accountNumber}
              onChange={(e) => handleInputChange("accountNumber", e.target.value)}
              disabled={!isEditing}
              placeholder="Enter account number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payoutFrequency">Payout Frequency</Label>
            <Select
              value={settings.payoutFrequency}
              onValueChange={(value: "weekly" | "biweekly" | "monthly") => 
                handleInputChange("payoutFrequency", value)
              }
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="minimumPayout">Minimum Payout (₦)</Label>
            <Input
              id="minimumPayout"
              type="number"
              value={settings.minimumPayout}
              onChange={(e) => handleInputChange("minimumPayout", Number(e.target.value))}
              disabled={!isEditing}
              placeholder="Enter minimum payout amount"
            />
          </div>
        </div>
        
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        )}
        
        {!isEditing && (
          <div className="text-sm text-gray-500 mt-4">
            <p>* Required fields for receiving payouts</p>
            <p className="mt-1">Payouts are processed automatically based on your selected frequency.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}