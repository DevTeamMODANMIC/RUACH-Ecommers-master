// Utility functions for managing service provider availability and time slots

export interface TimeSlot {
  date: string
  timeSlots: string[]
}

export interface ProviderAvailability {
  providerId: string
  workingHours: {
    start: string // "09:00"
    end: string   // "17:00"
  }
  workingDays: number[] // 0-6, where 0 is Sunday
  unavailableDates: string[] // ["2024-01-15", "2024-01-20"]
  slotDuration: number // in minutes, default 60
}

// Default availability for providers (can be customized per provider)
const DEFAULT_AVAILABILITY: Omit<ProviderAvailability, 'providerId'> = {
  workingHours: {
    start: "09:00",
    end: "17:00"
  },
  workingDays: [1, 2, 3, 4, 5], // Monday to Friday
  unavailableDates: [],
  slotDuration: 60 // 1 hour slots
}

// Generate time slots for a given date
export const generateTimeSlotsForDate = (
  date: string,
  workingHours: { start: string; end: string },
  slotDuration: number = 60,
  bookedSlots: string[] = []
): string[] => {
  const slots: string[] = []
  
  const [startHour, startMinute] = workingHours.start.split(':').map(Number)
  const [endHour, endMinute] = workingHours.end.split(':').map(Number)
  
  const startTime = startHour * 60 + startMinute
  const endTime = endHour * 60 + endMinute
  
  for (let time = startTime; time < endTime; time += slotDuration) {
    const hour = Math.floor(time / 60)
    const minute = time % 60
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    
    // Skip if this slot is already booked
    if (!bookedSlots.includes(timeString)) {
      slots.push(timeString)
    }
  }
  
  return slots
}

// Check if a date is a working day
export const isWorkingDay = (date: string, workingDays: number[]): boolean => {
  const dayOfWeek = new Date(date).getDay()
  return workingDays.includes(dayOfWeek)
}

// Generate available slots for the next N days
export const generateAvailableSlots = async (
  providerId: string,
  daysAhead: number = 14,
  availability?: Partial<ProviderAvailability>
): Promise<TimeSlot[]> => {
  try {
    console.log("🔍 Generating available slots for provider:", providerId)
    
    // Use provided availability or default
    const providerAvailability = {
      ...DEFAULT_AVAILABILITY,
      ...availability,
      providerId
    }
    
    const slots: TimeSlot[] = []
    const today = new Date()
    
    // Generate slots for the next N days
    for (let i = 1; i <= daysAhead; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD format
      
      // Skip if not a working day
      if (!isWorkingDay(dateString, providerAvailability.workingDays)) {
        continue
      }
      
      // Skip if date is in unavailable dates
      if (providerAvailability.unavailableDates.includes(dateString)) {
        continue
      }
      
      // TODO: Get booked slots for this date from Firebase
      // For now, we'll use empty array - this should be replaced with actual booking data
      const bookedSlots: string[] = []
      
      // Generate time slots for this date
      const timeSlots = generateTimeSlotsForDate(
        dateString,
        providerAvailability.workingHours,
        providerAvailability.slotDuration,
        bookedSlots
      )
      
      // Only add dates that have available slots
      if (timeSlots.length > 0) {
        slots.push({
          date: dateString,
          timeSlots
        })
      }
    }
    
    console.log("✅ Generated available slots:", slots.length, "days")
    return slots
    
  } catch (error: any) {
    console.error("💥 Error generating available slots:", error)
    return []
  }
}

// Get booked time slots for a provider on a specific date
export const getBookedSlotsForDate = async (
  providerId: string,
  date: string
): Promise<string[]> => {
  try {
    console.log("🔍 Getting booked slots for:", providerId, date)
    
    // Import Firebase functions dynamically to avoid circular dependencies
    const { getProviderBookings } = await import('./firebase-bookings')
    
    // Get all bookings for this provider
    const bookings = await getProviderBookings(providerId)
    
    // Filter bookings for the specific date and extract time slots
    const bookedSlots = bookings
      .filter(booking => 
        booking.scheduledDate === date && 
        (booking.status === 'confirmed' || booking.status === 'in_progress')
      )
      .map(booking => booking.scheduledTime)
    
    console.log("✅ Found booked slots:", bookedSlots.length)
    return bookedSlots
    
  } catch (error: any) {
    console.error("💥 Error getting booked slots:", error)
    return []
  }
}

// Validate if a time slot is available
export const isSlotAvailable = async (
  providerId: string,
  date: string,
  time: string
): Promise<boolean> => {
  try {
    const bookedSlots = await getBookedSlotsForDate(providerId, date)
    return !bookedSlots.includes(time)
  } catch (error) {
    console.error("Error checking slot availability:", error)
    return false
  }
}

// Format time for display (12-hour format)
export const formatTimeForDisplay = (time: string): string => {
  const [hour, minute] = time.split(':').map(Number)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
}

// Get next available slot for a provider
export const getNextAvailableSlot = async (
  providerId: string,
  availability?: Partial<ProviderAvailability>
): Promise<{ date: string; time: string } | null> => {
  try {
    const slots = await generateAvailableSlots(providerId, 30, availability)
    
    if (slots.length === 0) {
      return null
    }
    
    // Return the first available slot
    const firstSlot = slots[0]
    if (firstSlot.timeSlots.length > 0) {
      return {
        date: firstSlot.date,
        time: firstSlot.timeSlots[0]
      }
    }
    
    return null
  } catch (error) {
    console.error("Error getting next available slot:", error)
    return null
  }
}

// Mock data for testing - this should be replaced with real provider availability data
export const getMockProviderAvailability = (providerId: string): ProviderAvailability => {
  return {
    providerId,
    workingHours: {
      start: "09:00",
      end: "17:00"
    },
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    unavailableDates: [],
    slotDuration: 60
  }
}

// Helper function to get day name
export const getDayName = (date: string): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[new Date(date).getDay()]
}

// Helper function to format date for display
export const formatDateForDisplay = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}