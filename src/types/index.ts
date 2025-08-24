export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  displayCategory?: string // Human-readable category name
  origin: string
  inStock: boolean
  images: string[]
  cloudinaryImages?: CloudinaryImage[]
  discount?: number
  rating?: number
  reviews?: Review[]
  options?: ProductOption[]
  featured?: boolean
  bulkPricing?: BulkPricingTier[]
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  shippingClass?: string
  createdAt?: string
  popularity?: number
}

export type Review = {
  id: string
  userId: string
  userName: string
  rating: number
  title: string
  content: string
  date: string
  helpful?: number
  verified?: boolean
}

export type ProductOption = {
  name: string
  values: string[]
}

export type BulkPricingTier = {
  quantity: number
  price: number
}

export type CartItem = {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  options?: Record<string, string>
}

export type UserAddress = {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

export type Order = {
  id: string
  userId: string
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: string
  paymentId?: string
  shippingAddress: UserAddress
  billingAddress: UserAddress
  trackingNumber?: string
  trackingUrl?: string
  notes?: string
  estimatedDelivery?: string | number
  createdAt: string | number | null
  updatedAt: string | number | null
}

export type User = {
  id: string
  email: string
  name?: string
  avatar?: string
  addresses?: UserAddress[]
}

export type Country = {
  code: string
  name: string
  currency: {
    code: string
    symbol: string
    rate: number // Exchange rate relative to base currency (e.g., USD or GBP)
  }
  shipping: {
    available: boolean
    methods: ShippingMethod[]
  }
  vat: number // VAT rate as percentage
}

export type ShippingMethod = {
  id: string
  name: string
  price: number
  estimatedDelivery: string
}

export type CloudinaryImage = {
  publicId: string
  url: string
  alt?: string
  primary?: boolean
}

export type ServiceCategory = 
  | "plumbing"
  | "electrical"
  | "cleaning"
  | "event-planning"
  | "catering"
  | "beauty"
  | "fitness"
  | "tutoring"
  | "photography"
  | "repairs"
  | "landscaping"
  | "other"

export type ServiceProvider = {
  id: string
  ownerId: string
  name: string
  description: string
  category: ServiceCategory
  contactEmail: string
  contactPhone: string
  serviceAreas: string[]
  qualifications?: string[]
  profileImage?: CloudinaryImage
  rating: number
  reviewCount: number
  totalBookings: number
  isApproved?: boolean
  isActive?: boolean
  createdAt?: string | number
  updatedAt?: string | number
}

export type Service = {
  id: string
  providerId: string
  name: string
  description: string
  category: ServiceCategory
  price: number
  duration: number
  availability: {
    days: string[]
    hours: {
      start: string
      end: string
    }
  }
  isActive: boolean
  createdAt: string | number
  updatedAt: string | number
  // Pricing options
  pricingType?: "fixed" | "hourly" | "custom"
  basePrice?: number
  hourlyRate?: number
  // Service details
  serviceAreas?: string[]
  features?: string[]
  requirements?: string[]
  images?: CloudinaryImage[]
  // Booking configuration
  depositRequired?: boolean
  depositAmount?: number
  bookingRequiresApproval?: boolean
}

export type ServiceBooking = {
  id: string
  serviceId: string
  customerId: string
  providerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceDate: string
  serviceTime: string
  agreedPrice: number
  pricingType: "fixed" | "hourly" | "custom"
  duration: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes?: string
  address?: UserAddress
  depositAmount?: number
  paymentStatus?: "pending" | "paid" | "refunded"
  createdAt: string | number
  updatedAt: string | number
  // Additional booking details
  scheduledDate?: string
  scheduledTime?: string
  specialRequirements?: string
  totalAmount?: number
}
