import Admin from './pages/Admin'
import AdminCategoryTest from './pages/AdminCategory-test'
import AdminMigration from './pages/AdminMigration'
import AdminOrders from './pages/AdminOrders'
import AdminProducts from './pages/AdminProducts'
import AdminProductsAdd from './pages/AdminProductsAdd'
import AdminProductsCloudinaryMigration from './pages/AdminProductsCloudinary-migration'
import AdminProductsCloudinaryReport from './pages/AdminProductsCloudinary-report'
import EditProduct from './pages/admin/EditProduct'
import AdminProductsImport from './pages/AdminProductsImport'
import AdminServiceProviders from './pages/AdminService-providers'
import AdminUsers from './pages/admin/AdminUsers'
import AdminVendors from './pages/AdminVendors'
import AdminPayouts from './pages/AdminPayouts'
import AdminBulkOrders from './pages/admin/AdminBulkOrders'
import BulkOrder from './pages/Bulk-order'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout.tsx'
import Complaint from './pages/Complaint'
import Contact from './pages/Contact'
import Faq from './pages/Faq'
import ForgotPassword from './pages/Forgot-password'
import Index from './pages/Index'
import Login from './pages/Login'
import MyBookings from './pages/MyBookings'
import OrderConfirmation from './pages/Order-confirmation'
import OrderTrackingDetail from './pages/OrderTrackingDetail'
import PaymentSuccessful from './pages/Payment-successful'
import PrivacyPolicy from './pages/Privacy-policy'
import Products from './pages/Products'
import ProductsParam from './pages/ProductsParam'
import Profile from './pages/Profile'
// import ProfileOrders from './pages/ProfileOrders'
import OrdersPage from "./pages/profile/orders/orders"
// import ProfileOrdersParam from './pages/ProfileOrdersParam'
import OrderDetailPage from "./pages/profile/orders/orderDetail"
// import GuestOrderTracking from './pages/OrderTrackingDetail.tsx'

import Register from './pages/Register'
import RequestService from './pages/Request-service'
import ReturnsAndRefunds from './pages/Returns-and-refunds'

import ServiceProviderDashboard from './service-provider/dashboard/page'
import ServiceProviderDashboardAnalytics from './service-provider/dashboard/analytics/page'
import ServiceProviderDashboardBookings from './service-provider/dashboard/bookings/page'
import ServiceProviderDashboardReviews from './service-provider/dashboard/reviews/page'
import ServiceProviderDashboardServices from './service-provider/dashboard/services/page'
import ServiceProviderDashboardServicesAdd from './service-provider/dashboard/services/add/page'
import ServiceProviderDashboardServicesView from './service-provider/dashboard/services/[id]/page'
import ServiceProviderDashboardServicesEdit from './service-provider/dashboard/services/[id]/edit/page'
import ServiceProviderDashboardSettings from './service-provider/dashboard/settings/page'
import Services from './pages/Services'
import ServicesBookParam from './pages/ServicesBookParam'
import ServicesBulkOrders from './pages/ServicesBulk-orders'
import ServicesCustomerSupport from './pages/ServicesCustomer-support'
import ServicesDelivery from './pages/ServicesDelivery'
import ServicesMarketplace from './pages/ServicesMarketplace'
import ServicesVendorOnboarding from './pages/ServicesVendor-onboarding'
import ServicesDetail from './pages/services/detail/[serviceId]/page'
import ShippingAndDelivery from './pages/Shipping-and-delivery'
import Shop from './pages/Shop'
import TrackOrder from './pages/TrackOrder'
import Stores from './pages/Stores'
import Terms from './pages/Terms'
import VendorDashboard from './pages/VendorDashboard'
import VendorDashboardAnalytics from './pages/VendorDashboardAnalytics'
import VendorDashboardCustomers from './pages/VendorDashboardCustomers'
import VendorDashboardOrders from './pages/VendorDashboardOrders'
import VendorDashboardProducts from './pages/VendorDashboardProducts'
import VendorDashboardProductsNew from './pages/VendorDashboardProductsNew'
import VendorDashboardProductsParamEdit from './pages/VendorDashboardProductsParamEdit'
import VendorDashboardProfile from './pages/VendorDashboardProfile'
import VendorDashboardReviews from './pages/VendorDashboardReviews'
import VendorDashboardSettings from './pages/VendorDashboardSettings'
import VendorDashboardPayouts from './pages/VendorDashboardPayouts'
import VendorDashboardBulkOrders from './pages/VendorDashboardBulkOrders'
import VendorDashboardKyc from './pages/VendorDashboardKyc'
import VendorDashboardWallet from './pages/VendorDashboardWallet'
import VendorParam from './pages/VendorParam'
import VendorRegister from './pages/VendorRegister'
import VendorStores from './pages/VendorStores'
import Wishlist from './pages/Wishlist'
// import GuestOrderTracking from './pages/OrderTrackingDetail'

// Import the new Delivery Dashboard components
import DeliveryDashboard from './pages/DeliveryDashboard'
import DeliveryLogin from './pages/DeliveryLogin'
// Import the new Slider Management component
import SliderManagement from './pages/admin/SliderManagement.tsx'
import AdminKyc from './pages/admin/AdminKyc'
import KycTestPage from './pages/KycTest'

type RouteDef = {
  path: string
  Component: React.ComponentType<any>
}

const routes: RouteDef[] = [
  { path: '/', Component: Index },
  { path: '/admin', Component: Admin },
  { path: '/admin/category-test', Component: AdminCategoryTest },
  { path: '/admin/migration', Component: AdminMigration },
  { path: '/admin/orders', Component: AdminOrders },
  { path: '/admin/products', Component: AdminProducts },
  { path: '/admin/products/add', Component: AdminProductsAdd },
  { path: '/admin/products/cloudinary-migration', Component: AdminProductsCloudinaryMigration },
  { path: '/admin/products/cloudinary-report', Component: AdminProductsCloudinaryReport },
  { path: '/admin/products/edit/:id', Component: EditProduct },
  { path: '/admin/products/import', Component: AdminProductsImport },
  { path: '/admin/service-providers', Component: AdminServiceProviders },
  { path: '/admin/slider-management', Component: SliderManagement },
  { path: '/admin/kyc', Component: AdminKyc },
  { path: '/admin/users', Component: AdminUsers },
  { path: '/admin/vendors', Component: AdminVendors },
  { path: '/admin/payouts', Component: AdminPayouts },
  { path: '/admin/bulk-orders', Component: AdminBulkOrders },
  { path: '/bulk-order', Component: BulkOrder },
  { path: '/cart', Component: Cart },
  { path: '/checkout', Component: Checkout },
  { path: '/complaint', Component: Complaint },
  { path: '/contact', Component: Contact },
  { path: '/faq', Component: Faq },
  { path: '/forgot-password', Component: ForgotPassword },
  { path: '/login', Component: Login },
  { path: '/my-bookings', Component: MyBookings },
  { path: '/order-confirmation', Component: OrderConfirmation },
  { path: '/payment-successful', Component: PaymentSuccessful },
  { path: '/privacy-policy', Component: PrivacyPolicy },
  { path: '/products', Component: Products },
  { path: '/products/:id', Component: ProductsParam },
  { path: '/profile', Component: Profile },
  { path: '/profile/orders', Component: OrdersPage },
  { path: '/profile/orders/:id', Component: OrderDetailPage },

  { path: '/register', Component: Register },
  { path: '/request-service', Component: RequestService },
  { path: '/returns-and-refunds', Component: ReturnsAndRefunds },

  // Service Provider Dashboard Routes
  { path: '/service-provider/dashboard', Component: ServiceProviderDashboard },
  { path: '/service-provider/dashboard/analytics', Component: ServiceProviderDashboardAnalytics },
  { path: '/service-provider/dashboard/bookings', Component: ServiceProviderDashboardBookings },
  { path: '/service-provider/dashboard/reviews', Component: ServiceProviderDashboardReviews },
  { path: '/service-provider/dashboard/services', Component: ServiceProviderDashboardServices },
  { path: '/service-provider/dashboard/services/add', Component: ServiceProviderDashboardServicesAdd },
  { path: '/service-provider/dashboard/services/:id', Component: ServiceProviderDashboardServicesView },
  { path: '/service-provider/dashboard/services/:id/edit', Component: ServiceProviderDashboardServicesEdit },
  { path: '/service-provider/dashboard/settings', Component: ServiceProviderDashboardSettings },

  { path: '/services', Component: Services },
  { path: '/services/book/:serviceId', Component: ServicesBookParam },
  { path: '/services/bulk-orders', Component: ServicesBulkOrders },
  { path: '/services/customer-support', Component: ServicesCustomerSupport },
  { path: '/services/delivery', Component: ServicesDelivery },
  { path: '/services/marketplace', Component: ServicesMarketplace },
  { path: '/services/detail/:serviceId', Component: ServicesDetail },
  { path: '/services/vendor-onboarding', Component: ServicesVendorOnboarding },
  { path: '/shipping-and-delivery', Component: ShippingAndDelivery },
  { path: '/shop', Component: Shop },
  { path: '/stores', Component: Stores },
  { path: '/terms', Component: Terms },
  { path: '/track-order', Component: TrackOrder },
  { path: '/order-tracking/:id', Component: OrderTrackingDetail },
  { path: '/vendor/register', Component: VendorRegister },
  { path: '/vendor/stores', Component: VendorStores },
  { path: '/vendor/dashboard', Component: VendorDashboard },
  { path: '/vendor/dashboard/analytics', Component: VendorDashboardAnalytics },
  { path: '/vendor/dashboard/customers', Component: VendorDashboardCustomers },
  { path: '/vendor/dashboard/orders', Component: VendorDashboardOrders },
  { path: '/vendor/dashboard/products', Component: VendorDashboardProducts },
  { path: '/vendor/dashboard/products/:id/edit', Component: VendorDashboardProductsParamEdit },
  { path: '/vendor/dashboard/products/new', Component: VendorDashboardProductsNew },
  { path: '/vendor/dashboard/profile', Component: VendorDashboardProfile },
  { path: '/vendor/dashboard/reviews', Component: VendorDashboardReviews },
  { path: '/vendor/dashboard/settings', Component: VendorDashboardSettings },
  { path: '/vendor/dashboard/payouts', Component: VendorDashboardPayouts },
  { path: '/vendor/dashboard/bulk-orders', Component: VendorDashboardBulkOrders },
  { path: '/vendor/dashboard/kyc', Component: VendorDashboardKyc },
  { path: '/vendor/dashboard/wallet', Component: VendorDashboardWallet },
  { path: '/vendor/:vendorId', Component: VendorParam },
  { path: '/wishlist', Component: Wishlist },
  
  // Delivery Dashboard Routes
  { path: '/delivery-login', Component: DeliveryLogin },
  { path: '/delivery-dashboard', Component: DeliveryDashboard },
  { path: '/kyc-test', Component: KycTestPage },
]

export default routes