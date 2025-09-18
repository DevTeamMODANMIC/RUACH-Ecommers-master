"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Switch } from "../components/ui/switch"
import { Badge } from "../components/ui/badge"
import { 
  User,
  Bell,
  Shield,
  CreditCard,
  Clock,
  Save,
  Camera,
  Trash2,
  Key
} from "lucide-react"
import { useToast } from "../components/ui/use-toast"

export default function ServiceProviderSettingsPage() {
  const [provider, setProvider] = useState({
    id: "",
    name: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    serviceAreas: [],
    businessLicense: "",
    settings: {
      notifications: {
        newBookings: true,
        bookingUpdates: true,
        paymentAlerts: true,
        reviewAlerts: true,
        emailNotifications: true,
        smsNotifications: false
      },
      booking: {
        autoAccept: false,
        advanceNotice: 24,
        maxDailyBookings: 5,
        workingHours: { start: "08:00", end: "18:00" }
      },
      payment: {
        requireDeposit: true,
        depositPercentage: 30,
        acceptCashPayment: true,
        acceptOnlinePayment: true
      }
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const { toast } = useToast()

  // TODO: Load real service provider data from Firebase
  
  const handleSave = async (section: string) => {
    setIsLoading(true)
    // TODO: Save to Firebase
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast({
      title: "Settings saved",
      description: `Your ${section} settings have been updated successfully.`
    })
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "booking", label: "Booking", icon: Clock },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="w-full px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your service provider profile and preferences</p>
        </div>
      </div>

      <div className="w-full px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <tab.icon className="h-4 w-4 mr-3" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                      <p className="text-sm text-gray-600 mt-1">JPG, PNG up to 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Business Name</Label>
                      <Input
                        id="name"
                        value={provider.name}
                        onChange={(e) => setProvider({...provider, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Contact Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={provider.contactEmail}
                        onChange={(e) => setProvider({...provider, contactEmail: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Contact Phone</Label>
                      <Input
                        id="phone"
                        value={provider.contactPhone}
                        onChange={(e) => setProvider({...provider, contactPhone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="license">Business License</Label>
                      <Input
                        id="license"
                        value={provider.businessLicense}
                        onChange={(e) => setProvider({...provider, businessLicense: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      value={provider.description}
                      onChange={(e) => setProvider({...provider, description: e.target.value})}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Service Areas</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {provider.serviceAreas.map((area, index) => (
                        <Badge key={index} variant="secondary">
                          {area}
                          <Button variant="ghost" size="sm" className="ml-2 h-auto p-0">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      <Button variant="outline" size="sm">Add Area</Button>
                    </div>
                  </div>

                  <Button onClick={() => handleSave("profile")} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: "newBookings", label: "New Bookings", description: "Get notified when you receive new booking requests" },
                    { key: "bookingUpdates", label: "Booking Updates", description: "Notifications about booking changes and cancellations" },
                    { key: "paymentAlerts", label: "Payment Alerts", description: "Updates on payments and transactions" },
                    { key: "reviewAlerts", label: "Review Alerts", description: "New customer reviews and ratings" },
                    { key: "emailNotifications", label: "Email Notifications", description: "Receive notifications via email" },
                    { key: "smsNotifications", label: "SMS Notifications", description: "Receive notifications via text message" }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                      <Switch
                        checked={provider.settings.notifications[item.key as keyof typeof provider.settings.notifications]}
                        onCheckedChange={(checked) => 
                          setProvider({
                            ...provider,
                            settings: {
                              ...provider.settings,
                              notifications: {
                                ...provider.settings.notifications,
                                [item.key]: checked
                              }
                            }
                          })
                        }
                      />
                    </div>
                  ))}
                  
                  <Button onClick={() => handleSave("notifications")} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Booking Settings */}
            {activeTab === "booking" && (
              <Card>
                <CardHeader>
                  <CardTitle>Booking Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-Accept Bookings</div>
                      <div className="text-sm text-gray-600">Automatically accept booking requests without manual approval</div>
                    </div>
                    <Switch
                      checked={provider.settings.booking.autoAccept}
                      onCheckedChange={(checked) => 
                        setProvider({
                          ...provider,
                          settings: {
                            ...provider.settings,
                            booking: { ...provider.settings.booking, autoAccept: checked }
                          }
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="advance">Advance Notice (hours)</Label>
                      <Input
                        id="advance"
                        type="number"
                        value={provider.settings.booking.advanceNotice}
                        onChange={(e) => setProvider({
                          ...provider,
                          settings: {
                            ...provider.settings,
                            booking: { ...provider.settings.booking, advanceNotice: parseInt(e.target.value) }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxDaily">Max Daily Bookings</Label>
                      <Input
                        id="maxDaily"
                        type="number"
                        value={provider.settings.booking.maxDailyBookings}
                        onChange={(e) => setProvider({
                          ...provider,
                          settings: {
                            ...provider.settings,
                            booking: { ...provider.settings.booking, maxDailyBookings: parseInt(e.target.value) }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="startTime">Working Hours Start</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={provider.settings.booking.workingHours.start}
                        onChange={(e) => setProvider({
                          ...provider,
                          settings: {
                            ...provider.settings,
                            booking: {
                              ...provider.settings.booking,
                              workingHours: { ...provider.settings.booking.workingHours, start: e.target.value }
                            }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">Working Hours End</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={provider.settings.booking.workingHours.end}
                        onChange={(e) => setProvider({
                          ...provider,
                          settings: {
                            ...provider.settings,
                            booking: {
                              ...provider.settings.booking,
                              workingHours: { ...provider.settings.booking.workingHours, end: e.target.value }
                            }
                          }
                        })}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave("booking")} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Payment Settings */}
            {activeTab === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Require Deposit</div>
                      <div className="text-sm text-gray-600">Require customers to pay a deposit when booking</div>
                    </div>
                    <Switch
                      checked={provider.settings.payment.requireDeposit}
                      onCheckedChange={(checked) => 
                        setProvider({
                          ...provider,
                          settings: {
                            ...provider.settings,
                            payment: { ...provider.settings.payment, requireDeposit: checked }
                          }
                        })
                      }
                    />
                  </div>

                  {provider.settings.payment.requireDeposit && (
                    <div>
                      <Label htmlFor="deposit">Deposit Percentage</Label>
                      <Input
                        id="deposit"
                        type="number"
                        min="10"
                        max="50"
                        value={provider.settings.payment.depositPercentage}
                        onChange={(e) => setProvider({
                          ...provider,
                          settings: {
                            ...provider.settings,
                            payment: { ...provider.settings.payment, depositPercentage: parseInt(e.target.value) }
                          }
                        })}
                      />
                      <p className="text-sm text-gray-600 mt-1">10% to 50% of total service cost</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="font-medium">Accepted Payment Methods</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Cash Payment</div>
                        <div className="text-sm text-gray-600">Accept cash payments on completion</div>
                      </div>
                      <Switch
                        checked={provider.settings.payment.acceptCashPayment}
                        onCheckedChange={(checked) => 
                          setProvider({
                            ...provider,
                            settings: {
                              ...provider.settings,
                              payment: { ...provider.settings.payment, acceptCashPayment: checked }
                            }
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Online Payment</div>
                        <div className="text-sm text-gray-600">Accept online payments via cards and digital wallets</div>
                      </div>
                      <Switch
                        checked={provider.settings.payment.acceptOnlinePayment}
                        onCheckedChange={(checked) => 
                          setProvider({
                            ...provider,
                            settings: {
                              ...provider.settings,
                              payment: { ...provider.settings.payment, acceptOnlinePayment: checked }
                            }
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave("payment")} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Button variant="outline">
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <p className="text-sm text-gray-600 mt-2">Update your account password</p>
                  </div>

                  <div>
                    <div className="font-medium mb-2">Two-Factor Authentication</div>
                    <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>

                  <div>
                    <div className="font-medium mb-2">Active Sessions</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="text-sm font-medium">Current Session</div>
                          <div className="text-xs text-gray-600">Windows • Chrome • Lagos, Nigeria</div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                    <p className="text-sm text-gray-600 mt-2">Permanently delete your service provider account</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}