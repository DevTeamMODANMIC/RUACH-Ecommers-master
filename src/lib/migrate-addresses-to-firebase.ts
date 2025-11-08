import { saveUserAddress, getUserAddresses } from './firebase-profile'

interface LocalStorageAddress {
  id: number | string
  type: 'Home' | 'Work' | 'Other'
  name: string
  address: string
  city: string
  postalCode: string
  country: string
  isDefault: boolean
}

/**
 * Migrate addresses from localStorage to Firebase
 * This should be called once when a user logs in to move their data
 */
export async function migrateAddressesToFirebase(userId: string): Promise<{
  success: boolean
  migratedCount: number
  errors: string[]
}> {
  const errors: string[] = []
  let migratedCount = 0

  try {
    // Check if addresses exist in localStorage
    const localAddressesStr = localStorage.getItem('userAddresses')

    if (!localAddressesStr) {
      console.log('No addresses found in localStorage to migrate')
      return { success: true, migratedCount: 0, errors: [] }
    }

    const localAddresses: LocalStorageAddress[] = JSON.parse(localAddressesStr)

    if (!Array.isArray(localAddresses) || localAddresses.length === 0) {
      console.log('No valid addresses found in localStorage')
      return { success: true, migratedCount: 0, errors: [] }
    }

    // Check if addresses already exist in Firebase
    const existingAddresses = await getUserAddresses(userId)

    if (existingAddresses.length > 0) {
      console.log('Addresses already exist in Firebase, skipping migration')
      // Clean up localStorage
      localStorage.removeItem('userAddresses')
      return { success: true, migratedCount: 0, errors: ['Addresses already exist in Firebase'] }
    }

    console.log(`Migrating ${localAddresses.length} addresses to Firebase...`)

    // Migrate each address
    for (const localAddress of localAddresses) {
      try {
        await saveUserAddress(userId, {
          type: localAddress.type,
          name: localAddress.name,
          address: localAddress.address,
          city: localAddress.city,
          postalCode: localAddress.postalCode,
          country: localAddress.country,
          isDefault: localAddress.isDefault,
          validated: false,
        })

        migratedCount++
        console.log(`Migrated address: ${localAddress.type} - ${localAddress.city}`)
      } catch (error) {
        const errorMsg = `Failed to migrate address ${localAddress.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    // If migration was successful, remove from localStorage
    if (migratedCount > 0) {
      localStorage.removeItem('userAddresses')
      console.log(`Successfully migrated ${migratedCount} addresses and cleared localStorage`)
    }

    return {
      success: errors.length === 0,
      migratedCount,
      errors,
    }
  } catch (error) {
    const errorMsg = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error(errorMsg)
    return {
      success: false,
      migratedCount,
      errors: [errorMsg, ...errors],
    }
  }
}

/**
 * Check if migration is needed
 */
export function needsAddressMigration(): boolean {
  const localAddressesStr = localStorage.getItem('userAddresses')
  if (!localAddressesStr) return false

  try {
    const localAddresses = JSON.parse(localAddressesStr)
    return Array.isArray(localAddresses) && localAddresses.length > 0
  } catch {
    return false
  }
}

/**
 * Migrate all localStorage data to Firebase
 * Includes profile, addresses, preferences
 */
export async function migrateAllDataToFirebase(userId: string): Promise<{
  addresses: { success: boolean; count: number }
  profile: { success: boolean }
  errors: string[]
}> {
  const result = {
    addresses: { success: false, count: 0 },
    profile: { success: false },
    errors: [] as string[],
  }

  try {
    // Migrate addresses
    const addressResult = await migrateAddressesToFirebase(userId)
    result.addresses = {
      success: addressResult.success,
      count: addressResult.migratedCount,
    }
    result.errors.push(...addressResult.errors)

    // Note: Profile and preferences migrations would be added here
    // For now, they're still using localStorage

    return result
  } catch (error) {
    result.errors.push(
      `Overall migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
    return result
  }
}

/**
 * Clear all localStorage data (use with caution!)
 */
export function clearLocalStorageData() {
  const keysToRemove = [
    'userAddresses',
    'userProfile',
    'userPreferences',
    'userPaymentMethods',
    'userTwoFactorEnabled',
  ]

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key)
  })

  console.log('Cleared all user data from localStorage')
}
