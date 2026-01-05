import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  addDoc,
  limit,
} from "firebase/firestore"
import { db } from "./firebase"
import { ServiceBooking, BookingStatus } from "../types"

// Create a new booking
export const createBooking = async (
  bookingData: Omit<ServiceBooking, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    console.log("🔍 Firebase: Creating new booking...")
    
    const docRef = await addDoc(collection(db, "bookings"), {
      ...bookingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    console.log("✅ Firebase: Booking created with ID:", docRef.id)
    return docRef.id
  } catch (error: any) {
    console.error("💥 Firebase: Error creating booking:", error)
    throw new Error(`Failed to create booking: ${error.message}`)
  }
}

// Get booking by ID
export const getBooking = async (bookingId: string): Promise<ServiceBooking | null> => {
  try {
    console.log("🔍 Firebase: Fetching booking:", bookingId)
    
    const docRef = doc(db, "bookings", bookingId)
    const snapshot = await getDoc(docRef)
    
    if (!snapshot.exists()) {
      console.log("❌ Firebase: Booking not found:", bookingId)
      return null
    }
    
    const booking = {
      id: snapshot.id,
      ...snapshot.data()
    } as ServiceBooking
    
    console.log("✅ Firebase: Booking found:", booking.customerName)
    return booking
  } catch (error: any) {
    console.error("💥 Firebase: Error fetching booking:", error)
    throw new Error(`Failed to fetch booking: ${error.message}`)
  }
}

// Get bookings for a customer
export const getCustomerBookings = async (customerId: string): Promise<ServiceBooking[]> => {
  try {
    console.log("🔍 Firebase: Fetching bookings for customer:", customerId)
    
    const q = query(
      collection(db, "bookings"),
      where("customerId", "==", customerId),
      orderBy("createdAt", "desc")
    )
    
    const snapshot = await getDocs(q)
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ServiceBooking))
    
    console.log("✅ Firebase: Customer bookings fetched:", bookings.length)
    return bookings
  } catch (error: any) {
    console.error("💥 Firebase: Error fetching customer bookings:", error)
    
    // Fallback without orderBy if index doesn't exist
    try {
      console.log("🔄 Firebase: Trying fallback query...")
      const q = query(
        collection(db, "bookings"),
        where("customerId", "==", customerId)
      )
      
      const snapshot = await getDocs(q)
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceBooking))
      
      // Sort client-side
      bookings.sort((a, b) => {
        const getTimestamp = (timestamp: string | number | null): number => {
          if (!timestamp) return 0
          if (typeof timestamp === 'number') return timestamp
          if (typeof timestamp === 'string') {
            const parsed = new Date(timestamp).getTime()
            return isNaN(parsed) ? 0 : parsed
          }
          if (typeof timestamp === 'object' && 'seconds' in timestamp) {
            return (timestamp as any).seconds * 1000
          }
          return 0
        }
        
        const aTime = getTimestamp(a.createdAt)
        const bTime = getTimestamp(b.createdAt)
        return bTime - aTime
      })
      
      console.log("✅ Firebase: Customer bookings fetched with fallback:", bookings.length)
      return bookings
    } catch (fallbackError: any) {
      console.error("💥 Firebase: Fallback query also failed:", fallbackError)
      throw new Error(`Failed to fetch customer bookings: ${fallbackError.message}`)
    }
  }
}

// Get bookings for a service provider
export const getProviderBookings = async (providerId: string): Promise<ServiceBooking[]> => {
  try {
    console.log("🔍 Firebase: Fetching bookings for provider:", providerId)
    
    const q = query(
      collection(db, "bookings"),
      where("providerId", "==", providerId),
      orderBy("createdAt", "desc")
    )
    
    const snapshot = await getDocs(q)
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ServiceBooking))
    
    console.log("✅ Firebase: Provider bookings fetched:", bookings.length)
    return bookings
  } catch (error: any) {
    console.error("💥 Firebase: Error fetching provider bookings:", error)
    
    // Fallback without orderBy if index doesn't exist
    try {
      console.log("🔄 Firebase: Trying fallback query...")
      const q = query(
        collection(db, "bookings"),
        where("providerId", "==", providerId)
      )
      
      const snapshot = await getDocs(q)
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceBooking))
      
      // Sort client-side
      bookings.sort((a, b) => {
        const getTimestamp = (timestamp: string | number | null): number => {
          if (!timestamp) return 0
          if (typeof timestamp === 'number') return timestamp
          if (typeof timestamp === 'string') {
            const parsed = new Date(timestamp).getTime()
            return isNaN(parsed) ? 0 : parsed
          }
          if (typeof timestamp === 'object' && 'seconds' in timestamp) {
            return (timestamp as any).seconds * 1000
          }
          return 0
        }
        
        const aTime = getTimestamp(a.createdAt)
        const bTime = getTimestamp(b.createdAt)
        return bTime - aTime
      })
      
      console.log("✅ Firebase: Provider bookings fetched with fallback:", bookings.length)
      return bookings
    } catch (fallbackError: any) {
      console.error("💥 Firebase: Fallback query also failed:", fallbackError)
      throw new Error(`Failed to fetch provider bookings: ${fallbackError.message}`)
    }
  }
}

// Update booking status
export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus,
  notes?: string
): Promise<void> => {
  try {
    console.log("🔍 Firebase: Updating booking status:", bookingId, status)
    
    const docRef = doc(db, "bookings", bookingId)
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    }
    
    if (notes) {
      updateData.providerNotes = notes
    }
    
    await updateDoc(docRef, updateData)
    
    console.log("✅ Firebase: Booking status updated successfully")
  } catch (error: any) {
    console.error("💥 Firebase: Error updating booking status:", error)
    throw new Error(`Failed to update booking status: ${error.message}`)
  }
}

// Update payment status
export const updateBookingPayment = async (
  bookingId: string,
  paymentStatus: ServiceBooking['paymentStatus'],
  paymentId?: string
): Promise<void> => {
  try {
    console.log("🔍 Firebase: Updating booking payment:", bookingId, paymentStatus)
    
    const docRef = doc(db, "bookings", bookingId)
    const updateData: any = {
      paymentStatus,
      updatedAt: serverTimestamp(),
    }
    
    if (paymentId) {
      updateData.paymentId = paymentId
    }
    
    await updateDoc(docRef, updateData)
    
    console.log("✅ Firebase: Booking payment updated successfully")
  } catch (error: any) {
    console.error("💥 Firebase: Error updating booking payment:", error)
    throw new Error(`Failed to update booking payment: ${error.message}`)
  }
}

// Add customer review and rating
export const addBookingReview = async (
  bookingId: string,
  rating: number,
  review: string
): Promise<void> => {
  try {
    console.log("🔍 Firebase: Adding booking review:", bookingId)
    
    const docRef = doc(db, "bookings", bookingId)
    await updateDoc(docRef, {
      rating,
      review,
      updatedAt: serverTimestamp(),
    })
    
    console.log("✅ Firebase: Booking review added successfully")
  } catch (error: any) {
    console.error("💥 Firebase: Error adding booking review:", error)
    throw new Error(`Failed to add booking review: ${error.message}`)
  }
}

// Get recent bookings (for dashboard)
export const getRecentBookings = async (limitCount: number = 10): Promise<ServiceBooking[]> => {
  try {
    console.log("🔍 Firebase: Fetching recent bookings...")
    
    const q = query(
      collection(db, "bookings"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    )
    
    const snapshot = await getDocs(q)
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ServiceBooking))
    
    console.log("✅ Firebase: Recent bookings fetched:", bookings.length)
    return bookings
  } catch (error: any) {
    console.error("💥 Firebase: Error fetching recent bookings:", error)
    
    // Fallback without orderBy
    try {
      console.log("🔄 Firebase: Trying fallback query...")
      const q = query(collection(db, "bookings"), limit(limitCount))
      const snapshot = await getDocs(q)
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceBooking))
      
      console.log("✅ Firebase: Recent bookings fetched with fallback:", bookings.length)
      return bookings
    } catch (fallbackError: any) {
      console.error("💥 Firebase: Fallback query also failed:", fallbackError)
      return []
    }
  }
}

// Get bookings by status
export const getBookingsByStatus = async (status: BookingStatus): Promise<ServiceBooking[]> => {
  try {
    console.log("🔍 Firebase: Fetching bookings by status:", status)
    
    const q = query(
      collection(db, "bookings"),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    )
    
    const snapshot = await getDocs(q)
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ServiceBooking))
    
    console.log("✅ Firebase: Bookings by status fetched:", bookings.length)
    return bookings
  } catch (error: any) {
    console.error("💥 Firebase: Error fetching bookings by status:", error)
    
    // Fallback without orderBy
    try {
      console.log("🔄 Firebase: Trying fallback query...")
      const q = query(
        collection(db, "bookings"),
        where("status", "==", status)
      )
      
      const snapshot = await getDocs(q)
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceBooking))
      
      // Sort client-side
      bookings.sort((a, b) => {
        const getTimestamp = (timestamp: string | number | null): number => {
          if (!timestamp) return 0
          if (typeof timestamp === 'number') return timestamp
          if (typeof timestamp === 'string') {
            const parsed = new Date(timestamp).getTime()
            return isNaN(parsed) ? 0 : parsed
          }
          if (typeof timestamp === 'object' && 'seconds' in timestamp) {
            return (timestamp as any).seconds * 1000
          }
          return 0
        }
        
        const aTime = getTimestamp(a.createdAt)
        const bTime = getTimestamp(b.createdAt)
        return bTime - aTime
      })
      
      console.log("✅ Firebase: Bookings by status fetched with fallback:", bookings.length)
      return bookings
    } catch (fallbackError: any) {
      console.error("💥 Firebase: Fallback query also failed:", fallbackError)
      throw new Error(`Failed to fetch bookings by status: ${fallbackError.message}`)
    }
  }
}

// Cancel booking
export const cancelBooking = async (
  bookingId: string,
  reason?: string,
  cancelledBy?: "customer" | "provider"
): Promise<void> => {
  try {
    console.log("🔍 Firebase: Cancelling booking:", bookingId)
    
    const docRef = doc(db, "bookings", bookingId)
    const updateData: any = {
      status: "cancelled" as BookingStatus,
      updatedAt: serverTimestamp(),
    }
    
    if (reason) {
      updateData.customerNotes = reason
    }
    
    if (cancelledBy) {
      updateData.cancelledBy = cancelledBy
    }
    
    await updateDoc(docRef, updateData)
    
    console.log("✅ Firebase: Booking cancelled successfully")
  } catch (error: any) {
    console.error("💥 Firebase: Error cancelling booking:", error)
    throw new Error(`Failed to cancel booking: ${error.message}`)
  }
}

// Get booking statistics
export const getBookingStats = async () => {
  try {
    console.log("📊 Firebase: Fetching booking statistics...")
    
    // Get all bookings
    const allBookingsQuery = query(collection(db, "bookings"))
    const allSnapshot = await getDocs(allBookingsQuery)
    const allBookings = allSnapshot.docs.map(doc => doc.data() as ServiceBooking)
    
    const stats = {
      totalBookings: allBookings.length,
      pendingBookings: allBookings.filter(b => b.status === "pending").length,
      confirmedBookings: allBookings.filter(b => b.status === "confirmed").length,
      completedBookings: allBookings.filter(b => b.status === "completed").length,
      cancelledBookings: allBookings.filter(b => b.status === "cancelled").length,
      totalRevenue: allBookings
        .filter(b => b.paymentStatus === "fully_paid")
        .reduce((sum, b) => sum + b.totalAmount, 0),
      averageRating: allBookings
        .filter(b => b.rating)
        .reduce((sum, b, _, arr) => sum + (b.rating || 0) / arr.length, 0)
    }
    
    console.log("✅ Firebase: Booking stats calculated:", stats)
    return stats
  } catch (error: any) {
    console.error("💥 Firebase: Error fetching booking stats:", error)
    
    // Return default stats on error
    return {
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0,
      averageRating: 0
    }
  }
}

// Delete booking (admin only)
export const deleteBooking = async (bookingId: string): Promise<void> => {
  try {
    console.log("🔍 Firebase: Deleting booking:", bookingId)
    
    const docRef = doc(db, "bookings", bookingId)
    await deleteDoc(docRef)
    
    console.log("✅ Firebase: Booking deleted successfully")
  } catch (error: any) {
    console.error("💥 Firebase: Error deleting booking:", error)
    throw new Error(`Failed to delete booking: ${error.message}`)
  }
}