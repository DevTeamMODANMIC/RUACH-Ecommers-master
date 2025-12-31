"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Globe, Check } from "lucide-react"
import { useCountry } from "@/components/country-provider"
import { useCurrency } from "@/components/currency-provider"
import { useToast } from "@/hooks/use-toast"

interface CountrySelectorDropdownProps {
  variant?: "header" | "footer" | "full"
  showLabel?: boolean
}

export function CountrySelectorDropdown({ variant = "header", showLabel = true }: CountrySelectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { selectedCountry, setSelectedCountry, availableCountries } = useCountry()
  const { setCurrency } = useCurrency()
  const { toast } = useToast()

  const handleCountrySelect = (country: typeof selectedCountry) => {
    if (country.id === selectedCountry.id) return

    // Update country
    setSelectedCountry(country)

    // Update currency
    setCurrency(country.currency, country.symbol, country.exchangeRate)

    // Close dropdown
    setIsOpen(false)

    // Show success toast
    toast({
      title: "Country Updated",
      description: `Switched to ${country.name}. Products and pricing updated.`,
      duration: 3000,
    })
  }

  if (variant === "footer") {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-white">Shop by Country</h4>
        <div className="space-y-1">
          {availableCountries.map((country) => (
            <button
              key={country.id}
              onClick={() => handleCountrySelect(country)}
              className={`flex items-center space-x-2 text-sm transition-colors w-full text-left p-1 rounded ${
                selectedCountry.id === country.id
                  ? "text-green-400 bg-green-900/20"
                  : "text-gray-300 hover:text-green-400"
              }`}
            >
              <span className="text-base">{country.flag}</span>
              <span>{country.name}</span>
              {selectedCountry.id === country.id && <Check className="h-3 w-3 ml-auto" />}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === "header" ? "ghost" : "outline"}
          className="flex items-center space-x-2"
          size={variant === "header" ? "sm" : "default"}
        >
          <Globe className="h-4 w-4" />
          <span className="text-lg">{selectedCountry.flag}</span>
          {showLabel && (
            <span className="hidden sm:inline font-medium">
              {variant === "header" ? selectedCountry.name : `${selectedCountry.name} (${selectedCountry.symbol})`}
            </span>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span>Select Your Country</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {availableCountries.map((country) => (
          <DropdownMenuItem
            key={country.id}
            onClick={() => handleCountrySelect(country)}
            className="flex items-start space-x-3 p-3 cursor-pointer"
          >
            <div className="text-2xl">{country.flag}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium">{country.name}</span>
                {selectedCountry.id === country.id && <Check className="h-4 w-4 text-green-600" />}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{country.description}</p>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline" className="text-xs">
                  {country.productCount} products
                </Badge>
                <span className="text-xs font-medium">
                  {country.symbol} {country.currency}
                </span>
              </div>
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <div className="p-3 text-xs text-muted-foreground">
          <p>Changing your country will update:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Product availability and pricing</li>
            <li>Currency and payment methods</li>
            <li>Shipping options and costs</li>
          </ul>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
