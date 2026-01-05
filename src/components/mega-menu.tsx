import * as React from "react"
import { useState, useEffect } from "react"
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Sparkles, TrendingUp, Zap } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../../src/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../src/components/ui/collapsible"
import clsx from "clsx"

// Featured product for the mega menu
const featuredProduct = {
  title: "Featured Deal",
  image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop",
  name: "Premium Wireless Headphones",
  price: "₦45,000",
  originalPrice: "₦65,000",
  discount: "30% OFF"
}

// Define the mega menu categories structure
const megaMenuCategories = [
  {
    title: "APPLIANCES",
    icon: "🏠",
    subcategories: [
      {
        name: "Small Appliances",
        items: ["Blenders", "Juicers", "Rice Cookers", "Irons", "Coffee Makers"]
      },
      {
        name: "Large Appliances", 
        items: ["Washing Machines", "Fridges", "Air Conditioners", "Freezers"]
      },
      {
        name: "Home Appliances",
        items: ["Heaters", "Fans", "Generators & Inverters"]
      }
    ]
  },
  {
    title: "PHONES & TABLETS",
    icon: "📱",
    subcategories: [
      { name: "Smartphones", items: [] },
      { name: "Tablets", items: [] },
      { name: "Accessories", items: ["Chargers", "Power Banks", "Headphones"] }
    ]
  },
  {
    title: "ELECTRONICS",
    icon: "🖥️",
    subcategories: [
      { name: "Televisions", items: [] },
      { name: "Audio Systems", items: [] },
      { name: "Cameras", items: [] },
      { name: "Smartwatches", items: [] }
    ]
  },
  {
    title: "FASHION",
    icon: "👗",
    subcategories: [
      { name: "Men's Wear", items: ["Shirts", "Shoes", "Watches", "Accessories"] },
      { name: "Women's Wear", items: ["Dresses", "Bags", "Jewelry", "Footwear"] },
      { name: "Kids & Baby Fashion", items: [] }
    ]
  },
  {
    title: "COMPUTING",
    icon: "💻",
    subcategories: [
      { name: "Laptops", items: [] },
      { name: "Desktops", items: [] },
      { name: "Monitors", items: [] },
      { name: "Printers & Scanners", items: [] },
      { name: "Accessories", items: ["Keyboards", "Mice", "External Storage"] }
    ]
  },
  {
    title: "GAMING",
    icon: "🎮",
    subcategories: [
      { name: "Consoles", items: ["PlayStation", "Xbox", "Nintendo"] },
      { name: "Games", items: ["Digital & Physical"] },
      { name: "Gaming Accessories", items: ["Controllers", "Headsets"] }
    ]
  },
  {
    title: "HEALTH & BEAUTY",
    icon: "💄",
    subcategories: [
      { name: "Skincare", items: [] },
      { name: "Haircare", items: [] },
      { name: "Fragrances", items: [] },
      { name: "Personal Care Devices", items: [] }
    ]
  },
  {
    title: "HOME & OFFICE",
    icon: "🪑",
    subcategories: [
      { name: "Furniture", items: [] },
      { name: "Decor", items: [] },
      { name: "Lighting", items: [] },
      { name: "Stationery & Office Supplies", items: [] }
    ]
  },
  {
    title: "SUPERMARKET",
    icon: "🛒",
    subcategories: [
      { name: "Cleaning Supplies", items: [] },
      { name: "Baby Products", items: [] },
      { name: "Pet Supplies", items: [] }
    ]
  }
]

interface MegaMenuProps {
  pathname: string
  onNavigate?: () => void
}

interface MobileMegaMenuProps {
  onNavigate?: () => void
  isOpen?: boolean
  onToggle?: () => void
}

// Desktop Mega Menu Component
export function DesktopMegaMenu({ pathname, onNavigate }: MegaMenuProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={clsx(
        "flex items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200",
        pathname.startsWith("/shop") 
          ? "text-green-700 font-semibold bg-green-50" 
          : "text-gray-800 hover:text-green-600 hover:bg-gray-50"
      )}>
        Shop <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[850px] lg:w-[950px] p-0 shadow-2xl border-0 rounded-xl overflow-hidden"
        align="start"
        sideOffset={8}
      >
        <div className="bg-white rounded-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Shop by Category
                </h3>
                <p className="text-green-100 text-sm mt-1">Discover our wide range of products</p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">10,000+ Products</span>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex">
            {/* Categories Grid */}
            <div className="flex-1 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="grid grid-cols-3 gap-0">
                {megaMenuCategories.map((category, index) => (
                  <div 
                    key={category.title} 
                    className={clsx(
                      "p-4 border-r border-b border-gray-100 transition-all duration-200 group",
                      "hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50",
                      index % 3 === 2 && "border-r-0",
                      index >= megaMenuCategories.length - 3 && "border-b-0"
                    )}
                    onMouseEnter={() => setHoveredCategory(category.title)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <Link 
                      to={`/shop?category=${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={onNavigate}
                      className="block"
                    >
                      <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2 group-hover:text-green-600 transition-colors">
                        <span className="text-lg">{category.icon}</span>
                        {category.title}
                      </h4>
                    </Link>
                    <div className="space-y-1.5">
                      {category.subcategories.map((subcategory) => (
                        <div key={subcategory.name}>
                          <Link
                            to={`/shop?category=${category.title.toLowerCase().replace(/\s+/g, '-')}&subcategory=${subcategory.name.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={onNavigate}
                            className="block text-sm font-medium text-gray-700 hover:text-green-600 transition-colors py-0.5"
                          >
                            {subcategory.name}
                          </Link>
                          {subcategory.items.length > 0 && (
                            <div className="ml-3 space-y-0.5 mt-1">
                              {subcategory.items.slice(0, 3).map((item) => (
                                <Link
                                  key={item}
                                  to={`/shop?search=${encodeURIComponent(item)}`}
                                  onClick={onNavigate}
                                  className="block text-xs text-gray-500 hover:text-green-600 transition-colors py-0.5"
                                >
                                  {item}
                                </Link>
                              ))}
                              {subcategory.items.length > 3 && (
                                <span className="text-xs text-green-600 font-medium">
                                  +{subcategory.items.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Product Sidebar */}
            <div className="w-[220px] bg-gradient-to-b from-gray-50 to-white p-4 border-l border-gray-100">
              <div className="sticky top-0">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-bold text-gray-900">{featuredProduct.title}</span>
                </div>
                <div className="rounded-xl overflow-hidden shadow-lg bg-white border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="relative">
                    <img 
                      src={featuredProduct.image} 
                      alt={featuredProduct.name}
                      className="w-full h-32 object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {featuredProduct.discount}
                    </span>
                  </div>
                  <div className="p-3">
                    <h5 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
                      {featuredProduct.name}
                    </h5>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">{featuredProduct.price}</span>
                      <span className="text-gray-400 text-xs line-through">{featuredProduct.originalPrice}</span>
                    </div>
                    <Link
                      to="/shop?featured=true"
                      onClick={onNavigate}
                      className="mt-3 block w-full text-center bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="mt-4 space-y-2">
                  <Link
                    to="/shop?sort=newest"
                    onClick={onNavigate}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    New Arrivals
                  </Link>
                  <Link
                    to="/shop?sort=popular"
                    onClick={onNavigate}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    Best Sellers
                  </Link>
                  <Link
                    to="/shop?discount=true"
                    onClick={onNavigate}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    On Sale
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-5 py-3 border-t flex justify-between items-center">
            <Link 
              to="/shop" 
              onClick={onNavigate}
              className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-1 group"
            >
              View All Products 
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Free Delivery on orders over ₦50,000
              </span>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


// Mobile Mega Menu Component (Accordion Style)
export function MobileMegaMenu({ onNavigate, isOpen, onToggle }: MobileMegaMenuProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([])

  const toggleCategory = (title: string) => {
    setExpandedCategories(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  const toggleSubcategory = (name: string) => {
    setExpandedSubcategories(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name)
        : [...prev, name]
    )
  }

  const hasItems = (category: typeof megaMenuCategories[0]) => {
    return category.subcategories.some(sub => sub.items.length > 0)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Shop by Category
        </h3>
        <p className="text-green-100 text-sm">Browse all categories</p>
      </div>

      {/* View All Products Link */}
      <Link
        to="/shop"
        onClick={onNavigate}
        className="flex items-center justify-between w-full py-3 px-4 bg-green-50 text-green-700 font-medium border-b border-green-100 hover:bg-green-100 transition-colors"
      >
        <span className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          View All Products
        </span>
        <ChevronRight className="h-4 w-4" />
      </Link>

      {/* Categories List */}
      <div className="max-h-[60vh] overflow-y-auto">
        {megaMenuCategories.map((category) => (
          <div key={category.title} className="border-b border-gray-100 last:border-b-0">
            {hasItems(category) ? (
              <Collapsible 
                open={expandedCategories.includes(category.title)}
                onOpenChange={() => toggleCategory(category.title)}
              >
                <CollapsibleTrigger asChild>
                  <button className="flex items-center justify-between w-full py-3 px-4 text-gray-800 hover:bg-gray-50 transition-colors">
                    <span className="flex items-center gap-3 font-medium">
                      <span className="text-xl">{category.icon}</span>
                      {category.title}
                    </span>
                    <ChevronDown className={clsx(
                      "h-4 w-4 text-gray-400 transition-transform duration-200",
                      expandedCategories.includes(category.title) && "rotate-180"
                    )} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="bg-gray-50 py-2">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.name}>
                        {subcategory.items.length > 0 ? (
                          <Collapsible
                            open={expandedSubcategories.includes(subcategory.name)}
                            onOpenChange={() => toggleSubcategory(subcategory.name)}
                          >
                            <CollapsibleTrigger asChild>
                              <button className="flex items-center justify-between w-full py-2 px-6 text-gray-700 hover:text-green-600 transition-colors text-sm">
                                <span>{subcategory.name}</span>
                                <ChevronDown className={clsx(
                                  "h-3 w-3 text-gray-400 transition-transform duration-200",
                                  expandedSubcategories.includes(subcategory.name) && "rotate-180"
                                )} />
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="bg-white py-1 mx-4 rounded-lg mb-2">
                                {subcategory.items.map((item) => (
                                  <Link
                                    key={item}
                                    to={`/shop?search=${encodeURIComponent(item)}`}
                                    onClick={onNavigate}
                                    className="block py-2 px-4 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
                                  >
                                    {item}
                                  </Link>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ) : (
                          <Link
                            to={`/shop?category=${category.title.toLowerCase().replace(/\s+/g, '-')}&subcategory=${subcategory.name.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={onNavigate}
                            className="block py-2 px-6 text-sm text-gray-700 hover:text-green-600 hover:bg-white transition-colors"
                          >
                            {subcategory.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Link
                to={`/shop?category=${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={onNavigate}
                className="flex items-center gap-3 w-full py-3 px-4 text-gray-800 font-medium hover:bg-gray-50 hover:text-green-600 transition-colors"
              >
                <span className="text-xl">{category.icon}</span>
                {category.title}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            HOT
          </div>
          <Link
            to="/shop?discount=true"
            onClick={onNavigate}
            className="text-sm font-medium text-gray-800 hover:text-red-600 transition-colors"
          >
            Check out today's deals →
          </Link>
        </div>
      </div>
    </div>
  )
}

// Tablet Mega Menu (2-column layout for medium screens)
export function TabletMegaMenu({ pathname, onNavigate }: MegaMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={clsx(
        "flex items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200",
        pathname.startsWith("/shop") 
          ? "text-green-700 font-semibold bg-green-50" 
          : "text-gray-800 hover:text-green-600 hover:bg-gray-50"
      )}>
        Shop <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[500px] p-0 shadow-2xl border-0 rounded-xl overflow-hidden"
        align="start"
        sideOffset={8}
      >
        <div className="bg-white rounded-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Shop by Category
            </h3>
          </div>
          
          {/* Categories Grid - 2 columns for tablet */}
          <div className="max-h-[350px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-0">
              {megaMenuCategories.map((category, index) => (
                <div 
                  key={category.title} 
                  className={clsx(
                    "p-3 border-r border-b border-gray-100 hover:bg-green-50 transition-colors",
                    index % 2 === 1 && "border-r-0"
                  )}
                >
                  <Link 
                    to={`/shop?category=${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={onNavigate}
                    className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-2 hover:text-green-600 transition-colors"
                  >
                    <span>{category.icon}</span>
                    {category.title}
                  </Link>
                  <div className="space-y-1">
                    {category.subcategories.slice(0, 3).map((subcategory) => (
                      <Link
                        key={subcategory.name}
                        to={`/shop?category=${category.title.toLowerCase().replace(/\s+/g, '-')}&subcategory=${subcategory.name.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={onNavigate}
                        className="block text-xs text-gray-600 hover:text-green-600 transition-colors"
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 border-t">
            <Link 
              to="/shop" 
              onClick={onNavigate}
              className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-1"
            >
              View All Products <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
