import { collection, query, where, getDocs, writeBatch, doc, updateDoc, addDoc, Timestamp } from "firebase/firestore"
import { db } from "./firebase"
import { Vendor } from "./firebase-vendors"
import { Order } from "./firebase-orders"
import { processVendorPayout } from "./payment-provider"

// Payout record interface
export interface PayoutRecord {
  id: string
  vendorId: string
  amount: number
  status: "pending" | "processing" | "completed" | "failed"
  periodStart: Date
  periodEnd: Date
  createdAt: Timestamp
  processedAt?: Timestamp
  transactionId?: string
  failureReason?: string
}

/**
 * Calculate vendor earnings from orders
 * This function calculates how much a vendor should earn from their sales
 * after deducting the platform fee
 */
export const calculateVendorEarnings = async (vendorId: string, periodStart: Date, periodEnd: Date): Promise<number> => {
  try {
    // Get all orders for this vendor in the specified period
    const ordersQuery = query(
      collection(db, "orders"),
      where("createdAt", ">=", periodStart),
      where("createdAt", "<=", periodEnd),
      where("paymentStatus", "==", "paid")
    )
    
    const ordersSnapshot = await getDocs(ordersQuery)
    let totalEarnings = 0
    
    // Platform fee percentage (10%)
    const PLATFORM_FEE = 0.10
    
    ordersSnapshot.docs.forEach((doc) => {
      const order = doc.data() as Order
      
      // Calculate earnings from this order
      // Sum up items that belong to this vendor
      let orderEarnings = 0
      order.items.forEach((item) => {
        // Check if the item belongs to this vendor
        if (item.vendorId === vendorId) {
          orderEarnings += item.total
        }
      })
      
      // Deduct platform fee
      const earningsAfterFee = orderEarnings * (1 - PLATFORM_FEE)
      totalEarnings += earningsAfterFee
    })
    
    return totalEarnings
  } catch (error) {
    console.error("Error calculating vendor earnings:", error)
    throw error
  }
}

/**
 * Process payouts for vendors based on their payout frequency
 * This function would typically be run by a scheduled job (e.g., daily)
 */
export const processScheduledPayouts = async (): Promise<void> => {
  try {
    // Get all vendors with payout settings
    const vendorsQuery = query(
      collection(db, "vendors"),
      where("payoutSettings", "!=", null)
    )
    
    const vendorsSnapshot = await getDocs(vendorsQuery)
    
    // Process payouts for each vendor
    for (const vendorDoc of vendorsSnapshot.docs) {
      const vendor = { id: vendorDoc.id, ...vendorDoc.data() } as Vendor
      
      if (!vendor.payoutSettings) continue
      
      // Determine if this vendor should receive a payout today based on their frequency
      const shouldPayout = shouldProcessPayoutToday(vendor.payoutSettings.payoutFrequency)
      
      if (shouldPayout) {
        // Calculate the payout period
        const { periodStart, periodEnd } = calculatePayoutPeriod(vendor.payoutSettings.payoutFrequency)
        
        // Calculate earnings
        const earnings = await calculateVendorEarnings(vendor.id, periodStart, periodEnd)
        
        // Check if earnings meet minimum payout threshold
        if (earnings >= vendor.payoutSettings.minimumPayout) {
          // Create payout record
          const payoutId = await createPayoutRecord(vendor.id, earnings, periodStart, periodEnd)
          
          // Process the actual payout
          await processPayout(vendor, earnings, payoutId)
        }
      }
    }
  } catch (error) {
    console.error("Error processing scheduled payouts:", error)
    throw error
  }
}

/**
 * Process an individual payout to a vendor
 */
const processPayout = async (vendor: Vendor, amount: number, payoutId: string): Promise<void> => {
  if (!vendor.payoutSettings) {
    throw new Error("Vendor payout settings are missing")
  }
  
  try {
    // Update payout status to processing
    await updatePayoutStatus(payoutId, "processing")
    
    // Process the payout through the payment provider
    const payoutResult = await processVendorPayout({
      vendorId: vendor.id,
      amount,
      currency: "NGN",
      bankAccount: {
        bankName: vendor.payoutSettings.bankName,
        accountNumber: vendor.payoutSettings.accountNumber,
        accountName: vendor.payoutSettings.accountName,
        routingNumber: vendor.payoutSettings.routingNumber,
        swiftCode: vendor.payoutSettings.swiftCode
      },
      description: `Payout for ${vendor.shopName}`,
      metadata: {
        vendorId: vendor.id,
        payoutId,
        period: new Date().toISOString()
      }
    })
    
    if (payoutResult.success) {
      // Update payout status to completed
      await updatePayoutStatus(payoutId, "completed", payoutResult.transactionId)
      console.log(`Payout of ${amount} successfully processed for vendor ${vendor.id}`)
    } else {
      // Update payout status to failed
      await updatePayoutStatus(payoutId, "failed", undefined, payoutResult.errorMessage)
      console.error(`Payout failed for vendor ${vendor.id}:`, payoutResult.errorMessage)
    }
  } catch (error) {
    console.error("Error processing payout:", error)
    // Update payout status to failed
    await updatePayoutStatus(payoutId, "failed", undefined, error instanceof Error ? error.message : "Unknown error")
  }
}

/**
 * Determine if a vendor should receive a payout today based on their frequency
 */
const shouldProcessPayoutToday = (frequency: "weekly" | "biweekly" | "monthly"): boolean => {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
  const dayOfMonth = today.getDate()
  
  switch (frequency) {
    case "weekly":
      // Process on Mondays
      return dayOfWeek === 1
    case "biweekly":
      // Process on the 1st and 15th of each month
      return dayOfMonth === 1 || dayOfMonth === 15
    case "monthly":
      // Process on the 1st of each month
      return dayOfMonth === 1
    default:
      return false
  }
}

/**
 * Calculate the payout period based on frequency
 */
const calculatePayoutPeriod = (frequency: "weekly" | "biweekly" | "monthly"): { periodStart: Date, periodEnd: Date } => {
  const today = new Date()
  
  switch (frequency) {
    case "weekly":
      // Previous week (Monday to Sunday)
      const weekAgo = new Date(today)
      weekAgo.setDate(today.getDate() - 7)
      const periodStartWeekly = new Date(weekAgo)
      periodStartWeekly.setDate(weekAgo.getDate() - weekAgo.getDay() + 1) // Monday
      const periodEndWeekly = new Date(periodStartWeekly)
      periodEndWeekly.setDate(periodStartWeekly.getDate() + 6) // Sunday
      return { periodStart: periodStartWeekly, periodEnd: periodEndWeekly }
      
    case "biweekly":
      // If today is the 1st, payout for the 15th of last month to end of last month
      // If today is the 15th, payout for the 1st of this month to the 14th
      if (today.getDate() === 1) {
        const lastMonth = new Date(today)
        lastMonth.setMonth(today.getMonth() - 1)
        const periodStart1 = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 15)
        const periodEnd1 = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0) // Last day of last month
        return { periodStart: periodStart1, periodEnd: periodEnd1 }
      } else {
        const periodStart2 = new Date(today.getFullYear(), today.getMonth(), 1)
        const periodEnd2 = new Date(today.getFullYear(), today.getMonth(), 14)
        return { periodStart: periodStart2, periodEnd: periodEnd2 }
      }
      
    case "monthly":
      // Previous month
      const lastMonth = new Date(today)
      lastMonth.setMonth(today.getMonth() - 1)
      const periodStartMonthly = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)
      const periodEndMonthly = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0) // Last day of last month
      return { periodStart: periodStartMonthly, periodEnd: periodEndMonthly }
      
    default:
      return { periodStart: new Date(), periodEnd: new Date() }
  }
}

/**
 * Create a payout record in the database
 */
export const createPayoutRecord = async (
  vendorId: string, 
  amount: number, 
  periodStart: Date, 
  periodEnd: Date
): Promise<string> => {
  try {
    const payoutRecord: Omit<PayoutRecord, "id"> = {
      vendorId,
      amount,
      status: "pending",
      periodStart,
      periodEnd,
      createdAt: Timestamp.now()
    }
    
    const docRef = await addDoc(collection(db, "payouts"), payoutRecord)
    return docRef.id
  } catch (error) {
    console.error("Error creating payout record:", error)
    throw error
  }
}

/**
 * Update payout status
 */
export const updatePayoutStatus = async (
  payoutId: string,
  status: "processing" | "completed" | "failed",
  transactionId?: string,
  failureReason?: string
): Promise<void> => {
  try {
    const updates: any = { status, processedAt: Timestamp.now() }
    
    if (transactionId) updates.transactionId = transactionId
    if (failureReason) updates.failureReason = failureReason
    
    await updateDoc(doc(db, "payouts", payoutId), updates)
  } catch (error) {
    console.error("Error updating payout status:", error)
    throw error
  }
}

/**
 * Get payout history for a vendor
 */
export const getVendorPayoutHistory = async (vendorId: string): Promise<PayoutRecord[]> => {
  try {
    const payoutsQuery = query(
      collection(db, "payouts"),
      where("vendorId", "==", vendorId)
    )
    
    const payoutsSnapshot = await getDocs(payoutsQuery)
    
    return payoutsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as PayoutRecord))
  } catch (error) {
    console.error("Error fetching vendor payout history:", error)
    throw error
  }
}