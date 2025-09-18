

import { useState } from "react"
// import Link from "next/link"
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "../../src/components/ui/button"
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

// Define the mega menu categories structure (keep UI list here but ensure Shop filters use centralized categories)
const megaMenuCategories = [
  {
    title: "APPLIANCES",
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
    subcategories: [
      {
        name: "Smartphones",
        items: []
      },
      {
        name: "Tablets", 
        items: []
      },
      {
        name: "Accessories",
        items: ["Chargers", "Power Banks", "Headphones"]
      }
    ]
  },
  {
    title: "ELECTRONICS",
    subcategories: [
      {
        name: "Televisions",
        items: []
      },
      {
        name: "Audio Systems",
        items: []
      },
      {
        name: "Cameras",
        items: []
      },
      {
        name: "Smartwatches",
        items: []
      }
    ]
  },
  {
    title: "FASHION",
    subcategories: [
      {
        name: "Men's Wear",
        items: ["Shirts", "Shoes", "Watches", "Accessories"]
      },
      {
        name: "Women's Wear",
        items: ["Dresses", "Bags", "Jewelry", "Footwear"]
      },
      {
        name: "Kids & Baby Fashion",
        items: []
      }
    ]
  },
  {
    title: "COMPUTING",
    subcategories: [
      {
        name: "Laptops",
        items: []
      },
      {
        name: "Desktops",
        items: []
      },
      {
        name: "Monitors",
        items: []
      },
      {
        name: "Printers & Scanners",
        items: []
      },
      {
        name: "Accessories",
        items: ["Keyboards", "Mice", "External Storage"]
      }
    ]
  },
  {
    title: "GAMING",
    subcategories: [
      {
        name: "Consoles",
        items: ["PlayStation", "Xbox", "Nintendo"]
      },
      {
        name: "Games",
        items: ["Digital & Physical"]
      },
      {
        name: "Gaming Accessories",
        items: ["Controllers", "Headsets"]
      }
    ]
  },
  {
    title: "HEALTH & BEAUTY",
    subcategories: [
      {
        name: "Skincare",
        items: []
      },
      {
        name: "Haircare",
        items: []
      },
      {
        name: "Fragrances",
        items: []
      },
      {
        name: "Personal Care Devices",
        items: []
      }
    ]
  },
  {
    title: "HOME & OFFICE",
    subcategories: [
      {
        name: "Furniture",
        items: []
      },
      {
        name: "Decor",
        items: []
      },
      {
        name: "Lighting",
        items: []
      },
      {
        name: "Stationery & Office Supplies",
        items: []
      }
    ]
  },
  {
    title: "SUPERMARKET",
    subcategories: [
      {
        name: "Cleaning Supplies",
        items: []
      },
      {
        name: "Baby Products",
        items: []
      },
      {
        name: "Pet Supplies",
        items: []
      }
    ]
  }
]

interface MegaMenuProps {
  pathname: string
  onNavigate?: () => void
}

// Desktop Mega Menu Component
export function DesktopMegaMenu({ pathname, onNavigate }: MegaMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={clsx(
        "flex items-center gap-1 py-2 transition-colors",
        pathname.startsWith("/shop") 
          ? "text-green-700 font-semibold border-b-2 border-green-600" 
          : "text-gray-800 hover:text-green-600"
      )}>
        Shop <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[600px] p-0 shadow-lg border-0 rounded-lg"
        align="start"
        sideOffset={8}
      >
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
            <h3 className="text-lg font-semibold">Shop by Category</h3>
            <p className="text-green-100 text-sm">Discover our wide range of products</p>
          </div>
          
          {/* Categories Grid with ScrollArea for custom scrollbar */}
          <div className="max-h-[350px] overflow-y-auto pr-2">
            <div className="grid grid-cols-3 gap-0">
            {megaMenuCategories.map((category, index) => (
              <div 
                key={category.title} 
                className={clsx(
                  "p-4 border-r border-b border-gray-100 hover:bg-gray-50 transition-colors",
                  index % 3 === 2 && "border-r-0", // Remove right border for last column
                  index >= megaMenuCategories.length - 3 && "border-b-0" // Remove bottom border for last row
                )}
              >
                <Link 
                  to={`/shop?category=${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={onNavigate}
                  className="block"
                >
                  <h4 className="font-bold text-gray-900 text-sm mb-3 hover:text-green-600 transition-colors">
                    {category.title}
                  </h4>
                </Link>
                <div className="space-y-2">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.name}>
                      <Link
                        to={`/shop?category=${category.title.toLowerCase().replace(/\s+/g, '-')}&subcategory=${subcategory.name.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={onNavigate}
                        className="block text-sm font-medium text-gray-700 hover:text-green-600 transition-colors mb-1"
                      >
                        {subcategory.name}
                      </Link>
                      {subcategory.items.length > 0 && (
                        <div className="ml-2 space-y-1">
                          {subcategory.items.map((item) => (
                            <Link
                              key={item}
                              to={`/shop?search=${encodeURIComponent(item)}`}
                              onClick={onNavigate}
                              className="block text-xs text-gray-500 hover:text-green-600 transition-colors"
                            >
                              {item}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 p-4 border-t">
            <div className="flex justify-between items-center">
              <Link 
                to="/shop" 
                onClick={onNavigate}
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                View All Products →
              </Link>
              <div className="text-xs text-gray-500">
                Over 10,000+ products available
              </div>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Mobile Mega Menu Component (Accordion Style)
export function MobileMegaMenu({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="max-h-[350px] overflow-y-auto pr-2">
      <div className="space-y-2">
      <Link
        to="/shop"
        onClick={onNavigate}
        className="block text-gray-700 font-medium py-2"
      >
        All Products
      </Link>
      
      {megaMenuCategories.map((category) => (
        <Collapsible key={category.title}>
          <CollapsibleTrigger className="flex items-center justify-between w-full text-left py-2 text-gray-700 hover:text-green-600 transition-colors">
            <span className="font-medium text-sm">{category.title}</span>
            <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-4 space-y-2 pb-2">
            {category.subcategories.map((subcategory) => (
              <div key={subcategory.name}>
                <Link
                  to={`/shop?category=${category.title.toLowerCase().replace(/\s+/g, '-')}&subcategory=${subcategory.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={onNavigate}
                  className="block text-sm text-gray-600 hover:text-green-600 py-1 transition-colors"
                >
                  {subcategory.name}
                </Link>
                {subcategory.items.length > 0 && (
                  <div className="ml-3 space-y-1">
                    {subcategory.items.map((item) => (
                      <Link
                        key={item}
                        to={`/shop?search=${encodeURIComponent(item)}`}
                        onClick={onNavigate}
                        className="block text-xs text-gray-500 hover:text-green-600 py-0.5 transition-colors"
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
    </div>
  )
}