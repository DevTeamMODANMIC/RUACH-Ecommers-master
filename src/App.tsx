import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from "./components/theme-provider"
import SiteHeader from "./components/site-header"
import Footer from "./components/footer"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./components/auth-provider"
import { CurrencyProvider } from "./components/currency-provider"
import { CartProvider } from "./components/cart-provider"
import { CountryProvider } from "./components/country-provider"
import KeyboardNavigation from "./components/keyboard-navigation"
import KeyboardShortcutsHelp from "./components/keyboard-shortcuts-help"
import { Button } from "./components/ui/button"

// Pages
import HomePage from './pages/HomePage'
import Shop from './pages/shop/page'
import Stores from './pages/stores/page'
import Contact from './pages/contact/page'
import Login from './pages/login/page'
import Register from './pages/register/page'
import VendorRegister from './pages/vendor/register/page'
import BulkOrder from './pages/bulk-order/page'

// User Pages
import Cart from './pages/cart/page'
import Checkout from './pages/checkout/page'
import Wishlist from './pages/wishlist/page'
import Profile from './pages/profile/page'
import ProfileOrders from './pages/profile/orders/page'
import OrderConfirmation from './pages/order-confirmation/page'
import PaymentSuccessful from './pages/payment-successful/page'
import ForgotPassword from './pages/forgot-password/page'

// Product Pages
import Products from './pages/products/page'
import ProductDetail from './pages/products/[id]/page'

// Information Pages
import FAQ from './pages/faq/page'
import Terms from './pages/terms/page'
import PrivacyPolicy from './pages/privacy-policy/page'
import ShippingAndDelivery from './pages/shipping-and-delivery/page'
import ReturnsAndRefunds from './pages/returns-and-refunds/page'
import Complaint from './pages/complaint/page'

// Service Pages
import Services from './pages/services/page'
import RequestService from './pages/request-service/page'

// Vendor Pages
import VendorDashboardRouter from './pages/vendor/dashboard/VendorDashboardRouter'
import VendorStorefront from './pages/vendor/[vendorId]/page'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminUsers from './pages/admin/AdminUsers'
import AdminVendors from './pages/admin/AdminVendors'
import AdminMigration from './pages/admin/AdminMigration'
import AddProduct from './pages/admin/AddProduct'
import EditProduct from './pages/admin/EditProduct'
import ImportProducts from './pages/admin/ImportProducts'
import CloudinaryMigration from './pages/admin/CloudinaryMigration'
import CloudinaryReport from './pages/admin/CloudinaryReport'

function App() {
  return (
    <ThemeProvider>
      <CountryProvider>
        <CurrencyProvider>
          <CartProvider>
            <AuthProvider>
              <div className="min-h-screen bg-white text-gray-800">
                <KeyboardNavigation />
                <SiteHeader />
                <main className="min-h-screen">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/stores" element={<Stores />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/vendor/register" element={<VendorRegister />} />
                    <Route path="/bulk-order" element={<BulkOrder />} />
                    
                    {/* Product Routes */}
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    
                    {/* User Routes */}
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/orders" element={<ProfileOrders />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    <Route path="/payment-successful" element={<PaymentSuccessful />} />
                    
                    {/* Information Routes */}
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/shipping-and-delivery" element={<ShippingAndDelivery />} />
                    <Route path="/returns-and-refunds" element={<ReturnsAndRefunds />} />
                    <Route path="/complaint" element={<Complaint />} />
                    
                    {/* Service Routes */}
                    <Route path="/services" element={<Services />} />
                    <Route path="/request-service" element={<RequestService />} />
                    
                    {/* Vendor Routes */}
                    <Route path="/vendor/dashboard/*" element={<VendorDashboardRouter />} />
                    <Route path="/vendor/:vendorId" element={<VendorStorefront />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/orders" element={<AdminOrders />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/products/add" element={<AddProduct />} />
                    <Route path="/admin/products/edit/:id" element={<EditProduct />} />
                    <Route path="/admin/products/import" element={<ImportProducts />} />
                    <Route path="/admin/products/cloudinary-migration" element={<CloudinaryMigration />} />
                    <Route path="/admin/products/cloudinary-report" element={<CloudinaryReport />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/vendors" element={<AdminVendors />} />
                    <Route path="/admin/migration" element={<AdminMigration />} />
                  </Routes>
                </main>
                <Footer />
                <KeyboardShortcutsHelp />
                <Toaster />
                
                {/* WhatsApp Button */}
                <div className="fixed bottom-4 right-4 z-50 hidden md:block">
                  <Button 
                    asChild 
                    className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10 rounded-full shadow-lg"
                  >
                    <a href="https://wa.me/2348160662997" target="_blank" rel="noopener noreferrer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 inline-block">
                        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                        <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                        <path d="M12 17a5 5 0 0 1-5-5" />
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                  </Button>
                </div>
              </div>
            </AuthProvider>
          </CartProvider>
        </CurrencyProvider>
      </CountryProvider>
    </ThemeProvider>
  )
}

export default App