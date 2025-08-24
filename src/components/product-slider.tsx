

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "../../src/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"

interface SliderItem {
  id: string
  title: string
  description: string
  image: string
  link: string
}

export default function ProductSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  
  // Default promotional slider items with gradient backgrounds
  const sliderItems: SliderItem[] = [
    {
      id: "1",
      title: "Fresh African Products",
      description: "Discover authentic African foods, spices, and beverages delivered fresh to your door",
      image: "", // No image needed - using gradient
      link: "/shop?category=food"
    },
    {
      id: "2", 
      title: "Premium Beverages",
      description: "Enjoy traditional and international drinks from trusted vendors",
      image: "", // No image needed - using gradient
      link: "/shop?category=drinks"
    },
    {
      id: "3",
      title: "Bulk Orders Available",
      description: "Special pricing for restaurants, events, and large orders",
      image: "", // No image needed - using gradient
      link: "/bulk-order"
    }
  ]
  
  // Function to handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // swipe left
      nextSlide()
    }
    
    if (touchStart - touchEnd < -50) {
      // swipe right
      prevSlide()
    }
  }
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (sliderItems.length || 1))
  }
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + (sliderItems.length || 1)) % (sliderItems.length || 1))
  }
  
  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (sliderItems.length > 0) {
        nextSlide()
      }
    }, 5000)
    
    return () => clearInterval(timer)
  }, [])
  
  // If no slider items, show placeholder
  if (sliderItems.length === 0) {
    return (
      <section className="relative w-full h-[300px] overflow-hidden bg-white border-y border-gray-200 mt-4 mb-10">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <h3 className="text-xl font-medium mb-2">No featured products available</h3>
            <p>Check back later for our product highlights</p>
          </div>
        </div>
      </section>
    )
  }
  
  return (
    <section 
      className="relative w-full h-[500px] sm:h-[550px] md:h-[600px] overflow-hidden bg-white border-y border-gray-200 mt-4 mb-10 shadow-md"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {sliderItems.map((item, index) => {
          // Different gradient for each slide
          const gradients = [
            "bg-gradient-to-br from-green-600 via-green-700 to-emerald-800", // Fresh products
            "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800",   // Beverages
            "bg-gradient-to-br from-purple-600 via-purple-700 to-violet-800" // Bulk orders
          ];
          
          return (
            <div key={item.id} className={`min-w-full h-full relative ${gradients[index % gradients.length]}`}>
              {/* Decorative pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
              </div>
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-start">
                <div className="text-left text-white p-8 md:p-12 max-w-xl">
                  <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 drop-shadow-md">{item.title}</h2>
                  <p className="mb-8 text-base md:text-xl text-white/90 max-w-lg drop-shadow-sm">{item.description}</p>
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 px-8 py-6 text-base md:text-lg font-medium shadow-lg hover:shadow-xl transition-all rounded-md group relative overflow-hidden"
                  >
                    <Link href={item.link}>
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></span>
                      {item.link.includes("bulk") ? "Bulk Orders" : "Shop Now"}
                      <ArrowRight className="ml-2 h-5 w-5 inline-block group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Navigation buttons - only show if there are slides */}
      {sliderItems.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white hover:bg-opacity-90 rounded-full p-3 backdrop-blur-sm text-gray-800 shadow-md border border-gray-200 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white hover:bg-opacity-90 rounded-full p-3 backdrop-blur-sm text-gray-800 shadow-md border border-gray-200 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      
      {/* Indicator dots - only show if multiple slides */}
      {sliderItems.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
          {sliderItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? "bg-green-500 w-8" : "bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}