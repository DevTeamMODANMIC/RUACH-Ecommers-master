import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { 
  User, Package, Heart, Settings, Bell, Shield, CreditCard, MapPin, 
  Edit, Plus, Home, Building, Briefcase, ShoppingCart, Trash2, 
  ExternalLink, Wallet as WalletIcon, LogOut, CheckCircle, Clock,
  ChevronRight, Eye, EyeOff, AlertCircle, Sparkles, Camera, Mail
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useCurrency } from "@/components/currency-provider"
import { useToast } from "@/hooks/use-toast"
import { useWishlist } from "@/hooks/use-wishlist"
import { useCart } from "@/components/cart-provider"
import { getUserOrders } from "@/lib/firebase-orders"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { formatPrice } = useCurrency()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  
  const [profileData, setProfileData] = useState({
    firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "", gender: "",
  })
  const [addresses, setAddresses] = useState<any[]>([])
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [currentAddress, setCurrentAddress] = useState<any>(null)
  const [addressForm, setAddressForm] = useState({
    id: 0, type: "Home", name: "", address: "", city: "", state: "", 
    postalCode: "", country: "Nigeria", phone: "", isDefault: false,
  })

  const { wishlistItems, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [preferences, setPreferences] = useState({
    emailNotifications: true, smsNotifications: false, marketingEmails: true,
    orderUpdates: true, newsletter: true, language: "en", currency: "NGN",
  })
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  useEffect(() => {
    if (user) {
      const names = user.displayName?.split(" ") || ["", ""]
      setProfileData(prev => ({
        ...prev, firstName: names[0] || "", lastName: names.slice(1).join(" ") || "", email: user.email || "",
      }))
    }
  }, [user])

  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      setOrdersLoading(true)
      try {
        const userOrders = await getUserOrders(user.uid)
        setOrders(userOrders)
      } catch (error) { console.error("Error loading orders:", error) }
      finally { setOrdersLoading(false) }

      try {
        const savedProfile = localStorage.getItem('userProfile')
        if (savedProfile) setProfileData(prev => ({ ...prev, ...JSON.parse(savedProfile) }))
        const savedAddresses = localStorage.getItem('userAddresses')
        if (savedAddresses) setAddresses(JSON.parse(savedAddresses))
        const savedPreferences = localStorage.getItem('userPreferences')
        if (savedPreferences) setPreferences(JSON.parse(savedPreferences))
        const savedTwoFactor = localStorage.getItem('userTwoFactorEnabled')
        if (savedTwoFactor) setTwoFactorEnabled(JSON.parse(savedTwoFactor))
      } catch (error) { console.error("Error loading saved data:", error) }
    }
    loadData()
  }, [user])

  const getProfileCompletion = () => {
    const fields = [profileData.firstName, profileData.lastName, profileData.email, profileData.phone, profileData.dateOfBirth, profileData.gender]
    return Math.round((fields.filter(f => f?.trim()).length / fields.length) * 100)
  }

  const handleSaveProfile = () => {
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      toast({ title: "Validation Error", description: "Name is required", variant: "destructive" })
      return
    }
    try {
      localStorage.setItem('userProfile', JSON.stringify({ ...profileData, updatedAt: new Date().toISOString() }))
      toast({ title: "Profile updated", description: "Your profile has been saved." })
      setIsEditing(false)
    } catch { toast({ title: "Save failed", variant: "destructive" }) }
  }

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    const updated = { ...preferences, [key]: value }
    setPreferences(updated)
    localStorage.setItem('userPreferences', JSON.stringify(updated))
    toast({ title: "Preference saved" })
  }

  const openAddAddressDialog = () => {
    setCurrentAddress(null)
    setAddressForm({
      id: Date.now(), type: "Home", name: `${profileData.firstName} ${profileData.lastName}`.trim(),
      address: "", city: "", state: "", postalCode: "", country: "Nigeria", phone: profileData.phone || "", isDefault: addresses.length === 0,
    })
    setAddressDialogOpen(true)
  }

  const handleSaveAddress = () => {
    if (!addressForm.name || !addressForm.address || !addressForm.city) {
      toast({ title: "Missing information", description: "Please fill required fields.", variant: "destructive" })
      return
    }
    let newAddresses = [...addresses]
    if (addressForm.isDefault) newAddresses = newAddresses.map(a => ({ ...a, isDefault: false }))
    if (currentAddress) newAddresses = newAddresses.map(a => a.id === currentAddress.id ? addressForm : a)
    else newAddresses.push(addressForm)
    setAddresses(newAddresses)
    localStorage.setItem('userAddresses', JSON.stringify(newAddresses))
    setAddressDialogOpen(false)
    toast({ title: "Address saved" })
  }

  const handleDeleteAddress = (id: number) => {
    const updated = addresses.filter(a => a.id !== id)
    if (addresses.find(a => a.id === id)?.isDefault && updated.length > 0) updated[0].isDefault = true
    setAddresses(updated)
    localStorage.setItem('userAddresses', JSON.stringify(updated))
    toast({ title: "Address deleted" })
  }

  const setDefaultAddress = (id: number) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }))
    setAddresses(updated)
    localStorage.setItem('userAddresses', JSON.stringify(updated))
    toast({ title: "Default address updated" })
  }

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" })
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast({ title: "Password too short", description: "Minimum 8 characters", variant: "destructive" })
      return
    }
    toast({ title: "Password changed" })
    setPasswordDialogOpen(false)
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  const handleToggleTwoFactor = () => {
    const newState = !twoFactorEnabled
    setTwoFactorEnabled(newState)
    localStorage.setItem('userTwoFactorEnabled', JSON.stringify(newState))
    toast({ title: newState ? "2FA enabled" : "2FA disabled" })
    setTwoFactorDialogOpen(false)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      delivered: "bg-green-100 text-green-700", processing: "bg-yellow-100 text-yellow-700",
      shipped: "bg-blue-100 text-blue-700", pending: "bg-orange-100 text-orange-700", cancelled: "bg-red-100 text-red-700",
    }
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-700"
  }

  const handleLogout = async () => {
    try { await logout(); navigate('/login') }
    catch { toast({ title: "Logout failed", variant: "destructive" }) }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Please Log In</h1>
            <p className="text-gray-500 mb-6">You need to be logged in to view your profile.</p>
            <Button asChild className="w-full"><Link to="/login">Log In</Link></Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const profileCompletion = getProfileCompletion()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-white/30 shadow-xl">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                    {user.displayName?.split(" ").map(n => n[0]).join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 bg-white text-green-600 rounded-full p-1.5 shadow-lg hover:bg-gray-100">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Welcome, {profileData.firstName || user.displayName?.split(" ")[0] || "User"}!
                </h1>
                <p className="text-green-100 mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4" />{user.email}
                </p>
                <div className="flex items-center gap-2 mt-2 bg-white/20 rounded-full px-3 py-1 text-sm w-fit">
                  <Sparkles className="h-4 w-4" />
                  <span>Member since {new Date(user.metadata?.creationTime || Date.now()).getFullYear()}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <LogOut className="h-4 w-4 mr-2" />Sign Out
            </Button>
          </div>
          {profileCompletion < 100 && (
            <div className="mt-6 bg-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm font-bold">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-2 bg-white/20" />
              <p className="text-xs text-green-100 mt-2">Complete your profile to unlock all features</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white shadow-sm border p-1 rounded-xl flex-wrap h-auto gap-1">
            {[
              { value: "profile", icon: User, label: "Profile" },
              { value: "orders", icon: Package, label: "Orders", count: orders.length },
              { value: "wishlist", icon: Heart, label: "Wishlist", count: wishlistItems.length },
              { value: "addresses", icon: MapPin, label: "Addresses" },
              { value: "security", icon: Shield, label: "Security" },
              { value: "preferences", icon: Settings, label: "Preferences" },
              { value: "wallet", icon: WalletIcon, label: "Wallet" },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}
                className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 rounded-lg px-4 py-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{tab.count}</Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Personal Information</CardTitle>
                  <Button variant={isEditing ? "ghost" : "outline"} size="sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4 mr-2" />{isEditing ? "Cancel" : "Edit"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>First Name</Label>
                      <Input value={profileData.firstName} onChange={e => setProfileData(p => ({ ...p, firstName: e.target.value }))} disabled={!isEditing} />
                    </div>
                    <div><Label>Last Name</Label>
                      <Input value={profileData.lastName} onChange={e => setProfileData(p => ({ ...p, lastName: e.target.value }))} disabled={!isEditing} />
                    </div>
                  </div>
                  <div><Label>Email</Label><Input type="email" value={profileData.email} disabled className="bg-gray-50" /></div>
                  <div><Label>Phone</Label>
                    <Input value={profileData.phone} onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))} disabled={!isEditing} placeholder="+234..." />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Date of Birth</Label>
                      <Input type="date" value={profileData.dateOfBirth} onChange={e => setProfileData(p => ({ ...p, dateOfBirth: e.target.value }))} disabled={!isEditing} />
                    </div>
                    <div><Label>Gender</Label>
                      <Select value={profileData.gender} onValueChange={v => setProfileData(p => ({ ...p, gender: v }))} disabled={!isEditing}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {isEditing && <Button onClick={handleSaveProfile} className="w-full bg-green-600 hover:bg-green-700">Save Changes</Button>}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-xl"><Package className="h-6 w-6 text-green-600" /></div>
                      <div>
                        <p className="text-2xl font-bold text-green-700">{orders.length}</p>
                        <p className="text-sm text-green-600">Total Orders</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-rose-100 rounded-xl"><Heart className="h-6 w-6 text-rose-600" /></div>
                      <div>
                        <p className="text-2xl font-bold text-rose-700">{wishlistItems.length}</p>
                        <p className="text-sm text-rose-600">Wishlist Items</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-xl"><MapPin className="h-6 w-6 text-blue-600" /></div>
                      <div>
                        <p className="text-2xl font-bold text-blue-700">{addresses.length}</p>
                        <p className="text-sm text-blue-600">Saved Addresses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Order History</CardTitle></CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-500">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-4">Start shopping to see your orders here</p>
                    <Button asChild><Link to="/shop">Browse Products</Link></Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 10).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium">Order #{order.id.slice(-8)}</p>
                            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          <span className="font-semibold">{formatPrice(order.total)}</span>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/profile/orders/${order.id}`}><ChevronRight className="h-4 w-4" /></Link>
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
              <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5" />My Wishlist</CardTitle></CardHeader>
              <CardContent>
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-4">Save items you love for later</p>
                    <Button asChild><Link to="/shop">Explore Products</Link></Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {wishlistItems.map(item => (
                      <div key={item.id} className="group border rounded-xl overflow-hidden hover:shadow-lg transition-all">
                        <div className="relative aspect-square bg-gray-100">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFromWishlist(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-sm line-clamp-2 mb-2">{item.name}</h3>
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-green-600">{formatPrice(item.price)}</p>
                            <Button size="sm" onClick={() => {
                              addToCart({ productId: item.id, name: item.name, price: item.price, image: item.image, quantity: 1, options: {} })
                              toast({ title: "Added to cart" })
                            }}><ShoppingCart className="h-4 w-4" /></Button>
                          </div>
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
                <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Saved Addresses</CardTitle>
                <Button onClick={openAddAddressDialog}><Plus className="h-4 w-4 mr-2" />Add Address</Button>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
                    <p className="text-gray-500 mb-4">Add an address for faster checkout</p>
                    <Button onClick={openAddAddressDialog}><Plus className="h-4 w-4 mr-2" />Add Address</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div key={addr.id} className={cn("p-4 rounded-xl border-2 transition-colors", addr.isDefault ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300")}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={addr.type === "Home" ? "default" : "secondary"}>{addr.type}</Badge>
                            {addr.isDefault && <Badge className="bg-green-600">Default</Badge>}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setCurrentAddress(addr); setAddressForm(addr); setAddressDialogOpen(true) }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteAddress(addr.id)} disabled={addr.isDefault}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="font-medium">{addr.name}</p>
                        <p className="text-sm text-gray-600">{addr.address}</p>
                        <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p className="text-sm text-gray-600">{addr.country}</p>
                        {addr.phone && <p className="text-sm text-gray-500 mt-1">{addr.phone}</p>}
                        {!addr.isDefault && (
                          <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-green-600" onClick={() => setDefaultAddress(addr.id)}>
                            Set as default
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Account Security</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg"><Shield className="h-5 w-5 text-green-600" /></div>
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setPasswordDialogOpen(true)}>Change</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", twoFactorEnabled ? "bg-green-100" : "bg-gray-100")}>
                        <Bell className={cn("h-5 w-5", twoFactorEnabled ? "text-green-600" : "text-gray-500")} />
                      </div>
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">{twoFactorEnabled ? "Enabled" : "Not enabled"}</p>
                      </div>
                    </div>
                    <Button variant={twoFactorEnabled ? "destructive" : "default"} onClick={() => setTwoFactorDialogOpen(true)}>
                      {twoFactorEnabled ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Login Activity</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Current Session</p>
                          <p className="text-xs text-gray-500">Windows • Chrome</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: "orderUpdates", label: "Order Updates", desc: "Get notified about order status" },
                    { key: "emailNotifications", label: "Email Notifications", desc: "Receive updates via email" },
                    { key: "smsNotifications", label: "SMS Notifications", desc: "Receive updates via SMS" },
                    { key: "marketingEmails", label: "Marketing Emails", desc: "Promotional offers and deals" },
                    { key: "newsletter", label: "Newsletter", desc: "Weekly newsletter subscription" },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div><p className="font-medium">{item.label}</p><p className="text-sm text-gray-500">{item.desc}</p></div>
                      <Switch checked={preferences[item.key as keyof typeof preferences] as boolean}
                        onCheckedChange={v => handlePreferenceChange(item.key, v)} />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Language & Region</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Language</Label>
                    <Select value={preferences.language} onValueChange={v => handlePreferenceChange("language", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Currency</Label>
                    <Select value={preferences.currency} onValueChange={v => handlePreferenceChange("currency", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><WalletIcon className="h-5 w-5" />My Wallet</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <WalletIcon className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Manage Your Wallet</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">View balance, add funds, and track all your transactions in one place</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild><Link to="/wallet">Go to Wallet</Link></Button>
                    <Button variant="outline" asChild><Link to="/kyc-verification">Verify Identity (KYC)</Link></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{currentAddress ? "Edit Address" : "Add New Address"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Address Type</Label>
              <RadioGroup value={addressForm.type} onValueChange={v => setAddressForm(p => ({ ...p, type: v }))} className="flex gap-4 mt-2">
                {[{ v: "Home", icon: Home }, { v: "Work", icon: Briefcase }, { v: "Other", icon: Building }].map(t => (
                  <div key={t.v} className="flex items-center space-x-2">
                    <RadioGroupItem value={t.v} id={t.v.toLowerCase()} />
                    <Label htmlFor={t.v.toLowerCase()} className="flex items-center gap-1"><t.icon className="h-4 w-4" />{t.v}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div><Label>Full Name *</Label><Input value={addressForm.name} onChange={e => setAddressForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Street Address *</Label><Input value={addressForm.address} onChange={e => setAddressForm(p => ({ ...p, address: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>City *</Label><Input value={addressForm.city} onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))} /></div>
              <div><Label>State</Label><Input value={addressForm.state} onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Postal Code</Label><Input value={addressForm.postalCode} onChange={e => setAddressForm(p => ({ ...p, postalCode: e.target.value }))} /></div>
              <div><Label>Country</Label>
                <Select value={addressForm.country} onValueChange={v => setAddressForm(p => ({ ...p, country: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nigeria">Nigeria</SelectItem>
                    <SelectItem value="Ghana">Ghana</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Phone</Label><Input value={addressForm.phone} onChange={e => setAddressForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="flex items-center space-x-2">
              <Switch checked={addressForm.isDefault} onCheckedChange={v => setAddressForm(p => ({ ...p, isDefault: v }))} />
              <Label>Set as default address</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddressDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAddress}>{currentAddress ? "Update" : "Save"} Address</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Current Password</Label>
              <Input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} />
            </div>
            <div><Label>New Password</Label>
              <Input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} />
            </div>
            <div><Label>Confirm New Password</Label>
              <Input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Dialog */}
      <Dialog open={twoFactorDialogOpen} onOpenChange={setTwoFactorDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Two-Factor Authentication</DialogTitle></DialogHeader>
          <div className="py-6 text-center">
            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", twoFactorEnabled ? "bg-red-100" : "bg-green-100")}>
              <Shield className={cn("h-8 w-8", twoFactorEnabled ? "text-red-600" : "text-green-600")} />
            </div>
            <h3 className="text-lg font-semibold mb-2">{twoFactorEnabled ? "Disable 2FA?" : "Enable 2FA"}</h3>
            <p className="text-sm text-gray-500">
              {twoFactorEnabled ? "This will make your account less secure." : "Add an extra layer of security to your account."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTwoFactorDialogOpen(false)}>Cancel</Button>
            <Button variant={twoFactorEnabled ? "destructive" : "default"} onClick={handleToggleTwoFactor}>
              {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
