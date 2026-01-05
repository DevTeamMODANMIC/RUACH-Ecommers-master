

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Country {
  id: string
  name: string
  flag: string
  currency: string
  symbol: string
  description: string
  productCount: number
  popularCategories: string[]
  exchangeRate: number
  shippingInfo: {
    freeShippingThreshold: number
    standardShipping: number
    expressShipping: number
    estimatedDays: string
  }
  paymentMethods: string[]
  languages: string[]
}

export const countries: Country[] = [
  {
    id: "nigeria",
    name: "Nigeria",
    flag: "🇳🇬",
    currency: "NGN",
    symbol: "₦",
    description: "Authentic Nigerian foods, spices, and traditional ingredients",
    productCount: 245,
    popularCategories: ["Rice", "Spices", "Palm Oil", "Yam Flour"],
    exchangeRate: 1650,
    shippingInfo: {
      freeShippingThreshold: 82500, // ₦82,500 (equivalent to £50)
      standardShipping: 3300, // ₦3,300 (equivalent to £2)
      expressShipping: 8250, // ₦8,250 (equivalent to £5)
      estimatedDays: "3-7 business days",
    },
    paymentMethods: ["Card", "Bank Transfer", "Mobile Money"],
    languages: ["English", "Hausa", "Yoruba", "Igbo"],
  },
  {
    id: "india",
    name: "India",
    flag: "🇮🇳",
    currency: "INR",
    symbol: "₹",
    description: "Premium Indian spices, lentils, and specialty ingredients",
    productCount: 189,
    popularCategories: ["Spices", "Lentils", "Basmati Rice", "Tea"],
    exchangeRate: 104,
    shippingInfo: {
      freeShippingThreshold: 5200, // ₹5,200 (equivalent to £50)
      standardShipping: 208, // ₹208 (equivalent to £2)
      expressShipping: 520, // ₹520 (equivalent to £5)
      estimatedDays: "2-5 business days",
    },
    paymentMethods: ["Card", "UPI", "Net Banking", "Wallet"],
    languages: ["English", "Hindi", "Tamil", "Bengali"],
  },
  {
    id: "ghana",
    name: "Ghana",
    flag: "🇬🇭",
    currency: "GHS",
    symbol: "₵",
    description: "Traditional Ghanaian foods and West African specialties",
    productCount: 156,
    popularCategories: ["Plantain", "Cassava", "Palm Nut", "Kenkey"],
    exchangeRate: 16,
    shippingInfo: {
      freeShippingThreshold: 800, // ₵800 (equivalent to £50)
      standardShipping: 32, // ₵32 (equivalent to £2)
      expressShipping: 80, // ₵80 (equivalent to £5)
      estimatedDays: "4-8 business days",
    },
    paymentMethods: ["Card", "Mobile Money", "Bank Transfer"],
    languages: ["English", "Twi", "Ga", "Ewe"],
  },
  {
    id: "jamaica",
    name: "Jamaica",
    flag: "🇯🇲",
    currency: "JMD",
    symbol: "J$",
    description: "Caribbean flavors and Jamaican culinary essentials",
    productCount: 98,
    popularCategories: ["Scotch Bonnet", "Ackee", "Plantain", "Jerk Seasoning"],
    exchangeRate: 195,
    shippingInfo: {
      freeShippingThreshold: 9750, // J$9,750 (equivalent to £50)
      standardShipping: 390, // J$390 (equivalent to £2)
      expressShipping: 975, // J$975 (equivalent to £5)
      estimatedDays: "5-10 business days",
    },
    paymentMethods: ["Card", "Bank Transfer"],
    languages: ["English", "Patois"],
  },
  {
    id: "uk",
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    symbol: "£",
    description: "International foods available in the UK market",
    productCount: 312,
    popularCategories: ["International Mix", "Organic", "Halal", "Vegan"],
    exchangeRate: 1,
    shippingInfo: {
      freeShippingThreshold: 50, // £50
      standardShipping: 2, // £2
      expressShipping: 5, // £5
      estimatedDays: "1-3 business days",
    },
    paymentMethods: ["Card", "PayPal", "Apple Pay", "Google Pay"],
    languages: ["English"],
  },
]

interface CountryContextType {
  selectedCountry: Country
  setSelectedCountry: (country: Country) => void
  availableCountries: Country[]
  isCountryAvailable: (countryId: string) => boolean
}

export const CountryContext = createContext<CountryContextType | undefined>(undefined)

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [selectedCountry, setSelectedCountryState] = useState<Country>(countries[4]) // Default to UK

  const setSelectedCountry = (country: Country) => {
    setSelectedCountryState(country)

    // Store in localStorage for persistence
    localStorage.setItem("selectedCountry", JSON.stringify(country))

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent("countryChanged", { detail: country }))
  }

  const isCountryAvailable = (countryId: string): boolean => {
    return countries.some((country) => country.id === countryId)
  }

  // Load saved country on mount
  useEffect(() => {
    const saved = localStorage.getItem("selectedCountry")
    if (saved) {
      try {
        const savedCountry = JSON.parse(saved)
        // Validate that the saved country still exists in our countries list
        const validCountry = countries.find((c) => c.id === savedCountry.id)
        if (validCountry) {
          setSelectedCountryState(validCountry)
        }
      } catch (error) {
        console.error("Error loading saved country:", error)
      }
    }
  }, [])

  return (
    <CountryContext.Provider
      value={{
        selectedCountry,
        setSelectedCountry,
        availableCountries: countries,
        isCountryAvailable,
      }}
    >
      {children}
    </CountryContext.Provider>
  )
}

export function useCountry() {
  const context = useContext(CountryContext)
  if (context === undefined) {
    throw new Error("useCountry must be used within a CountryProvider")
  }
  return context
}
