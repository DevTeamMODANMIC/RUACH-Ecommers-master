"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Users, TrendingUp } from "lucide-react"
import { useCurrency } from "@/components/currency-provider"

const countries = [
  {
    id: "nigeria",
    name: "Nigeria",
    flag: "🇳🇬",
    currency: "NGN",
    symbol: "₦",
    description: "Authentic Nigerian foods, spices, and traditional ingredients",
    productCount: 245,
    popularCategories: ["Rice", "Spices", "Palm Oil", "Yam Flour"],
    exchangeRate: 1650, // NGN per GBP
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
    exchangeRate: 104, // INR per GBP
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
    exchangeRate: 16, // GHS per GBP
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
    exchangeRate: 195, // JMD per GBP
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
    exchangeRate: 1, // Base currency
  },
]

interface CountrySelectorProps {
  selectedCountry: string
  onCountryChange: (country: string) => void
}

export function CountrySelector({ selectedCountry, onCountryChange }: CountrySelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { setCurrency } = useCurrency()

  const handleCountrySelect = (countryId: string) => {
    const country = countries.find((c) => c.id === countryId)
    if (country) {
      onCountryChange(countryId)
      setCurrency(country.currency, country.symbol, country.exchangeRate)
      setIsExpanded(false)
    }
  }

  const selectedCountryData = countries.find((c) => c.id === selectedCountry)

  return (
    <div className="space-y-4">
      {/* Current Selection */}
      <Card className="border-2 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{selectedCountryData?.flag}</div>
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-600" />
                  {selectedCountryData?.name}
                </h3>
                <p className="text-muted-foreground">{selectedCountryData?.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {selectedCountryData?.productCount} products
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Currency: {selectedCountryData?.symbol}
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => setIsExpanded(!isExpanded)} className="ml-4">
              {isExpanded ? "Hide Options" : "Change Country"}
            </Button>
          </div>

          {/* Popular Categories */}
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Popular Categories:</p>
            <div className="flex flex-wrap gap-2">
              {selectedCountryData?.popularCategories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country Options */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {countries
            .filter((country) => country.id !== selectedCountry)
            .map((country) => (
              <Card
                key={country.id}
                className="cursor-pointer hover:shadow-lg transition-shadow border hover:border-green-300 dark:hover:border-green-700"
                onClick={() => handleCountrySelect(country.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{country.flag}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{country.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{country.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{country.productCount} products</span>
                        <span>{country.symbol}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
