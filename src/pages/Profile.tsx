import { useState, useEffect } from "react"

import { Link } from "react-router-dom";
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Badge } from "../components/ui/badge"
import { Separator } from "../components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Switch } from "../components/ui/switch"
import { User, Package, Heart, Settings, Bell, Shield, CreditCard, MapPin, Edit, Plus, Home, Building, Briefcase, ShoppingCart, Trash2, ExternalLink, Wallet as WalletIcon } from "lucide-react"
import { useAuth } from "../components/auth-provider"
import { useCurrency } from "../components/currency-provider"
import { useToast } from "../hooks/use-toast"
import { useLocalStorage } from "../hooks/use-local-storage"
import { useWishlist } from "../hooks/use-wishlist"
import { useCart } from "../components/cart-provider"
import { getUserOrders, listenToUserOrders } from "../lib/firebase-orders"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import AIChatbot from "../components/ai-chatbot"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { formatPrice } = useCurrency()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: user?.displayName?.split(" ")[0] || "",
    lastName: user?.displayName?.split(" ")[1] || "",
    email: user?.email || "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  })
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: "Home",
      name: "John Doe",
      address: "123 Main Street",
      city: "London",
      postalCode: "SW1A 1AA",
      country: "United Kingdom",
      isDefault: true,
    },
  ])

  // Address dialog state
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [currentAddress, setCurrentAddress] = useState<any>(null)
  const [addressForm, setAddressForm] = useState({
    id: 0,
    type: "Home",
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    isDefault: false,
  })

  // Use localStorage for wishlist to maintain consistency with the main wishlist page
  const { wishlistItems, removeFromWishlist } = useWishlist()

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    orderUpdates: true,
    newsletter: true,
    language: "en",
    currency: "GBP",
  })

  // Orders state
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Security features state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false)
  const [paymentMethodsDialogOpen, setPaymentMethodsDialogOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "card",
      last4: "4242",
      brand: "Visa",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
  ])

  // Load orders and profile data on component mount
  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return

      setOrdersLoading(true)
      try {
        const userOrders = await getUserOrders(user.uid)
        setOrders(userOrders)
      } catch (error) {
        console.error("Error loading orders:", error)
        toast({
          title: "Error loading orders",
          description: "There was a problem loading your order history",
          variant: "destructive"
        })
      } finally {
        setOrdersLoading(false)
      }
    }

    // Load saved profile data from localStorage
    const loadProfileData = () => {
      try {
        const savedProfile = localStorage.getItem('userProfile')
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile)
          setProfileData(prev => ({ ...prev, ...parsedProfile }))
        }

        // Load saved addresses
        const savedAddresses = localStorage.getItem('userAddresses')
        if (savedAddresses) {
          setAddresses(JSON.parse(savedAddresses))
        }

        // Load saved preferences
        const savedPreferences = localStorage.getItem('userPreferences')
        if (savedPreferences) {
          setPreferences(JSON.parse(savedPreferences))
        }

        // Load saved payment methods
        const savedPaymentMethods = localStorage.getItem('userPaymentMethods')
        if (savedPaymentMethods) {
          setPaymentMethods(JSON.parse(savedPaymentMethods))
        }

        // Load 2FA setting
        const savedTwoFactor = localStorage.getItem('userTwoFactorEnabled')
        if (savedTwoFactor) {
          setTwoFactorEnabled(JSON.parse(savedTwoFactor))
        }
      } catch (error) {
        console.error("Error loading saved data:", error)
      }
    }

    loadOrders()
    loadProfileData()
  }, [user, toast])

  // Order history - now using real data from Firebase
  const orderHistory = orders.map(order => ({
    id: order.id,
    date: order.createdAt,
    status: order.status,
    total: order.total,
    items: order.items.length,
  }))

  const { addToCart } = useCart()

  const handleSaveProfile = () => {
    const errors = []

    // Validate first name
    if (!profileData.firstName.trim()) {
      errors.push("First name is required")
    } else if (profileData.firstName.trim().length < 2) {
      errors.push("First name must be at least 2 characters long")
    } else if (!/^[a-zA-Z\s'-]+$/.test(profileData.firstName.trim())) {
      errors.push("First name can only contain letters, spaces, hyphens, and apostrophes")
    }

    // Validate last name
    if (!profileData.lastName.trim()) {
      errors.push("Last name is required")
    } else if (profileData.lastName.trim().length < 2) {
      errors.push("Last name must be at least 2 characters long")
    } else if (!/^[a-zA-Z\s'-]+$/.test(profileData.lastName.trim())) {
      errors.push("Last name can only contain letters, spaces, hyphens, and apostrophes")
    }

    // Validate email
    if (!profileData.email.trim()) {
      errors.push("Email is required")
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(profileData.email.trim())) {
        errors.push("Please enter a valid email address")
      }
    }

    // Validate phone number if provided
    if (profileData.phone.trim()) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/
      if (!phoneRegex.test(profileData.phone.trim())) {
        errors.push("Please enter a valid phone number")
      }
    }

    // Validate date of birth if provided
    if (profileData.dateOfBirth) {
      const birthDate = new Date(profileData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()

      if (birthDate > today) {
        errors.push("Date of birth cannot be in the future")
      } else if (age < 13) {
        errors.push("You must be at least 13 years old")
      } else if (age > 150) {
        errors.push("Please enter a valid date of birth")
      }
    }

    // Validate gender if provided
    if (profileData.gender && !['male', 'female', 'other', 'prefer-not-to-say'].includes(profileData.gender)) {
      errors.push("Please select a valid gender option")
    }

    // If there are validation errors, show them
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0], // Show first error
        variant: "destructive"
      })
      return
    }

    try {
      // Save to localStorage for persistence
      const profileToSave = {
        ...profileData,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem('userProfile', JSON.stringify(profileToSave))

      // Update the user display name if it changed
      if (user && `${profileData.firstName} ${profileData.lastName}` !== user.displayName) {
        // In a real app, you'd update this in your backend/Firebase
        console.log('Would update user display name:', `${profileData.firstName} ${profileData.lastName}`)
      }

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Save failed",
        description: "There was an error saving your profile. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    const updatedPreferences = { ...preferences, [key]: value }
    setPreferences(updatedPreferences)

    // Save to localStorage
    try {
      localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences))
    } catch (error) {
      console.error("Error saving preferences:", error)
    }

    toast({
      title: "Preference updated",
      description: "Your preference has been saved.",
    })
  }

  const handleAddressChange = (key: string, value: any) => {
    setAddressForm((prev) => ({ ...prev, [key]: value }))
  }

  const openAddAddressDialog = () => {
    setCurrentAddress(null)
    setAddressForm({
      id: Date.now(), // Generate a temporary ID
      type: "Home",
      name: `${profileData.firstName} ${profileData.lastName}`.trim() || "John Doe",
      address: "",
      city: "",
      postalCode: "",
      country: "United Kingdom",
      isDefault: addresses.length === 0, // Make default if it's the first address
    })
    setAddressDialogOpen(true)
  }

  const openEditAddressDialog = (address: any) => {
    setCurrentAddress(address)
    setAddressForm({
      ...address
    })
    setAddressDialogOpen(true)
  }

  const handleDeleteAddress = (id: number) => {
    const updatedAddresses = addresses.filter(address => address.id !== id)
    
    // If we deleted the default address and have other addresses, make another one default
    if (addresses.find(a => a.id === id)?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true
    }
    
    setAddresses(updatedAddresses)

    // Save to localStorage
    try {
      localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses))
    } catch (error) {
      console.error("Error saving addresses:", error)
    }

    toast({
      title: "Address deleted",
      description: "The address has been removed from your account.",
    })
  }

  const handleSaveAddress = () => {
    // Validate form data
    if (!addressForm.name || !addressForm.address || !addressForm.city || !addressForm.postalCode || !addressForm.country) {
      toast({
        title: "Missing information",
        description: "Please in all required fields.",
        variant: "destructive"
      })
      return
    }

    // If this is an update
    if (currentAddress) {
      setAddresses(addresses.map(address => 
        address.id === currentAddress.id ? addressForm : address
      ))
      toast({
        title: "Address updated",
        description: "Your address has been updated successfully."
      })
    } else {
      // If setting as default, update other addresses
      let newAddresses = [...addresses]
      if (addressForm.isDefault) {
        newAddresses = newAddresses.map(addr => ({ ...addr, isDefault: false }))
      }
      newAddresses.push(addressForm)
      setAddresses(newAddresses)
    }

    // Save to localStorage
    try {
      localStorage.setItem('userAddresses', JSON.stringify(addresses))
    } catch (error) {
      console.error("Error saving addresses:", error)
    }

    setAddressDialogOpen(false)
    toast({
      title: "Address saved",
      description: "Your address has been saved successfully.",
    })
  }

  const setStatusAsDefault = (id: number) => {
    setAddresses(addresses.map(address => ({
      ...address,
      isDefault: address.id === id
    })))
    toast({
      title: "Default address updated",
      description: "Your default address has been changed."
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Security feature handlers
  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }))
  }

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation password do not match",
        variant: "destructive"
      })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      })
      return
    }

    // In a real app, you'd call an API to change the password
    toast({
      title: "Password changed",
      description: "Your password has been updated successfully",
    })

    setPasswordDialogOpen(false)
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const handleToggleTwoFactor = () => {
    const newTwoFactorState = !twoFactorEnabled
    setTwoFactorEnabled(newTwoFactorState)

    // Save to localStorage
    try {
      localStorage.setItem('userTwoFactorEnabled', JSON.stringify(newTwoFactorState))
    } catch (error) {
      console.error("Error saving 2FA setting:", error)
    }

    toast({
      title: newTwoFactorState ? "2FA enabled" : "2FA disabled",
      description: newTwoFactorState
        ? "Two-factor authentication has been enabled. Check your email for setup instructions."
        : "Two-factor authentication has been disabled for your account.",
    })
    setTwoFactorDialogOpen(false)
  }

  const handleSetDefaultPaymentMethod = (id: number) => {
    const updatedMethods = paymentMethods.map(method => ({ ...method, isDefault: method.id === id }))
    setPaymentMethods(updatedMethods)

    // Save to localStorage
    try {
      localStorage.setItem('userPaymentMethods', JSON.stringify(updatedMethods))
    } catch (error) {
      console.error("Error saving payment methods:", error)
    }

    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been changed",
    })
  }

  const handleDeletePaymentMethod = (id: number) => {
    const methodToDelete = paymentMethods.find(m => m.id === id)
    let updatedMethods = paymentMethods

    if (methodToDelete?.isDefault && paymentMethods.length > 1) {
      // Set another method as default
      updatedMethods = paymentMethods.map((method, index) =>
        method.id === id ? { ...method, isDefault: false } : { ...method, isDefault: index === 0 }
      )
    }

    const finalMethods = updatedMethods.filter(method => method.id !== id)
    setPaymentMethods(finalMethods)

    // Save to localStorage
    try {
      localStorage.setItem('userPaymentMethods', JSON.stringify(finalMethods))
    } catch (error) {
      console.error("Error saving payment methods:", error)
    }

    toast({
      title: "Payment method removed",
      description: "The payment method has been removed from your account",
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Please log in</h1>
            <p className="text-muted-foreground mb-8">You need to be logged in to view your profile.</p>
            <Button asChild>
              <a href="/login">Log In</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My Account</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="text-lg">
                {user.displayName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user.displayName?.split(" ")[0]}!</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout}>
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <WalletIcon className="h-4 w-4" />
              Wallet
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={profileData.gender}
                        onValueChange={(value) => setProfileData((prev) => ({ ...prev, gender: value }))}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {isEditing && (
                    <Button onClick={handleSaveProfile} className="w-full">
                      Save Changes
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Password</div>
                        <div className="text-sm text-muted-foreground">Last updated 3 months ago</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setPasswordDialogOpen(true)}>
                      Change
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-muted-foreground">
                          {twoFactorEnabled ? "Enabled" : "Not enabled"}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setTwoFactorDialogOpen(true)}>
                      {twoFactorEnabled ? "Disable" : "Enable"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Payment Methods</div>
                        <div className="text-sm text-muted-foreground">{paymentMethods.length} card{paymentMethods.length !== 1 ? 's' : ''} on file</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setPaymentMethodsDialogOpen(true)}>
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
                    <h3 className="text-lg font-semibold mb-2">Loading your orders...</h3>
                    <p className="text-muted-foreground">
                      Please wait while we fetch your order history.
                    </p>
                  </div>
                ) : orderHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-4">
                      When you place an order, it will appear here for you to track.
                    </p>
                    <Button asChild>
                      <a href="/shop">Start Shopping</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderHistory.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="font-medium">{order.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleDateString()} • {order.items} items
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/order/${order.id}`}>
                              View Details
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle>Wishlist</CardTitle>
              </CardHeader>
              <CardContent>
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                    <p className="text-muted-foreground mb-4">
                      Save items to your wishlist to easily find them later.
                    </p>
                    <Button asChild>
                      <a href="/shop">Start Shopping</a>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                      <div key={item.id} className="border rounded-lg overflow-hidden">
                        <div className="relative">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-48 object-cover"
                          />
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="absolute top-2 right-2"
                            onClick={() => removeFromWishlist(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium mb-1">{item.name}</h3>
                          <p className="text-lg font-bold text-primary">{formatPrice(item.price)}</p>
                          <Button 
                            className="w-full mt-2"
                            onClick={() => {
                              addToCart({
                                productId: item.id,
                                name: item.name,
                                price: item.price,
                                image: item.image,
                                quantity: 1,
                                options: {} // Add empty options object to satisfy CartItem interface
                              })
                              toast({
                                title: "Added to cart",
                                description: `${item.name} has been added to your cart`,
                              })
                            }}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Addresses</CardTitle>
                <Button onClick={openAddAddressDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
                    <p className="text-muted-foreground mb-4">
                      Add an address to make checkout faster.
                    </p>
                    <Button onClick={openAddAddressDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={address.type === "Home" ? "default" : address.type === "Work" ? "secondary" : "outline"}>
                                {address.type}
                              </Badge>
                              {address.isDefault && (
                                <Badge variant="outline">Default</Badge>
                              )}
                            </div>
                            <h3 className="font-medium">{address.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {address.address}, {address.city}, {address.postalCode}, {address.country}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!address.isDefault && (
                              <Button variant="outline" size="sm" onClick={() => setStatusAsDefault(address.id)}>
                                Set as Default
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => openEditAddressDialog(address)}>
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteAddress(address.id)}
                              disabled={address.isDefault}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Dialog */}
            <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{currentAddress ? "Edit Address" : "Add Address"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="addressType">Address Type</Label>
                    <RadioGroup 
                      value={addressForm.type} 
                      onValueChange={(value) => handleAddressChange("type", value)}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Home" id="home" />
                        <Label htmlFor="home" className="flex items-center">
                          <Home className="h-4 w-4 mr-2" />
                          Home
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Work" id="work" />
                        <Label htmlFor="work" className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          Work
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Other" id="other" />
                        <Label htmlFor="other" className="flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Other
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name"
                      value={addressForm.name}
                      onChange={(e) => handleAddressChange("name", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input 
                      id="address"
                      value={addressForm.address}
                      onChange={(e) => handleAddressChange("address", e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city"
                        value={addressForm.city}
                        onChange={(e) => handleAddressChange("city", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input 
                        id="postalCode"
                        value={addressForm.postalCode}
                        onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select 
                      value={addressForm.country}
                      onValueChange={(value) => handleAddressChange("country", value)}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="Nigeria">Nigeria</SelectItem>
                        <SelectItem value="Ghana">Ghana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="isDefault"
                      checked={addressForm.isDefault}
                      onCheckedChange={(checked) => handleAddressChange("isDefault", checked)}
                      disabled={currentAddress?.isDefault} // Can't uncheck if it's already the default
                    />
                    <Label htmlFor="isDefault">Set as default address</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddressDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveAddress}>
                    {currentAddress ? "Update Address" : "Save Address"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Password Change Dialog */}
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleChangePassword}>
                    Change Password
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Two-Factor Authentication Dialog */}
            <Dialog open={twoFactorDialogOpen} onOpenChange={setTwoFactorDialogOpen}>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Two-Factor Authentication</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="text-center">
                    <Bell className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {twoFactorEnabled
                        ? "Two-factor authentication will be disabled for your account."
                        : "Add an extra layer of security to your account by enabling two-factor authentication."
                      }
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setTwoFactorDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleToggleTwoFactor}>
                    {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Payment Methods Dialog */}
            <Dialog open={paymentMethodsDialogOpen} onOpenChange={setPaymentMethodsDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Payment Methods</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No payment methods</h3>
                      <p className="text-muted-foreground mb-4">
                        Add a payment method to make checkout faster.
                      </p>
                      <Button>Add Payment Method</Button>
                    </div>
                  ) : (
                    paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {method.brand} ending in {method.last4}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Expires {method.expiryMonth}/{method.expiryYear}
                              {method.isDefault && " • Default"}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!method.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefaultPaymentMethod(method.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePaymentMethod(method.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  <Button className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Payment Method
                  </Button>
                </div>
                <DialogFooter>
                  <Button onClick={() => setPaymentMethodsDialogOpen(false)}>
                    Done
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WalletIcon className="h-5 w-5" />
                  My Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <WalletIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Manage Your Wallet</h3>
                  <p className="text-muted-foreground mb-4">
                    View your wallet balance, add funds, and track transactions.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild>
                      <Link to="/wallet">Go to Wallet</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/kyc-verification">Verify Identity (KYC)</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive notifications via email</div>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">SMS Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive notifications via SMS</div>
                    </div>
                    <Switch
                      checked={preferences.smsNotifications}
                      onCheckedChange={(checked) => handlePreferenceChange("smsNotifications", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Order Updates</div>
                      <div className="text-sm text-muted-foreground">Get notified about order status changes</div>
                    </div>
                    <Switch
                      checked={preferences.orderUpdates}
                      onCheckedChange={(checked) => handlePreferenceChange("orderUpdates", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Marketing Emails</div>
                      <div className="text-sm text-muted-foreground">Receive promotional offers and updates</div>
                    </div>
                    <Switch
                      checked={preferences.marketingEmails}
                      onCheckedChange={(checked) => handlePreferenceChange("marketingEmails", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Newsletter</div>
                      <div className="text-sm text-muted-foreground">Subscribe to our weekly newsletter</div>
                    </div>
                    <Switch
                      checked={preferences.newsletter}
                      onCheckedChange={(checked) => handlePreferenceChange("newsletter", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Language & Region</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) => handlePreferenceChange("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={preferences.currency}
                      onValueChange={(value) => handlePreferenceChange("currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Download My Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}