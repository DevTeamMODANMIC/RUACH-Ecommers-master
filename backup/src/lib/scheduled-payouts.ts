/**
 * This file contains functions for scheduled payout processing.
 * In a production environment, these functions would be run by a scheduled job (e.g., daily).
 * For development/testing, you can run them manually or set up a cron job.
 */

import { processScheduledPayouts } from "./payout-processing"

/**
 * Run daily payout processing
 * This function should be scheduled to run once per day
 */
export const runDailyPayoutProcessing = async (): Promise<void> => {
  try {
    console.log("Starting daily payout processing...")
    
    // Process scheduled payouts
    await processScheduledPayouts()
    
    console.log("Daily payout processing completed successfully")
  } catch (error) {
    console.error("Error in daily payout processing:", error)
    throw error
  }
}

/**
 * Run weekly payout processing
 * This function should be scheduled to run once per week
 */
export const runWeeklyPayoutProcessing = async (): Promise<void> => {
  try {
    console.log("Starting weekly payout processing...")
    
    // Process scheduled payouts
    await processScheduledPayouts()
    
    console.log("Weekly payout processing completed successfully")
  } catch (error) {
    console.error("Error in weekly payout processing:", error)
    throw error
  }
}

/**
 * Run monthly payout processing
 * This function should be scheduled to run once per month
 */
export const runMonthlyPayoutProcessing = async (): Promise<void> => {
  try {
    console.log("Starting monthly payout processing...")
    
    // Process scheduled payouts
    await processScheduledPayouts()
    
    console.log("Monthly payout processing completed successfully")
  } catch (error) {
    console.error("Error in monthly payout processing:", error)
    throw error
  }
}

// For testing purposes, you can export a function to manually trigger payouts
export const triggerPayoutProcessing = async (): Promise<void> => {
  await processScheduledPayouts()
}