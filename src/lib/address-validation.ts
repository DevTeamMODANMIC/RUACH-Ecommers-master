// Address validation service
// This service provides address validation and autocomplete functionality

export interface AddressValidationResult {
  isValid: boolean
  formatted?: {
    address: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  suggestions?: Array<{
    address: string
    city: string
    state?: string
    postalCode: string
    country: string
  }>
  errors?: string[]
}

export interface PostalCodeValidationResult {
  isValid: boolean
  city?: string
  state?: string
  country?: string
  error?: string
}

// Postal code patterns by country
const postalCodePatterns: Record<string, RegExp> = {
  'United Kingdom': /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
  'United States': /^\d{5}(-\d{4})?$/,
  'Canada': /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
  'Australia': /^\d{4}$/,
  'Nigeria': /^\d{6}$/,
  'Ghana': /^[A-Z]{2}-?\d{3,4}-?\d{4}$/i,
  'South Africa': /^\d{4}$/,
  'Kenya': /^\d{5}$/,
  'Germany': /^\d{5}$/,
  'France': /^\d{5}$/,
  'Italy': /^\d{5}$/,
  'Spain': /^\d{5}$/,
  'Netherlands': /^\d{4}\s?[A-Z]{2}$/i,
  'Belgium': /^\d{4}$/,
  'Switzerland': /^\d{4}$/,
  'Austria': /^\d{4}$/,
  'Ireland': /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i,
  'New Zealand': /^\d{4}$/,
  'India': /^\d{6}$/,
  'Singapore': /^\d{6}$/,
  'Malaysia': /^\d{5}$/,
  'Japan': /^\d{3}-?\d{4}$/,
  'China': /^\d{6}$/,
  'Brazil': /^\d{5}-?\d{3}$/,
  'Mexico': /^\d{5}$/,
  'Argentina': /^[A-Z]?\d{4}[A-Z]{3}$/i,
}

// Validate postal code format
export function validatePostalCode(postalCode: string, country: string): boolean {
  const pattern = postalCodePatterns[country]
  if (!pattern) {
    // If we don't have a pattern for this country, accept any non-empty value
    return postalCode.trim().length > 0
  }
  return pattern.test(postalCode.trim())
}

// Format postal code based on country standards
export function formatPostalCode(postalCode: string, country: string): string {
  const trimmed = postalCode.trim().replace(/\s+/g, '')

  switch (country) {
    case 'United Kingdom':
      // Format UK postcodes (e.g., SW1A1AA -> SW1A 1AA)
      if (trimmed.length >= 5) {
        return `${trimmed.slice(0, -3)} ${trimmed.slice(-3)}`.toUpperCase()
      }
      return trimmed.toUpperCase()

    case 'Canada':
      // Format Canadian postal codes (e.g., K1A0B1 -> K1A 0B1)
      if (trimmed.length === 6) {
        return `${trimmed.slice(0, 3)} ${trimmed.slice(3)}`.toUpperCase()
      }
      return trimmed.toUpperCase()

    case 'Netherlands':
      // Format Dutch postal codes (e.g., 1234AB -> 1234 AB)
      if (trimmed.length === 6) {
        return `${trimmed.slice(0, 4)} ${trimmed.slice(4)}`.toUpperCase()
      }
      return trimmed.toUpperCase()

    case 'Japan':
      // Format Japanese postal codes (e.g., 1234567 -> 123-4567)
      if (trimmed.length === 7 && !trimmed.includes('-')) {
        return `${trimmed.slice(0, 3)}-${trimmed.slice(3)}`
      }
      return trimmed

    case 'Brazil':
      // Format Brazilian postal codes (e.g., 12345678 -> 12345-678)
      if (trimmed.length === 8 && !trimmed.includes('-')) {
        return `${trimmed.slice(0, 5)}-${trimmed.slice(5)}`
      }
      return trimmed

    case 'United States':
      // Format US ZIP codes (preserve ZIP+4 if present)
      if (trimmed.length === 9 && !trimmed.includes('-')) {
        return `${trimmed.slice(0, 5)}-${trimmed.slice(5)}`
      }
      return trimmed

    default:
      return trimmed
  }
}

// Validate full address
export async function validateAddress(
  address: string,
  city: string,
  postalCode: string,
  country: string,
  state?: string
): Promise<AddressValidationResult> {
  const errors: string[] = []

  // Basic validation
  if (!address || address.trim().length < 5) {
    errors.push('Address must be at least 5 characters long')
  }

  if (!city || city.trim().length < 2) {
    errors.push('City name must be at least 2 characters long')
  }

  if (!postalCode || postalCode.trim().length === 0) {
    errors.push('Postal code is required')
  } else if (!validatePostalCode(postalCode, country)) {
    errors.push(`Invalid postal code format for ${country}`)
  }

  if (!country || country.trim().length === 0) {
    errors.push('Country is required')
  }

  // Check if state is required for certain countries
  const stateRequiredCountries = ['United States', 'Canada', 'Australia', 'Brazil', 'India']
  if (stateRequiredCountries.includes(country) && (!state || state.trim().length === 0)) {
    errors.push(`State/Province is required for ${country}`)
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors
    }
  }

  // Format the address
  const formatted = {
    address: address.trim(),
    city: city.trim(),
    state: state?.trim(),
    postalCode: formatPostalCode(postalCode, country),
    country: country.trim()
  }

  return {
    isValid: true,
    formatted
  }
}

// Validate postal code and get location info (mock implementation)
// In production, you'd integrate with a real API like Google Places, Postcode.io, etc.
export async function lookupPostalCode(
  postalCode: string,
  country: string
): Promise<PostalCodeValidationResult> {
  // Validate format first
  if (!validatePostalCode(postalCode, country)) {
    return {
      isValid: false,
      error: `Invalid postal code format for ${country}`
    }
  }

  // Mock data for demonstration
  // In production, replace this with actual API calls
  const mockData: Record<string, Record<string, any>> = {
    'United Kingdom': {
      'SW1A 1AA': { city: 'London', state: 'Greater London' },
      'M1 1AA': { city: 'Manchester', state: 'Greater Manchester' },
      'EH1 1AA': { city: 'Edinburgh', state: 'Scotland' }
    },
    'United States': {
      '10001': { city: 'New York', state: 'NY' },
      '90001': { city: 'Los Angeles', state: 'CA' },
      '60601': { city: 'Chicago', state: 'IL' }
    },
    'Nigeria': {
      '100001': { city: 'Lagos', state: 'Lagos State' },
      '900001': { city: 'Abuja', state: 'FCT' }
    }
  }

  const formattedCode = formatPostalCode(postalCode, country)
  const countryData = mockData[country]

  if (countryData && countryData[formattedCode]) {
    return {
      isValid: true,
      ...countryData[formattedCode],
      country
    }
  }

  // If no mock data found, just validate the format
  return {
    isValid: true,
    country
  }
}

// Get address suggestions (autocomplete)
export async function getAddressSuggestions(
  searchTerm: string,
  country: string
): Promise<string[]> {
  // This is a mock implementation
  // In production, integrate with Google Places API, Mapbox, or similar services

  if (searchTerm.length < 3) {
    return []
  }

  // Return empty array - in production, this would call an actual API
  return []
}

// Validate phone number format by country
export function validatePhoneNumber(phone: string, country: string): boolean {
  const phonePatterns: Record<string, RegExp> = {
    'United Kingdom': /^(\+44|0)\s?\d{3,4}\s?\d{3,4}\s?\d{3,4}$/,
    'United States': /^(\+1|1)?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
    'Canada': /^(\+1|1)?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
    'Nigeria': /^(\+234|0)\s?\d{3}\s?\d{3}\s?\d{4}$/,
    'Ghana': /^(\+233|0)\s?\d{2}\s?\d{3}\s?\d{4}$/,
    'Australia': /^(\+61|0)\s?\d{1}\s?\d{4}\s?\d{4}$/,
    'South Africa': /^(\+27|0)\s?\d{2}\s?\d{3}\s?\d{4}$/,
    'Kenya': /^(\+254|0)\s?\d{3}\s?\d{6}$/,
    'India': /^(\+91|0)?\s?\d{10}$/,
    'Germany': /^(\+49|0)\s?\d{2,4}\s?\d{3,9}$/,
    'France': /^(\+33|0)\s?\d{1}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/,
  }

  const pattern = phonePatterns[country]
  if (!pattern) {
    // Generic phone validation - 10-15 digits
    return /^[\+]?[(]?\d{1,4}[)]?[-\s\.]?\d{1,4}[-\s\.]?\d{1,9}$/.test(phone.trim())
  }

  return pattern.test(phone.trim())
}

// Format phone number based on country
export function formatPhoneNumber(phone: string, country: string): string {
  const digits = phone.replace(/\D/g, '')

  switch (country) {
    case 'United Kingdom':
      if (digits.startsWith('44')) {
        return `+44 ${digits.slice(2, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
      }
      if (digits.startsWith('0')) {
        return `${digits.slice(0, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
      }
      return phone

    case 'United States':
    case 'Canada':
      if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
      }
      if (digits.length === 11 && digits.startsWith('1')) {
        return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
      }
      return phone

    case 'Nigeria':
      if (digits.startsWith('234')) {
        return `+234 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
      }
      if (digits.startsWith('0')) {
        return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
      }
      return phone

    default:
      return phone
  }
}

// Validate name fields
export function validateName(name: string, fieldName: string): { isValid: boolean; error?: string } {
  const trimmed = name.trim()

  if (trimmed.length === 0) {
    return { isValid: false, error: `${fieldName} is required` }
  }

  if (trimmed.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters long` }
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: `${fieldName} must not exceed 50 characters` }
  }

  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` }
  }

  return { isValid: true }
}

// Validate email
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmed = email.trim()

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }

  return { isValid: true }
}

// Get list of states/provinces for a country
export function getStatesForCountry(country: string): Array<{ code: string; name: string }> {
  const states: Record<string, Array<{ code: string; name: string }>> = {
    'United States': [
      { code: 'AL', name: 'Alabama' },
      { code: 'AK', name: 'Alaska' },
      { code: 'AZ', name: 'Arizona' },
      { code: 'AR', name: 'Arkansas' },
      { code: 'CA', name: 'California' },
      { code: 'CO', name: 'Colorado' },
      { code: 'CT', name: 'Connecticut' },
      { code: 'DE', name: 'Delaware' },
      { code: 'FL', name: 'Florida' },
      { code: 'GA', name: 'Georgia' },
      { code: 'HI', name: 'Hawaii' },
      { code: 'ID', name: 'Idaho' },
      { code: 'IL', name: 'Illinois' },
      { code: 'IN', name: 'Indiana' },
      { code: 'IA', name: 'Iowa' },
      { code: 'KS', name: 'Kansas' },
      { code: 'KY', name: 'Kentucky' },
      { code: 'LA', name: 'Louisiana' },
      { code: 'ME', name: 'Maine' },
      { code: 'MD', name: 'Maryland' },
      { code: 'MA', name: 'Massachusetts' },
      { code: 'MI', name: 'Michigan' },
      { code: 'MN', name: 'Minnesota' },
      { code: 'MS', name: 'Mississippi' },
      { code: 'MO', name: 'Missouri' },
      { code: 'MT', name: 'Montana' },
      { code: 'NE', name: 'Nebraska' },
      { code: 'NV', name: 'Nevada' },
      { code: 'NH', name: 'New Hampshire' },
      { code: 'NJ', name: 'New Jersey' },
      { code: 'NM', name: 'New Mexico' },
      { code: 'NY', name: 'New York' },
      { code: 'NC', name: 'North Carolina' },
      { code: 'ND', name: 'North Dakota' },
      { code: 'OH', name: 'Ohio' },
      { code: 'OK', name: 'Oklahoma' },
      { code: 'OR', name: 'Oregon' },
      { code: 'PA', name: 'Pennsylvania' },
      { code: 'RI', name: 'Rhode Island' },
      { code: 'SC', name: 'South Carolina' },
      { code: 'SD', name: 'South Dakota' },
      { code: 'TN', name: 'Tennessee' },
      { code: 'TX', name: 'Texas' },
      { code: 'UT', name: 'Utah' },
      { code: 'VT', name: 'Vermont' },
      { code: 'VA', name: 'Virginia' },
      { code: 'WA', name: 'Washington' },
      { code: 'WV', name: 'West Virginia' },
      { code: 'WI', name: 'Wisconsin' },
      { code: 'WY', name: 'Wyoming' }
    ],
    'Nigeria': [
      { code: 'AB', name: 'Abia' },
      { code: 'AD', name: 'Adamawa' },
      { code: 'AK', name: 'Akwa Ibom' },
      { code: 'AN', name: 'Anambra' },
      { code: 'BA', name: 'Bauchi' },
      { code: 'BY', name: 'Bayelsa' },
      { code: 'BE', name: 'Benue' },
      { code: 'BO', name: 'Borno' },
      { code: 'CR', name: 'Cross River' },
      { code: 'DE', name: 'Delta' },
      { code: 'EB', name: 'Ebonyi' },
      { code: 'ED', name: 'Edo' },
      { code: 'EK', name: 'Ekiti' },
      { code: 'EN', name: 'Enugu' },
      { code: 'FC', name: 'FCT' },
      { code: 'GO', name: 'Gombe' },
      { code: 'IM', name: 'Imo' },
      { code: 'JI', name: 'Jigawa' },
      { code: 'KD', name: 'Kaduna' },
      { code: 'KN', name: 'Kano' },
      { code: 'KT', name: 'Katsina' },
      { code: 'KE', name: 'Kebbi' },
      { code: 'KO', name: 'Kogi' },
      { code: 'KW', name: 'Kwara' },
      { code: 'LA', name: 'Lagos' },
      { code: 'NA', name: 'Nasarawa' },
      { code: 'NI', name: 'Niger' },
      { code: 'OG', name: 'Ogun' },
      { code: 'ON', name: 'Ondo' },
      { code: 'OS', name: 'Osun' },
      { code: 'OY', name: 'Oyo' },
      { code: 'PL', name: 'Plateau' },
      { code: 'RI', name: 'Rivers' },
      { code: 'SO', name: 'Sokoto' },
      { code: 'TA', name: 'Taraba' },
      { code: 'YO', name: 'Yobe' },
      { code: 'ZA', name: 'Zamfara' }
    ],
    'Canada': [
      { code: 'AB', name: 'Alberta' },
      { code: 'BC', name: 'British Columbia' },
      { code: 'MB', name: 'Manitoba' },
      { code: 'NB', name: 'New Brunswick' },
      { code: 'NL', name: 'Newfoundland and Labrador' },
      { code: 'NS', name: 'Nova Scotia' },
      { code: 'ON', name: 'Ontario' },
      { code: 'PE', name: 'Prince Edward Island' },
      { code: 'QC', name: 'Quebec' },
      { code: 'SK', name: 'Saskatchewan' },
      { code: 'NT', name: 'Northwest Territories' },
      { code: 'NU', name: 'Nunavut' },
      { code: 'YT', name: 'Yukon' }
    ],
    'Australia': [
      { code: 'NSW', name: 'New South Wales' },
      { code: 'VIC', name: 'Victoria' },
      { code: 'QLD', name: 'Queensland' },
      { code: 'WA', name: 'Western Australia' },
      { code: 'SA', name: 'South Australia' },
      { code: 'TAS', name: 'Tasmania' },
      { code: 'ACT', name: 'Australian Capital Territory' },
      { code: 'NT', name: 'Northern Territory' }
    ]
  }

  return states[country] || []
}
