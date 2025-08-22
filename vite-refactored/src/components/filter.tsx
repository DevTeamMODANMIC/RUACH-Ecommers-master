

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

interface FilterProps {
  categories: string[]
  onCategoryChange: (category: string | null) => void
  onPriceRangeChange: (range: [number, number]) => void
  onSortByChange: (sort: "price" | "name" | null) => void
}

export function Filter({ categories, onCategoryChange, onPriceRangeChange, onSortByChange }: FilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100])
  const [sortBy, setSortBy] = useState<"price" | "name" | null>(null)

  const handleCategoryChange = (category: string) => {
    const newCategory = selectedCategory === category ? null : category
    setSelectedCategory(newCategory)
    onCategoryChange(newCategory)
  }

  const handlePriceRangeChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]]
    setPriceRange(newRange)
    onPriceRangeChange(newRange)
  }

  const handleSortChange = (value: string) => {
    const newSort = value === "none" ? null : (value as "price" | "name")
    setSortBy(newSort)
    onSortByChange(newSort)
  }

  const handleClearFilters = () => {
    setSelectedCategory(null)
    setPriceRange([0, 100])
    setSortBy(null)
    onCategoryChange(null)
    onPriceRangeChange([0, 100])
    onSortByChange(null)
  }

  return (
    <div className="space-y-6">
      {/* Sort */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={sortBy || "none"} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price">Price (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={selectedCategory === category}
                  onCheckedChange={() => handleCategoryChange(category)}
                />
                <Label htmlFor={category} className="text-sm">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Clear Filters */}
      <Button variant="outline" className="w-full" onClick={handleClearFilters}>
        Clear All Filters
      </Button>
    </div>
  )
} 