import { useState, useEffect, useMemo, useCallback, useRef, memo, lazy, Suspense } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import ProductGrid from "../components/product-grid"
import { Product } from "../types"
import { Loader2, Filter, ChevronDown, Search as SearchIcon, X, SlidersHorizontal } from "lucide-react"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { products } from "../lib/product-data"
import { getProducts, ProductFilters } from "../lib/firebase-products"

// Lazy load the chatbot since it's not critical for initial render
const ShopAIChatbot = lazy(() => import("../components/shop-ai-chatbot"));

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../components/ui/dropdown-menu"
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "../components/ui/sheet"
import { Badge } from "../components/ui/badge"

// Centralized categories for consistency across the site
import { MAIN_CATEGORIES as categories, MainCategoryId, normalizeCategoryId, bucketProductToMainCategory } from "../lib/categories";

// Define price ranges
const priceRanges = [
  { id: "all", name: "All Prices" },
  { id: "under10000", name: "Under ₦10,000", min: 0, max: 10000 },
  { id: "10000to50000", name: "₦10,000 - ₦50,000", min: 10000, max: 50000 },
  { id: "over50000", name: "Over ₦50,000", min: 50000, max: Infinity }
];

// Sort options for products
const sortOptions = [
  { id: "popularity", name: "Popular" },
  { id: "price-asc", name: "Price: Low to High" },
  { id: "price-desc", name: "Price: High to Low" },
  { id: "newest", name: "Newest" }
];

// Custom debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}

export default function ShopPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  // Get category from URL or default to "all"
  const categoryParam = normalizeCategoryId(searchParams.get("category"))
  // Get search term from URL
  const searchParam = searchParams.get("search") || ""
  
  const [selectedCategory, setSelectedCategory] = useState<MainCategoryId>(categoryParam)
  const [selectedPriceRange, setSelectedPriceRange] = useState("all")
  const [selectedSort, setSelectedSort] = useState("popularity")
  const [searchTerm, setSearchTerm] = useState(searchParam)
  const [isLoading, setIsLoading] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    priceRange: true,
    sort: true
  })
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12
  
  // Debounce search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  // Cache for products to avoid refetching
  const productsCache = useRef<Map<string, Product[]>>(new Map())
  
  // Memoize active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedCategory !== "all") count++
    if (selectedPriceRange !== "all") count++
    if (debouncedSearchTerm) count++
    return count
  }, [selectedCategory, selectedPriceRange, debouncedSearchTerm])
  
  // Memoize filtered products for better performance
  const filteredAndSortedProducts = useMemo(() => {
    const result = [...filteredProducts]
    
    // Apply sorting
    switch (selectedSort) {
      case "price-asc":
        result.sort((a, b) => {
          const aPrice = a.discount ? a.price * (1 - a.discount / 100) : a.price
          const bPrice = b.discount ? b.price * (1 - b.discount / 100) : b.price
          return aPrice - bPrice
        })
        break
      case "price-desc":
        result.sort((a, b) => {
          const aPrice = a.discount ? a.price * (1 - a.discount / 100) : a.price
          const bPrice = b.discount ? b.price * (1 - b.discount / 100) : b.price
          return bPrice - aPrice
        })
        break
      case "newest":
        result.sort((a, b) => {
          const aDate = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0
          const bDate = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0
          return bDate - aDate
        })
        break
      default:
        // Sort by popularity (rating)
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }
    
    return result
  }, [filteredProducts, selectedSort])
  
  // Get current products for pagination
  const currentProducts = useMemo(() => {
    const indexOfLastProduct = currentPage * productsPerPage
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage
    return filteredAndSortedProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  }, [filteredAndSortedProducts, currentPage])
  
  // Calculate total pages and results count
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage)
  const resultsCount = filteredAndSortedProducts.length
  
  // Filter products based on selected filters - optimized with caching
  useEffect(() => {
    const cacheKey = `${selectedCategory}-${selectedPriceRange}-${debouncedSearchTerm}`
    
    // Check cache first
    if (productsCache.current.has(cacheKey)) {
      setFilteredProducts(productsCache.current.get(cacheKey)!)
      setCurrentPage(1)
      return
    }
    
    setIsLoading(true)
    setCurrentPage(1)
    
    const controller = new AbortController()
    
    async function loadProducts() {
      try {
        const firebaseFilters: ProductFilters = {}
        const categoryFilter = selectedCategory !== "all" ? selectedCategory : null
        
        console.log("Fetching products with filters:", firebaseFilters)
        const { products: firebaseProducts } = await getProducts(firebaseFilters, 500)
        console.log("Firebase products count:", firebaseProducts.length)
        
        // Use Firebase products or fallback to mock data
        let result = firebaseProducts.length > 0 ? [...firebaseProducts] : [...products]
        
        // Apply category filter client-side
        if (categoryFilter) {
          result = result.filter((product) => {
            const productCategoryBucket = bucketProductToMainCategory(product as any)
            return categoryFilter === 'others' 
              ? productCategoryBucket === 'others'
              : productCategoryBucket === categoryFilter
          })
        }

        // Apply price range filter
        if (selectedPriceRange !== "all") {
          const range = priceRanges.find(r => r.id === selectedPriceRange)
          if (range?.min !== undefined && range?.max !== undefined) {
            result = result.filter(product => {
              const finalPrice = product.discount && product.discount > 0
                ? product.price * (1 - product.discount / 100)
                : product.price
              return finalPrice >= range.min && finalPrice < range.max
            })
          }
        }

        // Apply search filter
        if (debouncedSearchTerm) {
          const term = debouncedSearchTerm.toLowerCase()
          result = result.filter(product => 
            product.name.toLowerCase().includes(term) || 
            (product.description && product.description.toLowerCase().includes(term))
          )
        }

        // Cache the results
        productsCache.current.set(cacheKey, result as unknown as Product[])
        
        // Limit cache size to prevent memory issues
        if (productsCache.current.size > 20) {
          const firstKey = productsCache.current.keys().next().value
          productsCache.current.delete(firstKey)
        }
        
        setFilteredProducts(result as unknown as Product[])
      } catch (error: any) {
        console.error("Error loading products:", error)
        
        // Fallback to local data with client-side filtering
        let localProducts = [...products]
        
        if (selectedCategory !== "all") {
          localProducts = localProducts.filter((product) => {
            const productCategoryBucket = bucketProductToMainCategory(product as any)
            return selectedCategory === 'others'
              ? productCategoryBucket === 'others'
              : productCategoryBucket === selectedCategory
          })
        }
        
        if (selectedPriceRange !== "all") {
          const range = priceRanges.find(r => r.id === selectedPriceRange)
          if (range?.min !== undefined && range?.max !== undefined) {
            localProducts = localProducts.filter((product) => {
              const finalPrice = product.discount && product.discount > 0
                ? product.price * (1 - product.discount / 100)
                : product.price
              return finalPrice >= range.min && finalPrice < range.max
            })
          }
        }
        
        if (debouncedSearchTerm) {
          const term = debouncedSearchTerm.toLowerCase()
          localProducts = localProducts.filter((product) =>
            product.name.toLowerCase().includes(term) ||
            (product.description && product.description.toLowerCase().includes(term)) ||
            (product.category && product.category.toLowerCase().includes(term))
          )
        }
        
        setFilteredProducts(localProducts)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProducts()
    
    return () => controller.abort()
  }, [selectedCategory, selectedPriceRange, debouncedSearchTerm])
  
  // Update URL when filters change - debounced
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (selectedCategory !== "all") {
      params.set("category", selectedCategory)
    }
    
    if (debouncedSearchTerm) {
      params.set("search", debouncedSearchTerm)
    }
    
    const newUrl = params.toString() ? `/shop?${params.toString()}` : '/shop'
    navigate(newUrl, { replace: true })
  }, [selectedCategory, debouncedSearchTerm, navigate])
  
  // Memoized event handlers
  const handleCategoryChange = useCallback((categoryId: MainCategoryId) => {
    setSelectedCategory(categoryId)
  }, [])
  
  const handlePriceRangeChange = useCallback((rangeId: string) => {
    setSelectedPriceRange(rangeId)
  }, [])
  
  const handleSortChange = useCallback((sortId: string) => {
    setSelectedSort(sortId)
  }, [])
  
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
  }, [])

  const clearAllFilters = useCallback(() => {
    setSelectedCategory("all")
    setSelectedPriceRange("all")
    setSearchTerm("")
    productsCache.current.clear()
  }, [])

  // Memoized helper functions
  const getSelectedCategoryName = useMemo(() => {
    const category = categories.find(cat => cat.id === selectedCategory)
    return category ? category.name : "All Products"
  }, [selectedCategory])

  const getSelectedPriceRangeName = useMemo(() => {
    const range = priceRanges.find(range => range.id === selectedPriceRange)
    return range ? range.name : "All Prices"
  }, [selectedPriceRange])
  
  const getSelectedSortName = useMemo(() => {
    const sort = sortOptions.find(sort => sort.id === selectedSort)
    return sort ? sort.name : "Popular"
  }, [selectedSort])
  
  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }, [])
  
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  
  // Memoized pagination numbers to avoid recalculation on every render
  const paginationNumbers = useMemo(() => {
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
      if (totalPages <= 5) return i + 1
      if (currentPage <= 3) return i + 1
      if (currentPage >= totalPages - 2) return totalPages - 4 + i
      return currentPage - 2 + i
    })
  }, [totalPages, currentPage])
  
  // Memoized Filter component to prevent unnecessary re-renders
  const FiltersComponent = useMemo(() => {
    const Component = ({ isMobile = false, onApply = () => {} }: { isMobile?: boolean; onApply?: () => void }) => (
    <div className={`${isMobile ? 'p-0' : 'bg-white rounded-lg border border-gray-200 p-4 shadow-sm sticky top-28'}`}>
      {!isMobile && (
        <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
          <Filter className="h-4 w-4 mr-2 text-green-600" />
          <h2 className="font-medium text-gray-800">Filter Products</h2>
        </div>
      )}
      
      {/* Search - for mobile only */}
      {isMobile && (
        <div className="mb-4">
          <h3 className="font-medium mb-2 text-sm text-gray-700">Search</h3>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-gray-300 bg-gray-50 h-9 text-gray-800 placeholder:text-gray-400"
            />
          </div>
        </div>
      )}
      
      {/* Category Filter - Accordion style */}
      <div className="mb-2 border border-gray-200 rounded-md">
        <button 
          onClick={() => toggleSection('categories')}
          className="w-full flex justify-between items-center p-3 text-left focus:outline-none"
        >
          <span className="font-medium text-gray-700">Categories</span>
          <ChevronDown 
            className={`h-4 w-4 text-gray-500 transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`} 
          />
        </button>
         
        {expandedSections.categories && (
          <div className="p-3 border-t border-gray-200 space-y-2 max-h-40 overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center">
                <input
                  type="radio"
                  id={`category-${category.id}`}
                  checked={selectedCategory === category.id}
                  onChange={() => handleCategoryChange(category.id)}
                  className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500 focus:ring-1 bg-white"
                  name="category"
                />
                <label 
                  htmlFor={`category-${category.id}`} 
                  className="ml-2 text-sm text-gray-700 cursor-pointer"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Price Range Filter - Accordion style */}
      <div className="mb-2 border border-gray-200 rounded-md">
        <button 
          onClick={() => toggleSection('priceRange')}
          className="w-full flex justify-between items-center p-3 text-left focus:outline-none"
        >
          <span className="font-medium text-gray-700">Price Range</span>
          <ChevronDown 
            className={`h-4 w-4 text-gray-500 transition-transform ${expandedSections.priceRange ? 'rotate-180' : ''}`} 
          />
        </button>
         
        {expandedSections.priceRange && (
          <div className="p-3 border-t border-gray-200 space-y-2">
            {priceRanges.map((range) => (
              <div key={range.id} className="flex items-center">
                <input
                  type="radio"
                  id={`price-${range.id}`}
                  checked={selectedPriceRange === range.id}
                  onChange={() => handlePriceRangeChange(range.id)}
                  className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500 focus:ring-1 bg-white"
                  name="priceRange"
                />
                <label 
                  htmlFor={`price-${range.id}`} 
                  className="ml-2 text-sm text-gray-700 cursor-pointer"
                >
                  {range.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Sort By - Mobile Only */}
      {isMobile && (
        <div className="mb-2 border border-gray-200 rounded-md">
          <button 
            onClick={() => toggleSection('sort')}
            className="w-full flex justify-between items-center p-3 text-left focus:outline-none"
          >
            <span className="font-medium text-gray-700">Sort By</span>
            <ChevronDown 
              className={`h-4 w-4 text-gray-500 transition-transform ${expandedSections.sort ? 'rotate-180' : ''}`} 
            />
          </button>
           
          {expandedSections.sort && (
            <div className="p-3 border-t border-gray-200 space-y-2">
              {sortOptions.map((option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="radio"
                    id={`sort-${option.id}`}
                    checked={selectedSort === option.id}
                    onChange={() => handleSortChange(option.id)}
                    className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500 focus:ring-1 bg-white"
                    name="sort"
                  />
                  <label 
                    htmlFor={`sort-${option.id}`} 
                    className="ml-2 text-sm text-gray-700 cursor-pointer"
                  >
                    {option.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Active Filters - Simplified */}
      {(selectedCategory !== "all" || selectedPriceRange !== "all" || searchTerm) && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs text-gray-700">Active Filters</h3>
            <Button 
              variant="link" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-xs text-red-600 hover:text-red-700 p-0 h-auto"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedCategory !== "all" && (
              <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 gap-1 py-1">
                {getSelectedCategoryName}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedCategory("all")} />
              </Badge>
            )}
            {selectedPriceRange !== "all" && (
              <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 gap-1 py-1">
                {getSelectedPriceRangeName}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedPriceRange("all")} />
              </Badge>
            )}
            
            {searchTerm && (
              <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 gap-1 py-1">
                {searchTerm}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchTerm("")} />
              </Badge>
            )}
          </div>
        </div>
      )}
      
      {/* Filter Actions */}
      {isMobile ? (
        <SheetFooter className="mt-4 pt-4 border-t border-gray-200">
          <SheetClose asChild>
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={onApply}>Apply Filters</Button>
          </SheetClose>
        </SheetFooter>
      ) : (
        <Button 
          className="w-full mt-3 bg-green-600 hover:bg-green-700"
          onClick={clearAllFilters}
        >
          Reset Filters
        </Button>
      )}
    </div>
  )
    return Component
  }, [selectedCategory, selectedPriceRange, searchTerm, expandedSections, toggleSection, handleCategoryChange, handlePriceRangeChange, handleSortChange, clearAllFilters, getSelectedCategoryName, getSelectedPriceRangeName, selectedSort])
  
  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
            <p className="text-gray-600 mt-1">Browse our wide selection of products</p>
          </div>
          
          {/* Search and Sort controls */}
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex w-full md:w-60">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-9 pr-4 rounded-l-md border-r-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" className="rounded-l-none bg-green-600 hover:bg-green-700">
                Search
              </Button>
            </form>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto justify-between whitespace-nowrap">
                  <span className="mr-1">Sort:</span> {getSelectedSortName}
                  <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={selectedSort} onValueChange={handleSortChange}>
                  {sortOptions.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.id}
                      value={option.id}
                      className="cursor-pointer"
                    >
                      {option.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Mobile filter button */}
          <div className="lg:hidden mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-1 bg-green-500">{activeFiltersCount}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto bg-white">
                <SheetHeader className="mb-6">
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Filter products by category, price, and more.
                  </SheetDescription>
                </SheetHeader>
                <FiltersComponent isMobile={true} />
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Desktop sidebar filters */}
          <div className="hidden lg:block">
            <FiltersComponent />
          </div>
          
          {/* Product grid */}
          <div className="lg:col-span-3">
            {/* Debug component - temporary for troubleshooting */}
            
            {/* Results count */}
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {Math.min(productsPerPage, filteredAndSortedProducts.length)} of {resultsCount} {resultsCount === 1 ? 'product' : 'products'}
                {activeFiltersCount > 0 && ' with applied filters'}
              </div>
              
              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters} 
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-2" />
                  <p className="text-gray-500 text-sm">Loading products...</p>
                </div>
              </div>
            ) : currentProducts.length > 0 ? (
              <>
                <ProductGrid products={currentProducts} />
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="h-9 px-3"
                      >
                        Previous
                      </Button>
                      
                      {paginationNumbers.map((pageNum) => (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="h-9 w-9 p-0"
                        >
                          {pageNum}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="h-9 px-3"
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-center max-w-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any products matching your current filters. Try adjusting your search or clear filters to see all products.
                  </p>
                  <Button onClick={clearAllFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Lazy loaded chatbot */}
      <Suspense fallback={null}>
        <ShopAIChatbot />
      </Suspense>
    </div>
  );
}