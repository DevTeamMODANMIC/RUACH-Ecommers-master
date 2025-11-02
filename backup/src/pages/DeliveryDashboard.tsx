import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle, 
  Clock, 
  Home,
  ArrowRight,
  Search,
  LogOut,
  Calendar,
  CreditCard,
  RefreshCw,
  Keyboard,
  Plus,
  X
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { useToast } from "../hooks/use-toast";
import { getAllOrdersNoMax, updateOrderStatus } from "../lib/firebase-orders";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostalCode: string;
  deliveryCountry: string;
  itemsCount: number;
  totalAmount: number;
  status: string;
  estimatedDelivery?: Date;
  trackingNumber?: string;
}

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DeliveryOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showEmailManagement, setShowEmailManagement] = useState(false);
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [isAddingEmail, setIsAddingEmail] = useState(false);

  // Mock delivery person data (in a real app, this would come from authentication)
  const deliveryPerson = {
    name: "Patrick Onukwugha",
    id: "DEL-001",
    vehicle: "Van #A-24",
    email: "patrickonukwugha@gmail.com"
  };

  // Load authorized emails from Firebase
  useEffect(() => {
    const loadAuthorizedEmails = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "deliveryAuthorizedEmails"));
        const emails = querySnapshot.docs.map(doc => doc.data().email);
        setAuthorizedEmails(emails);
      } catch (error) {
        console.error("Error loading authorized emails:", error);
      }
    };

    loadAuthorizedEmails();
  }, []);

  // Keyboard shortcut handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in an input field
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Handle keyboard shortcuts
    switch (e.key.toLowerCase()) {
      case "r":
        e.preventDefault();
        handleRefresh();
        break;
      case "l":
        e.preventDefault();
        handleLogout();
        break;
      case "/":
        e.preventDefault();
        const searchInput = document.getElementById("search-input");
        if (searchInput) {
          searchInput.focus();
        }
        break;
      case "1":
        e.preventDefault();
        setStatusFilter("all");
        break;
      case "2":
        e.preventDefault();
        setStatusFilter("pending");
        break;
      case "3":
        e.preventDefault();
        setStatusFilter("processing");
        break;
      case "4":
        e.preventDefault();
        setStatusFilter("shipped");
        break;
      case "5":
        e.preventDefault();
        setStatusFilter("out-for-delivery");
        break;
      case "6":
        e.preventDefault();
        setStatusFilter("delivered");
        break;
      case "7":
        e.preventDefault();
        setStatusFilter("cancelled");
        break;
      case "?":
        e.preventDefault();
        setShowShortcuts(prev => !prev);
        break;
      case "e":
        e.preventDefault();
        setShowEmailManagement(prev => !prev);
        break;
    }
  }, []);

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Fetch all orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would filter orders assigned to this delivery person
        const allOrders = await getAllOrdersNoMax();
        
        // Transform orders to our DeliveryOrder format
        const deliveryOrders: DeliveryOrder[] = allOrders
          .filter(order => {
            // Show orders that are relevant for delivery personnel
            const status = (order.status || '').toLowerCase();
            // Include cancelled orders as well
            return status === "pending" || 
                   status === "processing" || 
                   status === "shipped" || 
                   status === "out-for-delivery" ||
                   status === "cancelled";
          })
          .map(order => {
            // Helper function to safely convert dates
            const safeDate = (date: any): Date | undefined => {
              if (!date) return undefined;
              if (date instanceof Date) return date;
              if (typeof date.toDate === 'function') return date.toDate();
              // Try to parse as date string
              if (typeof date === 'string') {
                const parsedDate = new Date(date);
                return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
              }
              // Try to parse as number (milliseconds since epoch)
              if (typeof date === 'number') {
                return new Date(date);
              }
              return undefined;
            };
            
            return {
              id: order.id,
              orderNumber: order.orderNumber || 'Unknown',
              customerName: `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || 'Unknown Customer',
              customerPhone: order.shippingAddress?.phone || 'No phone',
              deliveryAddress: order.shippingAddress?.address1 || 'No address',
              deliveryCity: order.shippingAddress?.city || 'No city',
              deliveryPostalCode: order.shippingAddress?.postalCode || '',
              deliveryCountry: order.shippingAddress?.country || '',
              itemsCount: order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
              totalAmount: order.total || 0,
              status: order.status || 'unknown',
              estimatedDelivery: safeDate(order.estimatedDelivery),
              trackingNumber: order.trackingNumber
            };
          });
        
        setOrders(deliveryOrders);
        setFilteredOrders(deliveryOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error",
          description: "Failed to load delivery orders. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  // Filter orders based on search term and status filter
  useEffect(() => {
    let result = orders;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(order => 
        order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  const handleMarkAsDelivered = async (orderId: string) => {
    try {
      setDeliveringOrderId(orderId);
      // Update order status to delivered
      await updateOrderStatus(orderId, "delivered");
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: "delivered" } : order
      ));
      
      setFilteredOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: "delivered" } : order
      ));
      
      toast({
        title: "Success",
        description: "Order marked as delivered!",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeliveringOrderId(null);
    }
  };

  const handleMarkAsOutForDelivery = async (orderId: string) => {
    try {
      setDeliveringOrderId(orderId);
      // Update order status to out-for-delivery
      await updateOrderStatus(orderId, "out-for-delivery");
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: "out-for-delivery" } : order
      ));
      
      setFilteredOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: "out-for-delivery" } : order
      ));
      
      toast({
        title: "Success",
        description: "Order marked as out for delivery!",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeliveringOrderId(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
      case "out-for-delivery":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "out-for-delivery":
        return "Out for Delivery";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handleLogout = () => {
    // In a real app, you would clear authentication state
    navigate("/delivery-login");
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would filter orders assigned to this delivery person
      const allOrders = await getAllOrdersNoMax();
      
      // Transform orders to our DeliveryOrder format
      const deliveryOrders: DeliveryOrder[] = allOrders
        .filter(order => {
          // Show orders that are relevant for delivery personnel
          const status = (order.status || '').toLowerCase();
          // Include cancelled orders as well
          return status === "pending" || 
                 status === "processing" || 
                 status === "shipped" || 
                 status === "out-for-delivery" ||
                 status === "cancelled";
        })
        .map(order => {
          // Helper function to safely convert dates
          const safeDate = (date: any): Date | undefined => {
            if (!date) return undefined;
            if (date instanceof Date) return date;
            if (typeof date.toDate === 'function') return date.toDate();
            // Try to parse as date string
            if (typeof date === 'string') {
              const parsedDate = new Date(date);
              return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
            }
            // Try to parse as number (milliseconds since epoch)
            if (typeof date === 'number') {
              return new Date(date);
            }
            return undefined;
          };
          
          return {
            id: order.id,
            orderNumber: order.orderNumber || 'Unknown',
            customerName: `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || 'Unknown Customer',
            customerPhone: order.shippingAddress?.phone || 'No phone',
            deliveryAddress: order.shippingAddress?.address1 || 'No address',
            deliveryCity: order.shippingAddress?.city || 'No city',
            deliveryPostalCode: order.shippingAddress?.postalCode || '',
            deliveryCountry: order.shippingAddress?.country || '',
            itemsCount: order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
            totalAmount: order.total || 0,
            status: order.status || 'unknown',
            estimatedDelivery: safeDate(order.estimatedDelivery),
            trackingNumber: order.trackingNumber
          };
        });
      
      setOrders(deliveryOrders);
      setFilteredOrders(deliveryOrders);
      
      toast({
        title: "Success",
        description: "Orders refreshed successfully!",
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to refresh delivery orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a new authorized email
  const handleAddEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Check if email already exists
    if (authorizedEmails.some(email => email.toLowerCase() === newEmail.toLowerCase())) {
      toast({
        title: "Email Exists",
        description: "This email is already authorized.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingEmail(true);
    try {
      await addDoc(collection(db, "deliveryAuthorizedEmails"), { email: newEmail });
      setAuthorizedEmails(prev => [...prev, newEmail]);
      setNewEmail("");
      toast({
        title: "Email Added",
        description: "Email has been successfully authorized.",
      });
    } catch (error) {
      console.error("Error adding email:", error);
      toast({
        title: "Error",
        description: "Failed to add email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingEmail(false);
    }
  };

  // Remove an authorized email
  const handleRemoveEmail = async (emailToRemove: string) => {
    // Prevent removing the last email
    if (authorizedEmails.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one authorized email must remain.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find the document ID for this email
      const querySnapshot = await getDocs(collection(db, "deliveryAuthorizedEmails"));
      const docToRemove = querySnapshot.docs.find(doc => doc.data().email === emailToRemove);
      
      if (docToRemove) {
        await deleteDoc(doc(db, "deliveryAuthorizedEmails", docToRemove.id));
        setAuthorizedEmails(prev => prev.filter(email => email !== emailToRemove));
        toast({
          title: "Email Removed",
          description: "Email has been successfully removed.",
        });
      }
    } catch (error) {
      console.error("Error removing email:", error);
      toast({
        title: "Error",
        description: "Failed to remove email. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading delivery orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Delivery Dashboard</h1>
                <p className="text-sm text-muted-foreground">RUACH E-STORE Logistics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <div className="hidden md:block">
                <div className="text-sm font-medium">{deliveryPerson.name}</div>
                <div className="text-xs text-muted-foreground">{deliveryPerson.email}</div>
                <div className="text-xs text-muted-foreground">{deliveryPerson.vehicle}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowEmailManagement(!showEmailManagement)}>
                <Plus className="h-4 w-4 mr-2" />
                Emails
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowShortcuts(!showShortcuts)}>
                <Keyboard className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Email Management Panel */}
      {showEmailManagement && (
        <div className="container mx-auto px-4 py-2">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Manage Authorized Emails</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowEmailManagement(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Add New Email</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={isAddingEmail}
                  />
                  <Button 
                    onClick={handleAddEmail} 
                    disabled={isAddingEmail || !newEmail}
                    size="sm"
                  >
                    {isAddingEmail ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Authorized Emails</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {authorizedEmails.map((email, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{email}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveEmail(email)}
                        disabled={authorizedEmails.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      {showShortcuts && (
        <div className="container mx-auto px-4 py-2">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Keyboard Shortcuts</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowShortcuts(false)}>×</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">R</kbd>
                  <span>Refresh orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">L</kbd>
                  <span>Logout</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">E</kbd>
                  <span>Toggle email management</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">/</kbd>
                  <span>Focus search</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">?</kbd>
                  <span>Toggle shortcuts</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">1</kbd>
                  <span>All orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">2</kbd>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">3</kbd>
                  <span>Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">4</kbd>
                  <span>Shipped</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">5</kbd>
                  <span>Out for delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">6</kbd>
                  <span>Delivered</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">7</kbd>
                  <span>Cancelled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">All Orders</p>
                  <p className="text-2xl font-bold">
                    {orders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => (o.status || '').toLowerCase() === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => (o.status || '').toLowerCase() === "processing").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Truck className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Out for Delivery</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => (o.status || '').toLowerCase() === "out-for-delivery").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => (o.status || '').toLowerCase() === "cancelled").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-input"
                    placeholder="Search by order number, customer name, or address..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="out-for-delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Delivery Orders</h2>
            <p className="text-sm text-muted-foreground">
              {filteredOrders.length} orders
            </p>
          </div>

          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No delivery orders found</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? "No orders match your search criteria." 
                    : "There are currently no orders assigned to you for delivery."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">Order #{order.orderNumber.slice(-8)}</h3>
                            <Badge variant="secondary" className={getStatusBadgeVariant(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.estimatedDelivery || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{order.totalAmount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{order.itemsCount} items</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">{order.customerName}</p>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm">
                              {order.deliveryAddress}, {order.deliveryCity}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.deliveryPostalCode}, {order.deliveryCountry}
                            </p>
                          </div>
                        </div>
                      </div>

                      {order.trackingNumber && (
                        <div className="flex items-center gap-2 mb-3">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">
                            <span className="text-muted-foreground">Tracking:</span> {order.trackingNumber}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <Separator className="md:hidden" />
                    <div className="flex flex-col gap-2 md:w-48">
                      {(() => {
                        const status = (order.status || '').toLowerCase();
                        return status === "pending" || status === "processing" || status === "shipped";
                      })() && (
                        <Button 
                          size="sm" 
                          onClick={() => handleMarkAsOutForDelivery(order.id)}
                          disabled={deliveringOrderId === order.id}
                        >
                          {deliveringOrderId === order.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <Truck className="h-4 w-4 mr-2" />
                              {(() => {
                                const status = (order.status || '').toLowerCase();
                                return status === "pending" ? "Prepare for Delivery" : "Out for Delivery";
                              })()}
                            </>
                          )}
                        </Button>
                      )}
                        
                      {(() => {
                        const status = (order.status || '').toLowerCase();
                        return status === "out-for-delivery";
                      })() && (
                        <Button 
                          size="sm" 
                          onClick={() => handleMarkAsDelivered(order.id)}
                          disabled={deliveringOrderId === order.id}
                        >
                          {deliveringOrderId === order.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Delivered
                            </>
                          )}
                        </Button>
                      )}
                        
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                      >
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${order.deliveryAddress}, ${order.deliveryCity}, ${order.deliveryPostalCode}, ${order.deliveryCountry}`
                          )}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          View on Map
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}