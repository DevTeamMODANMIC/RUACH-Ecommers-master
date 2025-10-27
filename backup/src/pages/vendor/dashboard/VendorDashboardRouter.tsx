import { Routes, Route } from 'react-router-dom'
import VendorDashboardLayout from './layout'
import VendorDashboardHome from './page'
import VendorAnalytics from './analytics/page'
import VendorBookings from './bookings/page'
import VendorCustomers from './customers/page'
import VendorOrders from './orders/page'
import VendorProducts from './products/page'
import VendorProductEdit from './products/[id]/edit/page'
import VendorProductNew from './products/new/page'
import VendorProfile from './profile/page'
import VendorReviews from './reviews/page'
import VendorServices from './services/page'
import VendorServicesAdd from './services/add/page'
import VendorSettings from './settings/page'
import VendorStores from '../stores/page'

export default function VendorDashboardRouter() {
  return (
    <Routes>
      <Route path="/" element={<VendorDashboardLayout />}>
        <Route index element={<VendorDashboardHome />} />
        <Route path="stores" element={<VendorStores />} />
        <Route path="analytics" element={<VendorAnalytics />} />
        <Route path="bookings" element={<VendorBookings />} />
        <Route path="customers" element={<VendorCustomers />} />
        <Route path="orders" element={<VendorOrders />} />
        <Route path="products" element={<VendorProducts />} />
        <Route path="products/new" element={<VendorProductNew />} />
        <Route path="products/:id/edit" element={<VendorProductEdit />} />
        <Route path="profile" element={<VendorProfile />} />
        <Route path="reviews" element={<VendorReviews />} />
        <Route path="services" element={<VendorServices />} />
        <Route path="services/add" element={<VendorServicesAdd />} />
        <Route path="settings" element={<VendorSettings />} />
      </Route>
    </Routes>
  )
}