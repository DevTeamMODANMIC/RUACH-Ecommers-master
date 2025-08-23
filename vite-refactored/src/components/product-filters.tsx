

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, ChevronDown } from "lucide-react"
import { useNavigate, useSearchParams } from "next/navigation"
import Link from "next/link"
import { MAIN_CATEGORIES } from "@/lib/categories"

export function ProductFilters() {
  const router = useNavigate()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category')
  const currentOrigin = searchParams.get('origin')
  
  const [priceRange, setPriceRange] = useState([0, 100])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentCategory ? [currentCategory] : []
  )
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>(
    currentOrigin ? [currentOrigin] : []
  )
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    categories: true,
    origin: true,
  })
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    })
  }

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId))
    } else {
      setSelectedCategories([...selectedCategories, categoryId])
    }
  }
  
  const toggleOrigin = (originId: string) => {
    if (selectedOrigins.includes(originId)) {
      setSelectedOrigins(selectedOrigins.filter(id => id !== originId))
    } else {
      setSelectedOrigins([...selectedOrigins, originId])
    }
  }
  
  const handleApplyFilters = () => {
    // Build query params
    const params = new URLSearchParams()
    
    if (selectedCategories.length === 1) {
      params.set('category', selectedCategories[0])
    }
    
    if (selectedOrigins.length === 1) {
      params.set('origin', selectedOrigins[0])
    }
    
    if (searchQuery) {
      params.set('search', searchQuery)
    }
    
    if (priceRange[0] > 0 || priceRange[1] < 100) {
      params.set('minPrice', priceRange[0].toString())
      params.set('maxPrice', priceRange[1].toString())
    }
    
    const queryString = params.toString()
    navigate(`/shop${queryString ? `?${queryString}` : ''}`)
  }
  
  const resetFilters = () => {
    setPriceRange([0, 100])
    setSearchQuery("")
    setSelectedCategories([])
    setSelectedOrigins([])
    navigate('/shop')
  }

  // Use centralized main categories (excluding 'all')
  const categoryOptions = MAIN_CATEGORIES.filter(c => c.id !== 'all').map(c => ({ id: c.id, label: c.name }))
  
  const originOptions = [
    { id: 'nigeria', label: 'Nigeria' },
    { id: 'ghana', label: 'Ghana' },
    { id: 'kenya', label: 'Kenya' },
    { id: 'south-africa', label: 'South Africa' },
    { id: 'international', label: 'International' },
    { id: 'uk', label: 'United Kingdom' },
  ]

  return (
    <div className="border border-gray-300 rounded-lg p-5 bg-white shadow-md">
      {/* Header */}
      <div className="flex items-center mb-5 pb-3 border-b border-gray-200">
        <Filter className="h-4 w-4 mr-2 text-green-600" />
        <h2 className="text-base font-medium text-gray-800">Filter Products</h2>
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <h3 className="font-medium mb-2 text-sm text-gray-700">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-gray-300 bg-gray-50 h-9 text-gray-800 placeholder:text-gray-400"
          />
        </div>
      </div>
      
      {/* Price Range */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('price')}
        >
          <h3 className="font-medium text-sm text-gray-700">Price Range</h3>
          <ChevronDown 
            className={`h-4 w-4 text-gray-500 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} 
          />
        </div>
        
        {expandedSections.price && (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">
                £{priceRange[0]} - £{priceRange[1]}
              </span>
            </div>
            <Slider
              defaultValue={[0, 100]}
              max={100}
              step={1}
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as number[])}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>£0</span>
              <span>£100</span>
            </div>
          </>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('categories')}
        >
          <h3 className="font-medium text-sm text-gray-700">Categories</h3>
          <ChevronDown 
            className={`h-4 w-4 text-gray-500 transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`} 
          />
        </div>
        
        {expandedSections.categories && (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {categoryOptions.map(category => (
              <div key={category.id} className="flex items-center">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-1 bg-white"
                  />
                  <label 
                    htmlFor={`category-${category.id}`} 
                    className="ml-2 text-sm text-gray-700 cursor-pointer"
                  >
                    {category.label}
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Origin */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('origin')}
        >
          <h3 className="font-medium text-sm text-gray-700">Origin</h3>
          <ChevronDown 
            className={`h-4 w-4 text-gray-500 transition-transform ${expandedSections.origin ? 'rotate-180' : ''}`} 
          />
        </div>
        
        {expandedSections.origin && (
          <div className="space-y-2">
            {originOptions.map(origin => (
              <div key={origin.id} className="flex items-center">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id={`origin-${origin.id}`}
                    checked={selectedOrigins.includes(origin.id)}
                    onChange={() => toggleOrigin(origin.id)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-1 bg-white"
                  />
                  <label 
                    htmlFor={`origin-${origin.id}`} 
                    className="ml-2 text-sm text-gray-700 cursor-pointer"
                  >
                    {origin.label}
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 h-9"
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
        
        <button 
          onClick={resetFilters}
          className="w-full text-center text-sm text-green-600 hover:text-green-700 hover:underline py-1"
        >
          Reset all filters
        </button>
      </div>
    </div>
  )
}
