import { lazy, Suspense } from 'react'
import { ComponentType } from 'react'

// Lazy load all page components
const Admin = lazy(() => import('./pages/Admin'))
const AdminCategoryTest = lazy(() => import('./pages/AdminCategory-test'))
const AdminMigration = lazy(() => import('./pages/AdminMigration'))
const AdminOrders = lazy(() => import('./pages/AdminOrders'))
const AdminProducts = lazy(() => import('./pages/AdminProducts'))
const AdminProductsAdd = lazy(() => import('./pages/AdminProductsAdd'))
const AdminProductsCloudinaryMigration = lazy(() => import('./pages/AdminProductsCloudinary-migration'))
const AdminProductsCloudinaryReport = lazy(() => import('./pages/AdminProductsCloudinary-report'))
const EditProduct = lazy(() => import('./pages/admin/EditProduct'))
const AdminProductsImport = lazy(() => import('./pages/AdminProductsImport'))
const AdminServiceProviders = lazy(() => import('./pages/AdminService-providers'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminVendors = lazy(() => import('./pages/AdminVendors'))
const AdminPayouts = lazy(() => import('./pages/AdminPayouts'))
const AdminBulkOrders = lazy(() => import('./pages/admin/AdminBulkOrders'))
const BulkOrder = lazy(() => import('./pages/Bulk-order'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout.tsx'))
const Complaint = lazy(() => import('./pages/Complaint'))
const Contact = lazy(() => import('./pages/Contact'))
const Faq = lazy(() => import('./pages/Faq'))
const ForgotPassword = lazy(() => import('./pages/Forgot-password'))
const Index = lazy(() => import('./pages/Index'))
const Login = lazy(() => import('./pages/Login'))
const MyBookings = lazy(() => import('./pages/MyBookings'))
const OrderConfirmation = lazy(() => import('./pages/Order-confirmation'))
const OrderTrackingDetail = lazy(() => import('./pages/OrderTrackingDetail'))
const PaymentSuccessful = lazy(() => import('./pages/Payment-successful'))
const PrivacyPolicy = lazy(() => import('./pages/Privacy-policy'))
const Products = lazy(() => import('./pages/Products'))
const ProductsParam = lazy(() => import('./pages/ProductsParam'))
const Profile = lazy(() => import('./pages/Profile'))
const OrdersPage = lazy(() => import("./pages/profile/orders/orders"))
const OrderDetailPage = lazy(() => import("./pages/profile/orders/orderDetail"))

const Register = lazy(() => import('./pages/Register'))
const RequestService = lazy(() => import('./pages/Request-service'))
const ReturnsAndRefunds = lazy(() => import('./pages/Returns-and-refunds'))

const ServiceProviderDashboard = lazy(() => import('./service-provider/dashboard/page'))
const ServiceProviderDashboardAnalytics = lazy(() => import('./service-provider/dashboard/analytics/page'))
const ServiceProviderDashboardBookings = lazy(() => import('./service-provider/dashboard/bookings/page'))
const ServiceProviderDashboardReviews = lazy(() => import('./service-provider/dashboard/reviews/page'))
const ServiceProviderDashboardServices = lazy(() => import('./service-provider/dashboard/services/page'))
const ServiceProviderDashboardServicesAdd = lazy(() => import('./service-provider/dashboard/services/add/page'))
const ServiceProviderDashboardServicesView = lazy(() => import('./service-provider/dashboard/services/[id]/page'))
const ServiceProviderDashboardServicesEdit = lazy(() => import('./service-provider/dashboard/services/[id]/edit/page'))
const ServiceProviderDashboardSettings = lazy(() => import('./service-provider/dashboard/settings/page'))
const ServiceProviderDashboardMessages = lazy(() => import('./service-provider/dashboard/messages/page'))
const Services = lazy(() => import('./pages/Services'))
const ServicesBookParam = lazy(() => import('./pages/ServicesBookParam'))
const ServicesBulkOrders = lazy(() => import('./pages/ServicesBulk-orders'))
const ServicesCustomerSupport = lazy(() => import('./pages/ServicesCustomer-support'))
const ServicesDelivery = lazy(() => import('./pages/ServicesDelivery'))
const ServicesMarketplace = lazy(() => import('./pages/ServicesMarketplace'))
const ServicesVendorOnboarding = lazy(() => import('./pages/ServicesVendor-onboarding'))
const ServicesDetail = lazy(() => import('./pages/services/detail/[serviceId]/page'))
const ShippingAndDelivery = lazy(() => import('./pages/Shipping-and-delivery'))
const Shop = lazy(() => import('./pages/Shop'))
const TrackOrder = lazy(() => import('./pages/TrackOrder'))
const Stores = lazy(() => import('./pages/Stores'))
const Terms = lazy(() => import('./pages/Terms'))
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'))
const VendorDashboardAnalytics = lazy(() => import('./pages/VendorDashboardAnalytics'))
const VendorDashboardCustomers = lazy(() => import('./pages/VendorDashboardCustomers'))
const VendorDashboardOrders = lazy(() => import('./pages/VendorDashboardOrders'))
const VendorDashboardProducts = lazy(() => import('./pages/VendorDashboardProducts'))
const VendorDashboardProductsNew = lazy(() => import('./pages/VendorDashboardProductsNew'))
const VendorDashboardProductsParamEdit = lazy(() => import('./pages/VendorDashboardProductsParamEdit'))
const VendorDashboardProfile = lazy(() => import('./pages/VendorDashboardProfile'))
const VendorDashboardReviews = lazy(() => import('./pages/VendorDashboardReviews'))
const VendorDashboardSettings = lazy(() => import('./pages/VendorDashboardSettings'))
const VendorDashboardPayouts = lazy(() => import('./pages/VendorDashboardPayouts'))
const VendorDashboardBulkOrders = lazy(() => import('./pages/VendorDashboardBulkOrders'))
const VendorDashboardKyc = lazy(() => import('./pages/VendorDashboardKyc'))
const VendorDashboardWallet = lazy(() => import('./pages/VendorDashboardWallet'))
const VendorParam = lazy(() => import('./pages/VendorParam'))
const VendorRegister = lazy(() => import('./pages/VendorRegister'))
const VendorStores = lazy(() => import('./pages/VendorStores'))
const WalletPage = lazy(() => import('./pages/Wallet'))
const Wishlist = lazy(() => import('./pages/Wishlist'))

// Import the new Delivery Dashboard components
const DeliveryDashboard = lazy(() => import('./pages/DeliveryDashboard'))
const DeliveryLogin = lazy(() => import('./pages/DeliveryLogin'))
// Import the new Slider Management component
const SliderManagement = lazy(() => import('./pages/admin/SliderManagement.tsx'))
const AdminKyc = lazy(() => import('./pages/admin/AdminKyc'))
const KycVerificationPage = lazy(() => import('./pages/KycVerificationPage'))
const KycTestPage = lazy(() => import('./pages/KycTest'))

// Loading component for suspense fallback
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
)

type RouteDef = {
  path: string
  Component: ComponentType<any>
}

// Wrap components with Suspense
const createLazyComponent = (Component: React.LazyExoticComponent<ComponentType<any>>) => {
  return function LazyComponent(props: any) {
    return (
      <Suspense fallback={<LoadingComponent />}>
        <Component {...props} />
      </Suspense>
    )
  }
}

const routes: RouteDef[] = [
  { path: '/', Component: createLazyComponent(Index) },
  { path: '/admin', Component: createLazyComponent(Admin) },
  { path: '/admin/category-test', Component: createLazyComponent(AdminCategoryTest) },
  { path: '/admin/migration', Component: createLazyComponent(AdminMigration) },
  { path: '/admin/orders', Component: createLazyComponent(AdminOrders) },
  { path: '/admin/products', Component: createLazyComponent(AdminProducts) },
  { path: '/admin/products/add', Component: createLazyComponent(AdminProductsAdd) },
  { path: '/admin/products/cloudinary-migration', Component: createLazyComponent(AdminProductsCloudinaryMigration) },
  { path: '/admin/products/cloudinary-report', Component: createLazyComponent(AdminProductsCloudinaryReport) },
  { path: '/admin/products/edit/:id', Component: createLazyComponent(EditProduct) },
  { path: '/admin/products/import', Component: createLazyComponent(AdminProductsImport) },
  { path: '/admin/service-providers', Component: createLazyComponent(AdminServiceProviders) },
  { path: '/admin/slider-management', Component: createLazyComponent(SliderManagement) },
  { path: '/admin/kyc', Component: createLazyComponent(AdminKyc) },
  { path: '/admin/users', Component: createLazyComponent(AdminUsers) },
  { path: '/admin/vendors', Component: createLazyComponent(AdminVendors) },
  { path: '/admin/payouts', Component: createLazyComponent(AdminPayouts) },
  { path: '/admin/bulk-orders', Component: createLazyComponent(AdminBulkOrders) },
  { path: '/bulk-order', Component: createLazyComponent(BulkOrder) },
  { path: '/cart', Component: createLazyComponent(Cart) },
  { path: '/checkout', Component: createLazyComponent(Checkout) },
  { path: '/complaint', Component: createLazyComponent(Complaint) },
  { path: '/contact', Component: createLazyComponent(Contact) },
  { path: '/faq', Component: createLazyComponent(Faq) },
  { path: '/forgot-password', Component: createLazyComponent(ForgotPassword) },
  { path: '/login', Component: createLazyComponent(Login) },
  { path: '/my-bookings', Component: createLazyComponent(MyBookings) },
  { path: '/order-confirmation', Component: createLazyComponent(OrderConfirmation) },
  { path: '/payment-successful', Component: createLazyComponent(PaymentSuccessful) },
  { path: '/privacy-policy', Component: createLazyComponent(PrivacyPolicy) },
  { path: '/products', Component: createLazyComponent(Products) },
  { path: '/products/:id', Component: createLazyComponent(ProductsParam) },
  { path: '/profile', Component: createLazyComponent(Profile) },
  { path: '/profile/orders', Component: createLazyComponent(OrdersPage) },
  { path: '/profile/orders/:id', Component: createLazyComponent(OrderDetailPage) },

  { path: '/register', Component: createLazyComponent(Register) },
  { path: '/request-service', Component: createLazyComponent(RequestService) },
  { path: '/returns-and-refunds', Component: createLazyComponent(ReturnsAndRefunds) },

  // Service Provider Dashboard Routes
  { path: '/service-provider/dashboard', Component: createLazyComponent(ServiceProviderDashboard) },
  { path: '/service-provider/dashboard/analytics', Component: createLazyComponent(ServiceProviderDashboardAnalytics) },
  { path: '/service-provider/dashboard/bookings', Component: createLazyComponent(ServiceProviderDashboardBookings) },
  { path: '/service-provider/dashboard/reviews', Component: createLazyComponent(ServiceProviderDashboardReviews) },
  { path: '/service-provider/dashboard/services', Component: createLazyComponent(ServiceProviderDashboardServices) },
  { path: '/service-provider/dashboard/services/add', Component: createLazyComponent(ServiceProviderDashboardServicesAdd) },
  { path: '/service-provider/dashboard/services/:id', Component: createLazyComponent(ServiceProviderDashboardServicesView) },
  { path: '/service-provider/dashboard/services/:id/edit', Component: createLazyComponent(ServiceProviderDashboardServicesEdit) },
  { path: '/service-provider/dashboard/settings', Component: createLazyComponent(ServiceProviderDashboardSettings) },
  { path: '/service-provider/dashboard/messages', Component: createLazyComponent(ServiceProviderDashboardMessages) },

  { path: '/services', Component: createLazyComponent(Services) },
  { path: '/services/book/:serviceId', Component: createLazyComponent(ServicesBookParam) },
  { path: '/services/book', Component: createLazyComponent(ServicesBookParam) },
  { path: '/services/bulk-orders', Component: createLazyComponent(ServicesBulkOrders) },
  { path: '/services/customer-support', Component: createLazyComponent(ServicesCustomerSupport) },
  { path: '/services/delivery', Component: createLazyComponent(ServicesDelivery) },
  { path: '/services/marketplace', Component: createLazyComponent(ServicesMarketplace) },
  { path: '/services/detail/:serviceId', Component: createLazyComponent(ServicesDetail) },
  { path: '/services/vendor-onboarding', Component: createLazyComponent(ServicesVendorOnboarding) },
  { path: '/shipping-and-delivery', Component: createLazyComponent(ShippingAndDelivery) },
  { path: '/shop', Component: createLazyComponent(Shop) },
  { path: '/stores', Component: createLazyComponent(Stores) },
  { path: '/terms', Component: createLazyComponent(Terms) },
  { path: '/track-order', Component: createLazyComponent(TrackOrder) },
  { path: '/order-tracking/:id', Component: createLazyComponent(OrderTrackingDetail) },
  { path: '/vendor/register', Component: createLazyComponent(VendorRegister) },
  { path: '/vendor/stores', Component: createLazyComponent(VendorStores) },
  { path: '/vendor/dashboard', Component: createLazyComponent(VendorDashboard) },
  { path: '/vendor/dashboard/analytics', Component: createLazyComponent(VendorDashboardAnalytics) },
  { path: '/vendor/dashboard/customers', Component: createLazyComponent(VendorDashboardCustomers) },
  { path: '/vendor/dashboard/orders', Component: createLazyComponent(VendorDashboardOrders) },
  { path: '/vendor/dashboard/products', Component: createLazyComponent(VendorDashboardProducts) },
  { path: '/vendor/dashboard/products/:id/edit', Component: createLazyComponent(VendorDashboardProductsParamEdit) },
  { path: '/vendor/dashboard/products/new', Component: createLazyComponent(VendorDashboardProductsNew) },
  { path: '/vendor/dashboard/profile', Component: createLazyComponent(VendorDashboardProfile) },
  { path: '/vendor/dashboard/reviews', Component: createLazyComponent(VendorDashboardReviews) },
  { path: '/vendor/dashboard/settings', Component: createLazyComponent(VendorDashboardSettings) },
  { path: '/vendor/dashboard/payouts', Component: createLazyComponent(VendorDashboardPayouts) },
  { path: '/vendor/dashboard/bulk-orders', Component: createLazyComponent(VendorDashboardBulkOrders) },
  { path: '/vendor/dashboard/kyc', Component: createLazyComponent(VendorDashboardKyc) },
  { path: '/vendor/dashboard/wallet', Component: createLazyComponent(VendorDashboardWallet) },
  { path: '/wallet', Component: createLazyComponent(WalletPage) },
  { path: '/vendor/:vendorId', Component: createLazyComponent(VendorParam) },
  { path: '/wishlist', Component: createLazyComponent(Wishlist) },
  
  // Delivery Dashboard Routes
  { path: '/delivery-login', Component: createLazyComponent(DeliveryLogin) },
  { path: '/delivery-dashboard', Component: createLazyComponent(DeliveryDashboard) },
  { path: '/kyc-verification', Component: createLazyComponent(KycVerificationPage) },
  { path: '/kyc-test', Component: createLazyComponent(KycTestPage) },
]

export default routes